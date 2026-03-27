import Phaser from 'phaser'
import {
  advanceFloorAfterEncounter,
  getAvailableEncountersForCurrentFloor,
  getRunState,
  resolveRestEncounter,
  setCurrentEncounterType,
  type EncounterType,
} from '../battle/runState'

export class MapScene extends Phaser.Scene {
  constructor() {
    super('MapScene')
  }

  create() {
    const { width, height } = this.scale
    const run = getRunState()

    if (run.isRunComplete) {
      this.scene.start('RunEndScene')
      return
    }

    this.cameras.main.setBackgroundColor('#0f172a')

    this.add.text(width / 2, 44, 'Run Map', {
      fontSize: '34px',
      color: '#ffffff',
    }).setOrigin(0.5)

    this.add.text(width / 2, 82, `Floor ${run.currentFloor} / ${run.maxFloors}`, {
      fontSize: '20px',
      color: '#cbd5e1',
    }).setOrigin(0.5)

    this.add.text(width / 2, 110, `Hero HP: ${run.heroHp} / ${run.maxHeroHp}   Deck: ${run.currentDeck.length}   Relics: ${run.currentRelics.length}`, {
      fontSize: '18px',
      color: '#bfdbfe',
    }).setOrigin(0.5)

    this.add.text(width / 2, 140, 'Press ESC to return to menu', {
      fontSize: '16px',
      color: '#cbd5e1',
    }).setOrigin(0.5)

    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.start('MenuScene')
    })

    const options = getAvailableEncountersForCurrentFloor()
    const spacing = 260
    const startX = width / 2 - ((options.length - 1) * spacing) / 2

    options.forEach((encounterType, index) => {
      const x = startX + index * spacing
      this.createEncounterButton(x, height / 2 + 40, encounterType, () => {
        this.handleEncounterSelection(encounterType)
      })
    })
  }

  private createEncounterButton(
    x: number,
    y: number,
    encounterType: EncounterType,
    onClick: () => void,
  ) {
    const button = this.add.rectangle(x, y, 220, 120, 0x1e293b)
      .setStrokeStyle(2, 0xffffff)
      .setInteractive({ useHandCursor: true })

    const label = encounterType.toUpperCase()
    this.add.text(x, y - 10, label, {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    const hint = encounterType === 'rest' ? 'Heal and continue' : 'Start encounter'
    this.add.text(x, y + 28, hint, {
      fontSize: '14px',
      color: '#cbd5e1',
    }).setOrigin(0.5)

    button.on('pointerdown', onClick)
  }

  private handleEncounterSelection(encounterType: EncounterType) {
    if (encounterType === 'rest') {
      setCurrentEncounterType('rest')
      resolveRestEncounter()
      advanceFloorAfterEncounter()
      this.scene.restart()
      return
    }

    setCurrentEncounterType(encounterType)
    this.scene.start('PlayScene')
  }
}
