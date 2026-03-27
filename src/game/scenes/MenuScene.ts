import Phaser from 'phaser'
import { startNewRun } from '../battle/runState'
import { clearSave, hasSave, loadSavedRun } from '../battle/runSave'

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene')
  }

  create() {
    const { width, height } = this.scale
    this.cameras.main.setBackgroundColor('#1e293b')

    this.add.text(width / 2, 90, 'Hollow Crown', {
      fontSize: '40px',
      color: '#ffffff',
    }).setOrigin(0.5)

    const newBtn = this.add
      .rectangle(width / 2, height / 2 - 20, 260, 60, 0x1e293b)
      .setStrokeStyle(2, 0xffd166)
      .setInteractive({ useHandCursor: true })

    this.add.text(width / 2, height / 2 - 20, 'Start New Run', {
      fontSize: '22px',
      color: '#ffd166',
    }).setOrigin(0.5)

    newBtn.on('pointerdown', () => {
      clearSave()
      startNewRun()
      this.scene.start('MapScene')
    })

    if (hasSave()) {
      const contBtn = this.add
        .rectangle(width / 2, height / 2 + 60, 260, 60, 0x1e293b)
        .setStrokeStyle(2, 0x86efac)
        .setInteractive({ useHandCursor: true })

      this.add.text(width / 2, height / 2 + 60, 'Continue Run', {
        fontSize: '22px',
        color: '#86efac',
      }).setOrigin(0.5)

      contBtn.on('pointerdown', () => {
        loadSavedRun()
        this.scene.start('MapScene')
      })
    }
  }
}