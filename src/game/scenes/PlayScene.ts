import Phaser from 'phaser'
import { checkBattleOutcome, type BattleState } from '../battle/battleLogic'
import { type BoonContent } from '../content/boons'
import { getCardBaseId, getCardType, type CardContent } from '../content/cards'
import { getRouteById } from '../content/routes'
import { getEnemyIntentActions, type EnemyIntentAction } from '../content/enemies'
import {
  applyEnemyIntentActionStep,
  beginEnemyTurn,
  createInitialBattleSession,
  discardHand,
  getCurrentIntent,
  playCardFromHand,
  startNewPlayerTurn,
  type BattleSession,
} from '../battle/battleSession'
import {
  advanceFloorAfterEncounter,
  applyBattleResult,
  awardXpForCurrentEncounter,
  consumeCurrentBoonForBattle,
  getRunDeck,
  getRunAbilities,
  getRunRelics,
  getRunState,
  getShardTarget,
  hasPendingLevelUp,
  resolveBattleCardRewardForVictory,
  tryGrantShardForCurrentEncounter,
  type EncounterType,
} from '../battle/runState'
import { clearSave, saveRun } from '../battle/runSave'

type VictoryRewardType = 'none' | 'elite-relic' | 'boss-signature'

const CARD_VISUAL_ASSETS: Array<{ key: string, path: string }> = [
  { key: 'card-frame-attack', path: 'assets/cards/frame-attack.png' },
  { key: 'card-frame-defense', path: 'assets/cards/frame-defense.png' },
  { key: 'card-frame-utility', path: 'assets/cards/frame-utility.png' },
  { key: 'card-cost-energy', path: 'assets/cards/ui-cost/energy-variant-e-borderless-minimal.png' },
  { key: 'card-cost-ember', path: 'assets/cards/ui-cost/ember-variant-f-borderless-flame-gem.png' },
  { key: 'card-rarity-overlay-common', path: 'assets/cards/rarity-overlay-common.png' },
  { key: 'card-rarity-overlay-uncommon', path: 'assets/cards/rarity-overlay-uncommon.png' },
  { key: 'card-rarity-overlay-rare', path: 'assets/cards/rarity-overlay-rare.png' },
  { key: 'card-rarity-gems-uncommon', path: 'assets/cards/rarity-gems-uncommon.png' },
  { key: 'card-rarity-gems-rare', path: 'assets/cards/rarity-gems-rare.png' },
  { key: 'card-art-unicorn-strike', path: 'assets/cards/art-unicorn-strike.png' },
  { key: 'card-art-golden-shield', path: 'assets/cards/art-golden-shield.png' },
  { key: 'card-art-charge', path: 'assets/cards/art-charge.png' },
  { key: 'card-art-crown-diamonds', path: 'assets/cards/art-crown-diamonds.png' },
  { key: 'card-art-bg-unicorn-strike', path: 'assets/cards/art-bg-unicorn-strike.png' },
  { key: 'card-art-bg-golden-shield', path: 'assets/cards/art-bg-golden-shield.png' },
  { key: 'card-art-bg-charge', path: 'assets/cards/art-bg-charge.png' },
  { key: 'card-art-bg-crown-diamonds', path: 'assets/cards/art-bg-crown-diamonds.png' },
  { key: 'card-art-fg-unicorn-strike', path: 'assets/cards/art-fg-unicorn-strike.png' },
  { key: 'card-art-fg-golden-shield', path: 'assets/cards/art-fg-golden-shield.png' },
  { key: 'card-art-fg-charge', path: 'assets/cards/art-fg-charge.png' },
  { key: 'card-art-fg-crown-diamonds', path: 'assets/cards/art-fg-crown-diamonds.png' },
]

export class PlayScene extends Phaser.Scene {
  private readonly ENEMY_TURN_START_DELAY_MS = 320
  private readonly ENEMY_ACTION_PRE_DELAY_MS = 220
  private readonly ENEMY_ACTION_POST_DELAY_MS = 420
  private readonly ENEMY_TURN_END_DELAY_MS = 300

  private heroMaxHp = 40
  private session!: BattleSession
  private transitioningScene = false
  private encounterType: EncounterType = 'battle'
  private compactLayout = false

  private heroHpText!: Phaser.GameObjects.Text
  private heroArmorText!: Phaser.GameObjects.Text
  private heroStatusText!: Phaser.GameObjects.Text
  private heroStatsContainer!: Phaser.GameObjects.Container
  private energyText!: Phaser.GameObjects.Text
  private emberText!: Phaser.GameObjects.Text
  private drawPileCountText!: Phaser.GameObjects.Text
  private discardPileText!: Phaser.GameObjects.Text
  private enemyHpText!: Phaser.GameObjects.Text
  private enemyArmorText!: Phaser.GameObjects.Text
  private intentLabel!: Phaser.GameObjects.Text
  private intentText!: Phaser.GameObjects.Text
  private enemyNameText!: Phaser.GameObjects.Text
  private enemyStatsContainer!: Phaser.GameObjects.Container
  private resultText!: Phaser.GameObjects.Text
  private turnBannerText!: Phaser.GameObjects.Text
  private heroPanel!: Phaser.GameObjects.Rectangle
  private enemyPanel!: Phaser.GameObjects.Rectangle
  private heroSprite?: Phaser.GameObjects.Sprite
  private enemySprite?: Phaser.GameObjects.Sprite
  private previousEmber = 0
  private actionInProgress = false
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
  private isPileInspectOpen = false
  private pileInspectObjects: Phaser.GameObjects.GameObject[] = []
  private pileInspectCards: CardContent[] = []
  private pileInspectTitle = ''
  private pileInspectPage = 0
  private pileInspectPageSize = 12
  private pileInspectListText?: Phaser.GameObjects.Text
  private pileInspectPageText?: Phaser.GameObjects.Text
  private isEffectInspectOpen = false
  private effectInspectObjects: Phaser.GameObjects.GameObject[] = []
  // Active boon consumed at battle start; stored for in-battle display.
  private battleBoon: BoonContent | null = null
  // Victory screen overlay objects, cleared on transition.
  private victoryRewardPanel: Phaser.GameObjects.GameObject[] = []
  private victoryConfirmReady = false

  constructor() {
    super('PlayScene')
  }

  preload() {
    CARD_VISUAL_ASSETS.forEach((asset) => {
      if (!this.textures.exists(asset.key)) {
        this.load.image(asset.key, asset.path)
      }
    })
  }

