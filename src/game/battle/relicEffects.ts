import type { RelicContent, RelicEffectType } from '../content/relics'

export function getBattleStartEmberBonus(relics: RelicContent[]): number {
  return getRelicValueTotal(relics, 'battle_start_ember')
}

export function getFirstBlockBonusAmount(relics: RelicContent[]): number {
  return getRelicValueTotal(relics, 'first_block_bonus')
}

export function getFirstAttackBonusDamage(relics: RelicContent[]): number {
  return getRelicValueTotal(relics, 'first_attack_bonus_damage')
}

export function getEveryThirdTurnExtraDraw(turnNumber: number, relics: RelicContent[]): number {
  if (turnNumber % 3 !== 0) {
    return 0
  }

  return getRelicValueTotal(relics, 'every_third_turn_extra_draw')
}

export function getPostBattleHealAmount(relics: RelicContent[]): number {
  return getRelicValueTotal(relics, 'post_elite_boss_heal')
}

function getRelicValueTotal(relics: RelicContent[], effectType: RelicEffectType): number {
  return relics
    .filter((relic) => relic.effectType === effectType)
    .reduce((total, relic) => total + relic.value, 0)
}
