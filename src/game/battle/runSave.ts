import { getRunState, restoreRunState, type RunState } from './runState'

const SAVE_KEY = 'hollow-crown-run'

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
    return localStorage.getItem(SAVE_KEY) !== null
  } catch {
    return false
  }
}

export function loadSavedRun(): boolean {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return false
    const state = JSON.parse(raw) as RunState
    restoreRunState(state)
    return true
  } catch {
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
