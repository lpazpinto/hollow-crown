import Phaser from 'phaser'
import { getRunState, startNewRun } from '../battle/runState'
import { clearSave, hasSave, loadSavedRun } from '../battle/runSave'

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene')
  }

  preload() {
    if (!this.textures.exists('hud-button-standard')) {
      this.load.image('hud-button-standard', 'assets/HUD/button-standard-pixel-v2.png')
    }
  }

  create() {
    const { width, height } = this.scale
    const compactLayout = width < 900 || height < 700
    this.cameras.main.setBackgroundColor('#1e293b')

    if (this.textures.exists('ui-fantasy-backdrop-sheet')) {
      if (!this.anims.exists('ui-fantasy-backdrop-loop')) {
        this.anims.create({
          key: 'ui-fantasy-backdrop-loop',
          frames: this.anims.generateFrameNumbers('ui-fantasy-backdrop-sheet', {
            start: 0,
            end: 7,
          }),
          frameRate: 8,
          repeat: -1,
        })
      }

      const backdrop = this.add.sprite(width / 2, height / 2, 'ui-fantasy-backdrop-sheet')
      const scale = Math.max(width / 640, height / 360)
      backdrop.setScale(scale).setDepth(0)
      backdrop.play('ui-fantasy-backdrop-loop')
    }

    // Keep menu text/buttons readable on top of backdrop art.
    this.add.rectangle(width / 2, height / 2, width, height, 0x060a13, 0.5).setDepth(0)

    if (this.textures.exists('ui-title-crown-shatter-sheet') && !this.anims.exists('titleCrownShatter')) {
      this.anims.create({
        key: 'titleCrownShatter',
        frames: this.anims.generateFrameNumbers('ui-title-crown-shatter-sheet', {
          start: 0,
          end: 9,
        }),
        frameRate: 14,
        repeat: 0,
      })
    }

    let titleAnchorX = width / 2
    let titleAnchorY = compactLayout ? 88 : 92
    let titleVisualWidth = compactLayout ? 260 : 340

    if (this.textures.exists('ui-title-logo')) {
      const logo = this.add.image(titleAnchorX, titleAnchorY, 'ui-title-logo').setDepth(2)
      const maxLogoWidth = compactLayout ? Math.floor(width * 0.62) : Math.floor(width * 0.5)
      if (logo.width > maxLogoWidth) {
        logo.setScale(maxLogoWidth / logo.width)
      }
      titleAnchorX = logo.x
      titleAnchorY = logo.y
      titleVisualWidth = logo.displayWidth
    } else {
      const titleFallback = this.add.text(width / 2, 90, 'Hollow Crown', {
        fontSize: compactLayout ? '34px' : '40px',
        color: '#ffffff',
      }).setOrigin(0.5).setDepth(2)
      titleAnchorX = titleFallback.x
      titleAnchorY = titleFallback.y
      titleVisualWidth = titleFallback.width
    }

    if (this.textures.exists('ui-title-crown-shatter-sheet')) {
      const crown = this.add.sprite(
        titleAnchorX + titleVisualWidth / 2 + (compactLayout ? 30 : 42),
        titleAnchorY - (compactLayout ? 6 : 8),
        'ui-title-crown-shatter-sheet',
        0,
      )
        .setOrigin(0.5, 0.5)
        .setScale(compactLayout ? 0.56 : 0.7)
        .setDepth(3)

      if (this.anims.exists('titleCrownShatter')) {
        crown.play('titleCrownShatter')
        crown.once(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + 'titleCrownShatter', () => {
          crown.stop()
          crown.setFrame(9)
          crown.setVisible(true)
        })
      }
    }

    this.add.text(width / 2, compactLayout ? 140 : 148, 'Touch-friendly prototype for run, battle, reward, and relic flow', {
      fontSize: compactLayout ? '15px' : '16px',
      color: '#cbd5e1',
      align: 'center',
      wordWrap: { width: compactLayout ? 460 : 620 },
    }).setOrigin(0.5).setDepth(2)

    const menuButtonW = compactLayout ? 336 : 368
    const menuButtonH = compactLayout ? 72 : 76

    const newBtn = this.textures.exists('hud-button-standard')
      ? this.add
        .image(width / 2, height / 2 - 20, 'hud-button-standard')
        .setDisplaySize(menuButtonW, menuButtonH)
        .setTint(0xffd166)
        .setDepth(2)
        .setInteractive({ useHandCursor: true })
      : this.add
        .rectangle(width / 2, height / 2 - 20, menuButtonW, menuButtonH, 0x1e293b)
        .setStrokeStyle(2, 0xffd166)
        .setDepth(2)
        .setInteractive({ useHandCursor: true })

    this.add.text(width / 2, height / 2 - 20, 'Start New Adventure', {
      fontSize: compactLayout ? '18px' : '20px',
      color: '#ffd166',
    }).setOrigin(0.5).setDepth(3)

    newBtn.on('pointerdown', () => {
      this.animatePress(newBtn)
      clearSave()
      startNewRun()
      this.scene.start('CharacterSelectScene')
    })

    if (hasSave()) {
      const contBtn = this.textures.exists('hud-button-standard')
        ? this.add
          .image(width / 2, height / 2 + 68, 'hud-button-standard')
          .setDisplaySize(menuButtonW, menuButtonH)
          .setTint(0x86efac)
          .setDepth(2)
          .setInteractive({ useHandCursor: true })
        : this.add
          .rectangle(width / 2, height / 2 + 68, menuButtonW, menuButtonH, 0x1e293b)
          .setStrokeStyle(2, 0x86efac)
          .setDepth(2)
          .setInteractive({ useHandCursor: true })

      this.add.text(width / 2, height / 2 + 68, 'Continue Adventure', {
        fontSize: compactLayout ? '18px' : '20px',
        color: '#86efac',
      }).setOrigin(0.5).setDepth(3)

      contBtn.on('pointerdown', () => {
        this.animatePress(contBtn)
        if (!loadSavedRun()) {
          startNewRun()
        }

        const run = getRunState()
        this.scene.start(run.selectedRouteId ? 'MapScene' : 'CharacterSelectScene')
      })
    }

    this.add.text(width / 2, height - 72, 'Save data is stored locally when available. Start New Run replaces the current save.', {
      fontSize: compactLayout ? '14px' : '15px',
      color: '#94a3b8',
      align: 'center',
      wordWrap: { width: compactLayout ? 500 : 720 },
    }).setOrigin(0.5).setDepth(2)
  }

  private animatePress(target: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Image) {
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