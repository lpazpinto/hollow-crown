import {
  applyCardEffect,
  checkBattleOutcome,
  type BattleOutcome,
  type BattleState,
  type CardEffectType,
} from './battleLogic'
import { STARTER_DECK, type CardContent } from '../content/cards'
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
  getBattleStartArmorBonus,
  getConditionalDamageBonus,
  getFirstTurnExtraDraw,
  getTurnStartArmorBonus,
} from './relicEffects'

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
  relics: RelicContent[]
  outcome: BattleOutcome
}

type CreateBattleSessionOptions = {
  heroHp?: number
  encounterType?: EncounterType
  relics?: RelicContent[]
}

export function createInitialBattleSession(
  deck: CardContent[] = STARTER_DECK,
  options: CreateBattleSessionOptions = {},
): BattleSession {
  const encounterType = options.encounterType ?? 'battle'
  const enemy = getEnemyForEncounter(encounterType)
  const maxEnergy = 3
  const shuffledDeck = shuffleCards(cloneDeck(deck))
  const heroHp = options.heroHp ?? 40
  const relics = cloneRelics(options.relics ?? [])
  const battleStartArmor = getBattleStartArmorBonus(relics)
  const firstTurnDraw = getFirstTurnExtraDraw(relics)

  const initialSession: BattleSession = {
    state: {
      heroHp,
      heroArmor: battleStartArmor,
      enemyHp: enemy.maxHp,
    },
    drawPile: shuffledDeck,
    discardPile: [],
    hand: [],
    enemy,
    currentEnergy: maxEnergy,
    maxEnergy,
    currentIntentIndex: -1,
    turnNumber: 1,
    relics,
    outcome: 'ongoing',
  }

  return drawCards(initialSession, 3 + firstTurnDraw)
}

export function getCurrentIntent(session: BattleSession): EnemyIntent {
  if (session.currentIntentIndex < 0) {
    return session.enemy.initialIntent
  }

  return session.enemy.intents[session.currentIntentIndex]
}

export function playCardFromHand(session: BattleSession, cardIndex: number): BattleSession {
  const card = session.hand[cardIndex]
  if (!card || session.outcome !== 'ongoing' || session.currentEnergy < card.cost) {
    return session
  }

  const nextState = applyCardWithRelicBonus(session, card.effectType, card.value)
  const nextHand = session.hand.filter((_, index) => index !== cardIndex)
  const nextDiscardPile = [...session.discardPile, card]

  return {
    ...session,
    state: nextState,
    hand: nextHand,
    discardPile: nextDiscardPile,
    currentEnergy: session.currentEnergy - card.cost,
    outcome: checkBattleOutcome(nextState),
  }
}

export function startNewPlayerTurn(session: BattleSession): BattleSession {
  const nextIntentIndex = getNextIntentIndex(session)
  const turnStartArmor = getTurnStartArmorBonus(session.relics)

  const withResetEnergy: BattleSession = {
    ...session,
    state: {
      ...session.state,
      heroArmor: session.state.heroArmor + turnStartArmor,
    },
    currentEnergy: session.maxEnergy,
    currentIntentIndex: nextIntentIndex,
    turnNumber: session.turnNumber + 1,
  }

  return drawCards(withResetEnergy, 3)
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

function applyCardWithRelicBonus(
  session: BattleSession,
  effectType: CardEffectType,
  baseValue: number,
): BattleState {
  if (effectType !== 'damage') {
    return applyCardEffect(session.state, effectType, baseValue)
  }

  const bonusDamage = getConditionalDamageBonus(session.state, session.relics)
  return applyCardEffect(session.state, effectType, baseValue + bonusDamage)
}

function getNextIntentIndex(session: BattleSession): number {
  if (session.enemy.intents.length === 0) {
    return -1
  }

  if (session.currentIntentIndex < 0) {
    return 0
  }

  return (session.currentIntentIndex + 1) % session.enemy.intents.length
}

function cloneDeck(deck: CardContent[]): CardContent[] {
  return deck.map((card) => ({ ...card }))
}

function cloneRelics(relics: RelicContent[]): RelicContent[] {
  return relics.map((relic) => ({ ...relic }))
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
