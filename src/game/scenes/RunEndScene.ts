import Phaser from 'phaser'
import { clearSave } from '../battle/runSave'

export class RunEndScene extends Phaser.Scene {
  constructor() {
    super('RunEndScene')
  }

  create() {
    const { width, height } = this.scale
    const compactLayout = width < 900 || height < 700

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

    const menuButton = this.add.rectangle(
      width / 2,
      height / 2 + 122,
      compactLayout ? 260 : 280,
      compactLayout ? 68 : 72,
      0x1e293b,
    )
      .setStrokeStyle(2, 0xffffff)
      .setInteractive({ useHandCursor: true })

    this.add.text(width / 2, height / 2 + 122, 'Return to Menu', {
      fontSize: compactLayout ? '20px' : '22px',
      color: '#ffffff',
    }).setOrigin(0.5)

    const goToMenu = () => {
      this.tweens.killTweensOf(menuButton)
      menuButton.setScale(0.97)
      this.tweens.add({
        targets: menuButton,
        scaleX: 1,
        scaleY: 1,
        duration: 120,
        ease: 'Quad.Out',
      })
      this.scene.start('MenuScene')
    }

    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.start('MenuScene')
    })

    menuButton.on('pointerdown', goToMenu)
  }
}
