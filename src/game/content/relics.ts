export type RelicEffectType =
  | 'battle_start_armor'
  | 'turn_start_armor'
  | 'first_turn_extra_draw'
  | 'low_hp_bonus_damage'
  | 'post_battle_heal'

export type RelicContent = {
  id: string
  name: string
  description: string
  effectType: RelicEffectType
  value: number
}

export const RELIC_POOL: RelicContent[] = [
  {
    id: 'bronze-bulwark',
    name: 'Bronze Bulwark',
    description: 'Gain 4 armor at battle start.',
    effectType: 'battle_start_armor',
    value: 4,
  },
  {
    id: 'thorn-loop',
    name: 'Thorn Loop',
    description: 'Gain 2 armor at the start of each turn.',
    effectType: 'turn_start_armor',
    value: 2,
  },
  {
    id: 'quick-kindling',
    name: 'Quick Kindling',
    description: 'Draw 1 extra card on the first turn.',
    effectType: 'first_turn_extra_draw',
    value: 1,
  },
  {
    id: 'blood-rune',
    name: 'Blood Rune',
    description: 'When at 15 HP or less, deal 2 bonus damage.',
    effectType: 'low_hp_bonus_damage',
    value: 2,
  },
  {
    id: 'vital-seed',
    name: 'Vital Seed',
    description: 'Heal 4 HP after each victory.',
    effectType: 'post_battle_heal',
    value: 4,
  },
]
