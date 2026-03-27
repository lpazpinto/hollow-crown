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

export const CULTIST: EnemyContent = {
  id: 'cultist',
  name: 'Cultist',
  maxHp: 24,
  initialIntent: {
    label: 'Attack for 5',
    damage: 5,
  },
  intents: [
    { label: 'Attack for 5', damage: 5 },
    { label: 'Heavy Attack for 8', damage: 8 },
    { label: 'Rest', damage: 0 },
  ],
}

export const SLIME_BRUTE: EnemyContent = {
  id: 'slime-brute',
  name: 'Slime Brute',
  maxHp: 36,
  initialIntent: {
    label: 'Attack for 4',
    damage: 4,
  },
  intents: [
    { label: 'Attack for 4', damage: 4 },
    { label: 'Heavy Attack for 12', damage: 12 },
    { label: 'Rest', damage: 0 },
  ],
}

export const CROWN_SENTINEL: EnemyContent = {
  id: 'crown-sentinel',
  name: 'Crown Sentinel',
  maxHp: 55,
  initialIntent: {
    label: 'Attack for 8',
    damage: 8,
  },
  intents: [
    { label: 'Attack for 8', damage: 8 },
    { label: 'Heavy Attack for 14', damage: 14 },
    { label: 'Rest', damage: 0 },
  ],
}

export const ENEMY_POOL: EnemyContent[] = [
  SKELETON_KNIGHT,
  CULTIST,
  SLIME_BRUTE,
]

export const ELITE_ENEMY_POOL: EnemyContent[] = [
  SLIME_BRUTE,
  SKELETON_KNIGHT,
]

export const BOSS_ENEMY_POOL: EnemyContent[] = [
  CROWN_SENTINEL,
]

export function getRandomEnemy(): EnemyContent {
  const index = Math.floor(Math.random() * ENEMY_POOL.length)
  return ENEMY_POOL[index]
}

export function getRandomEliteEnemy(): EnemyContent {
  const index = Math.floor(Math.random() * ELITE_ENEMY_POOL.length)
  return ELITE_ENEMY_POOL[index]
}

export function getRandomBossEnemy(): EnemyContent {
  const index = Math.floor(Math.random() * BOSS_ENEMY_POOL.length)
  return BOSS_ENEMY_POOL[index]
}