import Phaser from 'phaser'
import {
  advanceFloorAfterEncounter,
  getAvailableEncountersForCurrentFloor,
  getNormalBattleRewardPreview,
  getRunState,
  getXpForNextLevel,
  resolveRestEncounter,
  setCurrentEncounterType,
  type EncounterType,
} from '../battle/runState'
import { saveRun } from '../battle/runSave'

type RoutePanel = {
  name: string
  hint: string
  statusLabel: 'Playable' | 'Locked' | 'Sealed' | 'Coming Soon' | 'Unknown'
  isPlayable: boolean
}

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

    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.start('MenuScene')
    })

    const options = getAvailableEncountersForCurrentFloor()
    const playableEncounterType = this.getPrimaryEncounterType(options)

    const routes: RoutePanel[] = [
      {
        name: 'Ashen March',
        hint: this.getRouteHint(playableEncounterType),
        statusLabel: 'Playable',
        isPlayable: true,
      },
      {
        name: 'Veil of Thorns',
        hint: 'Locked route. Nature relics rumored.',
        statusLabel: 'Sealed',
        isPlayable: false,
      },
      {
        name: 'Starforged Deep',
        hint: 'Coming soon. Arcane vault rewards.',
        statusLabel: 'Coming Soon',
        isPlayable: false,
      },
    ]

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
    route: RoutePanel,
    playableEncounterType: EncounterType,
  ) {
    const fillColor = route.isPlayable ? 0x172033 : 0x0b1220
    const strokeColor = route.isPlayable ? 0xf8fafc : 0x64748b

    const panel = this.add.rectangle(x, y, panelWidth, panelHeight, fillColor)
      .setStrokeStyle(2, strokeColor)

    if (route.isPlayable) {
      panel.setInteractive({ useHandCursor: true })
    }

    this.add.text(x, y - 58, route.name, {
      fontSize: compactLayout ? '25px' : '28px',
      color: route.isPlayable ? '#f8fafc' : '#94a3b8',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    this.add.text(x, y - 18, route.hint, {
      fontSize: compactLayout ? '15px' : '16px',
      color: route.isPlayable ? '#cbd5e1' : '#64748b',
      align: 'center',
      wordWrap: { width: panelWidth - 24 },
    }).setOrigin(0.5)

    this.add.text(x, y + 56, route.statusLabel, {
      fontSize: compactLayout ? '15px' : '16px',
      color: route.isPlayable ? '#86efac' : '#94a3b8',
      fontStyle: route.isPlayable ? 'bold' : 'normal',
    }).setOrigin(0.5)

    if (!route.isPlayable) {
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
      this.handleEncounterSelection(playableEncounterType)
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

  private handleEncounterSelection(encounterType: EncounterType) {
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
