import Phaser from 'phaser'
import { startNewRun } from '../battle/runState'
import { clearSave, hasSave, loadSavedRun } from '../battle/runSave'

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene')
  }

  create() {
    const { width, height } = this.scale
    const compactLayout = width < 900 || height < 700
    this.cameras.main.setBackgroundColor('#1e293b')

    this.add.text(width / 2, 90, 'Hollow Crown', {
      fontSize: compactLayout ? '34px' : '40px',
      color: '#ffffff',
    }).setOrigin(0.5)

    this.add.text(width / 2, 132, 'Touch-friendly prototype for run, battle, reward, and relic flow', {
      fontSize: compactLayout ? '15px' : '16px',
      color: '#cbd5e1',
      align: 'center',
      wordWrap: { width: compactLayout ? 460 : 620 },
    }).setOrigin(0.5)

    const newBtn = this.add
      .rectangle(width / 2, height / 2 - 20, compactLayout ? 280 : 300, compactLayout ? 72 : 76, 0x1e293b)
      .setStrokeStyle(2, 0xffd166)
      .setInteractive({ useHandCursor: true })

    this.add.text(width / 2, height / 2 - 20, 'Start New Run', {
      fontSize: '22px',
      color: '#ffd166',
    }).setOrigin(0.5)

    newBtn.on('pointerdown', () => {
      this.animatePress(newBtn)
      clearSave()
      startNewRun()
      this.scene.start('MapScene')
    })

    if (hasSave()) {
      const contBtn = this.add
        .rectangle(width / 2, height / 2 + 68, compactLayout ? 280 : 300, compactLayout ? 72 : 76, 0x1e293b)
        .setStrokeStyle(2, 0x86efac)
        .setInteractive({ useHandCursor: true })

      this.add.text(width / 2, height / 2 + 68, 'Continue Run', {
        fontSize: '22px',
        color: '#86efac',
      }).setOrigin(0.5)

      contBtn.on('pointerdown', () => {
        this.animatePress(contBtn)
        if (!loadSavedRun()) {
          startNewRun()
        }
        this.scene.start('MapScene')
      })
    }

    this.add.text(width / 2, height - 72, 'Save data is stored locally when available. Start New Run replaces the current save.', {
      fontSize: compactLayout ? '14px' : '15px',
      color: '#94a3b8',
      align: 'center',
      wordWrap: { width: compactLayout ? 500 : 720 },
    }).setOrigin(0.5)
  }

  private animatePress(target: Phaser.GameObjects.Rectangle) {
    this.tweens.killTweensOf(target)
    target.setScale(0.97)
    this.tweens.add({
      targets: target,
      scaleX: 1,
      scaleY: 1,
      duration: 120,
      ease: 'Quad.Out',
    })
  }
}