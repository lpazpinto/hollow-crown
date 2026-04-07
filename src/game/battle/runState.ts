import { type HeroAbilityContent, getAbilityBaseId } from '../content/abilities'
import { getBoonById, getRandomBoon, type BoonContent } from '../content/boons'
import { STARTER_DECK, createUpgradedCard, type CardContent } from '../content/cards'
import {
  getDefaultRouteLayoutId,
  getDefaultRoutePath,
  getRouteChoiceNodes,
  getRouteNodeById,
  getRouteNodeIdsForStep,
  getRoutePathById,
  pickRandomRouteLayoutId,
} from '../content/routes'
import type { RelicContent } from '../content/relics'
import { getAbilityPostEliteBossHeal } from './abilityEffects'
import { getPostBattleHealAmount } from './relicEffects'

export type EncounterType = 'battle' | 'rest' | 'elite' | 'boss'

export type RunState = {
  currentFloor: number
  maxFloors: number
  selectedRouteId: string | null
  selectedRouteLayoutId: string | null
  currentRouteStep: number
  currentRouteChoiceNodeIds: string[]
  currentRouteNodeId: string | null
  pendingRouteChoiceNodeIds: string[]
  shardCount: number
  isForgeAvailable: boolean
  currentBoonId: string | null
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

export type RouteChoice = {
  nodeId: string
  encounterType: EncounterType
  label: string
}

const LEVEL_XP_STEP_COSTS = [8, 12, 16, 20]
const LEVEL_XP_THRESHOLDS = buildLevelXpThresholds(LEVEL_XP_STEP_COSTS)

// Milestone card cadence control:
// normal battles do not grant permanent cards by default;
// every N normal battle wins grants one card draft.
const BATTLE_CARD_REWARD_INTERVAL = 3

// Tuning target (route-rewards-levelup-direction-update.md):
// - normal battle: 4-5 XP
// - elite: 7-8 XP
// - boss: 10-12 XP
const ENCOUNTER_XP_REWARD: Record<'battle' | 'elite' | 'boss', number> = {
  battle: 5,
  elite: 8,
  boss: 12,
}

const SHARDS_FOR_FORGE = 3
const SHARD_BATTLE_REWARD_CHANCE = 0.45

let runState: RunState | null = null

export function startNewRun() {
  const defaultPath = getDefaultRoutePath()

  runState = {
    currentFloor: 1,
    maxFloors: defaultPath.length,
    selectedRouteId: null,
    selectedRouteLayoutId: null,
    currentRouteStep: 0,
    currentRouteChoiceNodeIds: [],
    currentRouteNodeId: null,
    pendingRouteChoiceNodeIds: [],
    shardCount: 0,
    isForgeAvailable: false,
    currentBoonId: null,
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
  return state.normalBattleVictories % BATTLE_CARD_REWARD_INTERVAL === 0
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

  const winsUntilDraft =
    BATTLE_CARD_REWARD_INTERVAL - (state.normalBattleVictories % BATTLE_CARD_REWARD_INTERVAL)

  if (winsUntilDraft === BATTLE_CARD_REWARD_INTERVAL) {
    return 'Next normal battle grants a card draft'
  }

  return `${winsUntilDraft} more normal battle${winsUntilDraft > 1 ? 's' : ''} until the next card draft`
}

export function getRunState(): RunState {
  ensureRunState()
  return cloneRunState(runState as RunState)
}

export function getCurrentBoon(): BoonContent | null {
  ensureRunState()
  return getBoonById((runState as RunState).currentBoonId)
}

export function grantRandomBoon(): BoonContent {
  ensureRunState()
  const boon = getRandomBoon()
  ;(runState as RunState).currentBoonId = boon.id
  return boon
}

export function consumeCurrentBoonForBattle(): BoonContent | null {
  ensureRunState()
  const state = runState as RunState
  const boon = getBoonById(state.currentBoonId)
  state.currentBoonId = null
  return boon
}

export function getShardTarget(): number {
  return SHARDS_FOR_FORGE
}

export function tryGrantShardForCurrentEncounter(): {
  granted: boolean
  shardCount: number
  isForgeAvailable: boolean
} {
  ensureRunState()
  const state = runState as RunState

  if (state.isForgeAvailable || state.shardCount >= SHARDS_FOR_FORGE) {
    state.shardCount = SHARDS_FOR_FORGE
    state.isForgeAvailable = true
    return {
      granted: false,
      shardCount: state.shardCount,
      isForgeAvailable: state.isForgeAvailable,
    }
  }

  const encounterType = state.currentEncounterType
  let shouldGrant = false

  // Shards are out-of-deck micro rewards from normal and elite fights.
  if (encounterType === 'elite') {
    shouldGrant = true
  } else if (encounterType === 'battle') {
    shouldGrant = Math.random() < SHARD_BATTLE_REWARD_CHANCE
  }

  if (shouldGrant) {
    state.shardCount = Math.min(SHARDS_FOR_FORGE, state.shardCount + 1)
    if (state.shardCount >= SHARDS_FOR_FORGE) {
      state.isForgeAvailable = true
    }
  }

  return {
    granted: shouldGrant,
    shardCount: state.shardCount,
    isForgeAvailable: state.isForgeAvailable,
  }
}

export function setCurrentEncounterType(encounterType: EncounterType) {
  ensureRunState()
  ;(runState as RunState).currentEncounterType = encounterType
}

export function setSelectedRouteId(routeId: string | null) {
  ensureRunState()
  const state = runState as RunState

  if (state.selectedRouteId === routeId && state.selectedRouteLayoutId) {
    return
  }

  state.selectedRouteId = routeId

  if (!routeId) {
    state.selectedRouteLayoutId = null
    state.currentRouteChoiceNodeIds = []
    state.currentRouteNodeId = null
    state.pendingRouteChoiceNodeIds = []
    return
  }

  const layoutId = pickRandomRouteLayoutId(routeId) ?? getDefaultRouteLayoutId(routeId)
  const routePath = getRoutePathById(routeId, layoutId)
  const firstChoices = getRouteNodeIdsForStep(routeId, layoutId, 0)

  state.selectedRouteLayoutId = layoutId
  state.currentRouteChoiceNodeIds = firstChoices
  state.currentRouteNodeId = null
  state.pendingRouteChoiceNodeIds = []
  state.currentEncounterType = null
  state.isRunComplete = false
  state.currentRouteStep = 0
  state.currentFloor = 1
  state.maxFloors = routePath.length
}

export function getAvailableRouteChoices(): RouteChoice[] {
  ensureRunState()
  const state = runState as RunState

  if (!state.selectedRouteId) {
    return []
  }

  const nodes = getRouteChoiceNodes(
    state.selectedRouteId,
    state.selectedRouteLayoutId,
    state.currentRouteChoiceNodeIds,
  )

  return nodes.map((node) => ({
    nodeId: node.id,
    encounterType: node.encounterType,
    label: node.label,
  }))
}

export function setCurrentRouteChoiceNode(nodeId: string): EncounterType | null {
  ensureRunState()
  const state = runState as RunState

  if (!state.selectedRouteId) {
    return null
  }

  const node = getRouteNodeById(state.selectedRouteId, state.selectedRouteLayoutId, nodeId)
  if (!node) {
    return null
  }

  state.currentRouteNodeId = node.id
  state.pendingRouteChoiceNodeIds = [...node.nextNodeIds]
  state.currentEncounterType = node.encounterType
  return node.encounterType
}

export function getAvailableEncountersForCurrentFloor(): EncounterType[] {
  ensureRunState()
  const state = runState as RunState

  if (state.selectedRouteId) {
    const uniqueEncounters = new Set(getAvailableRouteChoices().map((choice) => choice.encounterType))
    return [...uniqueEncounters]
  }

  const floor = state.currentFloor

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

  // Lightweight log to speed up future XP pacing tuning during playtests.
  console.debug('[run-xp]', {
    encounterType,
    gainedXp,
    totalXp: state.heroXp,
    level: state.heroLevel,
    levelsGained,
  })

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
  const routePath = getRoutePathById(state.selectedRouteId, state.selectedRouteLayoutId)

  if (state.selectedRouteId) {
    state.currentRouteStep += 1
    state.currentFloor = Math.min(routePath.length, state.currentRouteStep + 1)

    const noNextChoices = state.pendingRouteChoiceNodeIds.length === 0
    if (state.currentEncounterType === 'boss' || noNextChoices || state.currentRouteStep >= routePath.length) {
      state.isRunComplete = true
      state.currentRouteChoiceNodeIds = []
    } else {
      state.currentRouteChoiceNodeIds = [...state.pendingRouteChoiceNodeIds]
    }

    state.currentRouteNodeId = null
    state.pendingRouteChoiceNodeIds = []
    state.currentEncounterType = null
    return
  }

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

export function applyLevelUpRecoveryChoice(maxHpGain = 3, healAmount = 7): {
  maxHeroHp: number
  heroHp: number
} {
  ensureRunState()
  const state = runState as RunState

  // Level-up survival reward is semi-permanent: increase max HP and heal.
  state.maxHeroHp = Math.max(1, state.maxHeroHp + Math.max(0, maxHpGain))
  state.heroHp = Math.min(state.maxHeroHp, state.heroHp + Math.max(0, healAmount))

  return {
    maxHeroHp: state.maxHeroHp,
    heroHp: state.heroHp,
  }
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
    currentRouteChoiceNodeIds: [...state.currentRouteChoiceNodeIds],
    pendingRouteChoiceNodeIds: [...state.pendingRouteChoiceNodeIds],
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

function buildLevelXpThresholds(stepCosts: number[]): number[] {
  const thresholds = [0]

  stepCosts.forEach((cost) => {
    const previous = thresholds[thresholds.length - 1]
    thresholds.push(previous + cost)
  })

  return thresholds
}

function normalizeRunState(saved: RunState): RunState {
  const layoutId = saved.selectedRouteLayoutId ?? getDefaultRouteLayoutId(saved.selectedRouteId)
  const routePath = getRoutePathById(saved.selectedRouteId, layoutId)
  const normalizedStep = saved.currentRouteStep ?? Math.max(0, (saved.currentFloor ?? 1) - 1)
  const fallbackChoices = getRouteNodeIdsForStep(saved.selectedRouteId, layoutId, normalizedStep)

  const normalized = cloneRunState({
    ...saved,
    selectedRouteId: saved.selectedRouteId ?? null,
    selectedRouteLayoutId: layoutId,
    currentRouteStep: normalizedStep,
    currentRouteChoiceNodeIds: saved.currentRouteChoiceNodeIds ?? fallbackChoices,
    currentRouteNodeId: saved.currentRouteNodeId ?? null,
    pendingRouteChoiceNodeIds: saved.pendingRouteChoiceNodeIds ?? [],
    shardCount: saved.shardCount ?? 0,
    isForgeAvailable: saved.isForgeAvailable ?? false,
    currentBoonId: saved.currentBoonId ?? null,
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

  if (!Number.isFinite(normalized.shardCount)) {
    normalized.shardCount = 0
  }

  if (normalized.shardCount < 0) {
    normalized.shardCount = 0
  }

  if (normalized.shardCount > SHARDS_FOR_FORGE) {
    normalized.shardCount = SHARDS_FOR_FORGE
  }

  if (normalized.shardCount >= SHARDS_FOR_FORGE) {
    normalized.isForgeAvailable = true
  }

  if (!Number.isFinite(normalized.currentRouteStep)) {
    normalized.currentRouteStep = 0
  }

  if (normalized.currentRouteStep < 0) {
    normalized.currentRouteStep = 0
  }

  if (normalized.currentRouteStep >= routePath.length) {
    normalized.currentRouteStep = routePath.length - 1
  }

  normalized.maxFloors = routePath.length

  if (normalized.selectedRouteId) {
    normalized.currentFloor = normalized.currentRouteStep + 1

    if (
      !normalized.isRunComplete
      && normalized.currentEncounterType === null
      && normalized.currentRouteChoiceNodeIds.length === 0
    ) {
      normalized.currentRouteChoiceNodeIds = getRouteNodeIdsForStep(
        normalized.selectedRouteId,
        normalized.selectedRouteLayoutId,
        normalized.currentRouteStep,
      )
    }
  }

  return normalized
}
