import {
  applyCardEffect,
  checkBattleOutcome,
  type BattleOutcome,
  type BattleState,
} from './battleLogic'
import { STARTER_HAND, type CardContent } from '../content/cards'
import {
  SKELETON_KNIGHT,
  type EnemyContent,
  type EnemyIntent,
} from '../content/enemies'

export type BattleSession = {
  state: BattleState
  hand: CardContent[]
  enemy: EnemyContent
  currentEnergy: number
  maxEnergy: number
  currentIntentIndex: number
  outcome: BattleOutcome
}

export function createInitialBattleSession(): BattleSession {
  const enemy = SKELETON_KNIGHT
  const maxEnergy = 3

  return {
    state: {
      heroHp: 40,
      heroArmor: 0,
      enemyHp: enemy.maxHp,
    },
    hand: cloneStarterHand(),
    enemy,
    currentEnergy: maxEnergy,
    maxEnergy,
    currentIntentIndex: -1,
    outcome: 'ongoing',
  }
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

  const nextState = applyCardEffect(session.state, card.effectType, card.value)
  const nextHand = session.hand.filter((_, index) => index !== cardIndex)

  return {
    ...session,
    state: nextState,
    hand: nextHand,
    currentEnergy: session.currentEnergy - card.cost,
    outcome: checkBattleOutcome(nextState),
  }
}

export function startNewPlayerTurn(session: BattleSession): BattleSession {
  const nextIntentIndex = getNextIntentIndex(session)

  return {
    ...session,
    hand: cloneStarterHand(),
    currentEnergy: session.maxEnergy,
    currentIntentIndex: nextIntentIndex,
  }
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

function cloneStarterHand(): CardContent[] {
  return STARTER_HAND.map((card) => ({ ...card }))
}