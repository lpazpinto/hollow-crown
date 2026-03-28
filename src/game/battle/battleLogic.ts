export type BattleState = {
  heroHp: number
  heroArmor: number
  enemyHp: number
  enemyArmor: number
}

export type CardEffectType = 'damage' | 'armor'

export type BattleOutcome = 'victory' | 'defeat' | 'ongoing'

export function applyCardEffect(
  state: BattleState,
  effectType: CardEffectType,
  value: number,
): BattleState {
  if (effectType === 'damage') {
    const enemyAfterDamage = applyDamageToArmorThenHp(state.enemyArmor, state.enemyHp, value)

    return {
      ...state,
      enemyArmor: enemyAfterDamage.heroArmor,
      enemyHp: enemyAfterDamage.heroHp,
    }
  }

  return {
    ...state,
    heroArmor: state.heroArmor + value,
  }
}

export function applyDamageToArmorThenHp(
  heroArmor: number,
  heroHp: number,
  damage: number,
): { heroArmor: number; heroHp: number } {
  if (damage <= 0) {
    return { heroArmor, heroHp }
  }

  const armorBlocked = Math.min(heroArmor, damage)
  const remainingDamage = damage - armorBlocked

  return {
    heroArmor: heroArmor - armorBlocked,
    heroHp: remainingDamage > 0 ? Math.max(0, heroHp - remainingDamage) : heroHp,
  }
}

export function resolveEnemyAttack(state: BattleState, damage: number): BattleState {
  const afterDamage = applyDamageToArmorThenHp(state.heroArmor, state.heroHp, damage)

  return {
    ...state,
    heroArmor: afterDamage.heroArmor,
    heroHp: afterDamage.heroHp,
  }
}

export function checkBattleOutcome(state: BattleState): BattleOutcome {
  if (state.enemyHp <= 0) {
    return 'victory'
  }

  if (state.heroHp <= 0) {
    return 'defeat'
  }

  return 'ongoing'
}