  create() {
    const { width, height } = this.scale
    this.transitioningScene = false
    this.compactLayout = width < 900 || height < 700

    const runState = getRunState()
    this.heroMaxHp = runState.maxHeroHp
    this.encounterType = runState.currentEncounterType ?? 'battle'
    const battleBoon = consumeCurrentBoonForBattle()
    this.battleBoon = battleBoon
    this.session = createInitialBattleSession(getRunDeck(), {
      heroHp: runState.heroHp,
      maxHeroHp: runState.maxHeroHp,
      encounterType: this.encounterType,
      relics: getRunRelics(),
      abilities: getRunAbilities(),
      boon: battleBoon,
    })

    this.cameras.main.setBackgroundColor('#111827')

    const C = this.compactLayout
    const hudH = C ? 94 : 106
    const heroX = C ? Math.floor(width * 0.28) : Math.floor(width * 0.26)
    const enemyX = width - heroX
    const spriteY = C ? Math.floor(height * 0.49) : Math.floor(height * 0.48)

    // Top HUD band background.
    this.add.rectangle(width / 2, hudH / 2, width, hudH, 0x060a13, 0.84).setDepth(0)
    this.add.rectangle(width / 2, hudH - 2, width, 2, 0x2d4666).setDepth(1)

    const panelY = Math.floor(hudH / 2)
    const sidePanelW = C ? 258 : 304
    const sidePanelH = C ? 68 : 76
    const centerPanelW = C ? 270 : 318
    const centerPanelH = C ? 56 : 62

    // Visible terminology is defined here for the battle HUD.
    const effectTerms = {
      boon: 'Boon',
      passives: 'Passives',
      relics: 'Relics',
      none: 'None',
    }

    const leftPanel = this.add.rectangle(
      14 + sidePanelW / 2,
      panelY,
      sidePanelW,
      sidePanelH,
      0x101a2f,
      0.96,
    ).setStrokeStyle(2, 0x5b7699).setDepth(1)
    this.add.rectangle(leftPanel.x, leftPanel.y - sidePanelH / 2 + 8, sidePanelW - 10, 2, 0x7da2c9, 0.85).setDepth(2)

    const effectSummaryX = leftPanel.x - sidePanelW / 2 + (C ? 10 : 12)
    const battleBoonName = this.battleBoon ? this.battleBoon.name : effectTerms.none
    const battlePassiveCount = this.session.abilities.length
    // Active effect summary is rendered here.
    this.add.text(effectSummaryX, panelY - (C ? 16 : 18), 'Active Effects  •  tap', {
      fontSize: C ? '11px' : '12px',
      color: '#7ea8d4',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5).setDepth(3)
    this.add.text(effectSummaryX, panelY + (C ? 0 : 1), `${effectTerms.boon}: ${battleBoonName}`, {
      fontSize: C ? '12px' : '13px',
      color: this.battleBoon ? '#86efac' : '#94a3b8',
      fontStyle: 'bold',
      wordWrap: { width: sidePanelW - (C ? 24 : 28) },
    }).setOrigin(0, 0.5).setDepth(3)
    this.add.text(effectSummaryX, panelY + (C ? 18 : 22), `${effectTerms.passives}: ${battlePassiveCount}  •  ${effectTerms.relics}: ${this.session.relics.length}`, {
      fontSize: C ? '11px' : '12px',
      color: '#cbd5e1',
      wordWrap: { width: sidePanelW - (C ? 24 : 28) },
    }).setOrigin(0, 0.5).setDepth(3)
    const effectInspectHit = this.add.rectangle(leftPanel.x, panelY, sidePanelW - 12, sidePanelH - 10, 0x000000, 0.001)
      .setInteractive({ useHandCursor: true })
      .setDepth(4)
    effectInspectHit.on('pointerdown', () => {
      // Effect inspection panel or overlay is triggered here.
      if (this.isEffectInspectOpen || this.isPileInspectOpen) {
        return
      }

      this.showEffectInspectionPanel()
    })

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

    // Enemy section label in right panel header.
    const rightPanelLabelX = rightPanel.x - sidePanelW / 2 + (C ? 10 : 12)
    const enemyTypeLabel = this.encounterType === 'boss' ? 'Boss' : this.encounterType === 'elite' ? 'Elite' : 'Enemy'
    const enemyNameColor = this.encounterType === 'boss' ? '#e9b663' : '#f8d2d2'
    const enemyTypeColor = this.encounterType === 'boss' ? '#a88040' : '#8a6060'
    this.add.text(rightPanelLabelX, panelY - (C ? 16 : 18), enemyTypeLabel, {
      fontSize: C ? '10px' : '11px',
      color: enemyTypeColor,
      fontStyle: 'bold',
    }).setOrigin(0, 0.5).setDepth(3)
    this.add.text(rightPanelLabelX, panelY + (C ? 1 : 2), this.session.enemy.name, {
      fontSize: C ? '12px' : '13px',
      color: enemyNameColor,
      fontStyle: 'bold',
      wordWrap: { width: sidePanelW - (C ? 24 : 28) },
    }).setOrigin(0, 0.5).setDepth(3)

    // Battlefield band to anchor both combatants and avoid a floating look.
    const battleBandY = C ? Math.floor(height * 0.5) : Math.floor(height * 0.49)
    const battleBandH = C ? 182 : 198
    this.add.rectangle(width / 2, battleBandY, width * 0.9, battleBandH, 0x0f172a, 0.26)
      .setStrokeStyle(1, 0x334155, 0.35)
      .setDepth(0)
    this.add.rectangle(width / 2, battleBandY - battleBandH / 2, width * 0.9, 2, 0x334155, 0.38).setDepth(1)
    this.add.rectangle(width / 2, battleBandY + battleBandH / 2, width * 0.9, 2, 0x334155, 0.38).setDepth(1)
    const battleLineY = spriteY + (C ? 64 : 72)
    this.add.rectangle(width / 2, battleLineY, width * 0.78, 2, 0x334155, 0.7).setDepth(1)
    this.add.ellipse(heroX, battleLineY + 10, C ? 120 : 132, C ? 24 : 28, 0x000000, 0.24).setDepth(1)
    this.add.ellipse(enemyX, battleLineY + 10, C ? 126 : 142, C ? 24 : 28, 0x000000, 0.24).setDepth(1)

    // Battlefield overlays: result text + turn banner.
    this.resultText = this.add.text(width / 2, battleBandY - (C ? 94 : 110), '', {
      fontSize: C ? '20px' : '22px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#0a1020',
      strokeThickness: 5,
      align: 'center',
      wordWrap: { width: Math.floor(width * 0.52) },
    }).setOrigin(0.5, 0.5).setDepth(11)

    this.turnBannerText = this.add.text(width / 2, battleBandY - (C ? 62 : 72), '', {
      fontSize: C ? '28px' : '32px',
      color: '#fde68a',
      fontStyle: 'bold',
      stroke: '#0a1020',
      strokeThickness: 7,
    }).setOrigin(0.5).setAlpha(0).setDepth(12)

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

    const heroChipW = C ? 92 : 104
    const heroArmorChipW = C ? 68 : 76
    const heroChipH = C ? 24 : 28
    // Hero floating stat UI is created here.
    this.heroStatsContainer = this.add.container(0, 0).setDepth(7)
    const heroHpBadge = this.add.rectangle(0, 0, heroChipW, heroChipH, 0x07111f, 0.76)
      .setStrokeStyle(1, 0x7dd3fc, 0.5)
    const heroArmorBadge = this.add.rectangle(0, C ? 30 : 34, heroArmorChipW, C ? 22 : 24, 0x07111f, 0.7)
      .setStrokeStyle(1, 0xbfdbfe, 0.42)
    this.heroHpText = this.add.text(0, 0, '♥ 40/40', {
      fontSize: C ? '14px' : '16px',
      color: '#e0f2fe',
      fontStyle: 'bold',
      stroke: '#020617',
      strokeThickness: 4,
    }).setOrigin(0.5).setShadow(0, 2, '#020617', 4, true, true)
    this.heroArmorText = this.add.text(0, C ? 30 : 34, '🛡 0', {
      fontSize: C ? '12px' : '13px',
      color: '#dbeafe',
      fontStyle: 'bold',
      stroke: '#020617',
      strokeThickness: 4,
    }).setOrigin(0.5).setShadow(0, 2, '#020617', 4, true, true)
    // Hero status effect icons stay near the hero but no longer need a heavy panel.
    this.heroStatusText = this.add.text(0, C ? 56 : 62, '', {
      fontSize: C ? '11px' : '12px',
      color: '#fca5a5',
      fontStyle: 'bold',
      stroke: '#020617',
      strokeThickness: 3,
      align: 'center',
      wordWrap: { width: C ? 140 : 166 },
    }).setOrigin(0.5, 0).setShadow(0, 2, '#020617', 4, true, true)
    this.heroStatsContainer.add([heroHpBadge, heroArmorBadge, this.heroHpText, this.heroArmorText, this.heroStatusText])

    const enemyHpChipW = C ? 90 : 104
    const enemyArmorChipW = C ? 72 : 84
    const enemyChipH = C ? 24 : 28
    // Enemy floating stat UI is created here.
    this.enemyStatsContainer = this.add.container(0, 0).setDepth(7)
    this.enemyNameText = this.add.text(0, C ? -18 : -20, this.session.enemy.name, {
      fontSize: C ? '12px' : '14px',
      color: this.encounterType === 'boss' ? '#fde68a' : '#f8d2d2',
      fontStyle: 'bold',
      stroke: '#020617',
      strokeThickness: 4,
      align: 'center',
    }).setOrigin(0.5).setShadow(0, 2, '#020617', 4, true, true)
    const enemyHpBadge = this.add.rectangle(-(C ? 34 : 38), C ? 8 : 10, enemyHpChipW, enemyChipH, 0x18070b, 0.8)
      .setStrokeStyle(1, 0xfca5a5, 0.46)
    const enemyArmorBadge = this.add.rectangle(C ? 40 : 46, C ? 8 : 10, enemyArmorChipW, C ? 22 : 24, 0x111827, 0.74)
      .setStrokeStyle(1, 0xcbd5e1, 0.42)
    this.enemyHpText = this.add.text(-(C ? 34 : 38), C ? 8 : 10, `♥ ${this.session.enemy.maxHp}/${this.session.enemy.maxHp}`, {
      fontSize: C ? '12px' : '13px',
      color: '#fee2e2',
      fontStyle: 'bold',
      stroke: '#020617',
      strokeThickness: 4,
    }).setOrigin(0.5).setShadow(0, 2, '#020617', 4, true, true)
    this.enemyArmorText = this.add.text(C ? 40 : 46, C ? 8 : 10, '🛡 0', {
      fontSize: C ? '11px' : '12px',
      color: '#e2e8f0',
      fontStyle: 'bold',
      stroke: '#020617',
      strokeThickness: 4,
    }).setOrigin(0.5).setShadow(0, 2, '#020617', 4, true, true)
    this.intentLabel = this.add.text(0, C ? 34 : 38, 'NEXT', {
      fontSize: C ? '10px' : '11px',
      color: '#94a3b8',
      fontStyle: 'bold',
      stroke: '#020617',
      strokeThickness: 3,
    }).setOrigin(0.5).setShadow(0, 2, '#020617', 4, true, true)
    this.intentText = this.add.text(0, C ? 50 : 56, '', {
      fontSize: C ? '12px' : '13px',
      color: this.encounterType === 'boss' ? '#fde68a' : '#fef3c7',
      fontStyle: 'bold',
      stroke: '#020617',
      strokeThickness: 4,
      align: 'center',
      wordWrap: { width: C ? 156 : 188 },
    }).setOrigin(0.5, 0).setShadow(0, 2, '#020617', 4, true, true)
    this.enemyStatsContainer.add([
      this.enemyNameText,
      enemyHpBadge,
      enemyArmorBadge,
      this.enemyHpText,
      this.enemyArmorText,
      this.intentLabel,
      this.intentText,
    ])

    this.input.keyboard?.on('keydown-ESC', () => {
      if (this.isPileInspectOpen) {
        this.closePileInspection()
        return
      }

      if (this.isEffectInspectOpen) {
        this.closeEffectInspectionPanel()
        return
      }

      this.scene.start('MenuScene')
    })

    // Bottom command band with matching HUD framing.
    // Bottom command band — extended upward to give pile zone its own readable row above the hand zone.
    const bottomBarTopY = height - (C ? 248 : 266)
    // Battle stage boundary line — sits just above the bottom zone.
    this.add.rectangle(width / 2, bottomBarTopY - (C ? 16 : 20), width * 0.86, 2, 0x334155, 0.62).setDepth(1)
    // Bottom zone background fills from bottomBarTopY to screen bottom.
    this.add.rectangle(width / 2, height - (C ? 124 : 133), width, C ? 248 : 266, 0x0b1020, 0.84).setDepth(0)
    // Top edge of bottom zone.
    this.add.rectangle(width / 2, bottomBarTopY, width, 2, 0x2d4666).setDepth(1)

    // Hand/deck/discard spacing is controlled here.
    // Pile row sits in its own dedicated zone above the hand panel, separated by a clear gap.
    // pilesY is the vertical center of the pile row zone.
    const pilesY = height - (C ? 214 : 230)
    const pileW = C ? 96 : 110
    const pileH = C ? 54 : 60
    // Deck position is defined here — left of center in the pile row.
    const deckPileX = width / 2 - (C ? 126 : 168)
    // Discard position is defined here — right of center in the pile row.
    const discardPileX = width / 2 + (C ? 126 : 168)
    this.centerActionX = width / 2
    this.centerActionY = spriteY + (C ? 4 : 6)

    this.add.rectangle(deckPileX, pilesY, pileW + 12, pileH + 12, 0x0f172a, 0.95).setStrokeStyle(1, 0x4b617f).setDepth(1)
    this.add.rectangle(discardPileX, pilesY, pileW + 12, pileH + 12, 0x0f172a, 0.95).setStrokeStyle(1, 0x4b617f).setDepth(1)
    this.add.rectangle(deckPileX, pilesY, pileW, pileH, 0x1a2439, 0.95).setStrokeStyle(1, 0x5b7699).setDepth(2)
    this.add.rectangle(discardPileX, pilesY, pileW, pileH, 0x1a2439, 0.95).setStrokeStyle(1, 0x5b7699).setDepth(2)

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

    // Subtle hint centered between pile boxes — prompts pile inspection.
    this.add.text(width / 2, pilesY, 'tap to inspect', {
      fontSize: C ? '10px' : '11px',
      color: '#3d526a',
    }).setOrigin(0.5).setDepth(2)

    this.drawPileCountText = this.add.text(this.deckAnchorX, this.deckAnchorY + (C ? 29 : 34), '0', {
      fontSize: C ? '13px' : '14px',
      color: '#b0c8e3',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(3)

    this.discardPileText = this.add.text(this.discardAnchorX, this.discardAnchorY + (C ? 29 : 34), '0', {
      fontSize: C ? '13px' : '14px',
      color: '#b0c8e3',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(3)

    const inspectHitW = pileW + (C ? 24 : 28)
    const inspectHitH = pileH + (C ? 32 : 36)
    const deckInspectHit = this.add.rectangle(deckPileX, pilesY, inspectHitW, inspectHitH, 0x000000, 0.001)
      .setInteractive({ useHandCursor: true })
      .setDepth(4)
    const discardInspectHit = this.add.rectangle(discardPileX, pilesY, inspectHitW, inspectHitH, 0x000000, 0.001)
      .setInteractive({ useHandCursor: true })
      .setDepth(4)

    deckInspectHit.on('pointerdown', () => {
      if (this.transitioningScene || this.actionInProgress || this.isPileInspectOpen) {
        return
      }

      this.openPileInspection('deck')
    })

    discardInspectHit.on('pointerdown', () => {
      if (this.transitioningScene || this.actionInProgress || this.isPileInspectOpen) {
        return
      }

      this.openPileInspection('discard')
    })

    // End-turn button: framed, prominent, and consistent with HUD palette.
    const actionPanelY = bottomBarTopY + (C ? 56 : 62)
    this.add.rectangle(
      width - (C ? 118 : 138),
      actionPanelY,
      C ? 228 : 240,
      C ? 106 : 116,
      0x1f2937,
      0.88,
    ).setStrokeStyle(1, 0x6b7280, 0.7).setDepth(1)

    this.add.text(width - (C ? 118 : 138), actionPanelY - (C ? 44 : 48), 'Turn', {
      fontSize: C ? '11px' : '12px',
      color: '#9ca3af',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(3)

    const endTurnButton = this.add.rectangle(
      width - (C ? 118 : 138),
      actionPanelY + (C ? 8 : 10),
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

    this.handCardY = height - (C ? 86 : 96)

    this.renderHand()

    this.previousEmber = this.session.state.ember
    this.pendingDrawAnimation = true
    this.syncFloatingStatPositions()
    this.updateBattleText()

    if (this.encounterType === 'boss') {
      this.playBossIntroMoment()
    } else {
      this.showTurnBanner('Player Turn', '#fde68a')
      this.startHeroIdleAnimation()
    }
  }

  update() {
    this.syncFloatingStatPositions()
  }

  // Stat positions are synced to character positions here.
  private syncFloatingStatPositions() {
    const heroTarget = this.heroSprite ?? this.heroPanel
    const enemyTarget = this.enemySprite ?? this.enemyPanel
    const heroOffsetX = this.compactLayout ? -2 : -4
    const heroOffsetY = this.compactLayout ? -108 : -126
    const enemyOffsetX = this.compactLayout ? 10 : 12
    const enemyOffsetY = this.compactLayout ? -114 : -132

    this.heroStatsContainer.setPosition(heroTarget.x + heroOffsetX, heroTarget.y + heroOffsetY)
    this.enemyStatsContainer.setPosition(enemyTarget.x + enemyOffsetX, enemyTarget.y + enemyOffsetY)
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
    const frameType = this.getCardFrameType(cardData)
    const frameKey = `card-frame-${frameType}`
    const overlayKey = `card-rarity-overlay-${cardData.rarity}`
    const gemsKey = cardData.rarity === 'common' ? null : `card-rarity-gems-${cardData.rarity}`
    const artBgKey = this.getCardArtBackgroundKey(cardData)
    const artKey = this.getCardArtKey(cardData)

    const card = this.add.rectangle(x, y, cardWidth, cardHeight, 0xffffff, 0.001)
      .setStrokeStyle(0, 0x000000, 0)
      .setInteractive({ useHandCursor: true })
      .setName(cardData.id)

    const layeredVisuals: Phaser.GameObjects.GameObject[] = []
    const postFrameVisuals: Phaser.GameObjects.GameObject[] = []

    if (this.textures.exists(overlayKey)) {
      const rarityUnderlay = this.add.image(x, y, overlayKey).setDisplaySize(cardWidth, cardHeight)
      layeredVisuals.push(rarityUnderlay)
    } else {
      const fallbackUnderlay = this.add.rectangle(x, y, cardWidth, cardHeight, presentation.fillColor)
        .setStrokeStyle(2, presentation.strokeColor)
      layeredVisuals.push(fallbackUnderlay)
    }

    const artWindowWidth = cardWidth - 38
    const artWindowHeight = this.compactLayout ? 58 : 66
    const artWindow = this.add.rectangle(
      x,
      y - (this.compactLayout ? 12 : 14),
      artWindowWidth,
      artWindowHeight,
      0x3a4a62,
      0,
    ).setStrokeStyle(0, 0x000000, 0)
    postFrameVisuals.push(artWindow)

    const artMaskShape = this.add.graphics()
    artMaskShape.fillStyle(0xffffff, 1)
    artMaskShape.fillRect(
      artWindow.x - artWindowWidth / 2,
      artWindow.y - artWindowHeight / 2,
      artWindowWidth,
      artWindowHeight,
    )
    artMaskShape.setVisible(false)
    const artMask = artMaskShape.createGeometryMask()
    postFrameVisuals.push(artMaskShape)

    const maxW = cardWidth - 42
    const maxH = this.compactLayout ? 48 : 56

    if (artBgKey && this.textures.exists(artBgKey)) {
      const artBgImage = this.add.image(x, artWindow.y, artBgKey)
      artBgImage.setDisplaySize(artWindowWidth * 1.16, artWindowHeight * 1.16)
      artBgImage.setMask(artMask)
      artBgImage.setData('cardRole', 'art-bg-image')
      postFrameVisuals.push(artBgImage)
    }

    if (this.textures.exists(frameKey)) {
      const frameShadow = this.add.image(x + 2, y + 3, frameKey)
        .setDisplaySize(cardWidth, cardHeight)
        .setTintFill(0x000000)
        .setAlpha(0.28)
      postFrameVisuals.push(frameShadow)

      const frameImage = this.add.image(x, y, frameKey).setDisplaySize(cardWidth, cardHeight)
      postFrameVisuals.push(frameImage)
    }

    if (artKey && this.textures.exists(artKey)) {
      const artImage = this.add.image(x, artWindow.y, artKey)
      const source = this.textures.get(artKey).getSourceImage() as { width: number, height: number }
      const scale = Math.min(maxW / source.width, maxH / source.height) * (this.compactLayout ? 1.02 : 1.04)
      artImage.setDisplaySize(source.width * scale, source.height * scale)
      artImage.setData('cardRole', 'art-image')
      postFrameVisuals.push(artImage)
    }

    if (gemsKey && this.textures.exists(gemsKey)) {
      const gemsImage = this.add.image(x, y, gemsKey).setDisplaySize(cardWidth, cardHeight)
      postFrameVisuals.push(gemsImage)
    }

    const energyCost = cardData.cost
    const emberCost = cardData.emberCost ?? 0
    const hasEmberCost = emberCost > 0
    const costBadgeSize = this.compactLayout ? 36 : 38
    const gemBackingRadius = this.compactLayout ? 10 : 11
    const energyGemBacking = this.add.circle(
      x + cardWidth / 2 - 8,
      y - cardHeight / 2 + 22,
      gemBackingRadius,
      0xe2e8f0,
      0.98,
    ).setStrokeStyle(1, 0x94a3b8, 0.85)
    const energyGem = this.textures.exists('card-cost-energy')
      ? this.add.image(
        energyGemBacking.x,
        energyGemBacking.y,
        'card-cost-energy',
      ).setDisplaySize(costBadgeSize, costBadgeSize)
      : this.add.rectangle(
        energyGemBacking.x,
        energyGemBacking.y,
        costBadgeSize,
        costBadgeSize,
        0x0f172a,
        0.94,
      ).setStrokeStyle(2, presentation.strokeColor)

    const emberGemBacking = hasEmberCost
      ? this.add.circle(
        energyGemBacking.x,
        energyGemBacking.y + (this.compactLayout ? 24 : 26),
        gemBackingRadius,
        0xffedd5,
        0.98,
      ).setStrokeStyle(1, 0xfdba74, 0.9)
      : null

    const emberGem = hasEmberCost
      ? (this.textures.exists('card-cost-ember')
        ? this.add.image(
          emberGemBacking!.x,
          emberGemBacking!.y,
          'card-cost-ember',
        ).setDisplaySize(costBadgeSize, costBadgeSize)
        : this.add.circle(
          emberGemBacking!.x,
          emberGemBacking!.y,
          this.compactLayout ? 8 : 9,
          0x7c2d12,
          0.95,
        ).setStrokeStyle(2, 0xfb923c, 0.9))
      : null

    if (!canPlay) {
      card.disableInteractive()
      layeredVisuals.forEach((obj) => {
        const target = obj as Phaser.GameObjects.GameObject & { setAlpha: (value: number) => void }
        target.setAlpha(0.58)
      })
      energyGemBacking.setAlpha(0.7)
      emberGemBacking?.setAlpha(0.7)
      energyGem.setAlpha(0.6)
      emberGem?.setAlpha(0.6)
    }

    card.on('pointerdown', () => {
      onClick()
    })

    const isLongTitle = cardData.title.length >= 14
    const titleY = y - cardHeight / 2 + (this.compactLayout ? (isLongTitle ? 38 : 35) : (isLongTitle ? 40 : 38))

    const titleText = this.add.text(x, titleY, cardData.title, {
      fontSize: this.compactLayout ? (isLongTitle ? '9px' : '11px') : (isLongTitle ? '10px' : '12px'),
      color: '#f8fafc',
      fontFamily: '"Cinzel", "Georgia", "Times New Roman", serif',
      fontStyle: 'bold',
      wordWrap: { width: cardWidth - (this.compactLayout ? 30 : 26) },
      align: 'center',
    }).setOrigin(0.5)
    titleText.setShadow(0, 1, '#020617', 4, false, true)

    const bodyY = y + (this.compactLayout ? 38 : 42)
    const descriptionIsLong = cardData.description.length > 24

    const descriptionText = this.add.text(x, bodyY, cardData.description, {
      fontSize: this.compactLayout ? (descriptionIsLong ? '7px' : '8px') : (descriptionIsLong ? '8px' : '9px'),
      color: '#e2e8f0',
      align: 'center',
      wordWrap: { width: cardWidth - (this.compactLayout ? 38 : 34) },
      lineSpacing: this.compactLayout ? 1 : 2,
    }).setOrigin(0.5)
    descriptionText.setShadow(0, 1, '#1e293b', 4, false, true)

    const costText = this.add.text(energyGem.x, energyGem.y, `${energyCost}`, {
      fontSize: this.compactLayout ? '13px' : '14px',
      color: '#111827',
      fontStyle: 'bold',
    }).setOrigin(0.5)
    costText.setShadow(0, 1, '#f8fafc', 2, false, true)

    const emberText = emberGem
      ? this.add.text(emberGem.x, emberGem.y, `${emberCost}`, {
        fontSize: this.compactLayout ? '10px' : '11px',
        color: '#111827',
        fontStyle: 'bold',
      }).setOrigin(0.5)
      : null
    emberText?.setShadow(0, 1, '#fff7ed', 2, false, true)

    const footerLabel = frameType.toUpperCase()
    const footerText = this.add.text(x, y + cardHeight / 2 - (this.compactLayout ? 18 : 20), footerLabel, {
      fontSize: this.compactLayout ? '10px' : '11px',
      color: '#111827',
      fontStyle: 'bold',
    }).setOrigin(0.5)
    footerText.setShadow(0, 1, '#f8fafc', 2, false, true)

    if (!canPlay) {
      titleText.setAlpha(0.6)
      descriptionText.setAlpha(0.6)
      costText.setAlpha(0.6)
      emberText?.setAlpha(0.6)
      footerText.setAlpha(0.6)
    }

    const costObjects: Phaser.GameObjects.GameObject[] = [energyGemBacking, energyGem, costText]
    if (emberGemBacking) {
      costObjects.push(emberGemBacking)
    }
    if (emberGem) {
      costObjects.push(emberGem)
    }
    if (emberText) {
      costObjects.push(emberText)
    }

    return [
      card,
      ...layeredVisuals,
      ...postFrameVisuals,
      ...costObjects,
      titleText,
      descriptionText,
      footerText,
    ]
  }

  private playCardFromIndex(cardIndex: number) {
    if (this.session.outcome !== 'ongoing' || this.actionInProgress || this.isPileInspectOpen) {
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
    const cardTiming = this.getCardAnimationTiming(presentation.kind)
    const centerFallbackDelay = cardTiming.centerDuration + cardTiming.centerHold + 80
    const impactFallbackDelay = 180
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

        const sessionBeforePlay = this.session
        const nextSession = playCardFromHand(sessionBeforePlay, cardIndex)
        // Player-turn reshuffle trigger:
        // if deck is empty before resolving the card and hand size recovers after draw,
        // the draw came from discard->deck reshuffle and should be animated.
        const shouldAnimateReshuffleOnPlay =
          sessionBeforePlay.drawPile.length === 0
          && nextSession.hand.length >= sessionBeforePlay.hand.length

        const finalizeResolvedPlay = () => {
          this.session = nextSession
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

        if (shouldAnimateReshuffleOnPlay) {
          this.animateReshuffleToDeck(() => {
            finalizeResolvedPlay()
          })
          return
        }

        finalizeResolvedPlay()
      }

      this.playHeroCardAction(presentation.kind, resolveImpact)

      this.time.delayedCall(impactFallbackDelay, () => {
        resolveImpact()
      })
    }

    if (visual) {
      this.animateCardToCenter(visual, presentation.kind, resolvePlay)
      this.time.delayedCall(centerFallbackDelay, () => {
        resolvePlay()
      })
      return
    }

    resolvePlay()
  }

  private resolveEndTurn() {
    if (this.session.outcome !== 'ongoing' || this.actionInProgress || this.isPileInspectOpen) {
      return
    }

    this.lockBattleInput()
    this.stopHeroIdleAnimation()
    this.showTurnBanner('Enemy Turn', '#fca5a5')

    this.animateHandToDiscard(() => {
      this.session = discardHand(this.session)
      const previousPhase = this.session.enemyPhase

      // Enemy turn sequencing starts here: resolve enemy turn as a readable series of timed steps.
      this.time.delayedCall(this.ENEMY_TURN_START_DELAY_MS, () => {
        this.resolveEnemyTurnSequence(previousPhase)
      })
    })
  }

  private resolveEnemyTurnSequence(previousPhase: 1 | 2) {
    const intent = getCurrentIntent(this.session)
    const intentActions = getEnemyIntentActions(intent)

    const beforeTurnStart = this.cloneBattleState(this.session.state)
    this.session = beginEnemyTurn(this.session)
    this.playDamageFeedback(beforeTurnStart, this.session.state, {
      source: 'enemy',
      intentDamage: intent.damage,
    })
    this.updateBattleText()

    if (this.session.outcome !== 'ongoing') {
      this.finishEnemyTurnToPlayer(previousPhase)
      return
    }

    this.resolveEnemyActionStep(intentActions, 0, previousPhase)
  }

  private resolveEnemyActionStep(
    intentActions: EnemyIntentAction[],
    actionIndex: number,
    previousPhase: 1 | 2,
  ) {
    if (actionIndex >= intentActions.length) {
      this.finishEnemyTurnToPlayer(previousPhase)
      return
    }

    // Delays between enemy actions are controlled here (pre-action anticipation).
    this.time.delayedCall(this.ENEMY_ACTION_PRE_DELAY_MS, () => {
      const action = intentActions[actionIndex]
      this.playEnemyActionPresentation(action, () => {
        const beforeActionSession = this.session
        const beforeActionState = this.cloneBattleState(this.session.state)

        // One enemy action is resolved here, then HUD/feedback is refreshed immediately.
        this.session = applyEnemyIntentActionStep(this.session, action)
        this.playDamageFeedback(beforeActionState, this.session.state, {
          source: 'enemy',
          intentDamage: action.type === 'attack' ? action.value : 0,
        })
        this.showEnemyActionStatusFeedback(beforeActionSession, this.session, action)
        this.updateBattleText()

        if (this.session.outcome !== 'ongoing') {
          this.finishEnemyTurnToPlayer(previousPhase)
          return
        }

        this.time.delayedCall(this.ENEMY_ACTION_POST_DELAY_MS, () => {
          this.resolveEnemyActionStep(intentActions, actionIndex + 1, previousPhase)
        })
      })
    })
  }

  private finishEnemyTurnToPlayer(previousPhase: 1 | 2) {
    if (this.session.outcome !== 'ongoing') {
      this.unlockBattleInput()
      this.updateBattleText()
      return
    }

    // Reshuffle event is triggered here.
    // We detect reshuffle by comparing discard count before/after startNewPlayerTurn:
    // if discard shrinks, cards were moved from discard back into draw pile.
    const nextPlayerSession = startNewPlayerTurn(this.session)
    const shouldAnimateReshuffle =
      nextPlayerSession.discardPile.length < this.session.discardPile.length

    const startNextPlayerTurn = () => {
      this.session = nextPlayerSession
      this.pendingDrawAnimation = true
      this.handleBossPhaseTransition(previousPhase, this.session.enemyPhase)
      this.updateBattleText()

      // Control is returned to the player after a short end-of-enemy-turn delay.
      this.time.delayedCall(this.ENEMY_TURN_END_DELAY_MS, () => {
        if (this.session.outcome !== 'ongoing') {
          return
        }

        this.showTurnBanner('Your Turn', '#fde68a')
        this.startHeroIdleAnimation()
        this.unlockBattleInput()
      })
    }

    if (shouldAnimateReshuffle) {
      this.animateReshuffleToDeck(startNextPlayerTurn)
      return
    }

    startNextPlayerTurn()
  }

  private updateBattleText() {
    if (this.transitioningScene) {
      return
    }

    this.session.outcome = checkBattleOutcome(this.session.state)

    if (this.session.outcome === 'victory') {
      const isBossVictory = this.encounterType === 'boss'
      this.stopHeroIdleAnimation()
      // Battle rewards are calculated here — called once on first victory detection.
      applyBattleResult(this.session.state.heroHp, true)
      const xpResult = awardXpForCurrentEncounter()
      const shardReward = tryGrantShardForCurrentEncounter()
      const nextRoute = this.getPostVictoryRoute(shardReward)
      const hasLevelUp = hasPendingLevelUp()

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

      // Victory reward summary panel is shown here; transition waits for player input.
      this.showVictoryScreen(xpResult, shardReward, nextRoute, hasLevelUp, isBossVictory)

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

    const heroStatusSummary = this.getHeroStatusSummary()
    const enemyArmorSummary = this.session.enemyBurn > 0
      ? `🛡 ${this.session.state.enemyArmor}  🔥 ${this.session.enemyBurn}`
      : `🛡 ${this.session.state.enemyArmor}`

    // Floating stat values refresh after state changes here.
    this.enemyHpText.setText(`♥ ${this.session.state.enemyHp}/${this.session.enemy.maxHp}`)
    this.enemyArmorText.setText(enemyArmorSummary)
    this.enemyArmorText.setAlpha(this.session.state.enemyArmor > 0 || this.session.enemyBurn > 0 ? 1 : 0.72)
    this.heroHpText.setText(`♥ ${this.session.state.heroHp}/${this.heroMaxHp}`)
    this.heroArmorText.setText(`🛡 ${this.session.state.heroArmor}`)
    this.heroArmorText.setAlpha(this.session.state.heroArmor > 0 ? 1 : 0.72)
    this.heroStatusText.setText(heroStatusSummary)
    this.heroStatusText.setVisible(heroStatusSummary.length > 0)
    this.energyText.setText(`${this.session.currentEnergy}/${this.session.maxEnergy}`)
    this.emberText.setText(`${this.session.state.ember}`)
    this.emberText.setAlpha(this.session.state.ember > 0 ? 1 : 0.64)
    this.updateResourcePips()

    const emberDelta = this.session.state.ember - this.previousEmber
    if (emberDelta !== 0) {
      this.highlightEmberChange(emberDelta)
      this.previousEmber = this.session.state.ember
    }

    this.drawPileCountText.setText(`${this.session.drawPile.length}`)
    this.discardPileText.setText(`${this.session.discardPile.length}`)

    const hasDeckCards = this.session.drawPile.length > 0
    this.deckPileVisuals.forEach((pile, index) => {
      pile.setAlpha(hasDeckCards ? (0.86 + index * 0.06) : 0.34)
    })

    const hasDiscardCards = this.session.discardPile.length > 0
    this.discardPileVisuals.forEach((pile, index) => {
      pile.setAlpha(hasDiscardCards ? (0.84 + index * 0.06) : 0.3)
    })
    this.intentText.setText(this.getIntentIconSummary())

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

  // Enemy intent rendering: icon-first summary to improve glance readability.
  // Multi-action intents (e.g. attack + burn) are rendered side by side in one row, separated by ·
  private getIntentIconSummary(): string {
    const intent = getCurrentIntent(this.session)
    // Enemy intent UI is rendered from structured actions shared with battle resolution.
    // Status-inflicting intent parts are mapped to icons and values here:
    //   attack  → ⚔  (sword)
    //   armor   → 🛡  (shield)
    //   burn    → 🔥  (flame)
    //   poison  → ☠   (skull)
    //   reflect → 🛡↺ (reflect)
    const parts = getEnemyIntentActions(intent).map((action) => {
      if (action.type === 'attack') {
        return `⚔ ${action.value}`
      }

      if (action.type === 'armor') {
        return `🛡 ${action.value}`
      }

      if (action.type === 'burn') {
        return `🔥 ${action.value}`
      }

      if (action.type === 'poison') {
        return `☠ ${action.value}`
      }

      return `🛡↺ ${action.value}`
    })

    // Multi-action parts are joined with · so the player reads them as one combined intent.
    return parts.length > 0 ? parts.join('  ·  ') : '—'
  }

  private getHeroStatusSummary(): string {
    // Display format: icon + stack count. The stack count equals both the damage on the next tick
    // and the number of turns remaining until the effect expires (they are the same value in the
    // stack model: 2 stacks → takes 2 dmg, then 1 dmg, then expires).
    const parts: string[] = []

    if (this.session.heroBurn > 0) {
      parts.push(`🔥 ×${this.session.heroBurn}`)
    }

    if (this.session.heroPoison > 0) {
      parts.push(`☠ ×${this.session.heroPoison}`)
    }

    return parts.length > 0 ? parts.join('   ') : ''
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
      // Mixed-cost cards require both energy and Ember to be playable.
      const emberCost = cardData.emberCost ?? 0
      const canPlay =
        this.session.currentEnergy >= cardData.cost
        && this.session.state.ember >= emberCost
        && this.session.outcome === 'ongoing'

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
    const cardStartX = visual.card.x
    const cardStartY = visual.card.y
    const cardFinalX = cardStartX + dx
    const cardFinalY = cardStartY + dy
    const s = timing.centerScale
    visual.card.disableInteractive()

    const artObjects = visual.objects.filter((obj) => {
      const target = obj as Phaser.GameObjects.GameObject & { getData?: (key: string) => unknown }
      return target.getData?.('cardRole') === 'art-image'
    })
    const nonArtObjects = visual.objects.filter((obj) => !artObjects.includes(obj))
    const nonArtScaleTargets = nonArtObjects.map((obj) => {
      const target = obj as Phaser.GameObjects.GameObject & { scaleX: number, scaleY: number }
      return {
        target,
        scaleX: target.scaleX * timing.centerScale,
        scaleY: target.scaleY * timing.centerScale,
      }
    })
    const artScaleTargets = artObjects.map((obj) => {
      const target = obj as Phaser.GameObjects.GameObject & { scaleX: number, scaleY: number }
      return {
        target,
        scaleX: target.scaleX * timing.centerScale * timing.artFocusScale,
        scaleY: target.scaleY * timing.centerScale * timing.artFocusScale,
      }
    })

    this.tweens.add({
      targets: visual.objects as Phaser.GameObjects.GameObject[],
      x: (_target: unknown, _key: string, _value: number, targetIndex: number, _totalTargets: number) => {
        const obj = visual.objects[targetIndex] as Phaser.GameObjects.GameObject & { x: number }
        return cardFinalX + (obj.x - cardStartX) * s
      },
      y: (_target: unknown, _key: string, _value: number, targetIndex: number, _totalTargets: number) => {
        const obj = visual.objects[targetIndex] as Phaser.GameObjects.GameObject & { y: number }
        return cardFinalY + (obj.y - cardStartY) * s
      },
      duration: timing.centerDuration,
      ease: kind === 'special' ? 'Back.Out' : 'Cubic.Out',
    })

    this.tweens.add({
      targets: nonArtScaleTargets.map((entry) => entry.target),
      scaleX: (_target: unknown, _key: string, _value: number, targetIndex: number) => nonArtScaleTargets[targetIndex].scaleX,
      scaleY: (_target: unknown, _key: string, _value: number, targetIndex: number) => nonArtScaleTargets[targetIndex].scaleY,
      duration: timing.centerDuration,
      ease: kind === 'special' ? 'Back.Out' : 'Cubic.Out',
    })

    this.tweens.add({
      targets: artScaleTargets.map((entry) => entry.target),
      scaleX: (_target: unknown, _key: string, _value: number, targetIndex: number) => artScaleTargets[targetIndex].scaleX,
      scaleY: (_target: unknown, _key: string, _value: number, targetIndex: number) => artScaleTargets[targetIndex].scaleY,
      duration: timing.centerDuration,
      ease: 'Back.Out',
      onComplete: () => {
        if (kind === 'special') {
          this.cameraPunch(0.0035, 90, 1.01)
        }
        // Add pulse animation to art image when card reaches center
        this.animateArtPulse(artObjects)
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
    const scaleTargets = visual.objects.map((obj) => {
      const target = obj as Phaser.GameObjects.GameObject & { scaleX: number, scaleY: number }
      return {
        target,
        scaleX: target.scaleX * timing.discardScale,
        scaleY: target.scaleY * timing.discardScale,
      }
    })

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
      scaleX: (_target: unknown, _key: string, _value: number, targetIndex: number) => scaleTargets[targetIndex].scaleX,
      scaleY: (_target: unknown, _key: string, _value: number, targetIndex: number) => scaleTargets[targetIndex].scaleY,
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

  private animateArtPulse(artObjects: Phaser.GameObjects.GameObject[]) {
    // Pulse animation for card art when card reaches center
    artObjects.forEach((artObject) => {
      const art = artObject as Phaser.GameObjects.GameObject & { scaleX: number, scaleY: number }
      const originalScaleX = art.scaleX
      const originalScaleY = art.scaleY
      
      // Pulse effect: scale up then immediately back down with no gap
      this.tweens.add({
        targets: art,
        scaleX: originalScaleX * 1.16,
        scaleY: originalScaleY * 1.16,
        duration: 300,
        ease: 'Quad.Out',
        yoyo: true,
        hold: 0,
      })
    })
  }

  private animateReshuffleToDeck(onComplete: () => void) {
    // Reshuffle animation starts here.
    this.lockBattleInput()
    const C = this.compactLayout
    const burstCount = C ? 5 : 6
    // Reshuffle timing is controlled here.
    // Total visible duration: (burstCount-1)*cardDelay + liftDuration + funnelDuration + labelFade ≈ 750-900ms.
    const liftDuration = C ? 240 : 260
    const funnelDuration = C ? 300 : 330
    const cardDelay = C ? 36 : 40
    let finished = 0

    // Reshuffle visual positioning is controlled here.
    // Center is raised noticeably above the deck/discard row so the effect reads as a mid-screen event.
    const reshuffleCenterX = (this.discardAnchorX + this.deckAnchorX) / 2
    const reshuffleCenterY = this.deckAnchorY - (C ? 90 : 108)
    const labelY = reshuffleCenterY - (C ? 40 : 46)

    const label = this.add.text(reshuffleCenterX, labelY, 'Reshuffle', {
      fontSize: C ? '15px' : '17px',
      color: '#c7e0ff',
      fontStyle: 'bold',
      stroke: '#0a1120',
      strokeThickness: 5,
    }).setOrigin(0.5).setDepth(13).setAlpha(0)

    this.tweens.add({
      targets: label,
      alpha: 1,
      y: labelY - 5,
      duration: 180,
      ease: 'Quad.Out',
    })

    for (let i = 0; i < burstCount; i += 1) {
      // Reshuffle animation visuals are created here — each card back is a Container for proper child layout.
      const container = this.createReshuffleCardContainer(
        this.discardAnchorX + Phaser.Math.Between(-10, 10),
        this.discardAnchorY + Phaser.Math.Between(-8, 8),
      )

      this.tweens.add({
        targets: container,
        x: reshuffleCenterX + Phaser.Math.Between(-36, 36),
        y: reshuffleCenterY + Phaser.Math.Between(-14, 12),
        angle: Phaser.Math.Between(-18, 18),
        duration: liftDuration,
        delay: i * cardDelay,
        ease: 'Sine.Out',
        onComplete: () => {
          this.tweens.add({
            targets: container,
            x: this.deckAnchorX + Phaser.Math.Between(-8, 8),
            y: this.deckAnchorY + Phaser.Math.Between(-6, 6),
            alpha: 0,
            scaleX: 0.78,
            scaleY: 0.78,
            angle: Phaser.Math.Between(-12, 12),
            duration: funnelDuration,
            ease: 'Cubic.InOut',
            onComplete: () => {
              container.destroy()
              finished += 1
              if (finished >= burstCount) {
                // All cards have funneled into the deck; fade label and fire callback.
                this.tweens.add({
                  targets: label,
                  alpha: 0,
                  y: label.y - 7,
                  duration: 140,
                  ease: 'Quad.In',
                  onComplete: () => {
                    label.destroy()
                    this.cameras.main.flash(100, 150, 205, 255, false)
                    onComplete()
                  },
                })
              }
            },
          })
        },
      })
    }
  }

  private getCardAnimationTiming(kind: 'basic-attack' | 'basic-skill' | 'special') {
    if (kind === 'special') {
      return {
        centerDuration: 320,
        centerHold: 1050,
        centerScale: 1.25,
        artFocusScale: 1.0,
        discardDuration: 100,
        discardScale: 0.78,
      }
    }

    if (kind === 'basic-skill') {
      return {
        centerDuration: 285,
        centerHold: 950,
        centerScale: 1.22,
        artFocusScale: 1.0,
        discardDuration: 115,
        discardScale: 0.87,
      }
    }

    return {
      centerDuration: 260,
      centerHold: 850,
      centerScale: 1.2,
      artFocusScale: 1.0,
      discardDuration: 105,
      discardScale: 0.85,
    }
  }

  // Reshuffle card visual size and appearance is defined here.
  // Uses a Container so child elements maintain relative offsets during tween.
  private createReshuffleCardContainer(x: number, y: number): Phaser.GameObjects.Container {
    const C = this.compactLayout
    const w = C ? 40 : 48
    const h = C ? 54 : 64
    // Base card back
    const base = this.add.rectangle(0, 0, w, h, 0x18294a, 0.97)
      .setStrokeStyle(2, 0x7eb8d8, 0.94)
    // Inner inset border
    const inner = this.add.rectangle(0, 0, w - 8, h - 8, 0x1e3457, 0.0)
      .setStrokeStyle(1, 0x4d87b5, 0.60)
    // Horizontal stripe across mid-card
    const stripe = this.add.rectangle(0, 0, w - 12, C ? 4 : 5, 0x4a8ec4, 0.82)
    // Small corner accent
    const accent = this.add.rectangle(0, C ? -14 : -18, C ? 8 : 10, C ? 8 : 10, 0x3469a6, 0.68)
    return this.add.container(x, y, [base, inner, stripe, accent]).setDepth(12)
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

      const emberCost = cardData.emberCost ?? 0
      // Mixed-cost cards require both energy and Ember to be playable.
      const canPlay =
        this.session.outcome === 'ongoing'
        && this.session.currentEnergy >= cardData.cost
        && this.session.state.ember >= emberCost
      if (canPlay) {
        cardVisual.setInteractive({ useHandCursor: true })
        visual.objects.forEach((obj) => {
          const target = obj as Phaser.GameObjects.GameObject & { setAlpha?: (value: number) => void }
          target.setAlpha?.(1)
        })
      } else {
        cardVisual.disableInteractive()
        visual.objects.forEach((obj) => {
          const target = obj as Phaser.GameObjects.GameObject & { setAlpha?: (value: number) => void }
          target.setAlpha?.(0.6)
        })
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

  private showEffectInspectionPanel() {
    const { width, height } = this.scale
    const cx = width / 2
    const cy = height / 2
    const panelW = this.compactLayout ? 540 : 600
    const panelH = this.compactLayout ? 340 : 380
    const passiveLines = this.session.abilities.length > 0
      ? this.session.abilities.map((ability, index) => `${index + 1}. ${ability.name} - ${ability.description}`)
      : ['None']
    const relicLines = this.session.relics.length > 0
      ? this.session.relics.map((relic, index) => `${index + 1}. ${relic.name} - ${relic.description}`)
      : ['None']
    const lines = [
      `Boon: ${this.battleBoon ? this.battleBoon.name : 'None'}`,
      this.battleBoon ? this.battleBoon.description : 'No next-battle boon is active in this combat.',
      '',
      `Passives (${this.session.abilities.length})`,
      ...passiveLines,
      '',
      `Relics (${this.session.relics.length})`,
      ...relicLines,
    ]

    const overlay = this.add.rectangle(cx, cy, width, height, 0x000000, 0.56)
      .setInteractive()
      .setDepth(60)
    const panel = this.add.rectangle(cx, cy, panelW, panelH, 0x0b1220, 0.97)
      .setStrokeStyle(2, 0x3b82f6)
      .setDepth(61)
    const titleText = this.add.text(cx, cy - panelH / 2 + 34, 'Active Effects', {
      fontSize: this.compactLayout ? '22px' : '24px',
      color: '#dbeafe',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(62)
    const subtitleText = this.add.text(cx, cy - panelH / 2 + 64, 'Boon = temporary next-battle effect • Passives = run-long hero effects', {
      fontSize: this.compactLayout ? '12px' : '13px',
      color: '#93c5fd',
      align: 'center',
      wordWrap: { width: panelW - 44 },
    }).setOrigin(0.5).setDepth(62)
    const bodyText = this.add.text(cx - panelW / 2 + 24, cy - panelH / 2 + 96, lines.join('\n'), {
      fontSize: this.compactLayout ? '12px' : '13px',
      color: '#e2e8f0',
      lineSpacing: 5,
      wordWrap: { width: panelW - 48 },
    }).setOrigin(0, 0).setDepth(62)
    const hintText = this.add.text(cx, cy + panelH / 2 - 24, 'Click or press Space to close', {
      fontSize: this.compactLayout ? '11px' : '12px',
      color: '#64748b',
    }).setOrigin(0.5).setDepth(62)

    this.isEffectInspectOpen = true
    this.effectInspectObjects = [overlay, panel, titleText, subtitleText, bodyText, hintText]

    overlay.on('pointerdown', () => {
      this.closeEffectInspectionPanel()
    })
    this.input.keyboard?.once('keydown-SPACE', () => {
      this.closeEffectInspectionPanel()
    })
  }

  private closeEffectInspectionPanel() {
    if (!this.isEffectInspectOpen) {
      return
    }

    this.effectInspectObjects.forEach((obj) => obj.destroy())
    this.effectInspectObjects = []
    this.isEffectInspectOpen = false
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

  private getCardFrameType(card: CardContent): 'attack' | 'defense' | 'utility' {
    return getCardType(card)
  }

  private getCardArtBackgroundKey(card: CardContent): string | null {
    const baseId = getCardBaseId(card.id)
    const artKey = `card-art-bg-${baseId}`
    return this.textures.exists(artKey) ? artKey : null
  }

  private getCardArtKey(card: CardContent): string | null {
    const baseId = getCardBaseId(card.id)
    const foregroundArtKey = `card-art-fg-${baseId}`
    if (this.textures.exists(foregroundArtKey)) {
      return foregroundArtKey
    }

    const fallbackArtKey = `card-art-${baseId}`
    return this.textures.exists(fallbackArtKey) ? fallbackArtKey : null
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

  private playEnemyActionPresentation(action: EnemyIntentAction, onImpact: () => void) {
    if (action.type === 'attack') {
      this.playEnemyIntentAction(action.value, this.encounterType === 'boss', onImpact)
      return
    }

    const target = this.enemySprite ?? this.enemyPanel
    const startX = target.x
    const startY = target.y
    const nudgeY = action.type === 'armor' || action.type === 'reflect' ? -6 : -3

    this.tweens.killTweensOf(target)
    this.tweens.add({
      targets: target,
      x: startX - 8,
      y: startY + nudgeY,
      duration: 72,
      ease: 'Quad.Out',
      onComplete: () => {
        onImpact()
        this.tweens.add({
          targets: target,
          x: startX,
          y: startY,
          duration: 94,
          ease: 'Quad.In',
        })
      },
    })
  }

  private showEnemyActionStatusFeedback(
    previousSession: BattleSession,
    nextSession: BattleSession,
    action: EnemyIntentAction,
  ) {
    if (action.type === 'burn') {
      const burnDelta = nextSession.heroBurn - previousSession.heroBurn
      if (burnDelta > 0) {
        this.showFloatingDamageText(this.heroPanel.x, this.heroPanel.y - 64, `+${burnDelta} Burn`, '#fb7185')
      }
      return
    }

    if (action.type === 'poison') {
      const poisonDelta = nextSession.heroPoison - previousSession.heroPoison
      if (poisonDelta > 0) {
        this.showFloatingDamageText(this.heroPanel.x, this.heroPanel.y - 48, `+${poisonDelta} Poison`, '#a78bfa')
      }
      return
    }

    if (action.type === 'reflect' && nextSession.enemyReflect > 0) {
      this.showFloatingDamageText(this.enemyPanel.x, this.enemyPanel.y - 56, `Reflect ${nextSession.enemyReflect}`, '#c4b5fd')
    }
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

  private openPileInspection(type: 'deck' | 'discard') {
    this.closePileInspection()

    const cards = type === 'deck'
      ? [...this.session.drawPile]
      : [...this.session.discardPile].reverse()
    this.pileInspectCards = cards
    this.pileInspectTitle = type === 'deck' ? 'Draw Pile' : 'Discard Pile'
    this.pileInspectPage = 0
    this.isPileInspectOpen = true

    const { width, height } = this.scale
    const C = this.compactLayout
    const panelW = C ? Math.min(560, width - 44) : Math.min(650, width - 120)
    const panelH = C ? Math.min(420, height - 84) : Math.min(500, height - 120)
    const panelX = width / 2
    const panelY = height / 2
    const depth = 60

    const scrim = this.add.rectangle(panelX, panelY, width, height, 0x020617, 0.72)
      .setDepth(depth)
      .setInteractive()
    scrim.on('pointerdown', () => {
      this.closePileInspection()
    })

    const panel = this.add.rectangle(panelX, panelY, panelW, panelH, 0x0f172a, 0.98)
      .setStrokeStyle(2, 0x64748b, 0.9)
      .setDepth(depth + 1)

    const title = this.add.text(panelX - panelW / 2 + 20, panelY - panelH / 2 + 14, this.pileInspectTitle, {
      fontSize: C ? '20px' : '22px',
      color: '#e2e8f0',
      fontStyle: 'bold',
    }).setOrigin(0, 0).setDepth(depth + 2)

    const subtitle = this.add.text(panelX - panelW / 2 + 20, panelY - panelH / 2 + 44, `${cards.length} cards`, {
      fontSize: C ? '12px' : '13px',
      color: '#94a3b8',
      fontStyle: 'bold',
    }).setOrigin(0, 0).setDepth(depth + 2)

    const closeButton = this.add.text(panelX + panelW / 2 - 18, panelY - panelH / 2 + 12, 'X', {
      fontSize: C ? '18px' : '20px',
      color: '#e2e8f0',
      fontStyle: 'bold',
      backgroundColor: '#1e293b',
      padding: { x: 8, y: 2 },
    }).setOrigin(1, 0).setDepth(depth + 3).setInteractive({ useHandCursor: true })
    closeButton.on('pointerdown', () => {
      this.closePileInspection()
    })

    const listPanelY = panelY + 8
    const listPanelH = panelH - 120
    const listPanel = this.add.rectangle(panelX, listPanelY, panelW - 28, listPanelH, 0x111b30, 0.95)
      .setStrokeStyle(1, 0x334155, 0.85)
      .setDepth(depth + 1)

    this.pileInspectListText = this.add.text(panelX - panelW / 2 + 26, listPanelY - listPanelH / 2 + 12, '', {
      fontSize: C ? '12px' : '13px',
      color: '#dbeafe',
      lineSpacing: 4,
      wordWrap: { width: panelW - 60 },
    }).setOrigin(0, 0).setDepth(depth + 2)

    const prevButton = this.add.text(panelX - 60, panelY + panelH / 2 - 42, 'Prev', {
      fontSize: C ? '12px' : '13px',
      color: '#dbeafe',
      backgroundColor: '#1e293b',
      padding: { x: 8, y: 3 },
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(depth + 3).setInteractive({ useHandCursor: true })

    const nextButton = this.add.text(panelX + 60, panelY + panelH / 2 - 42, 'Next', {
      fontSize: C ? '12px' : '13px',
      color: '#dbeafe',
      backgroundColor: '#1e293b',
      padding: { x: 8, y: 3 },
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(depth + 3).setInteractive({ useHandCursor: true })

    this.pileInspectPageText = this.add.text(panelX, panelY + panelH / 2 - 42, '', {
      fontSize: C ? '12px' : '13px',
      color: '#94a3b8',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(depth + 2)

    prevButton.on('pointerdown', () => {
      if (this.pileInspectPage <= 0) {
        return
      }
      this.pileInspectPage -= 1
      this.refreshPileInspectionPage()
    })

    nextButton.on('pointerdown', () => {
      const maxPage = Math.max(0, Math.ceil(this.pileInspectCards.length / this.pileInspectPageSize) - 1)
      if (this.pileInspectPage >= maxPage) {
        return
      }
      this.pileInspectPage += 1
      this.refreshPileInspectionPage()
    })

    this.pileInspectObjects.push(
      scrim,
      panel,
      title,
      subtitle,
      closeButton,
      listPanel,
      this.pileInspectListText,
      prevButton,
      nextButton,
      this.pileInspectPageText,
    )

    this.refreshPileInspectionPage()
  }

  private refreshPileInspectionPage() {
    if (!this.pileInspectListText || !this.pileInspectPageText) {
      return
    }

    const totalCards = this.pileInspectCards.length
    if (totalCards === 0) {
      this.pileInspectListText.setText('No cards in this pile.')
      this.pileInspectPageText.setText('Page 1/1')
      return
    }

    const maxPage = Math.max(0, Math.ceil(totalCards / this.pileInspectPageSize) - 1)
    this.pileInspectPage = Phaser.Math.Clamp(this.pileInspectPage, 0, maxPage)
    const start = this.pileInspectPage * this.pileInspectPageSize
    const end = Math.min(totalCards, start + this.pileInspectPageSize)

    const lines = this.pileInspectCards.slice(start, end).map((card, index) => {
      const absoluteIndex = start + index + 1
      const rarity = card.rarity.charAt(0).toUpperCase()
      return `${absoluteIndex}. ${card.title}  [${card.cost}]  ${rarity}`
    })

    this.pileInspectListText.setText(lines.join('\n'))
    this.pileInspectPageText.setText(`Page ${this.pileInspectPage + 1}/${maxPage + 1}`)
  }

  private closePileInspection() {
    this.isPileInspectOpen = false
    this.pileInspectCards = []
    this.pileInspectTitle = ''
    this.pileInspectPage = 0
    this.pileInspectListText = undefined
    this.pileInspectPageText = undefined

    if (this.pileInspectObjects.length === 0) {
      return
    }

    this.pileInspectObjects.forEach((obj) => {
      obj.destroy()
    })
    this.pileInspectObjects = []
  }

  // Renders the on-screen victory reward summary and waits for player confirmation.
  private showVictoryScreen(
    xpResult: { gainedXp: number; levelsGained: number },
    shardReward: { granted: boolean; justCompleted: boolean; shardCount: number; isForgeAvailable: boolean },
    nextRoute: { scene: string; data?: Record<string, unknown>; advanceFloorNow: boolean },
    hasLevelUp: boolean,
    isBossVictory: boolean,
  ) {
    const { width, height } = this.scale
    const C = this.compactLayout

    // Destroy any leftover panel objects from a previous call.
    this.victoryRewardPanel.forEach((o) => o.destroy())
    this.victoryRewardPanel = []
    this.victoryConfirmReady = false

    // Panel geometry.
    const panelW = C ? 420 : 500
    const panelH = C ? 210 : 240
    const cx = width / 2
    const cy = height / 2

    const backdrop = this.add.rectangle(cx, cy, panelW, panelH, 0x060d1a, 0.95)
      .setStrokeStyle(2, 0x3b5c82)
      .setDepth(50)
    this.victoryRewardPanel.push(backdrop)

    // Victory headline.
    const headlineColor = hasLevelUp ? '#fde68a' : (isBossVictory ? '#fef08a' : '#86efac')
    const headlineText = hasLevelUp ? 'Level Up!' : (isBossVictory ? 'Boss Defeated' : 'Victory')
    const headline = this.add.text(cx, cy - (C ? 78 : 88), headlineText, {
      fontSize: C ? '26px' : '30px',
      color: headlineColor,
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(51)
    this.victoryRewardPanel.push(headline)

    // Horizontal rule below headline.
    const rule = this.add.rectangle(cx, cy - (C ? 55 : 62), panelW - 40, 1, 0x3b5c82, 0.8).setDepth(51)
    this.victoryRewardPanel.push(rule)

    // Reward lines — each on its own row.
    const lineSpacing = C ? 28 : 32
    const lineStartY = cy - (C ? 36 : 40)
    const lineFontSize = C ? '16px' : '18px'
    const rewardLines: Array<{ label: string; color: string }> = []

    // XP gain line.
    rewardLines.push({ label: `XP  +${xpResult.gainedXp}`, color: '#a5b4fc' })

    // Shard / Forge line.
    if (shardReward.granted) {
      if (shardReward.isForgeAvailable) {
        rewardLines.push({ label: `Shard  ${shardReward.shardCount}/${getShardTarget()}  •  Forge Ready`, color: '#fef3c7' })
        if (shardReward.justCompleted) {
          rewardLines.push({ label: 'Shard payoff unlocked  →  Powerful Card Reward', color: '#fde68a' })
        }
      } else {
        rewardLines.push({ label: `Shard  +1  (${shardReward.shardCount}/${getShardTarget()})`, color: '#93c5fd' })
      }
    }

    // Level-up or next reward hint.
    if (hasLevelUp) {
      const times = xpResult.levelsGained > 1 ? ` ×${xpResult.levelsGained}` : ''
      rewardLines.push({ label: `Level up${times}  →  Choose passive`, color: '#fde68a' })
    } else {
      const nextLabel =
        nextRoute.scene === 'RewardScene'
          ? '→  Card Draft'
          : nextRoute.scene === 'RelicRewardScene'
            ? '→  Relic Reward'
            : '→  Onward'
      rewardLines.push({ label: nextLabel, color: '#cbd5e1' })
    }

    rewardLines.forEach((line, i) => {
      const lineObj = this.add.text(cx, lineStartY + i * lineSpacing, line.label, {
        fontSize: lineFontSize,
        color: line.color,
      }).setOrigin(0.5).setDepth(51)
      this.victoryRewardPanel.push(lineObj)
    })

    // "Continue" prompt — rendered but invisible; revealed after minimum lock.
    const promptY = cy + (C ? 82 : 94)
    const promptObj = this.add.text(cx, promptY, 'Click  /  Space  to continue', {
      fontSize: C ? '13px' : '14px',
      color: '#475569',
    }).setOrigin(0.5).setDepth(51).setAlpha(0)
    this.victoryRewardPanel.push(promptObj)

    // After the minimum readable delay, enable player confirmation and reveal prompt.
    // Continue input becomes enabled after minimum readable delay (1200ms).
    this.time.delayedCall(1200, () => {
      if (this.transitioningScene) {
        return
      }
      this.victoryConfirmReady = true
      this.tweens.add({ targets: promptObj, alpha: 1, duration: 280 })

      const onConfirm = () => {
        if (!this.victoryConfirmReady) {
          return
        }
        this.doVictoryTransition(nextRoute, hasLevelUp)
      }

      // Transition to the next scene when player confirms via pointer or keyboard.
      this.input.once('pointerdown', onConfirm)
      this.input.keyboard?.once('keydown-SPACE', onConfirm)
    })
  }

  // Applies floor advance, saves run, and transitions to the next scene after victory.
  private doVictoryTransition(
    nextRoute: { scene: string; data?: Record<string, unknown>; advanceFloorNow: boolean },
    hasLevelUp: boolean,
  ) {
    if (this.transitioningScene) {
      return
    }
    this.transitioningScene = true

    // Clean up the reward panel before leaving.
    this.victoryRewardPanel.forEach((o) => o.destroy())
    this.victoryRewardPanel = []

    if (nextRoute.advanceFloorNow) {
      advanceFloorAfterEncounter()
    }

    saveRun()

    // Transition to next scene occurs here after player confirmation.
    if (hasLevelUp || hasPendingLevelUp()) {
      this.scene.start('LevelUpScene', {
        nextScene: nextRoute.scene,
        nextData: nextRoute.data,
      })
      return
    }

    this.scene.start(nextRoute.scene, nextRoute.data)
  }

  private getPostVictoryRoute(shardReward: {
    granted: boolean
    justCompleted: boolean
    shardCount: number
    isForgeAvailable: boolean
  }): {
    scene: 'RewardScene' | 'RelicRewardScene' | 'MapScene'
    data?: Record<string, unknown>
    advanceFloorNow: boolean
  } {
    // Reward type is determined by encounter type.
    const rewardType = this.getVictoryRewardType(this.encounterType)

    if (shardReward.justCompleted) {
      // Powerful card reward presentation is triggered here for the 3/3 shard payoff.
      const nextSceneAfterShardReward = rewardType === 'elite-relic' ? 'RelicRewardScene' : 'MapScene'
      return {
        scene: 'RewardScene',
        data: {
          encounterType: 'boss',
          mode: 'shard-forge',
          nextScene: nextSceneAfterShardReward,
          advanceFloorOnSelect: rewardType !== 'elite-relic',
        },
        advanceFloorNow: false,
      }
    }

    if (rewardType === 'boss-signature') {
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

    if (rewardType === 'none') {
      // Milestone cadence: only selected normal-battle wins grant permanent card drafts.
      const shouldGrantMilestoneDraft = resolveBattleCardRewardForVictory()

      if (shouldGrantMilestoneDraft) {
        return {
          scene: 'RewardScene',
          data: { encounterType: 'battle', advanceFloorOnSelect: true },
          advanceFloorNow: false,
        }
      }

      return {
        scene: 'MapScene',
        advanceFloorNow: true,
      }
    }

    return {
      scene: 'RelicRewardScene',
      data: { nextScene: 'MapScene' },
      advanceFloorNow: false,
    }
  }

  private getVictoryRewardType(encounterType: EncounterType): VictoryRewardType {
    if (encounterType === 'boss') {
      return 'boss-signature'
    }

    if (encounterType === 'elite') {
      return 'elite-relic'
    }

    return 'none'
  }

  private showRewardToast(title: string, detail: string, color = '#93c5fd') {
    const { width } = this.scale
    const y = this.compactLayout ? 118 : 126
    const bg = this.add.rectangle(width / 2, y, 460, 54, 0x0b1220, 0.9)
      .setStrokeStyle(2, 0x334155)
      .setDepth(40)
    const titleText = this.add.text(width / 2, y - 10, title, {
      fontSize: this.compactLayout ? '16px' : '17px',
      color,
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(41)
    const detailText = this.add.text(width / 2, y + 10, detail, {
      fontSize: this.compactLayout ? '12px' : '13px',
      color: '#e2e8f0',
      align: 'center',
    }).setOrigin(0.5).setDepth(41)

    this.tweens.add({
      targets: [bg, titleText, detailText],
      alpha: 0,
      delay: 1250,
      duration: 220,
      onComplete: () => {
        bg.destroy()
        titleText.destroy()
        detailText.destroy()
      },
    })
  }
}
