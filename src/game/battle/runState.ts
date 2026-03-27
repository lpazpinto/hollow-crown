import { STARTER_DECK, type CardContent } from '../content/cards'
import type { RelicContent } from '../content/relics'
import { getPostBattleHealAmount } from './relicEffects'

export type EncounterType = 'battle' | 'rest' | 'elite' | 'boss'

export type RunState = {
  currentFloor: number
  maxFloors: number
  currentDeck: CardContent[]
  currentRelics: RelicContent[]
  heroHp: number
  maxHeroHp: number
  currentEncounterType: EncounterType | null
  isRunComplete: boolean
}

let runState: RunState | null = null

export function startNewRun() {
  runState = {
    currentFloor: 1,
    maxFloors: 4,
    currentDeck: cloneDeck(STARTER_DECK),
    currentRelics: [],
    heroHp: 40,
    maxHeroHp: 40,
    currentEncounterType: null,
    isRunComplete: false,
  }
}

export function getRunState(): RunState {
  ensureRunState()
  return cloneRunState(runState as RunState)
}

export function setCurrentEncounterType(encounterType: EncounterType) {
  ensureRunState()
  ;(runState as RunState).currentEncounterType = encounterType
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

  if (wasVictory) {
    const healAmount = getPostBattleHealAmount(state.currentRelics)
    state.heroHp = Math.min(state.maxHeroHp, state.heroHp + healAmount)
  }

  if (!wasVictory) {
    state.currentEncounterType = null
  }
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
  }
}

function cloneRelics(relics: RelicContent[]): RelicContent[] {
  return relics.map((relic) => ({ ...relic }))
}
