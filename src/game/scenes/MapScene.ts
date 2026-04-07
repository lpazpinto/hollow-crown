import Phaser from 'phaser'
import {
  advanceFloorAfterEncounter,
  getCurrentBoon,
  getAvailableRouteChoices,
  getRunState,
  getShardTarget,
  grantRandomBoon,
  getXpForNextLevel,
  resolveRestEncounter,
  setCurrentRouteChoiceNode,
  setSelectedRouteId,
  type EncounterType,
} from '../battle/runState'
import { saveRun } from '../battle/runSave'
import {
  getRouteById,
  getRouteLayoutById,
  getRouteNodeLabel,
  type RouteGraphLayout,
  type RouteGraphNode,
  type RouteContent,
} from '../content/routes'

export class MapScene extends Phaser.Scene {
  constructor() {
    super('MapScene')
  }

  create(data: { rewardToast?: { title: string; detail: string; color?: string } } = {}) {
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
    const activeBoon = getCurrentBoon()
    const shardProgress = `${run.shardCount}/${getShardTarget()}`

    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.start('MenuScene')
    })

    // Route path progression begins here for the currently selected domain.
    this.add.text(width / 2, compactLayout ? 42 : 46, 'Domain Path', {
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

    // Reward status panel: compact shard + boon inspection for current run state.
    const rewardsPanelX = width - (compactLayout ? 146 : 172)
    const rewardsPanelY = compactLayout ? 96 : 102
    const rewardsPanelW = compactLayout ? 268 : 316
    const rewardsPanelH = compactLayout ? 64 : 72
    this.add.rectangle(rewardsPanelX, rewardsPanelY, rewardsPanelW, rewardsPanelH, 0x0f172a, 0.82)
      .setStrokeStyle(1, 0x334155, 0.88)
    this.add.text(rewardsPanelX - rewardsPanelW / 2 + 10, rewardsPanelY - 19, `Shards ${shardProgress}${run.isForgeAvailable ? '  •  Forge Ready' : ''}`, {
      fontSize: compactLayout ? '12px' : '13px',
      color: run.isForgeAvailable ? '#fef3c7' : '#93c5fd',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5)
    this.add.text(rewardsPanelX - rewardsPanelW / 2 + 10, rewardsPanelY + 6, activeBoon ? `Boon: ${activeBoon.name}` : 'Boon: None', {
      fontSize: compactLayout ? '12px' : '13px',
      color: activeBoon ? '#86efac' : '#94a3b8',
    }).setOrigin(0, 0.5)
    this.add.text(rewardsPanelX - rewardsPanelW / 2 + 10, rewardsPanelY + 24, activeBoon ? activeBoon.description : 'No next-battle boon active.', {
      fontSize: compactLayout ? '11px' : '12px',
      color: '#cbd5e1',
      wordWrap: { width: rewardsPanelW - 20 },
    }).setOrigin(0, 0.5)

    if (data.rewardToast) {
      this.showRewardToast(data.rewardToast.title, data.rewardToast.detail, data.rewardToast.color)
    }

    if (!selectedRoute) {
      this.scene.start('DomainSelectScene')
      return
    }

    this.renderRouteProgress(compactLayout, selectedRoute)
  }

  private renderRouteProgress(compactLayout: boolean, selectedRoute: RouteContent) {
    const { width, height } = this.scale
    const run = getRunState()
    const choices = getAvailableRouteChoices()
    const routeLayout = getRouteLayoutById(selectedRoute.id, run.selectedRouteLayoutId)

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
    if (routeLayout) {
      this.renderRouteGraph(
        compactLayout,
        routeLayout,
        run.currentRouteChoiceNodeIds,
        run.completedRouteNodeIds,
        compactLayout ? 286 : 306,
      )
    }

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

  private renderRouteGraph(
    compactLayout: boolean,
    layout: RouteGraphLayout,
    reachableNodeIds: string[],
    completedNodeIds: string[],
    centerY: number,
  ) {
    const { width } = this.scale
    const depthById = this.getDepthByNodeId(layout)
    const nodesByDepth = this.getNodesByDepth(layout, depthById)
    const depths = Object.keys(nodesByDepth)
      .map((value) => Number(value))
      .sort((a, b) => a - b)

    if (depths.length === 0) {
      return
    }

    const columnGap = compactLayout ? 104 : 122
    const startX = width / 2 - ((depths.length - 1) * columnGap) / 2
    const laneGap = compactLayout ? 58 : 66
    const nodeRadius = compactLayout ? 13 : 15

    const positionByNodeId: Record<string, { x: number; y: number }> = {}

    depths.forEach((depth) => {
      const columnNodes = [...nodesByDepth[depth]].sort((a, b) => a.id.localeCompare(b.id))
      const columnX = startX + depth * columnGap
      const startY = centerY - ((columnNodes.length - 1) * laneGap) / 2

      columnNodes.forEach((node, index) => {
        positionByNodeId[node.id] = {
          x: columnX,
          y: startY + index * laneGap,
        }
      })
    })

    // Graph connections are rendered first so split/merge structure stays visible behind node circles.
    layout.nodes.forEach((node) => {
      const from = positionByNodeId[node.id]
      if (!from) {
        return
      }

      node.nextNodeIds.forEach((nextNodeId) => {
        const to = positionByNodeId[nextNodeId]
        if (!to) {
          return
        }

        this.add.line(
          0,
          0,
          from.x + nodeRadius,
          from.y,
          to.x - nodeRadius,
          to.y,
          0x64748b,
          0.62,
        )
          .setOrigin(0, 0)
          .setLineWidth(compactLayout ? 2 : 3)
      })
    })

    const completedNodeSet = new Set(completedNodeIds)
    const reachableNodeSet = new Set(reachableNodeIds)

    // Current reachable next nodes are determined by runState.currentRouteChoiceNodeIds,
    // which represent node ids connected from the previously completed node.
    layout.nodes.forEach((node) => {
      const position = positionByNodeId[node.id]
      if (!position) {
        return
      }

      const isCompleted = completedNodeSet.has(node.id)
      const isReachable = reachableNodeSet.has(node.id)
      const isBoss = node.encounterType === 'boss'

      const fillColor = isCompleted
        ? 0x16a34a
        : isReachable
          ? 0xf59e0b
          : isBoss
            ? 0x7f1d1d
            : 0x334155
      const strokeColor = isReachable ? 0xfef3c7 : 0x94a3b8

      this.add.circle(position.x, position.y, nodeRadius, fillColor)
        .setStrokeStyle(2, strokeColor)

      this.add.text(position.x, position.y + nodeRadius + 16, this.getEncounterTypeTag(node.encounterType), {
        fontSize: compactLayout ? '10px' : '11px',
        color: isReachable ? '#fef3c7' : '#cbd5e1',
        fontStyle: isReachable ? 'bold' : 'normal',
      }).setOrigin(0.5)
    })

    this.add.text(width / 2, centerY + (compactLayout ? 108 : 116), 'Choose one highlighted node to advance this run.', {
      fontSize: compactLayout ? '12px' : '13px',
      color: '#94a3b8',
    }).setOrigin(0.5)
  }

  private getDepthByNodeId(layout: RouteGraphLayout): Record<string, number> {
    const depthById: Record<string, number> = {}
    const queue: string[] = [layout.startNodeId]
    depthById[layout.startNodeId] = 0

    while (queue.length > 0) {
      const nodeId = queue.shift() as string
      const node = layout.nodes.find((entry) => entry.id === nodeId)
      if (!node) {
        continue
      }

      const nodeDepth = depthById[nodeId]
      node.nextNodeIds.forEach((nextNodeId) => {
        const nextDepth = nodeDepth + 1
        const previousDepth = depthById[nextNodeId]

        if (previousDepth === undefined || nextDepth < previousDepth) {
          depthById[nextNodeId] = nextDepth
          queue.push(nextNodeId)
        }
      })
    }

    return depthById
  }

  private getNodesByDepth(
    layout: RouteGraphLayout,
    depthById: Record<string, number>,
  ): Record<number, RouteGraphNode[]> {
    const nodesByDepth: Record<number, RouteGraphNode[]> = {}

    layout.nodes.forEach((node) => {
      const depth = depthById[node.id] ?? 0
      nodesByDepth[depth] = [...(nodesByDepth[depth] ?? []), node]
    })

    return nodesByDepth
  }

  private getEncounterTypeTag(encounterType: RouteGraphNode['encounterType']): string {
    if (encounterType === 'battle') {
      return getRouteNodeLabel('battle')
    }

    if (encounterType === 'rest') {
      return getRouteNodeLabel('utility_or_special')
    }

    if (encounterType === 'elite') {
      return getRouteNodeLabel('elite')
    }

    return getRouteNodeLabel('boss')
  }

  private handleEncounterSelection(routeId: string, nodeId: string, encounterType: EncounterType) {
    setSelectedRouteId(routeId)
    const selectedEncounterType = setCurrentRouteChoiceNode(nodeId) ?? encounterType

    if (selectedEncounterType === 'rest') {
      // Utility nodes award a temporary Boon for the next battle.
      const boon = grantRandomBoon()
      resolveRestEncounter()
      advanceFloorAfterEncounter()
      saveRun()
      this.scene.restart({
        rewardToast: {
          title: 'Boon Gained',
          detail: `${boon.name}: ${boon.description}`,
          color: '#86efac',
        },
      })
      return
    }

    this.scene.start('PlayScene')
  }

  private showRewardToast(title: string, detail: string, color = '#93c5fd') {
    const { width } = this.scale
    const y = 134
    const bg = this.add.rectangle(width / 2, y, 520, 62, 0x0b1220, 0.92)
      .setStrokeStyle(2, 0x334155)
      .setDepth(30)
    const titleText = this.add.text(width / 2, y - 12, title, {
      fontSize: '18px',
      color,
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(31)
    const detailText = this.add.text(width / 2, y + 12, detail, {
      fontSize: '13px',
      color: '#e2e8f0',
      wordWrap: { width: 500 },
      align: 'center',
    }).setOrigin(0.5).setDepth(31)

    this.tweens.add({
      targets: [bg, titleText, detailText],
      alpha: 0,
      delay: 1450,
      duration: 260,
      onComplete: () => {
        bg.destroy()
        titleText.destroy()
        detailText.destroy()
      },
    })
  }
}
