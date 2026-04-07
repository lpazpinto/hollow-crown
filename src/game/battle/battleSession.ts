import {
  applyCardEffect,
  checkBattleOutcome,
  resolveEnemyAttack,
  type BattleOutcome,
  type BattleState,
  type CardEffectType,
} from './battleLogic'
import { STARTER_DECK, type CardContent } from '../content/cards'
import type { BoonContent } from '../content/boons'
import type { HeroAbilityContent } from '../content/abilities'
import type { RelicContent } from '../content/relics'
import {
  getRandomBossEnemy,
  getEnemyIntentActions,
  getRandomEliteEnemy,
  getRandomEnemy,
  type EnemyContent,
  type EnemyIntent,
} from '../content/enemies'
import type { EncounterType } from './runState'
import {
  getAbilityBattleStartEmber,
  getAbilityEveryThirdTurnExtraDraw,
  getAbilityFirstBlockBonusAmount,
  getAbilityFirstAttackBonusDamage,
  getAbilityTurnStartArmor,
} from './abilityEffects'
import {
  getBattleStartEmberBonus,
  getEveryThirdTurnExtraDraw,
  getFirstAttackBonusDamage,
  getFirstBlockBonusAmount,
} from './relicEffects'

const MAX_EMBER = 3

export type BattleSession = {
  state: BattleState
  drawPile: CardContent[]
  discardPile: CardContent[]
  hand: CardContent[]
  enemy: EnemyContent
  currentEnergy: number
  maxEnergy: number
  currentIntentIndex: number
  turnNumber: number
  // Hero status effects are stored on the battle session for turn-based ticking.
  heroBurn: number
  heroPoison: number
  enemyBurn: number
  enemyReflect: number
  enemyPhase: 1 | 2
  relics: RelicContent[]
  abilities: HeroAbilityContent[]
  relicTriggerState: {
    firstAttackUsed: boolean
    firstBlockUsed: boolean
  }
  turnCardState: {
    playedAttack: boolean
    playedSkill: boolean
    crownSparkTriggered: boolean
  }
  outcome: BattleOutcome
  boonState: {
    firstAttackBonusDamage: number
  }
}

type CreateBattleSessionOptions = {
  heroHp?: number
  maxHeroHp?: number
  encounterType?: EncounterType
  relics?: RelicContent[]
  abilities?: HeroAbilityContent[]
  boon?: BoonContent | null
}

export function createInitialBattleSession(
  deck: CardContent[] = STARTER_DECK,
  options: CreateBattleSessionOptions = {},
): BattleSession {
  const encounterType = options.encounterType ?? 'battle'
  const enemy = getEnemyForEncounter(encounterType)
  const relics = cloneRelics(options.relics ?? [])
  const abilities = cloneAbilities(options.abilities ?? [])
  const maxEnergy = 3
  const boon = options.boon ?? null
  const startEmber =
    getBattleStartEmberBonus(relics)
    + getAbilityBattleStartEmber(abilities)
    + (boon?.effectType === 'start_ember' ? boon.value : 0)
  const shuffledDeck = shuffleCards(cloneDeck(deck))
  const maxHeroHp = options.maxHeroHp ?? 40
  const heroHp = Math.min(
    maxHeroHp,
    (options.heroHp ?? 40) + (boon?.effectType === 'battle_start_heal' ? boon.value : 0),
  )
  const startArmor = boon?.effectType === 'start_armor' ? boon.value : 0
  const startDrawBonus = boon?.effectType === 'turn1_extra_draw' ? boon.value : 0
  const firstAttackBonusDamage = boon?.effectType === 'first_attack_bonus_damage' ? boon.value : 0

  const initialSession: BattleSession = {
    state: {
      heroHp,
      heroArmor: startArmor,
      ember: clampEmber(startEmber),
      enemyHp: enemy.maxHp,
      enemyArmor: 0,
    },
    drawPile: shuffledDeck,
    discardPile: [],
    hand: [],
    enemy,
    currentEnergy: maxEnergy,
    maxEnergy,
    currentIntentIndex: 0,
    turnNumber: 1,
    heroBurn: 0,
    heroPoison: 0,
    enemyBurn: 0,
    enemyReflect: 0,
    enemyPhase: 1,
    relics,
    abilities,
    relicTriggerState: {
      firstAttackUsed: false,
      firstBlockUsed: false,
    },
    turnCardState: {
      playedAttack: false,
      playedSkill: false,
      crownSparkTriggered: false,
    },
    outcome: 'ongoing',
    boonState: {
      firstAttackBonusDamage,
    },
  }

  return drawCards(initialSession, 4 + startDrawBonus)
}

