import Phaser from 'phaser'
import {
  advanceFloorAfterEncounter,
  getAvailableRouteChoices,
  getRunState,
  grantRandomBoon,
  getXpForNextLevel,
  resolveRestEncounter,
  setCurrentRouteChoiceNode,
  setSelectedRouteId,
  type EncounterType,
} from '../battle/runState'
import { saveRun } from '../battle/runSave'
import {
  getDefaultRoutePath,
  getRouteById,
  getRouteNodeLabel,
  getRoutePathById,
  ROUTE_SELECT_ROUTES,
  type RouteNodeType,
  type RouteContent,
} from '../content/routes'

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
    const statusXp = nextLevelXp === null ? `${run.heroXp}` : `${run.heroXp}/${nextLevelXp}`

    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.start('MenuScene')
    })

    // Header section: title + compact run status.
    this.add.text(width / 2, compactLayout ? 42 : 46, 'Route Select', {
      fontSize: compactLayout ? '34px' : '38px',
      color: '#f8fafc',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    this.add.rectangle(width / 2, compactLayout ? 82 : 88, compactLayout ? width * 0.72 : 660, 34, 0x111a2d, 0.86)
      .setStrokeStyle(1, 0x3b4e6d, 0.9)
    this.add.text(width / 2, compactLayout ? 82 : 88, `HP ${run.heroHp}/${run.maxHeroHp}   |   Level ${run.heroLevel}   |   XP ${statusXp}`, {
      fontSize: compactLayout ? '13px' : '14px',
      color: '#bfdbfe',
    }).setOrigin(0.5)

    if (!selectedRoute) {
      // Route identity section before first route pick.
      this.add.text(width / 2, compactLayout ? 124 : 134, 'Active Route: None', {
        fontSize: compactLayout ? '20px' : '21px',
        color: '#f8fafc',
        fontStyle: 'bold',
      }).setOrigin(0.5)

      this.add.text(width / 2, compactLayout ? 148 : 160, 'Choose a domain path to begin the hunt.', {
        fontSize: compactLayout ? '14px' : '15px',
        color: '#cbd5e1',
      }).setOrigin(0.5)

      this.add.text(width / 2, compactLayout ? 170 : 184, 'Boss: Unknown', {
        fontSize: compactLayout ? '13px' : '14px',
        color: '#94a3b8',
      }).setOrigin(0.5)

      this.renderRouteSelect(compactLayout)

      return
    }

    this.renderRouteProgress(compactLayout, selectedRoute)
  }

  private renderRouteSelect(compactLayout: boolean) {
    const { width, height } = this.scale
    const routes = ROUTE_SELECT_ROUTES

    // Path progress section: pre-route view starts at first node.
    this.renderPathProgress(compactLayout, getDefaultRoutePath(), 0, compactLayout ? 240 : 258)

    const panelWidth = compactLayout ? 258 : 300
    const panelHeight = compactLayout ? 204 : 220
    const spacing = compactLayout ? panelWidth + 16 : panelWidth + 24
    const startX = width / 2 - ((routes.length - 1) * spacing) / 2

    routes.forEach((route, index) => {
      const x = startX + index * spacing
      this.createRoutePanel(
        x,
        height / 2 + (compactLayout ? 80 : 72),
        panelWidth,
        panelHeight,
        compactLayout,
        route,
      )
    })
  }

  private renderRouteProgress(compactLayout: boolean, selectedRoute: RouteContent) {
    const { width, height } = this.scale
    const run = getRunState()
    const choices = getAvailableRouteChoices()

    // Route identity section: route, flavor line, boss.
    this.add.text(width / 2, compactLayout ? 128 : 136, selectedRoute.name, {
      fontSize: compactLayout ? '25px' : '28px',
      color: '#f8fafc',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    this.add.text(width / 2, compactLayout ? 154 : 164, selectedRoute.theme, {
      fontSize: compactLayout ? '14px' : '15px',
      color: '#cbd5e1',
      align: 'center',
      wordWrap: { width: compactLayout ? 520 : 700 },
    }).setOrigin(0.5)

    this.add.text(width / 2, compactLayout ? 178 : 190, `Boss: ${this.formatBossName(selectedRoute.bossId)}`, {
      fontSize: compactLayout ? '13px' : '14px',
      color: '#fca5a5',
    }).setOrigin(0.5)

    // Path progress section: compact route step visualization.
    this.renderPathProgress(
      compactLayout,
      getRoutePathById(selectedRoute.id, run.selectedRouteLayoutId),
      run.currentRouteStep,
      compactLayout ? 280 : 300,
    )

    // Next choice section: branching node choices for the current route position.
    const buttonWidth = compactLayout ? 240 : 256
    const spacing = choices.length > 1 ? buttonWidth + 20 : 0
    const buttonStartX = width / 2 - ((choices.length - 1) * spacing) / 2

    choices.forEach((choice, index) => {
      const x = buttonStartX + index * spacing
      this.createEncounterButton(
        x,
        compactLayout ? height - 114 : height - 120,
        buttonWidth,
        compactLayout,
        choice.encounterType,
        choice.label,
        () => {
          this.handleEncounterSelection(selectedRoute.id, choice.nodeId, choice.encounterType)
        },
      )
    })

    if (choices.length === 0) {
      this.add.text(width / 2, compactLayout ? height - 118 : height - 126, 'No route choices available', {
        fontSize: compactLayout ? '14px' : '15px',
        color: '#94a3b8',
      })
        .setOrigin(0.5)
    }
  }

  private createRoutePanel(
    x: number,
    y: number,
    panelWidth: number,
    panelHeight: number,
    compactLayout: boolean,
    route: RouteContent,
  ) {
    const isPlayable = route.status === 'playable'
    const fillColor = isPlayable ? 0x19243a : 0x0a111d
    const strokeColor = isPlayable ? 0xdbeafe : 0x475569

    const panel = this.add.rectangle(x, y, panelWidth, panelHeight, fillColor)
      .setStrokeStyle(2, strokeColor)

    this.add.rectangle(x, y - panelHeight / 2 + 24, panelWidth - 12, 34, isPlayable ? 0x223457 : 0x162235, 0.92)
      .setStrokeStyle(1, isPlayable ? 0x9fb6da : 0x64748b, 0.9)

    this.add.rectangle(x, y + panelHeight / 2 - 18, panelWidth - 14, 26, 0x0f172a, 0.66)
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

    // Route display content: concise status, route name, short flavor, and boss.
    this.add.text(x, y - panelHeight / 2 + 24, isPlayable ? 'OPEN DOMAIN' : 'SEALED DOMAIN', {
      fontSize: compactLayout ? '11px' : '12px',
      color: isPlayable ? '#fef3c7' : '#94a3b8',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    this.add.text(x, y - 36, route.name, {
      fontSize: compactLayout ? '24px' : '27px',
      color: isPlayable ? '#f8fafc' : '#94a3b8',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: panelWidth - 28 },
    }).setOrigin(0.5)

    this.add.text(x, y - 2, route.theme, {
      fontSize: compactLayout ? '13px' : '14px',
      color: isPlayable ? '#cbd5e1' : '#64748b',
      align: 'center',
      wordWrap: { width: panelWidth - 34 },
    }).setOrigin(0.5)

    this.add.text(x, y + 42, `Boss: ${this.formatBossName(route.bossId)}`, {
      fontSize: compactLayout ? '12px' : '13px',
      color: isPlayable ? '#a5f3fc' : '#64748b',
    }).setOrigin(0.5)

    this.add.text(x, y + panelHeight / 2 - 18, isPlayable ? 'Enter Route' : 'Locked', {
      fontSize: compactLayout ? '13px' : '14px',
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
      this.handleRouteSelection(route.id)
    })
  }

  private createEncounterButton(
    x: number,
    y: number,
    buttonWidth: number,
    compactLayout: boolean,
    encounterType: EncounterType,
    nodeLabel: string,
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

    const hint = encounterType === 'rest' ? nodeLabel : nodeLabel
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

  private formatBossName(bossId: string): string {
    return bossId
      .split('-')
      .filter((part) => part.length > 0)
      .map((part) => part[0].toUpperCase() + part.slice(1))
      .join(' ')
  }

  private renderPathProgress(compactLayout: boolean, routePath: RouteNodeType[], routeStep: number, y: number) {
    const { width } = this.scale
    const labels = routePath.map((node) => getRouteNodeLabel(node))
    const stepIndex = Math.max(0, Math.min(labels.length - 1, routeStep))
    const stepSpacing = compactLayout ? 154 : 176
    const startX = width / 2 - ((labels.length - 1) * stepSpacing) / 2

    labels.forEach((label, index) => {
      const x = startX + index * stepSpacing
      const isCompleted = index < stepIndex
      const isCurrent = index === stepIndex
      const nodeColor = isCompleted ? 0x16a34a : isCurrent ? 0xf59e0b : 0x334155

      this.add.circle(x, y, compactLayout ? 16 : 18, nodeColor)
      this.add.text(x, y + 34, label, {
        fontSize: compactLayout ? '13px' : '14px',
        color: isCurrent ? '#fef3c7' : '#cbd5e1',
      }).setOrigin(0.5)

      if (index < labels.length - 1) {
        this.add.rectangle(x + stepSpacing / 2, y, stepSpacing - 36, 4, 0x475569)
      }
    })
  }

  private handleRouteSelection(routeId: string) {
    setSelectedRouteId(routeId)
    const choices = getAvailableRouteChoices()

    if (choices.length === 1) {
      this.handleEncounterSelection(routeId, choices[0].nodeId, choices[0].encounterType)
      return
    }

    this.scene.restart()
  }

  private handleEncounterSelection(routeId: string, nodeId: string, encounterType: EncounterType) {
    setSelectedRouteId(routeId)
    const selectedEncounterType = setCurrentRouteChoiceNode(nodeId) ?? encounterType

    if (selectedEncounterType === 'rest') {
      // Utility nodes award a temporary Boon for the next battle.
      grantRandomBoon()
      resolveRestEncounter()
      advanceFloorAfterEncounter()
      saveRun()
      this.scene.restart()
      return
    }

    this.scene.start('PlayScene')
  }
}
