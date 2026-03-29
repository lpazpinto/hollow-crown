export type HeroAbilityEffectType =
  | 'battle_start_ember'
  | 'turn_start_armor'
  | 'first_block_bonus'
  | 'every_third_turn_extra_draw'
  | 'post_elite_boss_heal'
  | 'first_attack_bonus_damage'

export type HeroAbilityContent = {
  id: string
  name: string
  description: string
  effectType: HeroAbilityEffectType
  value: number
}

export const HERO_ABILITY_POOL: HeroAbilityContent[] = [
  {
    id: 'blessing-cinder-core',
    name: 'Cinder Core',
    description: 'Start each combat with +1 Ember.',
    effectType: 'battle_start_ember',
    value: 1,
  },
  {
    id: 'blessing-steady-heart',
    name: 'Steady Heart',
    description: 'At the start of each player turn, gain 2 Armor.',
    effectType: 'turn_start_armor',
    value: 2,
  },
  {
    id: 'blessing-horn-edge',
    name: 'Horn Edge',
    description: 'Your first Attack each combat deals +3 damage.',
    effectType: 'first_attack_bonus_damage',
    value: 3,
  },
  {
    id: 'blessing-warding-horn',
    name: 'Warding Horn',
    description: 'Your first Armor card each combat gains +3 Armor.',
    effectType: 'first_block_bonus',
    value: 3,
  },
  {
    id: 'blessing-rhythm-breath',
    name: 'Rhythm Breath',
    description: 'Every 3 turns, draw 1 extra card.',
    effectType: 'every_third_turn_extra_draw',
    value: 1,
  },
  {
    id: 'blessing-golden-oath',
    name: 'Golden Oath',
    description: 'After elite or boss victories, heal 4 HP.',
    effectType: 'post_elite_boss_heal',
    value: 4,
  },
]

export function getAbilityBaseId(abilityId: string): string {
  return abilityId.replace(/-run-\d+$/, '')
}

export function getAbilityChoicesForRun(
  ownedAbilities: HeroAbilityContent[],
  count: number,
): HeroAbilityContent[] {
  const owned = new Set(ownedAbilities.map((ability) => getAbilityBaseId(ability.id)))
  const candidates = HERO_ABILITY_POOL.filter((ability) => !owned.has(ability.id))

  return shuffle(candidates).slice(0, count).map((ability) => ({ ...ability }))
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = copy[i]
    copy[i] = copy[j]
    copy[j] = temp
  }

  return copy
}
