import Phaser from 'phaser'

export class LoadingScene extends Phaser.Scene {
  constructor() {
    super('LoadingScene')
  }

  preload() {
    this.load.image('hero-idle', 'assets/hero/hero_idle.png')
  }

  create() {
    const { width, height } = this.scale
    this.cameras.main.setBackgroundColor('#0f172a')

    this.add.text(width / 2, height / 2 - 10, 'Loading...', {
      fontSize: '28px',
      color: '#ffffff',
    }).setOrigin(0.5)

    this.add.text(width / 2, height / 2 + 28, 'Preparing the run for Poki play', {
      fontSize: '16px',
      color: '#cbd5e1',
    }).setOrigin(0.5)

    this.time.delayedCall(500, () => {
      this.scene.start('MenuScene')
    })
  }
}