export function getCurrentIntent(session: BattleSession): EnemyIntent {
  const intents = getActiveIntentCycle(session)

  if (intents.length === 0) {
    return session.enemy.initialIntent
  }

  const safeIndex = Math.max(0, session.currentIntentIndex % intents.length)
  return intents[safeIndex]
}

export function playCardFromHand(session: BattleSession, cardIndex: number): BattleSession {
  const card = session.hand[cardIndex]
  const emberCost = card?.emberCost ?? 0

  // Mixed-cost cards can require both energy and Ember.
  if (!card || session.outcome !== 'ongoing' || session.currentEnergy < card.cost || session.state.ember < emberCost) {
    return session
  }

  const withPhaseTransition = maybeEnterBossPhaseTwo(session)
  const cardId = getBaseCardId(card.id)
  const { nextState, nextTriggerState, drawCount, enemyBurn } = applyCardWithHooks(
    withPhaseTransition,
    cardId,
    card.effectType,
    card.value,
  )

  const heroHpAfterReflect =
    card.effectType === 'damage' && withPhaseTransition.enemyReflect > 0
      ? Math.max(0, nextState.heroHp - withPhaseTransition.enemyReflect)
      : nextState.heroHp

  const stateAfterReflect = {
    ...nextState,
    heroHp: heroHpAfterReflect,
  }

  const nextHand = session.hand.filter((_, index) => index !== cardIndex)
  const nextDiscardPile = [...session.discardPile, card]
  let nextSession: BattleSession = {
    ...withPhaseTransition,
    state: stateAfterReflect,
    enemyBurn,
    hand: nextHand,
    discardPile: nextDiscardPile,
    relicTriggerState: nextTriggerState,
    turnCardState: getUpdatedTurnCardState(withPhaseTransition.turnCardState, card.effectType),
    currentEnergy: session.currentEnergy - card.cost,
    outcome: checkBattleOutcome(stateAfterReflect),
  }

  if (emberCost > 0) {
    nextSession = {
      ...nextSession,
      state: {
        ...nextSession.state,
        ember: Math.max(0, nextSession.state.ember - emberCost),
      },
    }
  }

  if (drawCount > 0) {
    nextSession = drawCards(nextSession, drawCount)
  }

  nextSession = applyCrownSparkPassive(nextSession)

  return nextSession
}

export function startNewPlayerTurn(session: BattleSession): BattleSession {
  const nextTurnNumber = session.turnNumber + 1
  // Status effect lifecycle — tick phase:
  //   1. Hero armor is cleared (status damage bypasses armor — intentional).
  //   2. Burn damage is applied: hero takes heroBurn HP damage.
  //   3. Poison damage is applied: hero takes heroPoison HP damage.
  //   4. Both stacks decrement by 1 (minimum 0).
  //   5. When a stack reaches 0 it is expired and no longer displayed.
  // This all happens before cards are drawn or energy is restored, so the player
  // sees the damage reflected in their HP before they act.
  const statusTick = applyHeroStatusAtTurnStart(
    {
      burn: session.heroBurn,
      poison: session.heroPoison,
    },
    {
      ...session.state,
      heroArmor: 0,
    },
  )

  // If status damage kills the hero, record defeat immediately.
  // Do not draw cards or restore energy for a dead hero.
  const outcomeAfterStatus = checkBattleOutcome(statusTick.state)
  if (outcomeAfterStatus !== 'ongoing') {
    return {
      ...session,
      state: statusTick.state,
      heroBurn: statusTick.nextStatus.burn,
      heroPoison: statusTick.nextStatus.poison,
      turnNumber: nextTurnNumber,
      outcome: outcomeAfterStatus,
    }
  }

  const stateAfterAbilityBonus = {
    ...statusTick.state,
    heroArmor: statusTick.state.heroArmor + getAbilityTurnStartArmor(session.abilities),
  }
  const drawBonus =
    getEveryThirdTurnExtraDraw(nextTurnNumber, session.relics)
    + getAbilityEveryThirdTurnExtraDraw(nextTurnNumber, session.abilities)

  const withPhaseTransition = maybeEnterBossPhaseTwo({
    ...session,
    state: stateAfterAbilityBonus,
    heroBurn: statusTick.nextStatus.burn,
    heroPoison: statusTick.nextStatus.poison,
    turnNumber: nextTurnNumber,
    turnCardState: {
      playedAttack: false,
      playedSkill: false,
      crownSparkTriggered: false,
    },
  })

  const nextIntentIndex = getNextIntentIndex(withPhaseTransition)

  const withResetEnergy: BattleSession = {
    ...withPhaseTransition,
    currentEnergy: session.maxEnergy,
    currentIntentIndex: nextIntentIndex,
  }

  return drawCards(withResetEnergy, 4 + drawBonus)
}

