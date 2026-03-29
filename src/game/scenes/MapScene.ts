import Phaser from 'phaser'
import {
  advanceFloorAfterEncounter,
  getAvailableEncountersForCurrentFloor,
  getNormalBattleRewardPreview,
  getRunState,
  getXpForNextLevel,
  resolveRestEncounter,
  setCurrentEncounterType,
  type EncounterType,
} from '../battle/runState'
import { saveRun } from '../battle/runSave'

export class MapScene extends Phaser.Scene {
  constructor() {
    super('MapScene')
  }

  create() {
    const { width, height } = this.scale
    const compactLayout = width < 900 || height < 700
    const run = getRunState()
    const nextLevelXp = getXpForNextLevel()

    if (run.isRunComplete) {
      this.scene.start('RunEndScene')
      return
    }

    saveRun()

    this.cameras.main.setBackgroundColor('#0f172a')

    this.add.text(width / 2, 44, 'Run Map', {
      fontSize: '34px',
      color: '#ffffff',
    }).setOrigin(0.5)

    this.add.text(width / 2, 82, `Floor ${run.currentFloor} / ${run.maxFloors}`, {
      fontSize: '20px',
      color: '#cbd5e1',
    }).setOrigin(0.5)

    this.add.text(width / 2, 110, `Hero HP: ${run.heroHp} / ${run.maxHeroHp}   Deck: ${run.currentDeck.length}   Relics: ${run.currentRelics.length}   Blessings: ${run.currentAbilities.length}`, {
      fontSize: compactLayout ? '17px' : '18px',
      color: '#bfdbfe',
    }).setOrigin(0.5)

    this.add.text(
      width / 2,
      132,
      nextLevelXp === null
        ? `Level: ${run.heroLevel}   XP: ${run.heroXp}   Max level this run`
        : `Level: ${run.heroLevel}   XP: ${run.heroXp} / ${nextLevelXp}`,
      {
      fontSize: compactLayout ? '16px' : '17px',
      color: '#93c5fd',
      },
    ).setOrigin(0.5)

    this.add.text(width / 2, 154, getNormalBattleRewardPreview(), {
      fontSize: compactLayout ? '14px' : '15px',
      color: '#fde68a',
    }).setOrigin(0.5)

    this.add.text(width / 2, 178, 'Press ESC to return to menu', {
      fontSize: '16px',
      color: '#cbd5e1',
    }).setOrigin(0.5)

    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.start('MenuScene')
    })

    const options = getAvailableEncountersForCurrentFloor()
    const buttonWidth = compactLayout ? 240 : 250
    const spacing = options.length > 1 ? Math.min(260, buttonWidth + 28) : 0
    const startX = width / 2 - ((options.length - 1) * spacing) / 2

    options.forEach((encounterType, index) => {
      const x = startX + index * spacing
      this.createEncounterButton(x, height / 2 + 40, buttonWidth, compactLayout, encounterType, () => {
        this.handleEncounterSelection(encounterType)
      })
    })
  }

  private createEncounterButton(
    x: number,
    y: number,
    buttonWidth: number,
    compactLayout: boolean,
    encounterType: EncounterType,
    onClick: () => void,
  ) {
    const button = this.add.rectangle(x, y, buttonWidth, compactLayout ? 132 : 136, 0x1e293b)
      .setStrokeStyle(2, 0xffffff)
      .setInteractive({ useHandCursor: true })

    const label = encounterType.toUpperCase()
    this.add.text(x, y - 10, label, {
      fontSize: compactLayout ? '26px' : '28px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    const hint = encounterType === 'rest' ? 'Heal and continue' : 'Start encounter'
    this.add.text(x, y + 28, hint, {
      fontSize: compactLayout ? '15px' : '14px',
      color: '#cbd5e1',
    }).setOrigin(0.5)

    button.on('pointerdown', () => {
      button.setScale(0.97)
      this.tweens.add({
        targets: button,
        scaleX: 1,
        scaleY: 1,
        duration: 120,
        ease: 'Quad.Out',
      })
      onClick()
    })
  }

  private handleEncounterSelection(encounterType: EncounterType) {
    if (encounterType === 'rest') {
      setCurrentEncounterType('rest')
      resolveRestEncounter()
      advanceFloorAfterEncounter()
      saveRun()
      this.scene.restart()
      return
    }

    setCurrentEncounterType(encounterType)
    this.scene.start('PlayScene')
  }
}
