import { getRunState, restoreRunState, type RunState } from './runState'

const SAVE_KEY = 'hollow-crown-run'
const ENCOUNTER_TYPES = new Set(['battle', 'rest', 'elite', 'boss'])
const CARD_RARITIES = new Set(['common', 'uncommon', 'rare'])
const ABILITY_EFFECT_TYPES = new Set([
  'battle_start_ember',
  'turn_start_armor',
  'first_block_bonus',
  'every_third_turn_extra_draw',
  'post_elite_boss_heal',
  'first_attack_bonus_damage',
])

export function saveRun(): void {
  try {
    const state = getRunState()
    localStorage.setItem(SAVE_KEY, JSON.stringify(state))
  } catch {
    // localStorage unavailable or quota exceeded — ignore
  }
}

export function hasSave(): boolean {
  try {
    return getSavedRunState() !== null
  } catch {
    return false
  }
}

export function loadSavedRun(): boolean {
  try {
    const state = getSavedRunState()
    if (!state) {
      clearSave()
      return false
    }

    restoreRunState(state)
    return true
  } catch {
    clearSave()
    return false
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(SAVE_KEY)
  } catch {
    // ignore
  }
}

function getSavedRunState(): RunState | null {
  const raw = localStorage.getItem(SAVE_KEY)

  if (!raw) {
    return null
  }

  const parsed = JSON.parse(raw) as unknown
  return isRunState(parsed) ? parsed : null
}

function isRunState(value: unknown): value is RunState {
  if (!isRecord(value)) {
    return false
  }

  return (
    isNumber(value.currentFloor) &&
    isNumber(value.maxFloors) &&
    (value.selectedRouteId === undefined || value.selectedRouteId === null || typeof value.selectedRouteId === 'string') &&
    isNumber(value.heroHp) &&
    isNumber(value.maxHeroHp) &&
    (value.heroXp === undefined || isNumber(value.heroXp)) &&
    (value.heroLevel === undefined || isNumber(value.heroLevel)) &&
    (value.pendingLevelUps === undefined || isNumber(value.pendingLevelUps)) &&
    (value.normalBattleVictories === undefined || isNumber(value.normalBattleVictories)) &&
    typeof value.isRunComplete === 'boolean' &&
    isEncounterType(value.currentEncounterType) &&
    Array.isArray(value.currentDeck) &&
    value.currentDeck.every(isCardContent) &&
    Array.isArray(value.currentRelics) &&
    value.currentRelics.every(isRelicContent) &&
    (value.currentAbilities === undefined ||
      (Array.isArray(value.currentAbilities) && value.currentAbilities.every(isAbilityContent)))
  )
}

function isCardContent(value: unknown): boolean {
  if (!isRecord(value)) {
    return false
  }

  const rarity = value.rarity
  const isValidRarity =
    rarity === undefined || (typeof rarity === 'string' && CARD_RARITIES.has(rarity))

  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.description === 'string' &&
    typeof value.effectType === 'string' &&
    isNumber(value.value) &&
    isNumber(value.cost) &&
    isValidRarity
  )
}

function isRelicContent(value: unknown): boolean {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.description === 'string' &&
    typeof value.effectType === 'string' &&
    isNumber(value.value)
  )
}

function isEncounterType(value: unknown): boolean {
  return value === null || (typeof value === 'string' && ENCOUNTER_TYPES.has(value))
}

function isAbilityContent(value: unknown): boolean {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.description === 'string' &&
    typeof value.effectType === 'string' &&
    ABILITY_EFFECT_TYPES.has(value.effectType) &&
    isNumber(value.value)
  )
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