export function resolveEnemyIntentAction(session: BattleSession): BattleSession {
  const withPhaseTransition = maybeEnterBossPhaseTwo(session)
  const intent = getCurrentIntent(withPhaseTransition)
  // Temporary armor reset timing: enemy armor clears at the start of the enemy turn.
  const stateAtEnemyTurnStart = {
    ...withPhaseTransition.state,
    enemyArmor: 0,
  }
  const stateAfterEnemyBurn = applyEnemyBurnAtEnemyTurnStart(stateAtEnemyTurnStart, withPhaseTransition.enemyBurn)
  const nextEnemyBurn = Math.max(0, withPhaseTransition.enemyBurn - 1)
  const outcomeAfterEnemyBurn = checkBattleOutcome(stateAfterEnemyBurn)

  if (outcomeAfterEnemyBurn !== 'ongoing') {
    return {
      ...withPhaseTransition,
      state: stateAfterEnemyBurn,
      enemyBurn: nextEnemyBurn,
      outcome: outcomeAfterEnemyBurn,
    }
  }

  let nextState = stateAfterEnemyBurn
  let nextHeroBurn = withPhaseTransition.heroBurn
  let nextHeroPoison = withPhaseTransition.heroPoison
  let nextEnemyReflect = 0

  // Enemy defend/block is resolved from the same structured action source used by UI preview.
  getEnemyIntentActions(intent).forEach((action) => {
    if (action.type === 'attack') {
      nextState = resolveEnemyAttack(nextState, action.value)
      return
    }

    if (action.type === 'armor') {
      nextState = {
        ...nextState,
        enemyArmor: nextState.enemyArmor + action.value,
      }
      return
    }

    // Hero status effects are applied when enemy intent actions resolve.
    if (action.type === 'burn') {
      nextHeroBurn += action.value
      return
    }

    if (action.type === 'poison') {
      nextHeroPoison += action.value
      return
    }

    if (action.type === 'reflect') {
      nextEnemyReflect = action.value
    }
  })

  // Check outcome after all intent actions resolve.
  // Enemy attack can reduce heroHp to 0; outcome must be set so PlayScene reacts correctly.
  // Status stacks added here (burn/poison) will deal damage at the NEXT player turn start, not now.
  return {
    ...withPhaseTransition,
    state: nextState,
    heroBurn: nextHeroBurn,
    heroPoison: nextHeroPoison,
    enemyBurn: nextEnemyBurn,
    enemyReflect: nextEnemyReflect,
    outcome: checkBattleOutcome(nextState),
  }
}

export function drawCards(session: BattleSession, count: number): BattleSession {
  let nextSession = session

  for (let i = 0; i < count; i += 1) {
    if (nextSession.drawPile.length === 0) {
      nextSession = reshuffleDiscardIntoDrawPile(nextSession)
    }

    if (nextSession.drawPile.length === 0) {
      break
    }

    const [drawnCard, ...remainingDrawPile] = nextSession.drawPile
    nextSession = {
      ...nextSession,
      drawPile: remainingDrawPile,
      hand: [...nextSession.hand, drawnCard],
    }
  }

  return nextSession
}

