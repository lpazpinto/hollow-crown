import Phaser from 'phaser'
import { checkBattleOutcome, type BattleState } from '../battle/battleLogic'
import { getCardBaseId, type CardContent } from '../content/cards'
import { getRouteById } from '../content/routes'
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
  private enemyNameText!: Phaser.GameObjects.Text
  private resultText!: Phaser.GameObjects.Text
  private turnBannerText!: Phaser.GameObjects.Text
  private heroPanel!: Phaser.GameObjects.Rectangle
  private enemyPanel!: Phaser.GameObjects.Rectangle
  private heroSprite?: Phaser.GameObjects.Sprite
  private enemySprite?: Phaser.GameObjects.Sprite
  private previousEmber = 0
  private actionInProgress = false
  private abilityObjects: Phaser.GameObjects.GameObject[] = []
  private relicObjects: Phaser.GameObjects.GameObject[] = []
  private handObjects: Phaser.GameObjects.GameObject[] = []
  private handCardVisuals: Array<{ card: Phaser.GameObjects.Rectangle, objects: Phaser.GameObjects.GameObject[] }> = []
  private energyPips: Phaser.GameObjects.Rectangle[] = []
  private energyCrystalIcons: Phaser.GameObjects.Image[] = []
  private emberPips: Phaser.GameObjects.Rectangle[] = []
  private emberPipLabel?: Phaser.GameObjects.Text
  private handCardY = 0
  private deckAnchorX = 0
  private deckAnchorY = 0
  private discardAnchorX = 0
  private discardAnchorY = 0
  private deckPileVisuals: Phaser.GameObjects.Rectangle[] = []
  private discardPileVisuals: Phaser.GameObjects.Rectangle[] = []
  private centerActionX = 0
  private centerActionY = 0
  private pendingDrawAnimation = false

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

    const C = this.compactLayout
    const hudH = C ? 82 : 94
    const heroX = C ? Math.floor(width * 0.28) : Math.floor(width * 0.26)
    const enemyX = width - heroX
    const spriteY = C ? Math.floor(height * 0.46) : Math.floor(height * 0.45)

    // Top HUD band background.
    this.add.rectangle(width / 2, hudH / 2, width, hudH, 0x060a13, 0.84).setDepth(0)
    this.add.rectangle(width / 2, hudH - 2, width, 2, 0x2d4666).setDepth(1)

    const panelY = C ? 40 : 44
    const sidePanelW = C ? 258 : 304
    const sidePanelH = C ? 56 : 62
    const centerPanelW = C ? 270 : 318
    const centerPanelH = C ? 56 : 62

    const leftPanel = this.add.rectangle(
      14 + sidePanelW / 2,
      panelY,
      sidePanelW,
      sidePanelH,
      0x101a2f,
      0.96,
    ).setStrokeStyle(2, 0x5b7699).setDepth(1)
    this.add.rectangle(leftPanel.x, leftPanel.y - sidePanelH / 2 + 8, sidePanelW - 10, 2, 0x7da2c9, 0.85).setDepth(2)

    const centerPanel = this.add.rectangle(
      width / 2,
      panelY,
      centerPanelW,
      centerPanelH,
      0x1a1e2e,
      0.97,
    ).setStrokeStyle(2, 0x8b6b37).setDepth(1)
    this.add.rectangle(centerPanel.x, centerPanel.y - centerPanelH / 2 + 8, centerPanelW - 10, 2, 0xc7a364, 0.9).setDepth(2)

    const rightPanel = this.add.rectangle(
      width - 14 - sidePanelW / 2,
      panelY,
      sidePanelW,
      sidePanelH,
      0x241426,
      0.96,
    ).setStrokeStyle(2, this.encounterType === 'boss' ? 0xe9b663 : 0xa17676).setDepth(1)
    this.add.rectangle(
      rightPanel.x,
      rightPanel.y - sidePanelH / 2 + 8,
      sidePanelW - 10,
      2,
      this.encounterType === 'boss' ? 0xe9b663 : 0xc19595,
      0.85,
    ).setDepth(2)

    // Battlefield band to anchor both combatants and avoid a floating look.
    const battleBandY = C ? Math.floor(height * 0.48) : Math.floor(height * 0.47)
    this.add.rectangle(width / 2, battleBandY, width * 0.9, C ? 170 : 184, 0x0f172a, 0.26)
      .setStrokeStyle(1, 0x334155, 0.35)
      .setDepth(0)
    const battleLineY = spriteY + (C ? 64 : 72)
    this.add.rectangle(width / 2, battleLineY, width * 0.78, 2, 0x334155, 0.7).setDepth(1)
    this.add.ellipse(heroX, battleLineY + 10, C ? 120 : 132, C ? 24 : 28, 0x000000, 0.24).setDepth(1)
    this.add.ellipse(enemyX, battleLineY + 10, C ? 126 : 142, C ? 24 : 28, 0x000000, 0.24).setDepth(1)

    // Battlefield overlays: result text + turn banner.
    this.resultText = this.add.text(width / 2, spriteY - (C ? 76 : 92), '', {
      fontSize: C ? '20px' : '22px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#0a1020',
      strokeThickness: 5,
      align: 'center',
      wordWrap: { width: Math.floor(width * 0.52) },
    }).setOrigin(0.5, 0.5).setDepth(11)

    this.turnBannerText = this.add.text(width / 2, spriteY - (C ? 46 : 56), '', {
      fontSize: C ? '28px' : '32px',
      color: '#fde68a',
      fontStyle: 'bold',
      stroke: '#0a1020',
      strokeThickness: 7,
    }).setOrigin(0.5).setAlpha(0).setDepth(12)

    // Hero HUD panel.
    const heroLabelX = leftPanel.x - sidePanelW / 2 + 10
    this.add.text(heroLabelX, C ? 14 : 16, 'UN1', {
      fontSize: C ? '11px' : '12px',
      color: '#9cb0ca',
      fontStyle: 'bold',
    }).setOrigin(0, 0).setDepth(3)

    this.heroHpText = this.add.text(heroLabelX, C ? 30 : 32, 'HP 40/40', {
      fontSize: C ? '16px' : '18px',
      color: '#7dd3fc',
      fontStyle: 'bold',
    }).setOrigin(0, 0).setDepth(3)

    this.heroArmorText = this.add.text(heroLabelX + (C ? 120 : 138), C ? 32 : 34, 'Armor 0', {
      fontSize: C ? '13px' : '14px',
      color: '#bfdbfe',
      fontStyle: 'bold',
    }).setOrigin(0, 0).setDepth(3)

    // Resource HUD panel with pips.
    const centerX = width / 2
    const pipBaseY = C ? 34 : 38
    const pipGap = C ? 16 : 19
    const energyStartX = centerX - (C ? 88 : 100)
    const emberStartX = centerX + (C ? 12 : 20)

    this.add.text(centerX - (C ? 82 : 94), C ? 15 : 17, 'Energy', {
      fontSize: C ? '11px' : '12px',
      color: '#bfe9ff',
      fontStyle: 'bold',
    }).setOrigin(0, 0).setDepth(3)

    const hasCrystalEnergy = this.textures.exists('ui-energy-crystal')
    for (let i = 0; i < 6; i += 1) {
      if (hasCrystalEnergy) {
        const crystal = this.add.image(energyStartX + i * pipGap, pipBaseY, 'ui-energy-crystal')
          .setScale(C ? 0.55 : 0.62)
          .setDepth(3)
        this.energyCrystalIcons.push(crystal)
      } else {
        const pip = this.add.rectangle(energyStartX + i * pipGap, pipBaseY, C ? 10 : 12, C ? 10 : 12, 0x164e63)
          .setStrokeStyle(1, 0x86c9e9)
          .setDepth(3)
        this.energyPips.push(pip)
      }
    }

    this.energyText = this.add.text(centerX - (C ? 82 : 94), C ? 44 : 50, '3/3', {
      fontSize: C ? '12px' : '13px',
      color: '#93e4ff',
      fontStyle: 'bold',
    }).setOrigin(0, 0).setDepth(3)

    this.emberPipLabel = this.add.text(centerX + (C ? 20 : 28), C ? 15 : 17, 'Ember', {
      fontSize: C ? '11px' : '12px',
      color: '#ffd3a5',
      fontStyle: 'bold',
    }).setOrigin(0, 0).setDepth(3)

    for (let i = 0; i < 6; i += 1) {
      const pip = this.add.rectangle(emberStartX + i * pipGap, pipBaseY, C ? 10 : 12, C ? 10 : 12, 0x7c2d12)
        .setStrokeStyle(1, 0xf59e0b)
        .setDepth(3)
      this.emberPips.push(pip)
    }

    this.emberText = this.add.text(centerX + (C ? 20 : 28), C ? 44 : 50, '0', {
      fontSize: C ? '12px' : '13px',
      color: '#fdba74',
      fontStyle: 'bold',
    }).setOrigin(0, 0).setDepth(3)

    this.add.text(centerX, C ? 63 : 72, `${this.encounterType.toUpperCase()} · F${runState.currentFloor}/${runState.maxFloors}`, {
      fontSize: C ? '10px' : '11px',
      color: '#7f8ea7',
    }).setOrigin(0.5, 0).setDepth(3)

    // Enemy HUD panel + framed intent block.
    const ex = rightPanel.x + sidePanelW / 2 - 10

    this.enemyNameText = this.add.text(ex, C ? 14 : 16, this.session.enemy.name, {
      fontSize: C ? '14px' : '16px',
      color: this.encounterType === 'boss' ? '#fde68a' : '#f8d2d2',
      fontStyle: 'bold',
      align: 'right',
    }).setOrigin(1, 0).setDepth(3)

    if (this.encounterType === 'boss') {
      this.add.text(ex - this.enemyNameText.width - 8, C ? 16 : 18, 'BOSS', {
        fontSize: C ? '10px' : '11px',
        color: '#fca5a5',
        fontStyle: 'bold',
      }).setOrigin(1, 0).setDepth(3)
    }

    this.enemyHpText = this.add.text(ex, C ? 32 : 36, `HP ${this.session.enemy.maxHp}/${this.session.enemy.maxHp}`, {
      fontSize: C ? '13px' : '14px',
      color: '#fecaca',
      align: 'right',
      fontStyle: 'bold',
    }).setOrigin(1, 0).setDepth(3)

    const intentWidth = C ? 154 : 196
    const intentHeight = C ? 22 : 24
    const intentX = ex - intentWidth / 2
    const intentY = C ? 56 : 64
    this.add.rectangle(intentX, intentY, intentWidth, intentHeight, 0x3f1f1f, 0.95)
      .setStrokeStyle(1, this.encounterType === 'boss' ? 0xf59e0b : 0xe5b8b8)
      .setDepth(2)
    this.intentText = this.add.text(ex - 6, intentY, `Intent: ${getCurrentIntent(this.session).label}`, {
      fontSize: C ? '11px' : '12px',
      color: this.encounterType === 'boss' ? '#fde68a' : '#fef3c7',
      wordWrap: { width: intentWidth - 16 },
      align: 'right',
      fontStyle: 'bold',
    }).setOrigin(1, 0.5).setDepth(3)

    // Sprite slots: hidden references for hit feedback + fallback cards.
    const slotW = C ? 118 : 138
    const slotH = C ? 148 : 174
    this.heroPanel = this.add.rectangle(heroX, spriteY, slotW, slotH, 0x1e3a8a).setAlpha(0)
    this.enemyPanel = this.add.rectangle(enemyX, spriteY, slotW, slotH, 0x7f1d1d).setAlpha(0)

    this.heroSprite = this.createHeroSprite(heroX, spriteY)
    this.enemySprite = this.createEnemySprite(enemyX, spriteY)

    if (!this.heroSprite) {
      this.heroPanel.setAlpha(0.8).setFillStyle(0x1e3a8a, 0.9).setStrokeStyle(1, 0x93c5fd, 0.8)
    }

    if (!this.enemySprite) {
      this.enemyPanel.setAlpha(0.68)
        .setFillStyle(this.encounterType === 'boss' ? 0x3f1414 : 0x4a1f1f, 0.92)
        .setStrokeStyle(1, this.encounterType === 'boss' ? 0xf59e0b : 0xef4444, 0.72)
    }

    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.start('MenuScene')
    })

    // Bottom command band with matching HUD framing.
    const bottomBarTopY = height - (C ? 218 : 236)
    this.add.rectangle(width / 2, bottomBarTopY + (C ? 110 : 116), width, C ? 220 : 232, 0x0b1020, 0.84).setDepth(0)
    this.add.rectangle(width / 2, bottomBarTopY, width, 2, 0x2d4666).setDepth(1)

    const handPanelCenterX = width / 2
    const handPanelCenterY = height - (C ? 150 : 166)
    const handPanelW = C ? 410 : 560
    const handPanelH = C ? 144 : 156
    this.add.rectangle(handPanelCenterX, handPanelCenterY, handPanelW, handPanelH, 0x131d2e, 0.9)
      .setStrokeStyle(1, 0x4b617f, 0.75)
      .setDepth(0)
    this.add.rectangle(handPanelCenterX, handPanelCenterY - handPanelH / 2 + 10, handPanelW - 18, 2, 0x6d87a8, 0.6).setDepth(1)

    const pilesY = handPanelCenterY - handPanelH / 2 + (C ? 22 : 24)
    const pileW = C ? 96 : 110
    const pileH = C ? 54 : 60
    const deckPileX = width / 2 - (C ? 126 : 168)
    const discardPileX = width / 2 + (C ? 126 : 168)
    this.centerActionX = width / 2
    this.centerActionY = spriteY + (C ? 4 : 6)

    this.add.rectangle(deckPileX, pilesY, pileW, pileH, 0x1a2439, 0.95).setStrokeStyle(1, 0x5b7699).setDepth(1)
    this.add.rectangle(discardPileX, pilesY, pileW, pileH, 0x1a2439, 0.95).setStrokeStyle(1, 0x5b7699).setDepth(1)

    const stackW = C ? 28 : 32
    const stackH = C ? 36 : 40
    const stackTopY = pilesY + (C ? 2 : 3)

    this.deckAnchorX = deckPileX
    this.deckAnchorY = stackTopY
    this.discardAnchorX = discardPileX
    this.discardAnchorY = stackTopY

    for (let i = 0; i < 3; i += 1) {
      const deckCard = this.add.rectangle(
        this.deckAnchorX - (2 - i) * 4,
        this.deckAnchorY + (2 - i) * 3,
        stackW,
        stackH,
        0x243144,
        0.97,
      ).setStrokeStyle(1, 0x9fb9d8, 0.86).setDepth(3)
      this.deckPileVisuals.push(deckCard)

      const discardCard = this.add.rectangle(
        this.discardAnchorX - (2 - i) * 4,
        this.discardAnchorY + (2 - i) * 3,
        stackW,
        stackH,
        0x3f2b32,
        0.97,
      ).setStrokeStyle(1, 0xd4b6bf, 0.86).setDepth(3)
      this.discardPileVisuals.push(discardCard)
    }

    this.add.text(this.deckAnchorX, this.deckAnchorY - (C ? 30 : 34), 'Deck', {
      fontSize: C ? '11px' : '12px',
      color: '#d7e6f7',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(3)

    this.add.text(this.discardAnchorX, this.discardAnchorY - (C ? 30 : 34), 'Discard', {
      fontSize: C ? '11px' : '12px',
      color: '#e8cdd3',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(3)

    this.add.text(width / 2, pilesY, 'Hand', {
      fontSize: C ? '12px' : '13px',
      color: '#c7d6ea',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(2)

    this.drawPileCountText = this.add.text(this.deckAnchorX, this.deckAnchorY + (C ? 29 : 34), 'Deck 0', {
      fontSize: C ? '12px' : '13px',
      color: '#b0c8e3',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(3)

    this.discardPileText = this.add.text(this.discardAnchorX, this.discardAnchorY + (C ? 29 : 34), 'Discard 0', {
      fontSize: C ? '12px' : '13px',
      color: '#b0c8e3',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(3)

    // End-turn button: framed, prominent, and consistent with HUD palette.
    const endTurnButton = this.add.rectangle(
      width - (C ? 118 : 138),
      height - (C ? 90 : 100),
      C ? 208 : 220,
      C ? 72 : 78,
      0xb9781f,
    ).setStrokeStyle(2, 0xf8d17f).setInteractive({ useHandCursor: true }).setDepth(2)

    this.add.rectangle(endTurnButton.x, endTurnButton.y - (C ? 16 : 18), C ? 194 : 206, 2, 0xf7d896, 0.9).setDepth(3)

    this.add.text(endTurnButton.x, endTurnButton.y - 8, 'END TURN', {
      fontSize: C ? '21px' : '23px',
      color: '#fff4d6',
      fontStyle: 'bold',
      stroke: '#5a3200',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(4)

    this.add.text(endTurnButton.x, endTurnButton.y + 14, 'Pass Action', {
      fontSize: C ? '11px' : '12px',
      color: '#ffe7b3',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(4)

    endTurnButton.on('pointerdown', () => {
      this.animatePress(endTurnButton)
      this.resolveEndTurn()
    })

    // Compact passives strip on bottom-left.
    const ablCenterX = C ? 94 : 136
    const ablY = height - (C ? 156 : 172)
    this.renderAbilities(ablCenterX, ablY)
    this.renderRelics(ablCenterX, ablY + (C ? 36 : 42))

    this.handCardY = height - (C ? 92 : 102)

    this.renderHand()

    this.previousEmber = this.session.state.ember
    this.pendingDrawAnimation = true
    this.updateBattleText()

    if (this.encounterType === 'boss') {
      this.playBossIntroMoment()
    } else {
      this.showTurnBanner('Player Turn', '#fde68a')
      this.startHeroIdleAnimation()
    }
  }

  private createHeroSprite(x: number, y: number): Phaser.GameObjects.Sprite | undefined {
    if (!this.textures.exists('hero-idle-sheet')) {
      this.add.rectangle(x, y, 120, 150, 0x1e40af).setStrokeStyle(2, 0xffffff)
      return undefined
    }

    this.ensureHeroAnimations()
    const sprite = this.add.sprite(x, y, 'hero-idle-sheet')
    const targetHeight = this.compactLayout ? 150 : 180
    sprite.setScale(targetHeight / 48)

    if (this.anims.exists('hero-idle')) {
      sprite.play('hero-idle')
    }

    return sprite
  }

  private ensureHeroAnimations() {
    if (this.textures.exists('hero-idle-sheet') && !this.anims.exists('hero-idle')) {
      this.anims.create({
        key: 'hero-idle',
        frames: this.anims.generateFrameNumbers('hero-idle-sheet', {
          start: 0,
          end: 7,
        }),
        frameRate: 8,
        repeat: -1,
      })
    }

    if (this.textures.exists('hero-pain-sheet') && !this.anims.exists('hero-pain')) {
      this.anims.create({
        key: 'hero-pain',
        frames: this.anims.generateFrameNumbers('hero-pain-sheet', {
          start: 0,
          end: 7,
        }),
        frameRate: 18,
        repeat: 0,
      })
    }
  }

  private playHeroPainAnimation() {
    if (!this.heroSprite || !this.anims.exists('hero-pain')) {
      return
    }

    this.heroSprite.play('hero-pain', true)
    this.heroSprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + 'hero-pain', () => {
      if (this.session.outcome === 'ongoing') {
        this.startHeroIdleAnimation()
      }
    })
  }

  private createEnemySprite(x: number, y: number): Phaser.GameObjects.Sprite | undefined {
    if (this.session.enemy.id !== 'ashen-knight') {
      return undefined
    }

    if (!this.textures.exists('enemy-ashen-knight-idle-sheet')) {
      return undefined
    }

    this.ensureAshenKnightIdleAnimation()
    const sprite = this.add.sprite(x, y + (this.compactLayout ? 10 : 12), 'enemy-ashen-knight-idle-sheet')
    const targetHeight = this.compactLayout ? 136 : 152
    sprite.setScale(targetHeight / 88)
    sprite.setFlipX(true)
    sprite.play('enemy-ashen-knight-idle')

    return sprite
  }

  private ensureAshenKnightIdleAnimation() {
    if (this.anims.exists('enemy-ashen-knight-idle')) {
      return
    }

    this.anims.create({
      key: 'enemy-ashen-knight-idle',
      frames: this.anims.generateFrameNumbers('enemy-ashen-knight-idle-sheet', {
        start: 0,
        end: 7,
      }),
      frameRate: 8,
      repeat: -1,
    })
  }

  private createCard(x: number, y: number, cardData: CardContent, canPlay: boolean, onClick: () => void): Phaser.GameObjects.GameObject[] {
    const cardWidth = this.compactLayout ? 126 : 146
    const cardHeight = this.compactLayout ? 170 : 186
    const presentation = this.getCardPresentation(cardData)
    const cardKindLabel = presentation.kind === 'basic-attack'
      ? 'Attack'
      : presentation.kind === 'basic-skill'
        ? 'Skill'
        : 'Special'

    const card = this.add.rectangle(x, y, cardWidth, cardHeight, presentation.fillColor)
      .setStrokeStyle(3, presentation.strokeColor)
      .setInteractive({ useHandCursor: true })
      .setName(cardData.id)

    const topBand = this.add.rectangle(
      x,
      y - cardHeight / 2 + (this.compactLayout ? 16 : 18),
      cardWidth - 10,
      this.compactLayout ? 22 : 24,
      presentation.strokeColor,
      0.18,
    ).setStrokeStyle(1, presentation.strokeColor)

    const typeChip = this.add.text(x - cardWidth / 2 + 9, y - cardHeight / 2 + 6, cardKindLabel, {
      fontSize: this.compactLayout ? '10px' : '11px',
      color: presentation.accentColor,
      fontStyle: 'bold',
      backgroundColor: '#ffffff',
      padding: { x: 4, y: 1 },
    }).setOrigin(0, 0)

    const costGem = this.add.rectangle(
      x + cardWidth / 2 - 16,
      y - cardHeight / 2 + 17,
      this.compactLayout ? 20 : 22,
      this.compactLayout ? 20 : 22,
      0x0f172a,
      0.94,
    ).setStrokeStyle(2, presentation.strokeColor)

    if (!canPlay) {
      card.setFillStyle(0xd1d5db)
      card.disableInteractive()
      topBand.setAlpha(0.6)
      typeChip.setAlpha(0.6)
      costGem.setAlpha(0.6)
    }

    card.on('pointerdown', () => {
      this.animatePress(card)
      onClick()
    })

    const titleText = this.add.text(x, y - 42, cardData.title, {
      fontSize: this.compactLayout ? '16px' : '18px',
      color: presentation.accentColor,
      fontStyle: 'bold',
      wordWrap: { width: cardWidth - 22 },
      align: 'center',
    }).setOrigin(0.5)

    const descriptionText = this.add.text(x, y + 17, cardData.description, {
      fontSize: this.compactLayout ? '12px' : '13px',
      color: '#334155',
      align: 'center',
      wordWrap: { width: cardWidth - 24 },
    }).setOrigin(0.5)

    const costText = this.add.text(costGem.x, costGem.y, `${cardData.cost}`, {
      fontSize: this.compactLayout ? '14px' : '15px',
      color: '#f8fafc',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    const footerText = this.add.text(x, y + cardHeight / 2 - (this.compactLayout ? 20 : 22), cardData.rarity.toUpperCase(), {
      fontSize: this.compactLayout ? '10px' : '11px',
      color: presentation.accentColor,
      fontStyle: 'bold',
    }).setOrigin(0.5)

    if (!canPlay) {
      titleText.setAlpha(0.6)
      descriptionText.setAlpha(0.6)
      costText.setAlpha(0.6)
      footerText.setAlpha(0.6)
    }

    return [card, topBand, typeChip, costGem, titleText, descriptionText, costText, footerText]
  }

  private playCardFromIndex(cardIndex: number) {
    if (this.session.outcome !== 'ongoing' || this.actionInProgress) {
      return
    }

    const card = this.session.hand[cardIndex]
    if (!card) {
      return
    }

    this.lockBattleInput()
    this.stopHeroIdleAnimation()
    const presentation = this.getCardPresentation(card)
    const previousState = this.cloneBattleState(this.session.state)
    const previousPhase = this.session.enemyPhase
    const visual = this.handCardVisuals[cardIndex]
    let cardResolutionFinished = false
    let playResolved = false

    const finishCardResolution = () => {
      if (cardResolutionFinished) {
        return
      }

      cardResolutionFinished = true
      this.updateBattleText()
      this.unlockBattleInput()

      if (this.session.outcome === 'ongoing') {
        this.startHeroIdleAnimation()
      }
    }

    const resolvePlay = () => {
      if (playResolved) {
        return
      }

      playResolved = true

      let impactResolved = false
      const resolveImpact = () => {
        if (impactResolved) {
          return
        }

        impactResolved = true

        this.session = playCardFromHand(this.session, cardIndex)
        this.playDamageFeedback(previousState, this.session.state, {
          source: 'hero',
          cardKind: presentation.kind,
        })
        this.handleBossPhaseTransition(previousPhase, this.session.enemyPhase)

        if (visual) {
          this.animateCardToDiscard(visual, presentation.kind, () => {
            finishCardResolution()
          })
          this.time.delayedCall(360, () => {
            finishCardResolution()
          })
          return
        }

        finishCardResolution()
      }

      this.playHeroCardAction(presentation.kind, resolveImpact)

      this.time.delayedCall(320, () => {
        resolveImpact()
      })
    }

    if (visual) {
      this.animateCardToCenter(visual, presentation.kind, resolvePlay)
      this.time.delayedCall(420, () => {
        resolvePlay()
      })
      return
    }

    resolvePlay()
  }

  private resolveEndTurn() {
    if (this.session.outcome !== 'ongoing' || this.actionInProgress) {
      return
    }

    this.lockBattleInput()
    this.stopHeroIdleAnimation()
    this.showTurnBanner('Enemy Turn', '#fca5a5')

    this.animateHandToDiscard(() => {
      this.session = discardHand(this.session)
      const intent = getCurrentIntent(this.session)
      const previousState = this.cloneBattleState(this.session.state)
      const previousPhase = this.session.enemyPhase

      this.playEnemyIntentAction(intent.damage, this.encounterType === 'boss', () => {
        this.session = resolveEnemyIntentAction(this.session)
        this.playDamageFeedback(previousState, this.session.state, {
          source: 'enemy',
          intentDamage: intent.damage,
        })
        this.session.outcome = checkBattleOutcome(this.session.state)

        if (this.session.outcome === 'ongoing') {
          const shouldAnimateReshuffle = this.session.drawPile.length === 0 && this.session.discardPile.length > 0
          const startNextPlayerTurn = () => {
            this.session = startNewPlayerTurn(this.session)
            this.pendingDrawAnimation = true
            this.handleBossPhaseTransition(previousPhase, this.session.enemyPhase)
            this.time.delayedCall(260, () => {
              this.showTurnBanner('Player Turn', '#fde68a')
              this.startHeroIdleAnimation()
              this.unlockBattleInput()
            })
            this.updateBattleText()
          }

          if (shouldAnimateReshuffle) {
            this.animateReshuffleToDeck(startNextPlayerTurn)
            return
          }

          startNextPlayerTurn()
          return
        }

        this.unlockBattleInput()
        this.updateBattleText()
      })
    })
  }

  private updateBattleText() {
    if (this.transitioningScene) {
      return
    }

    this.session.outcome = checkBattleOutcome(this.session.state)

    if (this.session.outcome === 'victory') {
      const isBossVictory = this.encounterType === 'boss'
      this.stopHeroIdleAnimation()
      applyBattleResult(this.session.state.heroHp, true)
      const xpResult = awardXpForCurrentEncounter()
      const nextRoute = this.getPostVictoryRoute()
      const hasLevelUp = hasPendingLevelUp()
      const rewardSummary = hasLevelUp
        ? `Level Up x${xpResult.levelsGained}`
        : nextRoute.scene === 'RewardScene'
          ? 'Card Draft'
          : nextRoute.scene === 'RelicRewardScene'
            ? 'Relic Reward'
            : 'Onward'

      this.resultText.setText(
        isBossVictory
          ? `Boss Defeated  •  XP +${xpResult.gainedXp}  •  ${rewardSummary}`
          : `Victory  •  XP +${xpResult.gainedXp}  •  ${rewardSummary}`,
      )
      this.resultText.setColor(isBossVictory ? '#fef08a' : '#86efac')
      this.showTurnBanner(
        hasLevelUp ? 'Level Up' : (isBossVictory ? 'Boss Defeated' : 'Victory'),
        hasLevelUp ? '#fde68a' : (isBossVictory ? '#fef08a' : '#86efac'),
      )

      if (isBossVictory) {
        this.cameraPunch(0.01, 220, 1.028)
        this.cameras.main.flash(260, 255, 244, 180)
      } else {
        this.cameras.main.flash(180, 140, 255, 180)
      }

      this.transitioningScene = true

      this.time.delayedCall(isBossVictory ? 760 : (hasLevelUp ? 560 : 420), () => {
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

    const burnText = this.session.enemyBurn > 0 ? ` · Burn ${this.session.enemyBurn}` : ''
    const armorText = this.session.state.enemyArmor > 0 ? ` · Armor ${this.session.state.enemyArmor}` : ''

    this.enemyHpText.setText(
      `HP ${this.session.state.enemyHp}/${this.session.enemy.maxHp}${armorText}${burnText}`,
    )
    this.heroHpText.setText(`HP ${this.session.state.heroHp}/${this.heroMaxHp}`)
    this.heroArmorText.setText(`Armor ${this.session.state.heroArmor}`)
    this.energyText.setText(`${this.session.currentEnergy}/${this.session.maxEnergy}`)
    this.emberText.setText(`${this.session.state.ember}`)
    this.emberText.setAlpha(this.session.state.ember > 0 ? 1 : 0.64)
    this.updateResourcePips()

    const emberDelta = this.session.state.ember - this.previousEmber
    if (emberDelta !== 0) {
      this.highlightEmberChange(emberDelta)
      this.previousEmber = this.session.state.ember
    }

    this.drawPileCountText.setText(`Deck ${this.session.drawPile.length}`)
    this.discardPileText.setText(`Discard ${this.session.discardPile.length}`)

    const hasDeckCards = this.session.drawPile.length > 0
    this.deckPileVisuals.forEach((pile, index) => {
      pile.setAlpha(hasDeckCards ? (0.86 + index * 0.06) : 0.34)
    })

    const hasDiscardCards = this.session.discardPile.length > 0
    this.discardPileVisuals.forEach((pile, index) => {
      pile.setAlpha(hasDiscardCards ? (0.84 + index * 0.06) : 0.3)
    })
    this.intentText.setText(`Intent · ${getCurrentIntent(this.session).label}`)

    this.enemyNameText.setText(
      this.encounterType === 'boss' && this.session.enemyPhase === 2
        ? `${this.session.enemy.name}  ·  P2`
        : this.session.enemy.name,
    )

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
    this.handCardVisuals = []

    const { width } = this.scale
    const cardSpacing = this.getHandSpacing(width)
    const startX = width / 2 - ((this.session.hand.length - 1) * cardSpacing) / 2
    const animateDraw = this.pendingDrawAnimation
    this.pendingDrawAnimation = false

    this.session.hand.forEach((cardData, index) => {
      const cardX = startX + index * cardSpacing
      const canPlay = this.session.currentEnergy >= cardData.cost && this.session.outcome === 'ongoing'

      const cardObjects = this.createCard(
        cardX,
        this.handCardY,
        cardData,
        canPlay,
        () => {
          this.playCardFromIndex(index)
        },
      )

      const cardRect = cardObjects[0] as Phaser.GameObjects.Rectangle
      const cardVisual = {
        card: cardRect,
        objects: cardObjects,
      }
      this.handCardVisuals.push(cardVisual)

      if (animateDraw) {
        this.animateDrawToHand(cardVisual, cardX, this.handCardY, index, canPlay)
      }

      this.handObjects.push(...cardObjects)
    })
  }

  private animateDrawToHand(
    visual: { card: Phaser.GameObjects.Rectangle, objects: Phaser.GameObjects.GameObject[] },
    targetX: number,
    targetY: number,
    index: number,
    canPlay: boolean,
  ) {
    const card = visual.card
    const offsetMap = visual.objects.map((obj) => {
      const go = obj as Phaser.GameObjects.GameObject & { x: number, y: number, alpha: number, setPosition: (x: number, y: number) => void }
      const offsetX = go.x - targetX
      const offsetY = go.y - targetY
      const finalX = targetX + offsetX
      const finalY = targetY + offsetY
      go.setPosition(this.deckAnchorX + offsetX * 0.45, this.deckAnchorY + offsetY * 0.45)
      go.alpha = 0
      return { go, finalX, finalY }
    })

    card.disableInteractive()

    this.tweens.add({
      targets: offsetMap.map((entry) => entry.go),
      x: (_target: unknown, _key: string, _value: number, targetIndex: number) => offsetMap[targetIndex].finalX,
      y: (_target: unknown, _key: string, _value: number, targetIndex: number) => offsetMap[targetIndex].finalY,
      alpha: 1,
      duration: 170,
      delay: index * 34,
      ease: 'Cubic.Out',
      onComplete: () => {
        if (canPlay && this.session.outcome === 'ongoing') {
          card.setInteractive({ useHandCursor: true })
        }
      },
    })
  }

  private animateCardToCenter(
    visual: { card: Phaser.GameObjects.Rectangle, objects: Phaser.GameObjects.GameObject[] },
    kind: 'basic-attack' | 'basic-skill' | 'special',
    onComplete: () => void,
  ) {
    const timing = this.getCardAnimationTiming(kind)
    const dx = this.centerActionX - visual.card.x
    const dy = this.centerActionY - visual.card.y
    visual.card.disableInteractive()

    this.tweens.add({
      targets: visual.objects as Phaser.GameObjects.GameObject[],
      x: (_target: unknown, _key: string, _value: number, targetIndex: number, _totalTargets: number) => {
        const obj = visual.objects[targetIndex] as Phaser.GameObjects.GameObject & { x: number }
        return obj.x + dx
      },
      y: (_target: unknown, _key: string, _value: number, targetIndex: number, _totalTargets: number) => {
        const obj = visual.objects[targetIndex] as Phaser.GameObjects.GameObject & { y: number }
        return obj.y + dy
      },
      scaleX: timing.centerScale,
      scaleY: timing.centerScale,
      duration: timing.centerDuration,
      ease: kind === 'special' ? 'Back.Out' : 'Cubic.Out',
      onComplete: () => {
        if (kind === 'special') {
          this.cameraPunch(0.0035, 90, 1.01)
        }
        this.time.delayedCall(timing.centerHold, onComplete)
      },
    })
  }

  private animateCardToDiscard(
    visual: { card: Phaser.GameObjects.Rectangle, objects: Phaser.GameObjects.GameObject[] },
    kind: 'basic-attack' | 'basic-skill' | 'special',
    onComplete: () => void,
  ) {
    const timing = this.getCardAnimationTiming(kind)
    const dx = this.discardAnchorX - visual.card.x
    const dy = this.discardAnchorY - visual.card.y

    this.tweens.add({
      targets: visual.objects as Phaser.GameObjects.GameObject[],
      x: (_target: unknown, _key: string, _value: number, targetIndex: number) => {
        const obj = visual.objects[targetIndex] as Phaser.GameObjects.GameObject & { x: number }
        return obj.x + dx
      },
      y: (_target: unknown, _key: string, _value: number, targetIndex: number) => {
        const obj = visual.objects[targetIndex] as Phaser.GameObjects.GameObject & { y: number }
        return obj.y + dy
      },
      alpha: 0,
      scaleX: timing.discardScale,
      scaleY: timing.discardScale,
      duration: timing.discardDuration,
      ease: kind === 'special' ? 'Back.In' : 'Quad.In',
      onComplete: () => {
        visual.objects.forEach((obj) => obj.destroy())
        onComplete()
      },
    })
  }

  private animateHandToDiscard(onComplete: () => void) {
    if (this.handCardVisuals.length === 0) {
      onComplete()
      return
    }

    const pending = this.handCardVisuals.length
    let completed = 0

    this.handCardVisuals.forEach((visual, index) => {
      const dx = this.discardAnchorX - visual.card.x
      const dy = this.discardAnchorY - visual.card.y
      this.tweens.add({
        targets: visual.objects as Phaser.GameObjects.GameObject[],
        x: (_target: unknown, _key: string, _value: number, targetIndex: number) => {
          const obj = visual.objects[targetIndex] as Phaser.GameObjects.GameObject & { x: number }
          return obj.x + dx
        },
        y: (_target: unknown, _key: string, _value: number, targetIndex: number) => {
          const obj = visual.objects[targetIndex] as Phaser.GameObjects.GameObject & { y: number }
          return obj.y + dy
        },
        alpha: 0,
        duration: 120,
        delay: index * 26,
        ease: 'Quad.In',
        onComplete: () => {
          visual.objects.forEach((obj) => obj.destroy())
          completed += 1
          if (completed >= pending) {
            this.handObjects = []
            this.handCardVisuals = []
            onComplete()
          }
        },
      })
    })
  }

  private animateReshuffleToDeck(onComplete: () => void) {
    this.lockBattleInput()
    const burstCount = this.compactLayout ? 4 : 5
    let finished = 0

    for (let i = 0; i < burstCount; i += 1) {
      const cardBack = this.createTemporaryCardBack(
        this.discardAnchorX + Phaser.Math.Between(-9, 9),
        this.discardAnchorY + Phaser.Math.Between(-7, 7),
      )

      this.tweens.add({
        targets: cardBack,
        x: this.deckAnchorX + Phaser.Math.Between(-7, 7),
        y: this.deckAnchorY + Phaser.Math.Between(-5, 5),
        alpha: 0,
        scaleX: 0.76,
        scaleY: 0.76,
        angle: Phaser.Math.Between(-14, 14),
        duration: 175,
        delay: i * 32,
        ease: 'Cubic.InOut',
        onComplete: () => {
          cardBack.forEach((obj) => obj.destroy())
          finished += 1
          if (finished >= burstCount) {
            this.cameras.main.flash(50, 160, 205, 255, false)
            onComplete()
          }
        },
      })
    }
  }

  private getCardAnimationTiming(kind: 'basic-attack' | 'basic-skill' | 'special') {
    if (kind === 'special') {
      return {
        centerDuration: 175,
        centerHold: 120,
        centerScale: 1.1,
        discardDuration: 100,
        discardScale: 0.78,
      }
    }

    if (kind === 'basic-skill') {
      return {
        centerDuration: 145,
        centerHold: 70,
        centerScale: 1.05,
        discardDuration: 115,
        discardScale: 0.87,
      }
    }

    return {
      centerDuration: 125,
      centerHold: 50,
      centerScale: 1.04,
      discardDuration: 105,
      discardScale: 0.85,
    }
  }

  private createTemporaryCardBack(x: number, y: number): Phaser.GameObjects.Rectangle[] {
    const width = this.compactLayout ? 18 : 20
    const height = this.compactLayout ? 24 : 26
    const base = this.add.rectangle(x, y, width, height, 0x1e293b, 0.95)
      .setStrokeStyle(1, 0xcbd5e1, 0.9)
      .setDepth(4)
    const stripe = this.add.rectangle(x, y, width - 6, 3, 0x93c5fd, 0.9)
      .setDepth(5)

    return [base, stripe]
  }

  private lockBattleInput() {
    this.actionInProgress = true
  }

  private unlockBattleInput() {
    this.actionInProgress = false

    if (this.transitioningScene) {
      return
    }

    this.handCardVisuals.forEach((visual, index) => {
      const cardVisual = visual.card
      if (!cardVisual || !cardVisual.active || !cardVisual.scene?.sys) {
        return
      }

      const cardData = this.session.hand[index]
      if (!cardData) {
        cardVisual.disableInteractive()
        return
      }

      const canPlay = this.session.outcome === 'ongoing' && this.session.currentEnergy >= cardData.cost
      if (canPlay) {
        cardVisual.setInteractive({ useHandCursor: true })
      } else {
        cardVisual.disableInteractive()
      }
    })
  }

  private getHandSpacing(width: number): number {
    if (this.session.hand.length <= 1) {
      return 0
    }

    const maxSpacing = this.compactLayout ? 118 : 152
    const availableWidth = Math.max(340, width - (this.compactLayout ? 440 : 560))
    return Math.min(maxSpacing, availableWidth / (this.session.hand.length - 1))
  }

  private renderRelics(x: number, startY: number) {
    if (this.relicObjects.length > 0) {
      this.relicObjects.forEach((obj) => obj.destroy())
      this.relicObjects = []
    }

    const panelWidth = this.compactLayout ? 192 : 256
    const panel = this.add.rectangle(
      x,
      startY + (this.compactLayout ? 12 : 14),
      panelWidth,
      this.compactLayout ? 24 : 28,
      0x18253a,
      0.95,
    ).setStrokeStyle(1, 0x536f95).setDepth(1)

    const title = this.add.text(x - panelWidth / 2 + 6, startY + 2, 'Passives', {
      fontSize: this.compactLayout ? '9px' : '10px',
      color: '#a9c0db',
      fontStyle: 'bold',
    }).setOrigin(0, 0).setDepth(2)

    this.relicObjects.push(panel, title)

    const relics = this.session.relics
    if (relics.length === 0) {
      const none = this.add.text(x - panelWidth / 2 + 62, startY + 2, 'None', {
        fontSize: this.compactLayout ? '9px' : '10px',
        color: '#7388a4',
      }).setOrigin(0, 0).setDepth(2)
      this.relicObjects.push(none)
      return
    }

    let chipX = x - panelWidth / 2 + (this.compactLayout ? 54 : 66)
    const chipY = startY + 2
    const maxX = x + panelWidth / 2 - 8

    relics.forEach((relic, index) => {
      if (index >= 4) {
        return
      }

      const chipLabel = relic.name.length > 10 ? `${relic.name.slice(0, 9)}…` : relic.name
      const chip = this.add.text(chipX, chipY, chipLabel, {
        fontSize: this.compactLayout ? '8px' : '9px',
        color: '#bfdbfe',
        backgroundColor: '#223854',
        padding: { x: 4, y: 1 },
      }).setOrigin(0, 0).setDepth(2)

      if (chipX + chip.width > maxX) {
        chip.destroy()
        return
      }

      chipX += chip.width + 4
      this.relicObjects.push(chip)
    })
  }

  private renderAbilities(x: number, startY: number) {
    if (this.abilityObjects.length > 0) {
      this.abilityObjects.forEach((obj) => obj.destroy())
      this.abilityObjects = []
    }

    const panelWidth = this.compactLayout ? 192 : 256
    const panel = this.add.rectangle(
      x,
      startY + (this.compactLayout ? 12 : 14),
      panelWidth,
      this.compactLayout ? 24 : 28,
      0x221f30,
      0.96,
    ).setStrokeStyle(1, 0x8c7450).setDepth(1)

    const title = this.add.text(x - panelWidth / 2 + 6, startY + 2, 'Blessings', {
      fontSize: this.compactLayout ? '9px' : '10px',
      color: '#f8dfaf',
      fontStyle: 'bold',
    }).setOrigin(0, 0).setDepth(2)

    this.abilityObjects.push(panel, title)

    const abilities = this.session.abilities
    if (abilities.length === 0) {
      const none = this.add.text(x - panelWidth / 2 + 62, startY + 2, 'None', {
        fontSize: this.compactLayout ? '9px' : '10px',
        color: '#938676',
      }).setOrigin(0, 0).setDepth(2)
      this.abilityObjects.push(none)
      return
    }

    let chipX = x - panelWidth / 2 + (this.compactLayout ? 54 : 66)
    const chipY = startY + 2
    const maxX = x + panelWidth / 2 - 8

    abilities.forEach((ability, index) => {
      if (index >= 4) {
        return
      }

      const chipLabel = ability.name.length > 10 ? `${ability.name.slice(0, 9)}…` : ability.name
      const chip = this.add.text(chipX, chipY, chipLabel, {
        fontSize: this.compactLayout ? '8px' : '9px',
        color: '#fde68a',
        backgroundColor: '#433122',
        padding: { x: 4, y: 1 },
      }).setOrigin(0, 0).setDepth(2)

      if (chipX + chip.width > maxX) {
        chip.destroy()
        return
      }

      chipX += chip.width + 4
      this.abilityObjects.push(chip)
    })
  }

  private updateResourcePips() {
    const activeEnergy = this.session.currentEnergy
    const maxEnergy = this.session.maxEnergy

    this.energyCrystalIcons.forEach((icon, index) => {
      const isAvailable = index < maxEnergy
      const isActive = index < activeEnergy
      icon.setVisible(isAvailable)
      if (!isAvailable) {
        return
      }
      if (isActive) {
        icon.clearTint()
      } else {
        icon.setTint(0x74859e)
      }
      icon.setAlpha(isActive ? 1 : 0.62)
      icon.setScale(this.compactLayout ? (isActive ? 0.58 : 0.52) : (isActive ? 0.66 : 0.6))
    })

    this.energyPips.forEach((pip, index) => {
      const isAvailable = index < maxEnergy
      const isActive = index < activeEnergy
      pip.setVisible(isAvailable)
      if (!isAvailable) {
        return
      }
      pip.setFillStyle(isActive ? 0x22d3ee : 0x164e63)
      pip.setStrokeStyle(1, isActive ? 0xbef8ff : 0x5b7699)
      pip.setAlpha(isActive ? 1 : 0.55)
    })

    const ember = this.session.state.ember
    const activeEmberPips = Math.min(this.emberPips.length, ember)
    this.emberPips.forEach((pip, index) => {
      const isActive = index < activeEmberPips
      pip.setFillStyle(isActive ? 0xfb923c : 0x7c2d12)
      pip.setStrokeStyle(1, isActive ? 0xffd089 : 0xc27745)
      pip.setAlpha(isActive ? 1 : 0.48)
    })

    if (this.emberPipLabel) {
      this.emberPipLabel.setText(ember > this.emberPips.length ? `Ember +${ember}` : 'Ember')
    }
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
    if (!this.heroSprite || !this.anims.exists('hero-idle')) {
      return
    }
    this.heroSprite.play('hero-idle', true)
  }

  private stopHeroIdleAnimation() {
    if (!this.heroSprite) {
      return
    }
    this.heroSprite.stop()
    this.heroSprite.setFrame(0)
  }

  private cloneBattleState(state: BattleState): BattleState {
    return { ...state }
  }

  private playDamageFeedback(
    previousState: BattleState,
    nextState: BattleState,
    options: {
      source: 'hero' | 'enemy'
      cardKind?: 'basic-attack' | 'basic-skill' | 'special'
      intentDamage?: number
    },
  ) {
    const enemyDamage = previousState.enemyHp - nextState.enemyHp
    const heroDamage = previousState.heroHp - nextState.heroHp
    const heroArmorGain = nextState.heroArmor - previousState.heroArmor
    const enemyArmorGain = nextState.enemyArmor - previousState.enemyArmor
    const heavyEnemyHit = enemyDamage >= 10 || options.cardKind === 'special'
    const heavyHeroHit =
      heroDamage >= 10
      || (options.intentDamage ?? 0) >= 10
      || (this.encounterType === 'boss' && options.source === 'enemy' && heroDamage >= 8)

    if (enemyDamage > 0) {
      const enemyTarget = this.enemySprite ?? this.enemyPanel
      this.flashTargetRed(enemyTarget, this.encounterType === 'boss' ? 0x450a0a : 0x7f1d1d, heavyEnemyHit)
      const enemyY = this.enemySprite ? this.enemySprite.y - 80 : this.enemyPanel.y - 96
      this.showFloatingDamageText(this.enemyPanel.x, enemyY, `-${enemyDamage}`, '#fecaca', heavyEnemyHit)
      if (heavyEnemyHit) {
        this.cameraPunch(0.006, 110, 1.014)
      }
    }

    if (heroDamage > 0) {
      const heroTarget = this.heroSprite ?? this.heroPanel
      const hasPainAnimation = Boolean(this.heroSprite && this.anims.exists('hero-pain'))
      this.flashTargetRed(heroTarget, 0x1e3a8a, hasPainAnimation ? false : heavyHeroHit)
      if (hasPainAnimation) {
        this.playHeroPainAnimation()
      }
      const y = this.heroSprite ? this.heroSprite.y - 94 : this.heroPanel.y - 74
      this.showFloatingDamageText(this.heroPanel.x, y, `-${heroDamage}`, '#fecaca', heavyHeroHit)
      if (heavyHeroHit) {
        this.cameraPunch(
          this.encounterType === 'boss' && options.source === 'enemy' ? 0.01 : 0.008,
          this.encounterType === 'boss' && options.source === 'enemy' ? 150 : 130,
          this.encounterType === 'boss' && options.source === 'enemy' ? 1.022 : 1.018,
        )
      }
    }

    if (heroArmorGain > 0) {
      this.showFloatingDamageText(this.heroPanel.x, this.heroPanel.y - 52, `+${heroArmorGain} Armor`, '#93c5fd')
    }

    if (enemyArmorGain > 0) {
      this.showFloatingDamageText(this.enemyPanel.x, this.enemyPanel.y - 70, `+${enemyArmorGain} Armor`, '#93c5fd')
    }
  }

  private flashTargetRed(
    target: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Image | Phaser.GameObjects.Sprite,
    restoreFillColor: number,
    heavy = false,
  ) {
    const flashColor = heavy ? 0xff5555 : 0xcc2222
    const flashDuration = heavy ? 145 : 120

    if (target instanceof Phaser.GameObjects.Rectangle) {
      target.setFillStyle(flashColor)
      target.setAlpha(heavy ? 0.84 : 1)
      this.time.delayedCall(flashDuration, () => {
        target.setFillStyle(restoreFillColor)
        target.setAlpha(1)
      })
      return
    }

    const baseScaleX = target.scaleX
    const baseScaleY = target.scaleY
    target.setTintFill(flashColor)
    if (heavy) {
      target.setScale(baseScaleX * 1.03, baseScaleY * 1.03)
    }
    this.time.delayedCall(flashDuration, () => {
      target.clearTint()
      if (heavy) {
        target.setScale(baseScaleX, baseScaleY)
      }
    })
  }

  private showFloatingDamageText(x: number, y: number, text: string, color: string, heavy = false) {
    const label = this.add.text(x, y, text, {
      fontSize: heavy
        ? (this.compactLayout ? '24px' : '28px')
        : (this.compactLayout ? '19px' : '22px'),
      color,
      fontStyle: 'bold',
      stroke: '#111827',
      strokeThickness: 5,
    }).setOrigin(0.5).setDepth(14)

    if (heavy) {
      label.setScale(1.06)
    }

    this.tweens.add({
      targets: label,
      y: y - (heavy ? 30 : 25),
      alpha: 0,
      duration: heavy ? 470 : 420,
      ease: 'Cubic.Out',
      onComplete: () => { label.destroy() },
    })
  }

  private getCardPresentation(card: CardContent): {
    kind: 'basic-attack' | 'basic-skill' | 'special'
    strokeColor: number
    fillColor: number
    accentColor: string
  } {
    const baseId = getCardBaseId(card.id)
    const isSpecial = card.rarity === 'rare'
      || card.cost >= 2
      || baseId === 'double-strike'
      || baseId === 'golden-horseshoe'

    if (isSpecial) {
      return {
        kind: 'special',
        strokeColor: 0xf59e0b,
        fillColor: 0xfffbeb,
        accentColor: '#b45309',
      }
    }

    if (card.effectType === 'damage') {
      return {
        kind: 'basic-attack',
        strokeColor: 0xb91c1c,
        fillColor: 0xfff1f2,
        accentColor: '#991b1b',
      }
    }

    return {
      kind: 'basic-skill',
      strokeColor: 0x1d4ed8,
      fillColor: 0xeff6ff,
      accentColor: '#1d4ed8',
    }
  }

  private playHeroCardAction(kind: 'basic-attack' | 'basic-skill' | 'special', onImpact: () => void) {
    const target = this.heroSprite ?? this.heroPanel
    const startX = target.x
    const startY = target.y

    let forwardX = startX + 16
    let forwardY = startY - 2
    let duration = 70

    if (kind === 'basic-skill') {
      forwardX = startX + 8
      forwardY = startY - 12
      duration = 80
    }

    if (kind === 'special') {
      forwardX = startX + 24
      forwardY = startY - 10
      duration = 85
      this.cameraPunch(0.004, 120, 1.012)
    }

    this.tweens.killTweensOf(target)
    this.tweens.add({
      targets: target,
      x: forwardX,
      y: forwardY,
      duration,
      ease: 'Quad.Out',
      onComplete: () => {
        onImpact()
        this.tweens.add({
          targets: target,
          x: startX,
          y: startY,
          duration: kind === 'special' ? 120 : 95,
          ease: 'Quad.In',
        })
      },
    })
  }

  private playEnemyIntentAction(intentDamage: number, isBossAttack: boolean, onImpact: () => void) {
    const heavy = intentDamage >= 10 || (isBossAttack && intentDamage >= 8)
    const target = this.enemySprite ?? this.enemyPanel
    const startX = target.x
    const startY = target.y

    if (heavy) {
      this.cameraPunch(
        isBossAttack ? 0.009 : 0.007,
        isBossAttack ? 150 : 130,
        isBossAttack ? 1.02 : 1.016,
      )
    }

    this.tweens.killTweensOf(target)
    this.tweens.add({
      targets: target,
      x: startX - (heavy ? 18 : 10),
      y: startY + (heavy ? 2 : 0),
      duration: heavy ? (isBossAttack ? 105 : 90) : 70,
      ease: 'Quad.Out',
      onComplete: () => {
        onImpact()
        this.tweens.add({
          targets: target,
          x: startX,
          y: startY,
          duration: heavy ? (isBossAttack ? 145 : 130) : 100,
          ease: 'Quad.In',
        })
      },
    })
  }

  private playBossIntroMoment() {
    this.actionInProgress = true
    this.showTurnBanner('Boss Approaches', '#fca5a5')
    this.resultText.setText(this.session.enemy.name)
    this.resultText.setColor('#fef08a')
    this.cameraPunch(0.007, 220, 1.02)
    this.flashTargetRed(this.enemySprite ?? this.enemyPanel, 0x450a0a, true)

    this.time.delayedCall(620, () => {
      this.resultText.setText('')
      this.showTurnBanner('Player Turn', '#fde68a')
      this.startHeroIdleAnimation()
      this.actionInProgress = false
    })
  }

  private handleBossPhaseTransition(previousPhase: 1 | 2, nextPhase: 1 | 2) {
    if (this.encounterType !== 'boss') {
      return
    }

    if (previousPhase === nextPhase || nextPhase !== 2) {
      return
    }

    this.showTurnBanner('Boss Phase 2', '#fca5a5')
    this.resultText.setText(`${this.session.enemy.name} is enraged!`)
    this.resultText.setColor('#fca5a5')
    this.cameraPunch(0.009, 180, 1.024)
    this.flashTargetRed(this.enemySprite ?? this.enemyPanel, 0x450a0a, true)

    this.time.delayedCall(420, () => {
      if (this.session.outcome === 'ongoing') {
        this.resultText.setText('')
      }
    })
  }

  private cameraPunch(shakeIntensity: number, duration: number, zoomPeak: number) {
    this.cameras.main.shake(duration, shakeIntensity)
    this.tweens.killTweensOf(this.cameras.main)
    this.cameras.main.setZoom(1)
    this.tweens.add({
      targets: this.cameras.main,
      zoom: zoomPeak,
      duration: Math.max(50, Math.floor(duration / 2)),
      yoyo: true,
      ease: 'Quad.Out',
      onComplete: () => {
        this.cameras.main.setZoom(1)
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

  private getPostVictoryRoute(): {
    scene: 'RewardScene' | 'RelicRewardScene' | 'MapScene'
    data?: Record<string, unknown>
    advanceFloorNow: boolean
  } {
    if (this.encounterType === 'boss') {
      const runState = getRunState()
      const selectedRoute = getRouteById(runState.selectedRouteId)

      return {
        scene: 'RewardScene',
        data: {
          encounterType: 'boss',
          mode: 'boss-signature',
          routeName: selectedRoute?.name ?? 'Unknown Route',
          bossId: selectedRoute?.bossId ?? 'unknown-boss',
          signatureCardId: selectedRoute?.signatureCardId ?? null,
          nextScene: 'RunEndScene',
        },
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
