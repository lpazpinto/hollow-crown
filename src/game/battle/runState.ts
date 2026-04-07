import { type HeroAbilityContent, getAbilityBaseId } from '../content/abilities'
import { STARTER_DECK, createUpgradedCard, type CardContent } from '../content/cards'
import type { RelicContent } from '../content/relics'
import { getAbilityPostEliteBossHeal } from './abilityEffects'
import { getPostBattleHealAmount } from './relicEffects'

export type EncounterType = 'battle' | 'rest' | 'elite' | 'boss'

export type RunState = {
  currentFloor: number
  maxFloors: number
  selectedRouteId: string | null
  currentDeck: CardContent[]
  currentRelics: RelicContent[]
  currentAbilities: HeroAbilityContent[]
  heroHp: number
  maxHeroHp: number
  heroXp: number
  heroLevel: number
  pendingLevelUps: number
  normalBattleVictories: number
  currentEncounterType: EncounterType | null
  isRunComplete: boolean
}

const LEVEL_XP_THRESHOLDS = [0, 11, 24, 38]

const BATTLE_CARD_REWARD_INTERVAL = 2

const ENCOUNTER_XP_REWARD: Record<'battle' | 'elite' | 'boss', number> = {
  battle: 6,
  elite: 11,
  boss: 17,
}

let runState: RunState | null = null

export function startNewRun() {
  runState = {
    currentFloor: 1,
    maxFloors: 4,
    selectedRouteId: null,
    currentDeck: cloneDeck(STARTER_DECK),
    currentRelics: [],
    currentAbilities: [],
    heroHp: 40,
    maxHeroHp: 40,
    heroXp: 0,
    heroLevel: 1,
    pendingLevelUps: 0,
    normalBattleVictories: 0,
    currentEncounterType: null,
    isRunComplete: false,
  }
}

export function resolveBattleCardRewardForVictory(): boolean {
  ensureRunState()
  const state = runState as RunState

  if (state.currentEncounterType !== 'battle') {
    return false
  }

  state.normalBattleVictories += 1
  return state.normalBattleVictories % BATTLE_CARD_REWARD_INTERVAL === 1
}

export function getEncounterXpReward(encounterType: EncounterType | null): number {
  if (!encounterType || encounterType === 'rest') {
    return 0
  }

  return ENCOUNTER_XP_REWARD[encounterType]
}

export function getNormalBattleRewardPreview(): string {
  ensureRunState()
  const state = runState as RunState

  if (state.normalBattleVictories % BATTLE_CARD_REWARD_INTERVAL === 0) {
    return 'Next normal battle grants a card draft'
  }

  return '1 more normal battle until the next card draft'
}

export function getRunState(): RunState {
  ensureRunState()
  return cloneRunState(runState as RunState)
}

export function setCurrentEncounterType(encounterType: EncounterType) {
  ensureRunState()
  ;(runState as RunState).currentEncounterType = encounterType
}

export function setSelectedRouteId(routeId: string | null) {
  ensureRunState()
  ;(runState as RunState).selectedRouteId = routeId
}

export function getAvailableEncountersForCurrentFloor(): EncounterType[] {
  ensureRunState()
  const floor = (runState as RunState).currentFloor

  if (floor <= 1) {
    return ['battle']
  }

  if (floor === 2) {
    return ['battle', 'rest']
  }

  if (floor === 3) {
    return ['elite']
  }

  if (floor === 4) {
    return ['boss']
  }

  return []
}

export function resolveRestEncounter(healAmount = 12) {
  ensureRunState()
  const state = runState as RunState
  state.heroHp = Math.min(state.maxHeroHp, state.heroHp + healAmount)
  state.currentEncounterType = null
}

export function applyBattleResult(heroHpAfterBattle: number, wasVictory: boolean) {
  ensureRunState()
  const state = runState as RunState
  state.heroHp = Math.max(0, Math.min(state.maxHeroHp, heroHpAfterBattle))

  const isEliteOrBossVictory =
    wasVictory && (state.currentEncounterType === 'elite' || state.currentEncounterType === 'boss')

  if (isEliteOrBossVictory) {
    const healAmount =
      getPostBattleHealAmount(state.currentRelics)
      + getAbilityPostEliteBossHeal(state.currentAbilities)
    state.heroHp = Math.min(state.maxHeroHp, state.heroHp + healAmount)
  }

  if (!wasVictory) {
    state.currentEncounterType = null
  }
}

export function awardXpForCurrentEncounter(): {
  gainedXp: number
  levelsGained: number
  currentLevel: number
  currentXp: number
} {
  ensureRunState()
  const state = runState as RunState

  if (!state.currentEncounterType || state.currentEncounterType === 'rest') {
    return {
      gainedXp: 0,
      levelsGained: 0,
      currentLevel: state.heroLevel,
      currentXp: state.heroXp,
    }
  }

  const encounterType = state.currentEncounterType
  const gainedXp = ENCOUNTER_XP_REWARD[encounterType]
  state.heroXp += gainedXp

  let levelsGained = 0
  while (canLevelUp(state)) {
    state.heroLevel += 1
    state.pendingLevelUps += 1
    levelsGained += 1
  }

  return {
    gainedXp,
    levelsGained,
    currentLevel: state.heroLevel,
    currentXp: state.heroXp,
  }
}

