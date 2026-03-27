import type { CardEffectType } from '../battle/battleLogic'

export type CardContent = {
  id: string
  title: string
  description: string
  effectType: CardEffectType
  value: number
  cost: number
}

export const STARTER_DECK: CardContent[] = [
  {
    id: 'strike-1',
    title: 'Strike',
    description: 'Deal 6 damage',
    effectType: 'damage',
    value: 6,
    cost: 1,
  },
  {
    id: 'defend-1',
    title: 'Defend',
    description: 'Gain 5 armor',
    effectType: 'armor',
    value: 5,
    cost: 1,
  },
  {
    id: 'fireball-1',
    title: 'Fireball',
    description: 'Deal 8 damage',
    effectType: 'damage',
    value: 8,
    cost: 2,
  },
]

export const REWARD_CARD_OPTIONS: CardContent[] = [
  {
    id: 'cleave-reward',
    title: 'Cleave',
    description: 'Deal 10 damage',
    effectType: 'damage',
    value: 10,
    cost: 2,
  },
  {
    id: 'barrier-reward',
    title: 'Barrier',
    description: 'Gain 8 armor',
    effectType: 'armor',
    value: 8,
    cost: 2,
  },
  {
    id: 'spark-reward',
    title: 'Spark',
    description: 'Deal 4 damage',
    effectType: 'damage',
    value: 4,
    cost: 0,
  },
]

export const STARTER_HAND = STARTER_DECK
export const CURRENT_HAND = STARTER_DECK