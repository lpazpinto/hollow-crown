import type { BattleOutcome, BattleState } from './battleLogic'
import { CURRENT_HAND, type CardContent } from '../content/cards'
import { SKELETON_KNIGHT, type EnemyContent } from '../content/enemies'

export type BattleSession = {
  state: BattleState
  hand: CardContent[]
  enemy: EnemyContent
  currentIntentIndex: number
  outcome: BattleOutcome
}

export function createInitialBattleSession(): BattleSession {
  const enemy = SKELETON_KNIGHT

  return {
    state: {
      heroHp: 40,
      heroArmor: 0,
      enemyHp: enemy.maxHp,
    },
    hand: CURRENT_HAND,
    enemy,
    currentIntentIndex: -1,
    outcome: 'ongoing',
  }
}