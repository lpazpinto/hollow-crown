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

    const selectedRoute = getRouteById(run.selectedRouteId)
    if (selectedRoute) {
      this.add.text(width / 2, 204, `Selected route: ${selectedRoute.name}`, {
        fontSize: compactLayout ? '14px' : '15px',
        color: '#86efac',
      }).setOrigin(0.5)
    }

    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.start('MenuScene')
    })

    const options = getAvailableEncountersForCurrentFloor()
    const playableEncounterType = this.getPrimaryEncounterType(options)

    const routes = ROUTE_SELECT_ROUTES

    const panelWidth = compactLayout ? 252 : 300
    const panelHeight = compactLayout ? 188 : 204
    const spacing = compactLayout ? panelWidth + 18 : panelWidth + 28
    const startX = width / 2 - ((routes.length - 1) * spacing) / 2

    routes.forEach((route, index) => {
      const x = startX + index * spacing
      this.createRoutePanel(
        x,
        height / 2 + 42,
        panelWidth,
        panelHeight,
        compactLayout,
        route,
        playableEncounterType,
      )
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
    const fillColor = isPlayable ? 0x172033 : 0x0b1220
    const strokeColor = isPlayable ? 0xf8fafc : 0x64748b

    const panel = this.add.rectangle(x, y, panelWidth, panelHeight, fillColor)
      .setStrokeStyle(2, strokeColor)

    if (isPlayable) {
      panel.setInteractive({ useHandCursor: true })
    }

    this.add.text(x, y - 68, route.name, {
      fontSize: compactLayout ? '25px' : '28px',
      color: isPlayable ? '#f8fafc' : '#94a3b8',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    this.add.text(x, y - 28, route.theme, {
      fontSize: compactLayout ? '14px' : '15px',
      color: isPlayable ? '#cbd5e1' : '#64748b',
      align: 'center',
      wordWrap: { width: panelWidth - 24 },
    }).setOrigin(0.5)

    const panelHint = isPlayable
      ? `${route.rewardHint} ${this.getRouteHint(playableEncounterType)}`
      : route.rewardHint

    this.add.text(x, y + 16, panelHint, {
      fontSize: compactLayout ? '13px' : '14px',
      color: isPlayable ? '#cbd5e1' : '#64748b',
      align: 'center',
      wordWrap: { width: panelWidth - 24 },
    }).setOrigin(0.5)

    this.add.text(x, y + 46, `Boss: ${route.bossId}`, {
      fontSize: compactLayout ? '12px' : '13px',
      color: isPlayable ? '#a5f3fc' : '#64748b',
    }).setOrigin(0.5)

    this.add.text(x, y + 72, isPlayable ? 'Playable' : 'Locked', {
      fontSize: compactLayout ? '15px' : '16px',
      color: isPlayable ? '#86efac' : '#94a3b8',
      fontStyle: isPlayable ? 'bold' : 'normal',
    }).setOrigin(0.5)

    if (!isPlayable) {
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
      return 'Boss hunt. Relic reward on victory.'
    }

    if (encounterType === 'elite') {
      return 'Elite contract. High risk, relic chance.'
    }

    if (encounterType === 'rest') {
      return 'Sanctuary stop. Recover then advance.'
    }

    return 'Main hunt. Battle for growth and drafts.'
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
