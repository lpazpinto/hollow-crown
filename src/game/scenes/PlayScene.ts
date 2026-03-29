import Phaser from 'phaser'
import { checkBattleOutcome, type BattleState } from '../battle/battleLogic'
import {
  createInitialBattleSession,
  discardHand,
  getCurrentIntent,
  playCardFromHand,
  resolveEnemyIntentAction,
  startNewPlayerTurn,
  type BattleSession,
} from '../battle/battleSession'
import {
  advanceFloorAfterEncounter,
  applyBattleResult,
  awardXpForCurrentEncounter,
  getRunDeck,
  getRunAbilities,
  getRunRelics,
  getRunState,
  hasPendingLevelUp,
  resolveBattleCardRewardForVictory,
  type EncounterType,
} from '../battle/runState'
import { clearSave, saveRun } from '../battle/runSave'

export class PlayScene extends Phaser.Scene {
  private heroMaxHp = 40
  private session!: BattleSession
  private transitioningScene = false
  private encounterType: EncounterType = 'battle'
  private compactLayout = false

  private heroHpText!: Phaser.GameObjects.Text
  private heroArmorText!: Phaser.GameObjects.Text
  private energyText!: Phaser.GameObjects.Text
  private emberText!: Phaser.GameObjects.Text
  private drawPileCountText!: Phaser.GameObjects.Text
  private discardPileText!: Phaser.GameObjects.Text
  private enemyHpText!: Phaser.GameObjects.Text
  private intentText!: Phaser.GameObjects.Text
  private resultText!: Phaser.GameObjects.Text
  private turnBannerText!: Phaser.GameObjects.Text
  private heroPanel!: Phaser.GameObjects.Rectangle
  private enemyPanel!: Phaser.GameObjects.Rectangle
  private heroSprite?: Phaser.GameObjects.Image
  private heroSpriteBaseY = 0
  private heroIdleTimer?: Phaser.Time.TimerEvent
  private heroIdleFrame = 0
  private previousEmber = 0
  private abilityObjects: Phaser.GameObjects.GameObject[] = []
  private relicObjects: Phaser.GameObjects.GameObject[] = []
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
      abilities: getRunAbilities(),
    })

    this.cameras.main.setBackgroundColor('#111827')

    const topInfoY = this.compactLayout ? 18 : 20
    const heroX = this.compactLayout ? width * 0.25 : width * 0.23
    const enemyX = width - heroX
    const visualY = this.compactLayout ? 180 : 196

    this.add.text(width / 2, topInfoY, `Encounter: ${this.encounterType.toUpperCase()}`, {
      fontSize: this.compactLayout ? '14px' : '15px',
      color: '#cbd5e1',
    }).setOrigin(0.5, 0)

    this.add.text(width / 2, topInfoY + 20, `Floor ${runState.currentFloor} / ${runState.maxFloors}`, {
      fontSize: this.compactLayout ? '14px' : '15px',
      color: '#cbd5e1',
    }).setOrigin(0.5, 0)

    this.add.text(width / 2, topInfoY + 40, 'ESC: Menu', {
      fontSize: this.compactLayout ? '13px' : '14px',
      color: '#94a3b8',
    }).setOrigin(0.5, 0)

    this.resultText = this.add.text(width / 2, topInfoY + 62, '', {
      fontSize: this.compactLayout ? '22px' : '26px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0)

    this.turnBannerText = this.add.text(width / 2, topInfoY + 88, '', {
      fontSize: this.compactLayout ? '24px' : '28px',
      color: '#fde68a',
      fontStyle: 'bold',
      stroke: '#111827',
      strokeThickness: 6,
    }).setOrigin(0.5).setAlpha(0).setDepth(12)

    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.start('MenuScene')
    })

    this.heroSprite = this.createHeroSprite(heroX, visualY)

    this.heroPanel = this.add.rectangle(
      heroX,
      visualY + (this.compactLayout ? 124 : 138),
      this.compactLayout ? 248 : 266,
      this.compactLayout ? 150 : 162,
      0x1e3a8a,
    ).setStrokeStyle(2, 0xffffff)

    this.add.text(this.heroPanel.x, this.heroPanel.y - 44, 'Hero', {
      fontSize: this.compactLayout ? '20px' : '22px',
      color: '#ffffff',
    }).setOrigin(0.5)

    this.heroHpText = this.add.text(this.heroPanel.x, this.heroPanel.y - 26, 'Hero HP: 40 / 40', {
      fontSize: this.compactLayout ? '16px' : '18px',
      color: '#bfdbfe',
    }).setOrigin(0.5)

    this.heroArmorText = this.add.text(this.heroPanel.x, this.heroPanel.y, 'Hero Armor: 0', {
      fontSize: this.compactLayout ? '16px' : '18px',
      color: '#bfdbfe',
    }).setOrigin(0.5)

    this.energyText = this.add.text(this.heroPanel.x, this.heroPanel.y + 26, 'Energy: 3 / 3', {
      fontSize: this.compactLayout ? '16px' : '18px',
      color: '#bfdbfe',
    }).setOrigin(0.5)

    this.emberText = this.add.text(this.heroPanel.x, this.heroPanel.y + 52, 'Ember: 0', {
      fontSize: this.compactLayout ? '16px' : '18px',
      color: '#fdba74',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(3)

    this.renderAbilities(heroX, this.heroPanel.y + (this.compactLayout ? 78 : 88))
    this.renderRelics(heroX, this.heroPanel.y + (this.compactLayout ? 134 : 146))

    this.enemyPanel = this.add.rectangle(
      enemyX,
      visualY,
      this.compactLayout ? 260 : 280,
      this.compactLayout ? 190 : 206,
      0x7f1d1d,
    ).setStrokeStyle(2, 0xffffff)

    this.add.text(enemyX, visualY - (this.compactLayout ? 68 : 74), this.session.enemy.name, {
      fontSize: this.compactLayout ? '22px' : '24px',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: this.compactLayout ? 210 : 240 },
    }).setOrigin(0.5)

    this.enemyHpText = this.add.text(
      enemyX,
      visualY + (this.compactLayout ? 20 : 24),
      `Enemy HP: ${this.session.enemy.maxHp} / ${this.session.enemy.maxHp} | Armor: 0`,
      {
        fontSize: this.compactLayout ? '16px' : '18px',
        color: '#fecaca',
        align: 'center',
      },
    ).setOrigin(0.5)

    this.intentText = this.add.text(enemyX, visualY + (this.compactLayout ? 56 : 62), `Enemy Intent: ${getCurrentIntent(this.session).label}`, {
      fontSize: this.compactLayout ? '16px' : '17px',
      color: '#fde68a',
      align: 'center',
      wordWrap: { width: this.compactLayout ? 220 : 260 },
    }).setOrigin(0.5)

    const pilesY = height - (this.compactLayout ? 248 : 232)
    this.drawPileCountText = this.add.text(width / 2 - (this.compactLayout ? 170 : 220), pilesY, 'Draw Pile: 0 cards', {
      fontSize: this.compactLayout ? '15px' : '16px',
      color: '#cbd5e1',
    }).setOrigin(0.5)

    this.discardPileText = this.add.text(width / 2 + (this.compactLayout ? 170 : 220), pilesY, 'Discard Pile: 0 cards', {
      fontSize: this.compactLayout ? '15px' : '16px',
      color: '#cbd5e1',
    }).setOrigin(0.5)

    this.add.text(width / 2, height - (this.compactLayout ? 216 : 200), 'Hand', {
      fontSize: this.compactLayout ? '20px' : '22px',
      color: '#ffffff',
    }).setOrigin(0.5)

    const endTurnButton = this.add.rectangle(
      width - (this.compactLayout ? 118 : 138),
      height - (this.compactLayout ? 92 : 102),
      this.compactLayout ? 208 : 220,
      this.compactLayout ? 78 : 82,
      0xf59e0b,
    )
      .setStrokeStyle(2, 0xffffff)
      .setInteractive({ useHandCursor: true })

    const endTurnLabel = this.add.text(endTurnButton.x, endTurnButton.y - 9, 'End Turn', {
      fontSize: this.compactLayout ? '24px' : '26px',
      color: '#111827',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    this.add.text(endTurnButton.x, endTurnButton.y + 18, 'Tap to pass', {
      fontSize: this.compactLayout ? '13px' : '14px',
      color: '#3f2b00',
    }).setOrigin(0.5).setDepth(2)

    endTurnButton.on('pointerdown', () => {
      this.animatePress(endTurnButton)
      this.resolveEndTurn()
    })

    this.renderHand()

    endTurnButton.setDepth(1)
    endTurnLabel.setDepth(2)

    this.previousEmber = this.session.state.ember
    this.updateBattleText()
    this.showTurnBanner('Player Turn', '#fde68a')
    this.startHeroIdleAnimation()
  }

  private createHeroSprite(x: number, y: number): Phaser.GameObjects.Image | undefined {
    if (!this.textures.exists('hero-idle')) {
      this.add.rectangle(x, y, 120, 150, 0x1e40af).setStrokeStyle(2, 0xffffff)
      return undefined
    }

    const sprite = this.add.image(x, y, 'hero-idle')
    const targetHeight = this.compactLayout ? 150 : 180
    sprite.setScale(targetHeight / sprite.height)
    this.heroSpriteBaseY = y

    return sprite
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
      fontSize: this.compactLayout ? '18px' : '21px',
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
    this.playDamageFeedback(previousState, this.session.state)

    this.updateBattleText()
  }

  private resolveEndTurn() {
    if (this.session.outcome !== 'ongoing') {
      return
    }

    this.stopHeroIdleAnimation()
    this.showTurnBanner('Enemy Turn', '#fca5a5')

    this.session = discardHand(this.session)
    const previousState = this.cloneBattleState(this.session.state)
    this.session = resolveEnemyIntentAction(this.session)
    this.playDamageFeedback(previousState, this.session.state)
    this.session.outcome = checkBattleOutcome(this.session.state)

    if (this.session.outcome === 'ongoing') {
      this.session = startNewPlayerTurn(this.session)
      this.time.delayedCall(220, () => {
        this.showTurnBanner('Player Turn', '#fde68a')
        this.startHeroIdleAnimation()
      })
    }

    this.updateBattleText()
  }

  private updateBattleText() {
    if (this.transitioningScene) {
      return
    }

    this.session.outcome = checkBattleOutcome(this.session.state)

    if (this.session.outcome === 'victory') {
      this.stopHeroIdleAnimation()
      applyBattleResult(this.session.state.heroHp, true)
      awardXpForCurrentEncounter()
      this.resultText.setText('Victory')
      this.resultText.setColor('#86efac')
      this.showTurnBanner('Victory', '#86efac')
      this.cameras.main.flash(180, 140, 255, 180)
      this.transitioningScene = true

      this.time.delayedCall(320, () => {
        const nextRoute = this.getPostVictoryRoute()

        if (nextRoute.advanceFloorNow) {
          advanceFloorAfterEncounter()
        }

        saveRun()

        if (hasPendingLevelUp()) {
          this.scene.start('LevelUpScene', {
            nextScene: nextRoute.scene,
            nextData: nextRoute.data,
          })
          return
        }

        this.scene.start(nextRoute.scene, nextRoute.data)
      })

      return
    }

    if (this.session.outcome === 'defeat') {
      this.stopHeroIdleAnimation()
      applyBattleResult(this.session.state.heroHp, false)
      clearSave()
      this.resultText.setText('Defeat')
      this.resultText.setColor('#fca5a5')
      this.showTurnBanner('Defeat', '#fca5a5')
      this.cameras.main.shake(180, 0.008)
    }

    this.enemyHpText.setText(
      `Enemy HP: ${this.session.state.enemyHp} / ${this.session.enemy.maxHp} | Armor: ${this.session.state.enemyArmor}`,
    )
    this.heroHpText.setText(`Hero HP: ${this.session.state.heroHp} / ${this.heroMaxHp}`)
    this.heroArmorText.setText(`Hero Armor: ${this.session.state.heroArmor}`)
    this.energyText.setText(`Energy: ${this.session.currentEnergy} / ${this.session.maxEnergy}`)
    this.emberText.setText(`Ember: ${this.session.state.ember}`)

    const emberDelta = this.session.state.ember - this.previousEmber
    if (emberDelta !== 0) {
      this.highlightEmberChange(emberDelta)
      this.previousEmber = this.session.state.ember
    }

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
        height - (this.compactLayout ? 108 : 112),
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

    const maxSpacing = this.compactLayout ? 128 : 164
    const availableWidth = Math.max(360, width - (this.compactLayout ? 240 : 320))
    return Math.min(maxSpacing, availableWidth / (this.session.hand.length - 1))
  }

  private renderRelics(x: number, startY: number) {
    if (this.relicObjects.length > 0) {
      this.relicObjects.forEach((obj) => obj.destroy())
      this.relicObjects = []
    }

    const panelWidth = this.compactLayout ? 250 : 274
    const panel = this.add.rectangle(
      x,
      startY + (this.compactLayout ? 24 : 26),
      panelWidth,
      this.compactLayout ? 62 : 68,
      0x0f172a,
      0.9,
    ).setStrokeStyle(1, 0x334155).setDepth(1)

    const title = this.add.text(x - panelWidth / 2 + 8, startY + 5, 'Relics', {
      fontSize: this.compactLayout ? '14px' : '15px',
      color: '#e2e8f0',
      fontStyle: 'bold',
    }).setOrigin(0, 0).setDepth(2)

    this.relicObjects.push(panel)
    this.relicObjects.push(title)

    const relics = this.session.relics
    if (relics.length === 0) {
      const none = this.add.text(x - panelWidth / 2 + 8, startY + 26, 'None', {
        fontSize: this.compactLayout ? '13px' : '14px',
        color: '#94a3b8',
      }).setOrigin(0, 0).setDepth(2)
      this.relicObjects.push(none)
      return
    }

    let chipX = x - panelWidth / 2 + 8
    let chipY = startY + 24
    const maxX = x + panelWidth / 2 - 8

    relics.forEach((relic, index) => {
      if (index >= 6) {
        return
      }

      const chip = this.add.text(chipX, chipY, relic.name, {
        fontSize: this.compactLayout ? '12px' : '13px',
        color: '#bfdbfe',
        backgroundColor: '#1e293b',
        padding: { x: 6, y: 2 },
      }).setOrigin(0, 0).setDepth(2)

      if (chipX + chip.width > maxX) {
        chipX = x - panelWidth / 2 + 8
        chipY += 20
        chip.setPosition(chipX, chipY)
      }

      chipX += chip.width + 6
      this.relicObjects.push(chip)
    })
  }

  private renderAbilities(x: number, startY: number) {
    if (this.abilityObjects.length > 0) {
      this.abilityObjects.forEach((obj) => obj.destroy())
      this.abilityObjects = []
    }

    const panelWidth = this.compactLayout ? 250 : 274
    const panel = this.add.rectangle(
      x,
      startY + (this.compactLayout ? 20 : 22),
      panelWidth,
      this.compactLayout ? 56 : 60,
      0x0b1324,
      0.94,
    ).setStrokeStyle(1, 0x475569).setDepth(1)

    const title = this.add.text(x - panelWidth / 2 + 8, startY + 4, 'Blessings', {
      fontSize: this.compactLayout ? '14px' : '15px',
      color: '#fef3c7',
      fontStyle: 'bold',
    }).setOrigin(0, 0).setDepth(2)

    this.abilityObjects.push(panel, title)

    const abilities = this.session.abilities
    if (abilities.length === 0) {
      const none = this.add.text(x - panelWidth / 2 + 8, startY + 24, 'None', {
        fontSize: this.compactLayout ? '13px' : '14px',
        color: '#94a3b8',
      }).setOrigin(0, 0).setDepth(2)
      this.abilityObjects.push(none)
      return
    }

    let chipX = x - panelWidth / 2 + 8
    let chipY = startY + 22
    const maxX = x + panelWidth / 2 - 8

    abilities.forEach((ability, index) => {
      if (index >= 6) {
        return
      }

      const chip = this.add.text(chipX, chipY, ability.name, {
        fontSize: this.compactLayout ? '12px' : '13px',
        color: '#fde68a',
        backgroundColor: '#1f2937',
        padding: { x: 6, y: 2 },
      }).setOrigin(0, 0).setDepth(2)

      if (chipX + chip.width > maxX) {
        chipX = x - panelWidth / 2 + 8
        chipY += 20
        chip.setPosition(chipX, chipY)
      }

      chipX += chip.width + 6
      this.abilityObjects.push(chip)
    })
  }

  private highlightEmberChange(delta: number) {
    const gained = delta > 0
    const color = gained ? '#fdba74' : '#fca5a5'

    this.emberText.setColor(color)
    this.emberText.setScale(1.08)
    this.tweens.killTweensOf(this.emberText)
    this.tweens.add({
      targets: this.emberText,
      scaleX: 1,
      scaleY: 1,
      duration: 220,
      ease: 'Quad.Out',
      onComplete: () => {
        this.emberText.setColor('#fdba74')
      },
    })
  }

  private startHeroIdleAnimation() {
    if (!this.heroSprite) return
    this.stopHeroIdleAnimation()
    this.heroIdleFrame = 0
    this.heroSprite.y = this.heroSpriteBaseY - 3
    this.heroIdleTimer = this.time.addEvent({
      delay: 360,
      loop: true,
      callback: () => {
        if (!this.heroSprite) return
        this.heroIdleFrame = (this.heroIdleFrame + 1) % 2
        this.heroSprite.y = this.heroIdleFrame === 0
          ? this.heroSpriteBaseY - 3
          : this.heroSpriteBaseY + 3
      },
    })
  }

  private stopHeroIdleAnimation() {
    if (!this.heroSprite) return
    if (this.heroIdleTimer) {
      this.heroIdleTimer.remove()
      this.heroIdleTimer = undefined
    }
    this.heroSprite.y = this.heroSpriteBaseY
  }

  private cloneBattleState(state: BattleState): BattleState {
    return { ...state }
  }

  private playDamageFeedback(previousState: BattleState, nextState: BattleState) {
    const enemyDamage = previousState.enemyHp - nextState.enemyHp
    const heroDamage = previousState.heroHp - nextState.heroHp
    const heroArmorGain = nextState.heroArmor - previousState.heroArmor
    const enemyArmorGain = nextState.enemyArmor - previousState.enemyArmor

    if (enemyDamage > 0) {
      this.flashTargetRed(this.enemyPanel, 0x7f1d1d)
      this.showFloatingDamageText(this.enemyPanel.x, this.enemyPanel.y - 96, `-${enemyDamage}`, '#fecaca')
    }

    if (heroDamage > 0) {
      const heroTarget = this.heroSprite ?? this.heroPanel
      this.flashTargetRed(heroTarget, 0x1e3a8a)
      const y = this.heroSprite ? this.heroSprite.y - 94 : this.heroPanel.y - 74
      this.showFloatingDamageText(this.heroPanel.x, y, `-${heroDamage}`, '#fecaca')
    }

    if (heroArmorGain > 0) {
      this.showFloatingDamageText(this.heroPanel.x, this.heroPanel.y - 52, `+${heroArmorGain} Armor`, '#93c5fd')
    }

    if (enemyArmorGain > 0) {
      this.showFloatingDamageText(this.enemyPanel.x, this.enemyPanel.y - 70, `+${enemyArmorGain} Armor`, '#93c5fd')
    }
  }

  private flashTargetRed(
    target: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Image,
    restoreFillColor: number,
  ) {
    if (target instanceof Phaser.GameObjects.Image) {
      target.setTintFill(0xcc2222)
      this.time.delayedCall(120, () => { target.clearTint() })
      return
    }
    target.setFillStyle(0xcc2222)
    this.time.delayedCall(120, () => { target.setFillStyle(restoreFillColor) })
  }

  private showFloatingDamageText(x: number, y: number, text: string, color: string) {
    const label = this.add.text(x, y, text, {
      fontSize: this.compactLayout ? '19px' : '22px',
      color,
      fontStyle: 'bold',
      stroke: '#111827',
      strokeThickness: 5,
    }).setOrigin(0.5).setDepth(14)

    this.tweens.add({
      targets: label,
      y: y - 25,
      alpha: 0,
      duration: 420,
      ease: 'Cubic.Out',
      onComplete: () => { label.destroy() },
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

  private getPostVictoryRoute(): {
    scene: 'RewardScene' | 'RelicRewardScene' | 'MapScene'
    data?: Record<string, unknown>
    advanceFloorNow: boolean
  } {
    if (this.encounterType === 'boss') {
      return {
        scene: 'RelicRewardScene',
        data: { nextScene: 'RunEndScene' },
        advanceFloorNow: false,
      }
    }

    if (this.encounterType === 'battle') {
      const shouldGrantCardReward = resolveBattleCardRewardForVictory()

      if (!shouldGrantCardReward) {
        return {
          scene: 'MapScene',
          advanceFloorNow: true,
        }
      }

      return {
        scene: 'RewardScene',
        data: { encounterType: 'battle' },
        advanceFloorNow: false,
      }
    }

    return {
      scene: 'RelicRewardScene',
      data: { nextScene: 'MapScene' },
      advanceFloorNow: false,
    }
  }
}
