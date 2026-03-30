import Phaser from 'phaser'

const HERO_IDLE_SHEET = {
  key: 'hero-idle-sheet',
  path: 'assets/hero/hero_idle.png',
  frameWidth: 48,
  frameHeight: 48,
}

const HERO_PAIN_SHEET = {
  key: 'hero-pain-sheet',
  path: 'assets/hero/hero_pain.png',
  frameWidth: 48,
  frameHeight: 48,
}

const FANTASY_BACKDROP_SHEET = {
  key: 'ui-fantasy-backdrop-sheet',
  path: 'assets/tittle/Fantasy_Backdrop_animation_sheet.png',
  frameWidth: 512,
  frameHeight: 360,
}

const ENERGY_CRYSTAL_IMAGE = {
  key: 'ui-energy-crystal',
  path: 'assets/HUD/Crystal.png',
}

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
    this.load.spritesheet(FANTASY_BACKDROP_SHEET.key, FANTASY_BACKDROP_SHEET.path, {
      frameWidth: FANTASY_BACKDROP_SHEET.frameWidth,
      frameHeight: FANTASY_BACKDROP_SHEET.frameHeight,
    })
    this.load.image(ENERGY_CRYSTAL_IMAGE.key, ENERGY_CRYSTAL_IMAGE.path)
    this.load.spritesheet(HERO_IDLE_SHEET.key, HERO_IDLE_SHEET.path, {
      frameWidth: HERO_IDLE_SHEET.frameWidth,
      frameHeight: HERO_IDLE_SHEET.frameHeight,
    })
    this.load.spritesheet(HERO_PAIN_SHEET.key, HERO_PAIN_SHEET.path, {
      frameWidth: HERO_PAIN_SHEET.frameWidth,
      frameHeight: HERO_PAIN_SHEET.frameHeight,
    })
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