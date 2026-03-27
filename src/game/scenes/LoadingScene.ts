import Phaser from 'phaser'

export class LoadingScene extends Phaser.Scene {
  constructor() {
    super('LoadingScene')
  }

  preload() {
    // Later, we will load images, audio, and sprites here.
  }

  create() {
    this.cameras.main.setBackgroundColor('#0f172a')

    this.add.text(220, 150, 'Loading...', {
      fontSize: '28px',
      color: '#ffffff',
    })

    this.time.delayedCall(500, () => {
      this.scene.start('MenuScene')
    })
  }
}