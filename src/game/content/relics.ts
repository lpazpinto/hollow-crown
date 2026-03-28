export type RelicEffectType =
  | 'battle_start_ember'
  | 'first_block_bonus'
  | 'first_attack_bonus_damage'
  | 'every_third_turn_extra_draw'
  | 'post_elite_boss_heal'

export type RelicContent = {
  id: string
  name: string
  description: string
  effectType: RelicEffectType
  value: number
}

export const RELIC_POOL: RelicContent[] = [
  {
    id: 'ember-ring',
    name: 'Ember Ring',
    description: 'Gain 1 Ember at the start of each combat.',
    effectType: 'battle_start_ember',
    value: 1,
  },
  {
    id: 'worn-buckler',
    name: 'Worn Buckler',
    description: 'The first time each combat that you gain armor, gain +3 more.',
    effectType: 'first_block_bonus',
    value: 3,
  },
  {
    id: 'rat-fang',
    name: 'Rat Fang',
    description: 'Your first Attack each combat deals +2 damage.',
    effectType: 'first_attack_bonus_damage',
    value: 2,
  },
  {
    id: 'crown-shard',
    name: 'Crown Shard',
    description: 'Every 3 turns, draw 1 extra card.',
    effectType: 'every_third_turn_extra_draw',
    value: 1,
  },
  {
    id: 'pilgrim-lantern',
    name: 'Pilgrim Lantern',
    description: 'Heal 4 HP after elite and boss victories.',
    effectType: 'post_elite_boss_heal',
    value: 4,
  },
]
