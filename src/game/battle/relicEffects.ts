import type { BattleState } from './battleLogic'
import type { RelicContent, RelicEffectType } from '../content/relics'

export function getBattleStartArmorBonus(relics: RelicContent[]): number {
  return getRelicValueTotal(relics, 'battle_start_armor')
}

export function getTurnStartArmorBonus(relics: RelicContent[]): number {
  return getRelicValueTotal(relics, 'turn_start_armor')
}

export function getFirstTurnExtraDraw(relics: RelicContent[]): number {
  return getRelicValueTotal(relics, 'first_turn_extra_draw')
}

export function getConditionalDamageBonus(state: BattleState, relics: RelicContent[]): number {
  if (state.heroHp > 15) {
    return 0
  }

  return getRelicValueTotal(relics, 'low_hp_bonus_damage')
}

export function getPostBattleHealAmount(relics: RelicContent[]): number {
  return getRelicValueTotal(relics, 'post_battle_heal')
}

function getRelicValueTotal(relics: RelicContent[], effectType: RelicEffectType): number {
  return relics
    .filter((relic) => relic.effectType === effectType)
    .reduce((total, relic) => total + relic.value, 0)
}
