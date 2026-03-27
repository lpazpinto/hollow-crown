import StartGame from './game/main'
import { startOrientationGuard } from './game/orientationGuard'

document.addEventListener('DOMContentLoaded', () => {
  StartGame('game-container')
  startOrientationGuard()
})