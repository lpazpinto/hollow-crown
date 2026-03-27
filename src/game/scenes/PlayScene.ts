import Phaser from 'phaser'

export class PlayScene extends Phaser.Scene {
  private intentText!: Phaser.GameObjects.Text

  constructor() {
    super('PlayScene')
  }

  create() {
    const { width, height } = this.scale

    this.cameras.main.setBackgroundColor('#111827')

    this.add.text(width / 2, 30, 'Battle Prototype', {
      fontSize: '28px',
      color: '#ffffff',
    }).setOrigin(0.5)

    this.add.text(width / 2, 65, 'Press ESC to return to menu', {
      fontSize: '16px',
      color: '#cbd5e1',
    }).setOrigin(0.5)

    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.start('MenuScene')
    })

    // Enemy area
    this.add.rectangle(width / 2, 170, 220, 140, 0x7f1d1d)
      .setStrokeStyle(2, 0xffffff)

    this.add.text(width / 2, 125, 'Skeleton Knight', {
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5)

    this.add.text(width / 2, 160, 'HP: 30 / 30', {
      fontSize: '20px',
      color: '#fecaca',
    }).setOrigin(0.5)

    this.intentText = this.add.text(width / 2, 195, 'Intent: Attack for 6', {
      fontSize: '18px',
      color: '#fde68a',
    }).setOrigin(0.5)

    // Player area
    this.add.rectangle(170, height - 150, 240, 120, 0x1e3a8a)
      .setStrokeStyle(2, 0xffffff)

    this.add.text(170, height - 185, 'Hero', {
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5)

    this.add.text(170, height - 145, 'HP: 40 / 40', {
      fontSize: '18px',
      color: '#bfdbfe',
    }).setOrigin(0.5)

    this.add.text(170, height - 115, 'Armor: 0', {
      fontSize: '18px',
      color: '#bfdbfe',
    }).setOrigin(0.5)

    // End turn button
    const endTurnButton = this.add.rectangle(width - 140, height - 145, 180, 60, 0xf59e0b)
      .setStrokeStyle(2, 0xffffff)
      .setInteractive({ useHandCursor: true })

    const endTurnLabel = this.add.text(width - 140, height - 145, 'End Turn', {
      fontSize: '24px',
      color: '#111827',
    }).setOrigin(0.5)

    endTurnButton.on('pointerdown', () => {
      this.changeEnemyIntent()
    })

    // Hand area
    this.add.text(width / 2, height - 255, 'Hand', {
      fontSize: '22px',
      color: '#ffffff',
    }).setOrigin(0.5)

    this.createCard(width / 2 - 180, height - 130, 'Strike', 'Deal 6 damage')
    this.createCard(width / 2, height - 130, 'Defend', 'Gain 5 armor')
    this.createCard(width / 2 + 180, height - 130, 'Fireball', 'Deal 8 damage')
  }

  private createCard(x: number, y: number, title: string, description: string) {
    this.add.rectangle(x, y, 140, 180, 0xf8fafc)
      .setStrokeStyle(3, 0x1f2937)

    this.add.text(x, y - 55, title, {
      fontSize: '22px',
      color: '#111827',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    this.add.text(x, y + 5, description, {
      fontSize: '16px',
      color: '#374151',
      align: 'center',
      wordWrap: { width: 110 },
    }).setOrigin(0.5)
  }

  private changeEnemyIntent() {
    const intents = [
      'Intent: Attack for 6',
      'Intent: Defend for 5',
      'Intent: Heavy Attack for 10',
      'Intent: Buff + Strength',
    ]

    const randomIntent = Phaser.Utils.Array.GetRandom(intents)
    this.intentText.setText(randomIntent)
  }
}