export function hasPendingLevelUp(): boolean {
  ensureRunState()
  return (runState as RunState).pendingLevelUps > 0
}

export function consumePendingLevelUp(): boolean {
  ensureRunState()
  const state = runState as RunState

  if (state.pendingLevelUps <= 0) {
    return false
  }

  state.pendingLevelUps -= 1
  return true
}

export function getXpForNextLevel(): number | null {
  ensureRunState()
  const state = runState as RunState
  const nextLevel = state.heroLevel + 1

  if (nextLevel >= LEVEL_XP_THRESHOLDS.length) {
    return null
  }

  return LEVEL_XP_THRESHOLDS[nextLevel]
}

export function advanceFloorAfterEncounter() {
  ensureRunState()
  const state = runState as RunState

  if (state.currentFloor >= state.maxFloors) {
    state.isRunComplete = true
  } else {
    state.currentFloor += 1
  }

  state.currentEncounterType = null
}

export function restoreRunState(saved: RunState) {
  runState = normalizeRunState(saved)
}

export function resetRunDeck() {
  startNewRun()
}

export function getRunDeck(): CardContent[] {
  ensureRunState()
  return cloneDeck((runState as RunState).currentDeck)
}

export function addCardToRunDeck(card: CardContent) {
  ensureRunState()
  const state = runState as RunState

  const copy = {
    ...card,
    id: `${card.id}-run-${state.currentDeck.length + 1}`,
  }

  state.currentDeck = [...state.currentDeck, copy]
}

export function upgradeRunCard(cardId: string): boolean {
  ensureRunState()
  const state = runState as RunState
  const cardIndex = state.currentDeck.findIndex((card) => card.id === cardId)

  if (cardIndex < 0) {
    return false
  }

  const nextDeck = [...state.currentDeck]
  nextDeck[cardIndex] = createUpgradedCard(nextDeck[cardIndex])
  state.currentDeck = nextDeck

  return true
}

export function getRunRelics(): RelicContent[] {
  ensureRunState()
  return cloneRelics((runState as RunState).currentRelics)
}

export function addRelicToRun(relic: RelicContent) {
  ensureRunState()
  const state = runState as RunState

  const copy = {
    ...relic,
    id: `${relic.id}-run-${state.currentRelics.length + 1}`,
  }

  state.currentRelics = [...state.currentRelics, copy]
}

export function getRunAbilities(): HeroAbilityContent[] {
  ensureRunState()
  return cloneAbilities((runState as RunState).currentAbilities)
}

export function addAbilityToRun(ability: HeroAbilityContent): boolean {
  ensureRunState()
  const state = runState as RunState
  const nextBaseId = getAbilityBaseId(ability.id)

  const alreadyOwned = state.currentAbilities.some(
    (ownedAbility) => getAbilityBaseId(ownedAbility.id) === nextBaseId,
  )

  if (alreadyOwned) {
    return false
  }

  const copy = {
    ...ability,
    id: `${ability.id}-run-${state.currentAbilities.length + 1}`,
  }

  state.currentAbilities = [...state.currentAbilities, copy]
  return true
}

function ensureRunState() {
  if (!runState) {
    startNewRun()
  }
}

function cloneDeck(deck: CardContent[]): CardContent[] {
  return deck.map((card) => ({ ...card }))
}

function cloneRunState(state: RunState): RunState {
  return {
    ...state,
    currentDeck: cloneDeck(state.currentDeck),
    currentRelics: cloneRelics(state.currentRelics),
    currentAbilities: cloneAbilities(state.currentAbilities),
  }
}

function cloneRelics(relics: RelicContent[]): RelicContent[] {
  return relics.map((relic) => ({ ...relic }))
}

function cloneAbilities(abilities: HeroAbilityContent[]): HeroAbilityContent[] {
  return abilities.map((ability) => ({ ...ability }))
}

function canLevelUp(state: RunState): boolean {
  const nextLevel = state.heroLevel + 1

  if (nextLevel >= LEVEL_XP_THRESHOLDS.length) {
    return false
  }

  return state.heroXp >= LEVEL_XP_THRESHOLDS[nextLevel]
}

function normalizeRunState(saved: RunState): RunState {
  const normalized = cloneRunState({
    ...saved,
    selectedRouteId: saved.selectedRouteId ?? null,
    currentAbilities: saved.currentAbilities ?? [],
    heroXp: saved.heroXp ?? 0,
    heroLevel: saved.heroLevel ?? 1,
    pendingLevelUps: saved.pendingLevelUps ?? 0,
    normalBattleVictories: saved.normalBattleVictories ?? 0,
  })

  if (normalized.heroLevel < 1) {
    normalized.heroLevel = 1
  }

  if (normalized.heroXp < 0) {
    normalized.heroXp = 0
  }

  if (normalized.pendingLevelUps < 0) {
    normalized.pendingLevelUps = 0
  }

  if (normalized.normalBattleVictories < 0) {
    normalized.normalBattleVictories = 0
  }

  return normalized
}
