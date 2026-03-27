import Phaser from 'phaser'
import { startNewRun } from '../battle/runState'

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene')
  }

  create() {
    this.cameras.main.setBackgroundColor('#1e293b')

    this.add.text(180, 90, 'Hollow Crown', {
      fontSize: '40px',
      color: '#ffffff',
    })

    this.add.text(175, 180, 'Click to Start', {
      fontSize: '24px',
      color: '#ffd166',
    })

    this.input.once('pointerdown', () => {
      startNewRun()
      this.scene.start('MapScene')
    })
  }
}