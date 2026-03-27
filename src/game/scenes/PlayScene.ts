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
import { clearSave, saveRun } from '../battle/runSave'
import type { BattleState } from '../battle/battleLogic'

export class PlayScene extends Phaser.Scene {
  private heroMaxHp = 40
  private session!: BattleSession
  private transitioningScene = false
  private encounterType: EncounterType = 'battle'
  private compactLayout = false

  private heroHpText!: Phaser.GameObjects.Text
  private heroArmorText!: Phaser.GameObjects.Text
  private energyText!: Phaser.GameObjects.Text
  private drawPileCountText!: Phaser.GameObjects.Text
  private discardPileText!: Phaser.GameObjects.Text
  private enemyHpText!: Phaser.GameObjects.Text
  private intentText!: Phaser.GameObjects.Text
  private resultText!: Phaser.GameObjects.Text
  private turnBannerText!: Phaser.GameObjects.Text
  private heroPanel!: Phaser.GameObjects.Rectangle
  private enemyPanel!: Phaser.GameObjects.Rectangle
  private handObjects: Phaser.GameObjects.GameObject[] = []

  constructor() {
    super('PlayScene')
  }

  create() {
    const { width, height } = this.scale
    this.transitioningScene = false
    this.compactLayout = width < 900 || height < 700
    const runState = getRunState()
    this.heroMaxHp = runState.maxHeroHp
    this.encounterType = runState.currentEncounterType ?? 'battle'
    this.session = createInitialBattleSession(getRunDeck(), {
      heroHp: runState.heroHp,
      encounterType: this.encounterType,
      relics: getRunRelics(),
    })

    this.cameras.main.setBackgroundColor('#111827')

    this.add.text(width / 2, 30, 'Battle Prototype', {
      fontSize: this.compactLayout ? '24px' : '28px',
      color: '#ffffff',
    }).setOrigin(0.5)

    this.add.text(width / 2, 50, `Encounter: ${this.encounterType.toUpperCase()}`, {
      fontSize: this.compactLayout ? '15px' : '16px',
      color: '#cbd5e1',
    }).setOrigin(0.5)

    this.add.text(width / 2, 70, `Floor ${runState.currentFloor} / ${runState.maxFloors}`, {
      fontSize: this.compactLayout ? '15px' : '16px',
      color: '#cbd5e1',
    }).setOrigin(0.5)

    this.add.text(width / 2, 90, 'Press ESC to return to menu', {
      fontSize: this.compactLayout ? '15px' : '16px',
      color: '#cbd5e1',
    }).setOrigin(0.5)

    this.resultText = this.add.text(width / 2, 95, '', {
      fontSize: '26px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    this.turnBannerText = this.add.text(width / 2, 120, '', {
      fontSize: this.compactLayout ? '24px' : '28px',
      color: '#fde68a',
      fontStyle: 'bold',
      stroke: '#111827',
      strokeThickness: 6,
    }).setOrigin(0.5).setAlpha(0).setDepth(10)

    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.start('MenuScene')
    })

    // Enemy area
    this.enemyPanel = this.add.rectangle(
      width / 2,
      this.compactLayout ? 176 : 170,
      this.compactLayout ? 240 : 260,
      this.compactLayout ? 150 : 160,
      0x7f1d1d,
    ).setStrokeStyle(2, 0xffffff)

    this.add.text(width / 2, this.compactLayout ? 122 : 125, this.session.enemy.name, {
      fontSize: this.compactLayout ? '22px' : '24px',
      color: '#ffffff',
    }).setOrigin(0.5)

    this.enemyHpText = this.add.text(
      width / 2,
      this.compactLayout ? 156 : 160,
      `Enemy HP: ${this.session.enemy.maxHp} / ${this.session.enemy.maxHp}`,
      {
        fontSize: this.compactLayout ? '18px' : '20px',
        color: '#fecaca',
      },
    ).setOrigin(0.5)

    this.intentText = this.add.text(width / 2, this.compactLayout ? 198 : 205, `Enemy Intent: ${getCurrentIntent(this.session).label}`, {
      fontSize: this.compactLayout ? '17px' : '18px',
      color: '#fde68a',
      align: 'center',
      wordWrap: { width: this.compactLayout ? 250 : 320 },
    }).setOrigin(0.5)

    // Player area
    this.heroPanel = this.add.rectangle(
      this.compactLayout ? 160 : 180,
      height - (this.compactLayout ? 165 : 150),
      this.compactLayout ? 250 : 260,
      this.compactLayout ? 132 : 126,
      0x1e3a8a,
    ).setStrokeStyle(2, 0xffffff)

    this.add.text(this.heroPanel.x, this.heroPanel.y - 36, 'Hero', {
      fontSize: this.compactLayout ? '22px' : '24px',
      color: '#ffffff',
    }).setOrigin(0.5)

    this.heroHpText = this.add.text(this.heroPanel.x, this.heroPanel.y - 6, 'Hero HP: 40 / 40', {
      fontSize: this.compactLayout ? '17px' : '18px',
      color: '#bfdbfe',
    }).setOrigin(0.5)

    this.heroArmorText = this.add.text(this.heroPanel.x, this.heroPanel.y + 22, 'Hero Armor: 0', {
      fontSize: this.compactLayout ? '17px' : '18px',
      color: '#bfdbfe',
    }).setOrigin(0.5)

    this.energyText = this.add.text(this.heroPanel.x, this.heroPanel.y + 50, 'Energy: 3 / 3', {
      fontSize: this.compactLayout ? '17px' : '18px',
      color: '#bfdbfe',
    }).setOrigin(0.5)

    this.drawPileCountText = this.add.text(width / 2 - (this.compactLayout ? 170 : 220), height - (this.compactLayout ? 265 : 255), 'Draw Pile: 0 cards', {
      fontSize: this.compactLayout ? '15px' : '16px',
      color: '#cbd5e1',
    }).setOrigin(0.5)

    this.discardPileText = this.add.text(width / 2 + (this.compactLayout ? 170 : 220), height - (this.compactLayout ? 265 : 255), 'Discard Pile: 0 cards', {
      fontSize: this.compactLayout ? '15px' : '16px',
      color: '#cbd5e1',
    }).setOrigin(0.5)

    // End turn button
    const endTurnButton = this.add.rectangle(
      width - (this.compactLayout ? 130 : 150),
      height - (this.compactLayout ? 155 : 145),
      this.compactLayout ? 210 : 220,
      this.compactLayout ? 78 : 80,
      0xf59e0b,
    )
      .setStrokeStyle(2, 0xffffff)
      .setInteractive({ useHandCursor: true })

    const endTurnLabel = this.add.text(endTurnButton.x, endTurnButton.y - 8, 'End Turn', {
      fontSize: this.compactLayout ? '24px' : '26px',
      color: '#111827',
    }).setOrigin(0.5)

    this.add.text(endTurnButton.x, endTurnButton.y + 18, 'Tap to pass to the enemy', {
      fontSize: this.compactLayout ? '13px' : '14px',
      color: '#3f2b00',
    }).setOrigin(0.5).setDepth(2)

    endTurnButton.on('pointerdown', () => {
      this.animatePress(endTurnButton)
      this.resolveEndTurn()
    })

    // Hand area
    this.add.text(width / 2, height - (this.compactLayout ? 295 : 255), 'Hand', {
      fontSize: this.compactLayout ? '20px' : '22px',
      color: '#ffffff',
    }).setOrigin(0.5)

    this.renderHand()

    endTurnButton.setDepth(1)
    endTurnLabel.setDepth(2)

    this.updateBattleText()
    this.showTurnBanner('Player Turn', '#fde68a')
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
    const cardWidth = this.compactLayout ? 126 : 146
    const cardHeight = this.compactLayout ? 170 : 186
    const card = this.add.rectangle(x, y, cardWidth, cardHeight, 0xf8fafc)
      .setStrokeStyle(3, 0x1f2937)
      .setInteractive({ useHandCursor: true })
      .setName(id)

    if (!canPlay) {
      card.setFillStyle(0xd1d5db)
      card.disableInteractive()
    }

    card.on('pointerdown', () => {
      this.animatePress(card)
      onClick()
    })

    const titleText = this.add.text(x, y - 55, title, {
      fontSize: this.compactLayout ? '19px' : '22px',
      color: '#111827',
      fontStyle: 'bold',
      wordWrap: { width: cardWidth - 18 },
      align: 'center',
    }).setOrigin(0.5)

    const descriptionText = this.add.text(x, y + 5, description, {
      fontSize: this.compactLayout ? '14px' : '16px',
      color: '#374151',
      align: 'center',
      wordWrap: { width: cardWidth - 26 },
    }).setOrigin(0.5)

    const costText = this.add.text(x, y + 70, `Cost: ${cost}`, {
      fontSize: this.compactLayout ? '15px' : '16px',
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

    const previousState = this.cloneBattleState(this.session.state)
    this.session = playCardFromHand(this.session, cardIndex)
    this.showCombatFeedback(previousState, this.session.state)

    this.updateBattleText()
  }

  private resolveEndTurn() {
    if (this.session.outcome !== 'ongoing') {
      return
    }

    this.showTurnBanner('Enemy Turn', '#fca5a5')
    this.session = discardHand(this.session)
    const previousState = this.cloneBattleState(this.session.state)
    this.resolveEnemyIntent()
    this.showCombatFeedback(previousState, this.session.state)
    this.session.outcome = checkBattleOutcome(this.session.state)

    if (this.session.outcome === 'ongoing') {
      this.session = startNewPlayerTurn(this.session)
      this.time.delayedCall(220, () => {
        this.showTurnBanner('Player Turn', '#fde68a')
      })
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
      saveRun()
      this.resultText.setText('Victory')
      this.resultText.setColor('#86efac')
      this.showTurnBanner('Victory', '#86efac')
      this.cameras.main.flash(180, 140, 255, 180)
      this.transitioningScene = true

      this.time.delayedCall(320, () => {
        if (this.encounterType === 'boss') {
          this.scene.start('RelicRewardScene', { nextScene: 'RunEndScene' })
        } else if (this.encounterType === 'battle') {
          this.scene.start('RewardScene')
        } else {
          this.scene.start('RelicRewardScene', { nextScene: 'MapScene' })
        }
      })

      return
    } else if (this.session.outcome === 'defeat') {
      applyBattleResult(this.session.state.heroHp, false)
      clearSave()
      this.resultText.setText('Defeat')
      this.resultText.setColor('#fca5a5')
      this.showTurnBanner('Defeat', '#fca5a5')
      this.cameras.main.shake(180, 0.008)
    }

    this.enemyHpText.setText(`Enemy HP: ${this.session.state.enemyHp} / ${this.session.enemy.maxHp}`)
    this.heroHpText.setText(`Hero HP: ${this.session.state.heroHp} / ${this.heroMaxHp}`)
    this.heroArmorText.setText(`Hero Armor: ${this.session.state.heroArmor}`)
    this.energyText.setText(`Energy: ${this.session.currentEnergy} / ${this.session.maxEnergy}`)
    this.drawPileCountText.setText(`Draw Pile: ${this.session.drawPile.length} cards`)
    this.discardPileText.setText(`Discard Pile: ${this.session.discardPile.length} cards`)
    this.intentText.setText(`Enemy Intent: ${getCurrentIntent(this.session).label}`)

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
    const cardSpacing = this.getHandSpacing(width)
    const startX = width / 2 - ((this.session.hand.length - 1) * cardSpacing) / 2

    this.session.hand.forEach((cardData, index) => {
      const cardX = startX + index * cardSpacing
      const canPlay = this.session.currentEnergy >= cardData.cost && this.session.outcome === 'ongoing'

      const cardObjects = this.createCard(
        cardX,
        height - (this.compactLayout ? 130 : 128),
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

  private getHandSpacing(width: number): number {
    if (this.session.hand.length <= 1) {
      return 0
    }

    const maxSpacing = this.compactLayout ? 134 : 176
    const availableWidth = Math.max(320, width - 110)
    return Math.min(maxSpacing, availableWidth / (this.session.hand.length - 1))
  }

  private cloneBattleState(state: BattleState): BattleState {
    return { ...state }
  }

  private showCombatFeedback(previousState: BattleState, nextState: BattleState) {
    const enemyDamage = previousState.enemyHp - nextState.enemyHp
    const heroDamage = previousState.heroHp - nextState.heroHp
    const armorGain = nextState.heroArmor - previousState.heroArmor

    if (enemyDamage > 0) {
      this.showFloatingText(this.enemyPanel.x, this.enemyPanel.y - 16, `-${enemyDamage}`, '#fca5a5')
      this.flashTarget(this.enemyPanel, 0xfca5a5)
    }

    if (heroDamage > 0) {
      this.showFloatingText(this.heroPanel.x, this.heroPanel.y - 6, `-${heroDamage}`, '#fca5a5')
      this.flashTarget(this.heroPanel, 0xfca5a5)
    }

    if (armorGain > 0) {
      this.showFloatingText(this.heroPanel.x, this.heroPanel.y + 28, `+${armorGain} Armor`, '#93c5fd')
      this.flashTarget(this.heroPanel, 0x93c5fd)
    }
  }

  private showFloatingText(x: number, y: number, text: string, color: string) {
    const label = this.add.text(x, y, text, {
      fontSize: this.compactLayout ? '20px' : '24px',
      color,
      fontStyle: 'bold',
      stroke: '#111827',
      strokeThickness: 5,
    }).setOrigin(0.5).setDepth(12)

    this.tweens.add({
      targets: label,
      y: y - 36,
      alpha: 0,
      duration: 450,
      ease: 'Cubic.Out',
      onComplete: () => {
        label.destroy()
      },
    })
  }

  private flashTarget(target: Phaser.GameObjects.Rectangle, tintColor: number) {
    target.setFillStyle(tintColor)
    this.tweens.add({
      targets: target,
      alpha: 0.76,
      yoyo: true,
      duration: 90,
      repeat: 1,
      onComplete: () => {
        target.setAlpha(1)
        target.setFillStyle(target === this.heroPanel ? 0x1e3a8a : 0x7f1d1d)
      },
    })
  }

  private showTurnBanner(text: string, color: string) {
    this.turnBannerText.setText(text)
    this.turnBannerText.setColor(color)
    this.turnBannerText.setScale(0.92)
    this.turnBannerText.setAlpha(0)

    this.tweens.killTweensOf(this.turnBannerText)
    this.tweens.add({
      targets: this.turnBannerText,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 120,
      ease: 'Quad.Out',
      yoyo: true,
      hold: 220,
    })
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