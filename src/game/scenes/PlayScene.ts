import Phaser from 'phaser'
import {
  checkBattleOutcome,
  resolveEnemyAttack,
} from '../battle/battleLogic'
import {
  createInitialBattleSession,
  discardHand,
  getCurrentIntent,
  playCardFromHand,
  startNewPlayerTurn,
  type BattleSession,
} from '../battle/battleSession'
import {
  applyBattleResult,
  getRunDeck,
  getRunRelics,
  getRunState,
  type EncounterType,
} from '../battle/runState'

export class PlayScene extends Phaser.Scene {
  private readonly heroMaxHp = 40
  private session!: BattleSession
  private transitioningScene = false
  private encounterType: EncounterType = 'battle'

  private heroHpText!: Phaser.GameObjects.Text
  private heroArmorText!: Phaser.GameObjects.Text
  private energyText!: Phaser.GameObjects.Text
  private drawPileCountText!: Phaser.GameObjects.Text
  private discardPileText!: Phaser.GameObjects.Text
  private enemyHpText!: Phaser.GameObjects.Text
  private intentText!: Phaser.GameObjects.Text
  private resultText!: Phaser.GameObjects.Text
  private handObjects: Phaser.GameObjects.GameObject[] = []

  constructor() {
    super('PlayScene')
  }

  create() {
    const { width, height } = this.scale
    this.transitioningScene = false
    const runState = getRunState()
    this.encounterType = runState.currentEncounterType ?? 'battle'
    this.session = createInitialBattleSession(getRunDeck(), {
      heroHp: runState.heroHp,
      encounterType: this.encounterType,
      relics: getRunRelics(),
    })

    this.cameras.main.setBackgroundColor('#111827')

    this.add.text(width / 2, 30, 'Battle Prototype', {
      fontSize: '28px',
      color: '#ffffff',
    }).setOrigin(0.5)

    this.add.text(width / 2, 50, `Encounter: ${this.encounterType.toUpperCase()}`, {
      fontSize: '16px',
      color: '#cbd5e1',
    }).setOrigin(0.5)

    this.add.text(width / 2, 70, `Floor ${runState.currentFloor} / ${runState.maxFloors}`, {
      fontSize: '16px',
      color: '#cbd5e1',
    }).setOrigin(0.5)

    this.add.text(width / 2, 90, 'Press ESC to return to menu', {
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

    this.intentText = this.add.text(width / 2, 195, `Intent: ${getCurrentIntent(this.session).label}`, {
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

    this.energyText = this.add.text(170, height - 85, 'Energy: 3 / 3', {
      fontSize: '18px',
      color: '#bfdbfe',
    }).setOrigin(0.5)

    this.drawPileCountText = this.add.text(width / 2 - 220, height - 255, 'Draw Pile: 0', {
      fontSize: '16px',
      color: '#cbd5e1',
    }).setOrigin(0.5)

    this.discardPileText = this.add.text(width / 2 + 220, height - 255, 'Discard: 0', {
      fontSize: '16px',
      color: '#cbd5e1',
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

    this.renderHand()

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
    cost: number,
    canPlay: boolean,
    onClick: () => void,
  ): Phaser.GameObjects.GameObject[] {
    const card = this.add.rectangle(x, y, 140, 180, 0xf8fafc)
      .setStrokeStyle(3, 0x1f2937)
      .setInteractive({ useHandCursor: true })
      .setName(id)

    if (!canPlay) {
      card.setFillStyle(0xd1d5db)
      card.disableInteractive()
    }

    card.on('pointerdown', onClick)

    const titleText = this.add.text(x, y - 55, title, {
      fontSize: '22px',
      color: '#111827',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    const descriptionText = this.add.text(x, y + 5, description, {
      fontSize: '16px',
      color: '#374151',
      align: 'center',
      wordWrap: { width: 110 },
    }).setOrigin(0.5)

    const costText = this.add.text(x, y + 70, `Cost: ${cost}`, {
      fontSize: '16px',
      color: '#111827',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    if (!canPlay) {
      titleText.setAlpha(0.6)
      descriptionText.setAlpha(0.6)
      costText.setAlpha(0.6)
    }

    return [card, titleText, descriptionText, costText]
  }

  private playCardFromIndex(cardIndex: number) {
    if (this.session.outcome !== 'ongoing') {
      return
    }

    this.session = playCardFromHand(this.session, cardIndex)

    this.updateBattleText()
  }

  private resolveEndTurn() {
    if (this.session.outcome !== 'ongoing') {
      return
    }

    this.session = discardHand(this.session)
    this.resolveEnemyIntent()
    this.session.outcome = checkBattleOutcome(this.session.state)

    if (this.session.outcome === 'ongoing') {
      this.session = startNewPlayerTurn(this.session)
    }

    this.updateBattleText()
  }

  private resolveEnemyIntent() {
    const currentIntent = getCurrentIntent(this.session)
    this.session.state = resolveEnemyAttack(this.session.state, currentIntent.damage)
  }

  private updateBattleText() {
    if (this.transitioningScene) {
      return
    }

    this.session.outcome = checkBattleOutcome(this.session.state)

    if (this.session.outcome === 'victory') {
      applyBattleResult(this.session.state.heroHp, true)
      this.transitioningScene = true

      if (this.encounterType === 'boss') {
        this.scene.start('RelicRewardScene', { nextScene: 'RunEndScene' })
      } else if (this.encounterType === 'battle') {
        this.scene.start('RewardScene')
      } else {
        this.scene.start('RelicRewardScene', { nextScene: 'MapScene' })
      }

      return
    } else if (this.session.outcome === 'defeat') {
      applyBattleResult(this.session.state.heroHp, false)
      this.resultText.setText('Defeat')
      this.resultText.setColor('#fca5a5')
    }

    this.enemyHpText.setText(`HP: ${this.session.state.enemyHp} / ${this.session.enemy.maxHp}`)
    this.heroHpText.setText(`HP: ${this.session.state.heroHp} / ${this.heroMaxHp}`)
    this.heroArmorText.setText(`Armor: ${this.session.state.heroArmor}`)
    this.energyText.setText(`Energy: ${this.session.currentEnergy} / ${this.session.maxEnergy}`)
    this.drawPileCountText.setText(`Draw Pile: ${this.session.drawPile.length}`)
    this.discardPileText.setText(`Discard: ${this.session.discardPile.length}`)
    this.intentText.setText(`Intent: ${getCurrentIntent(this.session).label}`)

    if (this.session.outcome === 'ongoing') {
      this.resultText.setText('')
    }

    this.renderHand()
  }

  private renderHand() {
    if (this.handObjects.length > 0) {
      this.handObjects.forEach((gameObject) => {
        gameObject.destroy()
      })
      this.handObjects = []
    }

    const { width, height } = this.scale
    const cardSpacing = 180
    const startX = width / 2 - ((this.session.hand.length - 1) * cardSpacing) / 2

    this.session.hand.forEach((cardData, index) => {
      const cardX = startX + index * cardSpacing
      const canPlay = this.session.currentEnergy >= cardData.cost && this.session.outcome === 'ongoing'

      const cardObjects = this.createCard(
        cardX,
        height - 130,
        cardData.id,
        cardData.title,
        cardData.description,
        cardData.cost,
        canPlay,
        () => {
          this.playCardFromIndex(index)
        },
      )

      this.handObjects.push(...cardObjects)
    })
  }
}