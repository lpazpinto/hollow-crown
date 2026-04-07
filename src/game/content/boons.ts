export type BoonEffectType =
  | 'start_ember'
  | 'start_armor'
  | 'turn1_extra_draw'
  | 'battle_start_heal'
  | 'first_attack_bonus_damage'

export type BoonContent = {
  id: string
  name: string
  description: string
  effectType: BoonEffectType
  value: number
}

export const BOON_POOL: BoonContent[] = [
  {
    id: 'kindled-start',
    name: 'Kindled Start',
    description: 'Start next battle with +1 Ember',
    effectType: 'start_ember',
    value: 1,
  },
  {
    id: 'warded-step',
    name: 'Warded Step',
    description: 'Start next battle with 5 Block',
    effectType: 'start_armor',
    value: 5,
  },
  {
    id: 'quick-draw',
    name: 'Quick Draw',
    description: 'Draw +1 card on turn 1 of next battle',
    effectType: 'turn1_extra_draw',
    value: 1,
  },
  {
    id: 'menders-sip',
    name: "Mender's Sip",
    description: 'Recover 4 HP at battle start',
    effectType: 'battle_start_heal',
    value: 4,
  },
  {
    id: 'sharp-resolve',
    name: 'Sharp Resolve',
    description: 'First attack next battle gains +3 damage',
    effectType: 'first_attack_bonus_damage',
    value: 3,
  },
]

export function getBoonById(boonId: string | null | undefined): BoonContent | null {
  if (!boonId) {
    return null
  }

  return BOON_POOL.find((boon) => boon.id === boonId) ?? null
}

export function getRandomBoon(): BoonContent {
  const index = Math.floor(Math.random() * BOON_POOL.length)
  return BOON_POOL[index]
}