export function discardHand(session: BattleSession): BattleSession {
  if (session.hand.length === 0) {
    return session
  }

  return {
    ...session,
    hand: [],
    discardPile: [...session.discardPile, ...session.hand],
  }
}

export function reshuffleDiscardIntoDrawPile(session: BattleSession): BattleSession {
  if (session.drawPile.length > 0 || session.discardPile.length === 0) {
    return session
  }

  return {
    ...session,
    drawPile: shuffleCards([...session.discardPile]),
    discardPile: [],
  }
}

function getEnemyForEncounter(encounterType: EncounterType): EnemyContent {
  if (encounterType === 'elite') {
    return getRandomEliteEnemy()
  }

  if (encounterType === 'boss') {
    return getRandomBossEnemy()
  }

  return getRandomEnemy()
}

function applyCardWithHooks(
  session: BattleSession,
  cardId: string,
  effectType: CardEffectType,
  baseValue: number,
): {
  nextState: BattleState
  nextTriggerState: BattleSession['relicTriggerState']
  drawCount: number
  enemyBurn: number
} {
  const nextTriggerState = { ...session.relicTriggerState }
  let nextState = session.state
  let drawCount = 0

  if (effectType === 'armor') {
    let armorValue = baseValue

    if (!nextTriggerState.firstBlockUsed) {
      armorValue += getFirstBlockBonusAmount(session.relics)
      armorValue += getAbilityFirstBlockBonusAmount(session.abilities)
      nextTriggerState.firstBlockUsed = true
    }

    nextState = applyCardEffect(nextState, effectType, armorValue)

    if (cardId === 'charge') {
      drawCount += 1
    }

    if (cardId === 'crown-diamonds') {
      nextState = {
        ...nextState,
        ember: clampEmber(nextState.ember + 1),
      }
      drawCount += 1
    }

    if (cardId === 'reliquary-pulse') {
      const spentEmber = nextState.ember
      nextState = {
        ...nextState,
        ember: 0,
        heroArmor: nextState.heroArmor + baseValue,
      }
      drawCount += spentEmber
    }

    if (cardId === 'silver-protection' && session.turnCardState.playedAttack) {
      nextState = {
        ...nextState,
        ember: clampEmber(nextState.ember + 1),
      }
    }
  } else {
    let damageValue = baseValue
    const isDoubleStrike = cardId === 'double-strike'

    if (!nextTriggerState.firstAttackUsed) {
      damageValue += getFirstAttackBonusDamage(session.relics)
      damageValue += getAbilityFirstAttackBonusDamage(session.abilities)
      damageValue += session.boonState.firstAttackBonusDamage
      nextTriggerState.firstAttackUsed = true
    }

    if (cardId === 'ember-fire' && nextState.ember > 0) {
      damageValue += 3
    }

    if (cardId === 'crownfall' && nextState.ember > 0) {
      nextState = {
        ...nextState,
        ember: nextState.ember - 1,
      }
      damageValue += 6
    }

    if (isDoubleStrike) {
      nextState = applyCardEffect(nextState, effectType, damageValue)
      nextState = applyCardEffect(nextState, effectType, baseValue)
    } else {
      nextState = applyCardEffect(nextState, effectType, damageValue)
    }

    if (cardId === 'golden-horseshoe') {
      return {
        nextState,
        nextTriggerState,
        drawCount,
        enemyBurn: session.enemyBurn + 2,
      }
    }
  }

  return {
    nextState,
    nextTriggerState,
    drawCount,
    enemyBurn: session.enemyBurn,
  }
}

function getUpdatedTurnCardState(
  turnCardState: BattleSession['turnCardState'],
  effectType: CardEffectType,
): BattleSession['turnCardState'] {
  return {
    ...turnCardState,
    playedAttack: turnCardState.playedAttack || effectType === 'damage',
    playedSkill: turnCardState.playedSkill || effectType === 'armor',
  }
}

function applyCrownSparkPassive(session: BattleSession): BattleSession {
  const { playedAttack, playedSkill, crownSparkTriggered } = session.turnCardState

  if (!playedAttack || !playedSkill || crownSparkTriggered) {
    return session
  }

  return {
    ...session,
    state: {
      ...session.state,
      ember: clampEmber(session.state.ember + 1),
    },
    turnCardState: {
      ...session.turnCardState,
      crownSparkTriggered: true,
    },
  }
}

