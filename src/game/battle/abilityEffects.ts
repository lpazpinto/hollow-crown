import type { HeroAbilityContent } from '../content/abilities'

export function getAbilityBattleStartEmber(abilities: HeroAbilityContent[]): number {
  return sumAbilityValue(abilities, 'battle_start_ember')
}

export function getAbilityTurnStartArmor(abilities: HeroAbilityContent[]): number {
  return sumAbilityValue(abilities, 'turn_start_armor')
}

export function getAbilityFirstAttackBonusDamage(abilities: HeroAbilityContent[]): number {
  return sumAbilityValue(abilities, 'first_attack_bonus_damage')
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
