import Phaser from 'phaser'

const ASHEN_KNIGHT_SHEET = {
  key: 'enemy-ashen-knight-idle-sheet',
  path: 'assets/enemies/ashen-knight/ashen-knight-iddle.png',
  frameWidth: 88,
  frameHeight: 88,
}

export class LoadingScene extends Phaser.Scene {
  constructor() {
    super('LoadingScene')
  }

  preload() {
    this.load.image('hero-idle', 'assets/hero/hero_idle.png')
    this.load.spritesheet(ASHEN_KNIGHT_SHEET.key, ASHEN_KNIGHT_SHEET.path, {
      frameWidth: ASHEN_KNIGHT_SHEET.frameWidth,
      frameHeight: ASHEN_KNIGHT_SHEET.frameHeight,
    })
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