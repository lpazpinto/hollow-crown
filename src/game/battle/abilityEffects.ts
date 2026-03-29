import type { HeroAbilityContent } from '../content/abilities'

export function getAbilityBattleStartEmber(abilities: HeroAbilityContent[]): number {
  return sumAbilityValue(abilities, 'battle_start_ember')
}

export function getAbilityTurnStartArmor(abilities: HeroAbilityContent[]): number {
  return sumAbilityValue(abilities, 'turn_start_armor')
}

export function getAbilityFirstBlockBonusAmount(abilities: HeroAbilityContent[]): number {
  return sumAbilityValue(abilities, 'first_block_bonus')
}

export function getAbilityFirstAttackBonusDamage(abilities: HeroAbilityContent[]): number {
  return sumAbilityValue(abilities, 'first_attack_bonus_damage')
}

export function getAbilityEveryThirdTurnExtraDraw(
  turnNumber: number,
  abilities: HeroAbilityContent[],
): number {
  if (turnNumber <= 0 || turnNumber % 3 !== 0) {
    return 0
  }

  return sumAbilityValue(abilities, 'every_third_turn_extra_draw')
}

export function getAbilityPostEliteBossHeal(abilities: HeroAbilityContent[]): number {
  return sumAbilityValue(abilities, 'post_elite_boss_heal')
}

function sumAbilityValue(
  abilities: HeroAbilityContent[],
  effectType: HeroAbilityContent['effectType'],
): number {
  return abilities.reduce((total, ability) => {
    if (ability.effectType !== effectType) {
      return total
    }

    return total + ability.value
  }, 0)
}
