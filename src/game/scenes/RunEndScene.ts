import Phaser from 'phaser'
import { clearSave } from '../battle/runSave'

export class RunEndScene extends Phaser.Scene {
  constructor() {
    super('RunEndScene')
  }

  create() {
    const { width, height } = this.scale

    clearSave()

    this.cameras.main.setBackgroundColor('#0f172a')

    this.add.text(width / 2, height / 2 - 40, 'Run Complete', {
      fontSize: '44px',
      color: '#86efac',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    this.add.text(width / 2, height / 2 + 10, 'The Crown has fallen.', {
      fontSize: '22px',
      color: '#ffffff',
    }).setOrigin(0.5)

    this.add.text(width / 2, height / 2 + 58, 'Click or press ESC to return to menu', {
      fontSize: '16px',
      color: '#cbd5e1',
    }).setOrigin(0.5)

    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.start('MenuScene')
    })

    this.input.once('pointerdown', () => {
      this.scene.start('MenuScene')
    })
  }
}
