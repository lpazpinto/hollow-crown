export type EnemyIntent = {
  label: string
  damage: number
}

export type EnemyContent = {
  id: string
  name: string
  maxHp: number
  initialIntent: EnemyIntent
  intents: EnemyIntent[]
}

export const SKELETON_KNIGHT: EnemyContent = {
  id: 'skeleton-knight',
  name: 'Skeleton Knight',
  maxHp: 30,
  initialIntent: {
    label: 'Attack for 6',
    damage: 6,
  },
  intents: [
    { label: 'Attack for 6', damage: 6 },
    { label: 'Heavy Attack for 10', damage: 10 },
    { label: 'Rest', damage: 0 },
  ],
}