function getBaseCardId(cardId: string): string {
  return cardId
    .replace(/-run-\d+$/, '')
    .replace(/-starter-\d+$/, '')
}

function clampEmber(ember: number): number {
  return Math.max(0, Math.min(MAX_EMBER, ember))
}

function getNextIntentIndex(session: BattleSession): number {
  const intents = getActiveIntentCycle(session)

  if (intents.length === 0) {
    return -1
  }

  return (session.currentIntentIndex + 1) % intents.length
}

function getActiveIntentCycle(session: BattleSession): EnemyIntent[] {
  if (session.enemyPhase === 2 && session.enemy.phaseTwoIntents && session.enemy.phaseTwoIntents.length > 0) {
    return session.enemy.phaseTwoIntents
  }

  return session.enemy.intents
}

function maybeEnterBossPhaseTwo(session: BattleSession): BattleSession {
  if (!session.enemy.phaseTwoIntents || session.enemy.phaseTwoIntents.length === 0) {
    return session
  }

  if (session.enemyPhase === 2) {
    return session
  }

  if (session.state.enemyHp > session.enemy.maxHp / 2) {
    return session
  }

  return {
    ...session,
    enemyPhase: 2,
    currentIntentIndex: 0,
  }
}

// Status effect lifecycle (burn and poison share the same stack model):
//
//   APPLY    — stacks are added to heroBurn / heroPoison when an enemy intent resolves
//              (in resolveEnemyIntentAction). Multiple stacks can accumulate across turns.
//
//   DISPLAY  — heroStatusText in PlayScene is updated after every session change.
//              The displayed number equals the damage the player will take next tick.
//
//   TICK     — this function runs at the start of every player turn, before cards are drawn.
//              Damage is applied first, then stacks decrement.
//
//   DAMAGE   — each stack point reduces heroHp by 1 (burn damage bypasses hero armor).
//
//   DECREMENT — stacks reduce by 1 each turn. 1-stack burn deals 1 damage then expires
//              in the same tick. 3-stack burn deals 3 damage, then 2, then 1, then expires.
//
//   EXPIRE   — when stacks reach 0 via decrement, the effect is gone.
//              The status icon disappears from the HUD.
//
// Burn and poison both use this stack model. They are differentiated by icon (🔥 vs ☠)
// and source (burn from fire attacks, poison from venom attacks) only.
function applyHeroStatusAtTurnStart(
  status: { burn: number; poison: number },
  state: BattleState,
): {
  state: BattleState
  nextStatus: { burn: number; poison: number }
} {
  let nextState = state

  // Burn tick: hero takes damage equal to current burn stacks, bypassing armor.
  if (status.burn > 0) {
    nextState = {
      ...nextState,
      heroHp: Math.max(0, nextState.heroHp - status.burn),
    }
  }

  // Poison tick: hero takes damage equal to current poison stacks, bypassing armor.
  if (status.poison > 0) {
    nextState = {
      ...nextState,
      heroHp: Math.max(0, nextState.heroHp - status.poison),
    }
  }

  // Decrement both stacks by 1. When they reach 0 the effect expires.
  return {
    state: nextState,
    nextStatus: {
      burn: Math.max(0, status.burn - 1),
      poison: Math.max(0, status.poison - 1),
    },
  }
}

function applyEnemyBurnAtEnemyTurnStart(state: BattleState, burnAmount: number): BattleState {
  if (burnAmount <= 0) {
    return state
  }

  return {
    ...state,
    enemyHp: Math.max(0, state.enemyHp - burnAmount),
  }
}

function cloneDeck(deck: CardContent[]): CardContent[] {
  return deck.map((card) => ({ ...card }))
}

function cloneRelics(relics: RelicContent[]): RelicContent[] {
  return relics.map((relic) => ({ ...relic }))
}

function cloneAbilities(abilities: HeroAbilityContent[]): HeroAbilityContent[] {
  return abilities.map((ability) => ({ ...ability }))
}

function shuffleCards(cards: CardContent[]): CardContent[] {
  const shuffled = [...cards]

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = shuffled[i]
    shuffled[i] = shuffled[j]
    shuffled[j] = temp
  }

  return shuffled
}
