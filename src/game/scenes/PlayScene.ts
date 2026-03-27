import Phaser from 'phaser'
import {
  applyCardEffect,
  checkBattleOutcome,
  resolveEnemyAttack,
  type CardEffectType,
} from '../battle/battleLogic'
import { createInitialBattleSession, type BattleSession } from '../battle/battleSession'

export class PlayScene extends Phaser.Scene {
  private readonly heroMaxHp = 40
  private session!: BattleSession

  private heroHpText!: Phaser.GameObjects.Text
  private heroArmorText!: Phaser.GameObjects.Text
  private enemyHpText!: Phaser.GameObjects.Text
  private intentText!: Phaser.GameObjects.Text
  private resultText!: Phaser.GameObjects.Text

  constructor() {
    super('PlayScene')
  }

  create() {
    const { width, height } = this.scale
    this.session = createInitialBattleSession()

    this.cameras.main.setBackgroundColor('#111827')

    this.add.text(width / 2, 30, 'Battle Prototype', {
      fontSize: '28px',
      color: '#ffffff',
    }).setOrigin(0.5)

    this.add.text(width / 2, 65, 'Press ESC to return to menu', {
      fontSize: '16px',
      color: '#cbd5e1',
    }).setOrigin(0.5)

    this.resultText = this.add.text(width / 2, 95, '', {
      fontSize: '26px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.start('MenuScene')
    })

    // Enemy area
    this.add.rectangle(width / 2, 170, 220, 140, 0x7f1d1d)
      .setStrokeStyle(2, 0xffffff)

    this.add.text(width / 2, 125, this.session.enemy.name, {
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5)

    this.enemyHpText = this.add.text(
      width / 2,
      160,
      `HP: ${this.session.enemy.maxHp} / ${this.session.enemy.maxHp}`,
      {
      fontSize: '20px',
      color: '#fecaca',
      },
    ).setOrigin(0.5)

    this.intentText = this.add.text(width / 2, 195, `Intent: ${this.getCurrentIntent().label}`, {
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

    this.heroHpText = this.add.text(170, height - 145, 'HP: 40 / 40', {
      fontSize: '18px',
      color: '#bfdbfe',
    }).setOrigin(0.5)

    this.heroArmorText = this.add.text(170, height - 115, 'Armor: 0', {
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
      this.resolveEndTurn()
    })

    // Hand area
    this.add.text(width / 2, height - 255, 'Hand', {
      fontSize: '22px',
      color: '#ffffff',
    }).setOrigin(0.5)

    const cardSpacing = 180
    const startX = width / 2 - ((this.session.hand.length - 1) * cardSpacing) / 2

    this.session.hand.forEach((cardData, index) => {
      const cardX = startX + index * cardSpacing

      this.createCard(cardX, height - 130, cardData.id, cardData.title, cardData.description, () => {
        this.playCardEffect(cardData.effectType, cardData.value)
      })
    })

    endTurnButton.setDepth(1)
    endTurnLabel.setDepth(2)

    this.updateBattleText()
  }

  private createCard(
    x: number,
    y: number,
    id: string,
    title: string,
    description: string,
    onClick: () => void,
  ) {
    const card = this.add.rectangle(x, y, 140, 180, 0xf8fafc)
      .setStrokeStyle(3, 0x1f2937)
      .setInteractive({ useHandCursor: true })
      .setName(id)

    card.on('pointerdown', onClick)

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

  private playCardEffect(effectType: CardEffectType, value: number) {
    if (this.session.outcome !== 'ongoing') {
      return
    }

    this.session.state = applyCardEffect(this.session.state, effectType, value)

    this.updateBattleText()
  }

  private resolveEndTurn() {
    if (this.session.outcome !== 'ongoing') {
      return
    }

    this.resolveEnemyIntent()
    if (this.session.outcome === 'ongoing') {
      this.rollEnemyIntent()
    }

    this.updateBattleText()
  }

  private resolveEnemyIntent() {
    const currentIntent = this.getCurrentIntent()
    this.session.state = resolveEnemyAttack(this.session.state, currentIntent.damage)
  }

  private rollEnemyIntent() {
    this.session.currentIntentIndex = Phaser.Math.Between(0, this.session.enemy.intents.length - 1)
  }

  private updateBattleText() {
    this.session.outcome = checkBattleOutcome(this.session.state)

    if (this.session.outcome === 'victory') {
      this.resultText.setText('Victory')
      this.resultText.setColor('#86efac')
    } else if (this.session.outcome === 'defeat') {
      this.resultText.setText('Defeat')
      this.resultText.setColor('#fca5a5')
    }

    this.enemyHpText.setText(`HP: ${this.session.state.enemyHp} / ${this.session.enemy.maxHp}`)
    this.heroHpText.setText(`HP: ${this.session.state.heroHp} / ${this.heroMaxHp}`)
    this.heroArmorText.setText(`Armor: ${this.session.state.heroArmor}`)
    this.intentText.setText(`Intent: ${this.getCurrentIntent().label}`)

    if (this.session.outcome === 'ongoing') {
      this.resultText.setText('')
    }
  }

  private getCurrentIntent() {
    if (this.session.currentIntentIndex < 0) {
      return this.session.enemy.initialIntent
    }

    return this.session.enemy.intents[this.session.currentIntentIndex]
  }
}