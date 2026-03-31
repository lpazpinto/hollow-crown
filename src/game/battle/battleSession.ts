import {
  applyCardEffect,
  checkBattleOutcome,
  resolveEnemyAttack,
  type BattleOutcome,
  type BattleState,
  type CardEffectType,
} from './battleLogic'
import { STARTER_DECK, type CardContent } from '../content/cards'
import type { HeroAbilityContent } from '../content/abilities'
import type { RelicContent } from '../content/relics'
import {
  getRandomBossEnemy,
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
  heroBurn: number
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
}

type CreateBattleSessionOptions = {
  heroHp?: number
  encounterType?: EncounterType
  relics?: RelicContent[]
  abilities?: HeroAbilityContent[]
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
  const startEmber = getBattleStartEmberBonus(relics) + getAbilityBattleStartEmber(abilities)
  const shuffledDeck = shuffleCards(cloneDeck(deck))
  const heroHp = options.heroHp ?? 40

  const initialSession: BattleSession = {
    state: {
      heroHp,
      heroArmor: 0,
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
  }

  return drawCards(initialSession, 4)
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
  if (!card || session.outcome !== 'ongoing' || session.currentEnergy < card.cost) {
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

  if (drawCount > 0) {
    nextSession = drawCards(nextSession, drawCount)
  }

  nextSession = applyCrownSparkPassive(nextSession)

  return nextSession
}

export function startNewPlayerTurn(session: BattleSession): BattleSession {
  const nextTurnNumber = session.turnNumber + 1
  const stateAfterBurn = applyBurnAtTurnStart({
    ...session.state,
    heroArmor: 0,
    enemyArmor: 0,
  }, session.heroBurn)
  const stateAfterAbilityBonus = {
    ...stateAfterBurn,
    heroArmor: stateAfterBurn.heroArmor + getAbilityTurnStartArmor(session.abilities),
  }
  const nextHeroBurn = Math.max(0, session.heroBurn - 1)
  const drawBonus =
    getEveryThirdTurnExtraDraw(nextTurnNumber, session.relics)
    + getAbilityEveryThirdTurnExtraDraw(nextTurnNumber, session.abilities)

  const withPhaseTransition = maybeEnterBossPhaseTwo({
    ...session,
    state: stateAfterAbilityBonus,
    heroBurn: nextHeroBurn,
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
  const stateAfterEnemyBurn = applyEnemyBurnAtEnemyTurnStart(withPhaseTransition.state, withPhaseTransition.enemyBurn)
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

  let nextState = resolveEnemyAttack(stateAfterEnemyBurn, intent.damage)

  if (intent.armorValue && intent.armorValue > 0) {
    nextState = {
      ...nextState,
      enemyArmor: nextState.enemyArmor + intent.armorValue,
    }
  }

  return {
    ...withPhaseTransition,
    state: nextState,
    heroBurn: withPhaseTransition.heroBurn + (intent.burnValue ?? 0),
    enemyBurn: nextEnemyBurn,
    enemyReflect: intent.reflectValue ?? 0,
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

function applyBurnAtTurnStart(state: BattleState, burnAmount: number): BattleState {
  if (burnAmount <= 0) {
    return state
  }

  return {
    ...state,
    heroHp: Math.max(0, state.heroHp - burnAmount),
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
