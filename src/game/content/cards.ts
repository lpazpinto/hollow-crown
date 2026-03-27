import type { CardEffectType } from '../battle/battleLogic'

export type CardContent = {
  id: string
  title: string
  description: string
  effectType: CardEffectType
  value: number
}

export const CURRENT_HAND: CardContent[] = [
  {
    id: 'strike-1',
    title: 'Strike',
    description: 'Deal 6 damage',
    effectType: 'damage',
    value: 6,
  },
  {
    id: 'defend-1',
    title: 'Defend',
    description: 'Gain 5 armor',
    effectType: 'armor',
    value: 5,
  },
  {
    id: 'fireball-1',
    title: 'Fireball',
    description: 'Deal 8 damage',
    effectType: 'damage',
    value: 8,
  },
]