import Phaser from 'phaser'
import {
  applyCardEffect,
  checkBattleOutcome,
  resolveEnemyAttack,
  type BattleState,
  type CardEffectType,
} from '../battle/battleLogic'

export class PlayScene extends Phaser.Scene {
  private readonly heroMaxHp = 40
  private readonly enemyMaxHp = 30

  private heroHp = this.heroMaxHp
  private heroArmor = 0
  private enemyHp = this.enemyMaxHp

  private heroHpText!: Phaser.GameObjects.Text
  private heroArmorText!: Phaser.GameObjects.Text
  private enemyHpText!: Phaser.GameObjects.Text
  private intentText!: Phaser.GameObjects.Text
  private resultText!: Phaser.GameObjects.Text

  private currentIntentLabel = 'Attack for 6'
  private currentIntentDamage = 6
  private battleOver = false

  constructor() {
    super('PlayScene')
  }

  create() {
    const { width, height } = this.scale

    this.heroHp = this.heroMaxHp
    this.heroArmor = 0
    this.enemyHp = this.enemyMaxHp
    this.currentIntentLabel = 'Attack for 6'
    this.currentIntentDamage = 6
    this.battleOver = false

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

    this.add.text(width / 2, 125, 'Skeleton Knight', {
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5)

    this.enemyHpText = this.add.text(width / 2, 160, 'HP: 30 / 30', {
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

    type CardData = {
      id: string
      title: string
      description: string
      effectType: CardEffectType
      value: number
    }

    const hand: CardData[] = [
      {
        id: 'strike-1',
        title: 'Strike',
        description: 'Deal 6 damage',
        effectType: 'damage',
        value: 6,
      },
      {
        id: 'defend-1',
        title: 'Defend',
        description: 'Gain 5 armor',
        effectType: 'armor',
        value: 5,
      },
      {
        id: 'fireball-1',
        title: 'Fireball',
        description: 'Deal 8 damage',
        effectType: 'damage',
        value: 8,
      },
    ]

    const cardSpacing = 180
    const startX = width / 2 - ((hand.length - 1) * cardSpacing) / 2

    hand.forEach((cardData, index) => {
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

  private playCardEffect(effectType: 'damage' | 'armor', value: number) {
    if (this.battleOver) {
      return
    }

    const nextState = applyCardEffect(this.getBattleState(), effectType, value)
    this.setBattleState(nextState)

    this.updateBattleText()
  }

  private resolveEndTurn() {
    if (this.battleOver) {
      return
    }

    this.resolveEnemyIntent()
    if (!this.battleOver) {
      this.rollEnemyIntent()
    }

    this.updateBattleText()
  }

  private resolveEnemyIntent() {
    const nextState = resolveEnemyAttack(this.getBattleState(), this.currentIntentDamage)
    this.setBattleState(nextState)
  }

  private rollEnemyIntent() {
    const intents = [
      { label: 'Attack for 6', damage: 6 },
      { label: 'Heavy Attack for 10', damage: 10 },
      { label: 'Rest', damage: 0 },
    ]

    const nextIntent = Phaser.Utils.Array.GetRandom(intents)
    this.currentIntentLabel = nextIntent.label
    this.currentIntentDamage = nextIntent.damage
  }

  private updateBattleText() {
    const outcome = checkBattleOutcome(this.getBattleState())

    if (outcome === 'victory') {
      this.battleOver = true
      this.resultText.setText('Victory')
      this.resultText.setColor('#86efac')
    } else if (outcome === 'defeat') {
      this.battleOver = true
      this.resultText.setText('Defeat')
      this.resultText.setColor('#fca5a5')
    }

    this.enemyHpText.setText(`HP: ${this.enemyHp} / ${this.enemyMaxHp}`)
    this.heroHpText.setText(`HP: ${this.heroHp} / ${this.heroMaxHp}`)
    this.heroArmorText.setText(`Armor: ${this.heroArmor}`)
    this.intentText.setText(`Intent: ${this.currentIntentLabel}`)

    if (!this.battleOver) {
      this.resultText.setText('')
    }
  }

  private getBattleState(): BattleState {
    return {
      heroHp: this.heroHp,
      heroArmor: this.heroArmor,
      enemyHp: this.enemyHp,
    }
  }

  private setBattleState(state: BattleState) {
    this.heroHp = state.heroHp
    this.heroArmor = state.heroArmor
    this.enemyHp = state.enemyHp
  }
}