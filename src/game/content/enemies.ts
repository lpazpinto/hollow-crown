export type EnemyIntent = {
  id: string
  label: string
  damage: number
  armorValue?: number
  burnValue?: number
  poisonValue?: number
  reflectValue?: number
}

export type EnemyIntentActionType = 'attack' | 'armor' | 'burn' | 'poison' | 'reflect'

export type EnemyIntentAction = {
  type: EnemyIntentActionType
  value: number
}

// Enemy intent action structure: every preview/resolution path reads the same action list.
export function getEnemyIntentActions(intent: EnemyIntent): EnemyIntentAction[] {
  const actions: EnemyIntentAction[] = []

  if (intent.damage > 0) {
    actions.push({ type: 'attack', value: intent.damage })
  }

  if ((intent.armorValue ?? 0) > 0) {
    actions.push({ type: 'armor', value: intent.armorValue ?? 0 })
  }

  if ((intent.burnValue ?? 0) > 0) {
    actions.push({ type: 'burn', value: intent.burnValue ?? 0 })
  }

  if ((intent.poisonValue ?? 0) > 0) {
    actions.push({ type: 'poison', value: intent.poisonValue ?? 0 })
  }

  if ((intent.reflectValue ?? 0) > 0) {
    actions.push({ type: 'reflect', value: intent.reflectValue ?? 0 })
  }

  return actions
}

export type EnemyTier = 'common' | 'elite' | 'boss'

export type EnemyContent = {
  id: string
  name: string
  tier: EnemyTier
  maxHp: number
  initialIntent: EnemyIntent
  intents: EnemyIntent[]
  phaseTwoIntents?: EnemyIntent[]
}

export const HOLLOW_RAT: EnemyContent = {
  id: 'hollow-rat',
  name: 'Hollow Rat',
  tier: 'common',
  maxHp: 24,
  initialIntent: {
    id: 'attack-5',
    label: 'Attack for 5',
    damage: 5,
  },
  intents: [
    { id: 'attack-5', label: 'Attack for 5', damage: 5 },
    { id: 'defend-4', label: 'Defend 4', damage: 0, armorValue: 4 },
    { id: 'attack-6', label: 'Attack for 6', damage: 6 },
  ],
}

export const THORN_ACOLYTE: EnemyContent = {
  id: 'thorn-acolyte',
  name: 'Thorn Acolyte',
  tier: 'common',
  maxHp: 28,
  initialIntent: {
    id: 'attack-5-burn-2',
    label: 'Attack for 5 + Burn 2',
    damage: 5,
    burnValue: 2,
  },
  intents: [
    { id: 'attack-5-burn-2', label: 'Attack for 5 + Burn 2', damage: 5, burnValue: 2 },
    { id: 'defend-5', label: 'Defend 5', damage: 0, armorValue: 5 },
    { id: 'attack-7', label: 'Attack for 7', damage: 7 },
  ],
}

export const RUIN_BEETLE: EnemyContent = {
  id: 'ruin-beetle',
  name: 'Ruin Beetle',
  tier: 'common',
  maxHp: 36,
  initialIntent: {
    id: 'gain-6-armor',
    label: 'Gain 6 armor',
    damage: 0,
    armorValue: 6,
  },
  intents: [
    { id: 'gain-6-armor', label: 'Gain 6 armor', damage: 0, armorValue: 6 },
    { id: 'attack-8', label: 'Attack for 8', damage: 8 },
    { id: 'gain-4-armor', label: 'Gain 4 armor', damage: 0, armorValue: 4 },
    { id: 'attack-10', label: 'Attack for 10', damage: 10 },
  ],
}

export const ASHEN_KNIGHT: EnemyContent = {
  id: 'ashen-knight',
  name: 'Ashen Knight',
  tier: 'elite',
  maxHp: 52,
  initialIntent: {
    id: 'heavy-attack-10',
    label: 'Heavy Attack for 10',
    damage: 10,
  },
  intents: [
    { id: 'heavy-attack-10', label: 'Heavy Attack for 10', damage: 10 },
    {
      id: 'fortify-8-reflect-2',
      label: 'Fortify: Gain 8 armor, Reflect 2',
      damage: 0,
      armorValue: 8,
      reflectValue: 2,
    },
    { id: 'attack-7', label: 'Attack for 7', damage: 7 },
    {
      id: 'fortify-6-reflect-2',
      label: 'Fortify: Gain 6 armor, Reflect 2',
      damage: 0,
      armorValue: 6,
      reflectValue: 2,
    },
  ],
}

export const CORRUPTED_SLIME: EnemyContent = {
  id: 'corrupted-slime',
  name: 'Corrupted Slime',
  tier: 'boss',
  maxHp: 72,
  initialIntent: {
    id: 'slam-8',
    label: 'Slam for 8',
    damage: 8,
  },
  intents: [
    { id: 'slam-8', label: 'Slam for 8', damage: 8 },
    { id: 'defend-6', label: 'Defend 6', damage: 0, armorValue: 6 },
    { id: 'slime-burst-6-burn-1', label: 'Slime Burst 6 + Burn 1', damage: 6, burnValue: 1 },
  ],
  phaseTwoIntents: [
    { id: 'empower-6-armor', label: 'Empower: Gain 6 armor', damage: 0, armorValue: 6 },
    { id: 'heavy-slam-14', label: 'Heavy Slam for 14', damage: 14 },
    { id: 'corrupt-burst-8-burn-2', label: 'Corrupt Burst 8 + Burn 2', damage: 8, burnValue: 2 },
  ],
}

export const ENEMY_POOL: EnemyContent[] = [
  HOLLOW_RAT,
  THORN_ACOLYTE,
  RUIN_BEETLE,
]

export const ELITE_ENEMY_POOL: EnemyContent[] = [
  ASHEN_KNIGHT,
]

export const BOSS_ENEMY_POOL: EnemyContent[] = [
  CORRUPTED_SLIME,
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