import Phaser from 'phaser'
import {
  advanceFloorAfterEncounter,
  getAvailableEncountersForCurrentFloor,
  getNormalBattleRewardPreview,
  getRunState,
  getXpForNextLevel,
  resolveRestEncounter,
  setSelectedRouteId,
  setCurrentEncounterType,
  type EncounterType,
} from '../battle/runState'
import { saveRun } from '../battle/runSave'
import { getRouteById, ROUTE_SELECT_ROUTES, type RouteContent } from '../content/routes'

const ROUTE_PATH_LABELS = ['Battle', 'Battle / Utility', 'Elite', 'Boss']

export class MapScene extends Phaser.Scene {
  constructor() {
    super('MapScene')
  }

  create() {
    const { width, height } = this.scale
    const compactLayout = width < 900 || height < 700
    const run = getRunState()
    const nextLevelXp = getXpForNextLevel()

    if (run.isRunComplete) {
      this.scene.start('RunEndScene')
      return
    }

    saveRun()

    this.cameras.main.setBackgroundColor('#0f172a')

    const selectedRoute = getRouteById(run.selectedRouteId)

    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.start('MenuScene')
    })

    if (!selectedRoute) {
      this.add.rectangle(width / 2, height / 2, width, height, 0x060a13, 0.35)
      this.add.rectangle(width / 2, 58, compactLayout ? width * 0.9 : 900, compactLayout ? 84 : 94, 0x111a2d, 0.86)
        .setStrokeStyle(2, 0x4c5f7c, 0.92)

      this.add.text(width / 2, compactLayout ? 44 : 46, 'Choose A Domain', {
        fontSize: compactLayout ? '34px' : '40px',
        color: '#f8fafc',
        fontStyle: 'bold',
      }).setOrigin(0.5)

      this.add.text(width / 2, compactLayout ? 72 : 76, 'Select the next hunt and face its ruling boss', {
        fontSize: compactLayout ? '14px' : '16px',
        color: '#cbd5e1',
      }).setOrigin(0.5)

      this.add.text(width / 2, compactLayout ? 104 : 112, 'Playable domains glow. Sealed domains are visible but inaccessible.', {
        fontSize: compactLayout ? '13px' : '14px',
        color: '#94a3b8',
      }).setOrigin(0.5)

      this.renderRouteSelect(compactLayout)

      const runInfoText = `HP ${run.heroHp}/${run.maxHeroHp}  |  L${run.heroLevel} ${nextLevelXp === null ? `(XP ${run.heroXp})` : `(XP ${run.heroXp}/${nextLevelXp})`}  |  Deck ${run.currentDeck.length}  |  Relics ${run.currentRelics.length}  |  Blessings ${run.currentAbilities.length}`
      this.add.rectangle(width / 2, height - 58, compactLayout ? width * 0.94 : 960, 52, 0x0b1220, 0.78)
        .setStrokeStyle(1, 0x334155, 0.8)
      this.add.text(width / 2, height - 62, runInfoText, {
        fontSize: compactLayout ? '13px' : '14px',
        color: '#93c5fd',
      }).setOrigin(0.5)
      this.add.text(width / 2, height - 40, getNormalBattleRewardPreview(), {
        fontSize: compactLayout ? '12px' : '13px',
        color: '#fde68a',
      }).setOrigin(0.5)

      return
    }

    this.add.text(width / 2, 44, 'Route Select', {
      fontSize: '34px',
      color: '#ffffff',
    }).setOrigin(0.5)

    this.add.text(width / 2, 82, `Choose your next domain hunt  |  Floor ${run.currentFloor} / ${run.maxFloors}`, {
      fontSize: '20px',
      color: '#cbd5e1',
    }).setOrigin(0.5)

    this.add.text(width / 2, 110, `Hero HP: ${run.heroHp} / ${run.maxHeroHp}   Deck: ${run.currentDeck.length}   Relics: ${run.currentRelics.length}   Blessings: ${run.currentAbilities.length}`, {
      fontSize: compactLayout ? '17px' : '18px',
      color: '#bfdbfe',
    }).setOrigin(0.5)

    this.add.text(
      width / 2,
      132,
      nextLevelXp === null
        ? `Level: ${run.heroLevel}   XP: ${run.heroXp}   Max level this run`
        : `Level: ${run.heroLevel}   XP: ${run.heroXp} / ${nextLevelXp}`,
      {
      fontSize: compactLayout ? '16px' : '17px',
      color: '#93c5fd',
      },
    ).setOrigin(0.5)

    this.add.text(width / 2, 154, getNormalBattleRewardPreview(), {
      fontSize: compactLayout ? '14px' : '15px',
      color: '#fde68a',
    }).setOrigin(0.5)

    this.add.text(width / 2, 178, 'Pick one route to continue this run. Press ESC to return to menu', {
      fontSize: '16px',
      color: '#cbd5e1',
    }).setOrigin(0.5)

    this.renderRouteProgress(compactLayout, selectedRoute)
  }

  private renderRouteSelect(compactLayout: boolean) {
    const { width, height } = this.scale
    const options = getAvailableEncountersForCurrentFloor()
    const playableEncounterType = this.getPrimaryEncounterType(options)
    const routes = ROUTE_SELECT_ROUTES

    const panelWidth = compactLayout ? 268 : 324
    const panelHeight = compactLayout ? 236 : 252
    const spacing = compactLayout ? panelWidth + 16 : panelWidth + 24
    const startX = width / 2 - ((routes.length - 1) * spacing) / 2

    routes.forEach((route, index) => {
      const x = startX + index * spacing
      this.createRoutePanel(
        x,
        height / 2 + 22,
        panelWidth,
        panelHeight,
        compactLayout,
        route,
        playableEncounterType,
      )
    })
  }

  private renderRouteProgress(compactLayout: boolean, selectedRoute: RouteContent) {
    const { width, height } = this.scale
    const run = getRunState()
    const options = getAvailableEncountersForCurrentFloor()

    this.add.text(width / 2, 204, `Route active: ${selectedRoute.name}`, {
      fontSize: compactLayout ? '16px' : '18px',
      color: '#86efac',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    this.add.text(width / 2, 228, selectedRoute.theme, {
      fontSize: compactLayout ? '14px' : '15px',
      color: '#cbd5e1',
      align: 'center',
      wordWrap: { width: compactLayout ? 560 : 760 },
    }).setOrigin(0.5)

    this.add.text(width / 2, 250, `Reward focus: ${selectedRoute.rewardHint}`, {
      fontSize: compactLayout ? '13px' : '14px',
      color: '#a5f3fc',
      align: 'center',
      wordWrap: { width: compactLayout ? 560 : 760 },
    }).setOrigin(0.5)

    this.add.text(width / 2, 272, `Boss: ${selectedRoute.bossId}`, {
      fontSize: compactLayout ? '13px' : '14px',
      color: '#fca5a5',
    }).setOrigin(0.5)

    const stepIndex = Math.max(0, Math.min(ROUTE_PATH_LABELS.length - 1, run.currentRouteStep))
    const stepY = compactLayout ? 342 : 360
    const stepSpacing = compactLayout ? 154 : 176
    const startX = width / 2 - ((ROUTE_PATH_LABELS.length - 1) * stepSpacing) / 2

    ROUTE_PATH_LABELS.forEach((label, index) => {
      const x = startX + index * stepSpacing
      const isCompleted = index < stepIndex
      const isCurrent = index === stepIndex
      const nodeColor = isCompleted ? 0x16a34a : isCurrent ? 0xf59e0b : 0x334155

      this.add.circle(x, stepY, compactLayout ? 16 : 18, nodeColor)
      this.add.text(x, stepY + 34, label, {
        fontSize: compactLayout ? '13px' : '14px',
        color: isCurrent ? '#fef3c7' : '#cbd5e1',
      }).setOrigin(0.5)

      if (index < ROUTE_PATH_LABELS.length - 1) {
        this.add.rectangle(x + stepSpacing / 2, stepY, stepSpacing - 36, 4, 0x475569)
      }
    })

    const buttonWidth = compactLayout ? 240 : 256
    const spacing = options.length > 1 ? buttonWidth + 20 : 0
    const buttonStartX = width / 2 - ((options.length - 1) * spacing) / 2

    options.forEach((encounterType, index) => {
      const x = buttonStartX + index * spacing
      this.createEncounterButton(x, height - 122, buttonWidth, compactLayout, encounterType, () => {
        this.handleEncounterSelection(selectedRoute.id, encounterType)
      })
    })
  }

  private createRoutePanel(
    x: number,
    y: number,
    panelWidth: number,
    panelHeight: number,
    compactLayout: boolean,
    route: RouteContent,
    playableEncounterType: EncounterType,
  ) {
    const isPlayable = route.status === 'playable'
    const fillColor = isPlayable ? 0x19243a : 0x0a111d
    const strokeColor = isPlayable ? 0xdbeafe : 0x475569

    const panel = this.add.rectangle(x, y, panelWidth, panelHeight, fillColor)
      .setStrokeStyle(2, strokeColor)

    this.add.rectangle(x, y - panelHeight / 2 + 28, panelWidth - 12, 40, isPlayable ? 0x223457 : 0x162235, 0.92)
      .setStrokeStyle(1, isPlayable ? 0x9fb6da : 0x64748b, 0.9)

    this.add.rectangle(x, y + panelHeight / 2 - 20, panelWidth - 14, 30, 0x0f172a, 0.66)
      .setStrokeStyle(1, isPlayable ? 0x7c93b5 : 0x475569, 0.82)

    if (isPlayable) {
      panel.setInteractive({ useHandCursor: true })
      panel.on('pointerover', () => {
        panel.setStrokeStyle(2, 0xfef3c7)
      })

      panel.on('pointerout', () => {
        panel.setStrokeStyle(2, strokeColor)
      })
    }

    this.add.text(x, y - panelHeight / 2 + 28, isPlayable ? 'Open Domain' : 'Sealed Domain', {
      fontSize: compactLayout ? '13px' : '14px',
      color: isPlayable ? '#fef3c7' : '#94a3b8',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    this.add.text(x, y - 46, route.name, {
      fontSize: compactLayout ? '26px' : '30px',
      color: isPlayable ? '#f8fafc' : '#94a3b8',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: panelWidth - 28 },
    }).setOrigin(0.5)

    this.add.text(x, y - 4, route.theme, {
      fontSize: compactLayout ? '14px' : '15px',
      color: isPlayable ? '#cbd5e1' : '#64748b',
      align: 'center',
      wordWrap: { width: panelWidth - 34 },
    }).setOrigin(0.5)

    const panelHint = isPlayable
      ? `${route.rewardHint} ${this.getRouteHint(playableEncounterType)}`
      : route.rewardHint

    this.add.text(x, y + 52, panelHint, {
      fontSize: compactLayout ? '13px' : '14px',
      color: isPlayable ? '#bfdbfe' : '#64748b',
      align: 'center',
      wordWrap: { width: panelWidth - 34 },
    }).setOrigin(0.5)

    this.add.text(x, y + 88, `Boss: ${this.formatBossName(route.bossId)}`, {
      fontSize: compactLayout ? '12px' : '13px',
      color: isPlayable ? '#a5f3fc' : '#64748b',
    }).setOrigin(0.5)

    this.add.text(x, y + panelHeight / 2 - 20, isPlayable ? 'Playable - Enter Domain' : 'Locked - Not Yet Unsealed', {
      fontSize: compactLayout ? '15px' : '16px',
      color: isPlayable ? '#86efac' : '#94a3b8',
      fontStyle: isPlayable ? 'bold' : 'normal',
    }).setOrigin(0.5)

    if (!isPlayable) {
      this.add.line(x, y, -panelWidth / 2 + 22, -panelHeight / 2 + 58, panelWidth / 2 - 22, panelHeight / 2 - 36, 0x334155, 0.45)
      this.add.line(x, y, panelWidth / 2 - 22, -panelHeight / 2 + 58, -panelWidth / 2 + 22, panelHeight / 2 - 36, 0x334155, 0.45)
      return
    }

    panel.on('pointerdown', () => {
      panel.setScale(0.97)
      this.tweens.add({
        targets: panel,
        scaleX: 1,
        scaleY: 1,
        duration: 120,
        ease: 'Quad.Out',
      })
      this.handleEncounterSelection(route.id, playableEncounterType)
    })
  }

  private createEncounterButton(
    x: number,
    y: number,
    buttonWidth: number,
    compactLayout: boolean,
    encounterType: EncounterType,
    onClick: () => void,
  ) {
    const button = this.add.rectangle(x, y, buttonWidth, compactLayout ? 86 : 92, 0x1e293b)
      .setStrokeStyle(2, 0xf8fafc)
      .setInteractive({ useHandCursor: true })

    const label = encounterType === 'rest' ? 'Utility Stop' : encounterType.toUpperCase()
    this.add.text(x, y - 10, label, {
      fontSize: compactLayout ? '22px' : '24px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    const hint = encounterType === 'rest' ? 'Recover HP and advance route' : 'Continue route path'
    this.add.text(x, y + 18, hint, {
      fontSize: compactLayout ? '13px' : '14px',
      color: '#cbd5e1',
      align: 'center',
    }).setOrigin(0.5)

    button.on('pointerdown', () => {
      button.setScale(0.97)
      this.tweens.add({
        targets: button,
        scaleX: 1,
        scaleY: 1,
        duration: 120,
        ease: 'Quad.Out',
      })
      onClick()
    })
  }

  private getPrimaryEncounterType(options: EncounterType[]): EncounterType {
    if (options.includes('boss')) {
      return 'boss'
    }

    if (options.includes('elite')) {
      return 'elite'
    }

    if (options.includes('battle')) {
      return 'battle'
    }

    return options[0] ?? 'battle'
  }

  private getRouteHint(encounterType: EncounterType): string {
    if (encounterType === 'boss') {
      return 'Final trial awaits this hunt.'
    }

    if (encounterType === 'elite') {
      return 'Elite vanguard patrols this domain.'
    }

    if (encounterType === 'rest') {
      return 'A sanctuary stop may appear on this path.'
    }

    return 'Begin with skirmishes and gather strength.'
  }

  private formatBossName(bossId: string): string {
    return bossId
      .split('-')
      .filter((part) => part.length > 0)
      .map((part) => part[0].toUpperCase() + part.slice(1))
      .join(' ')
  }

  private handleEncounterSelection(routeId: string, encounterType: EncounterType) {
    setSelectedRouteId(routeId)

    if (encounterType === 'rest') {
      setCurrentEncounterType('rest')
      resolveRestEncounter()
      advanceFloorAfterEncounter()
      saveRun()
      this.scene.restart()
      return
    }

    setCurrentEncounterType(encounterType)
    this.scene.start('PlayScene')
  }
}
