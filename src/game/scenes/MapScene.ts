import Phaser from 'phaser'
import { type BoonContent } from '../content/boons'
import {
  advanceFloorAfterEncounter,
  getCurrentBoon,
  getAvailableRouteChoices,
  getRunDeck,
  getRunRelics,
  getRunState,
  getShardTarget,
  grantRandomBoon,
  getXpForNextLevel,
  resolveRestEncounter,
  setCurrentRouteChoiceNode,
  setSelectedRouteId,
  type EncounterType,
  type RouteChoiceRewardBadge,
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
    const runDeck = getRunDeck()
    const runRelics = getRunRelics()
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

    // Compact run summary is rendered here as a lightweight secondary panel.
    const summaryPanelX = compactLayout ? 126 : 146
    const summaryPanelY = compactLayout ? 98 : 104
    const summaryPanelW = compactLayout ? 224 : 252
    const summaryPanelH = compactLayout ? 74 : 82
    this.add.rectangle(summaryPanelX, summaryPanelY, summaryPanelW, summaryPanelH, 0x0f172a, 0.78)
      .setStrokeStyle(1, 0x334155, 0.88)
    this.add.text(summaryPanelX - summaryPanelW / 2 + 10, summaryPanelY - 24, 'Run Summary', {
      fontSize: compactLayout ? '11px' : '12px',
      color: '#93c5fd',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5)
    this.add.text(summaryPanelX - summaryPanelW / 2 + 10, summaryPanelY - 2, `Deck ${runDeck.length} cards`, {
      fontSize: compactLayout ? '12px' : '13px',
      color: '#dbeafe',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5)
    this.add.text(summaryPanelX - summaryPanelW / 2 + 10, summaryPanelY + 18, `Relics ${runRelics.length}`, {
      fontSize: compactLayout ? '12px' : '13px',
      color: '#cbd5e1',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5)
    this.add.text(summaryPanelX + summaryPanelW / 2 - 10, summaryPanelY + 28, 'Tap row to inspect', {
      fontSize: compactLayout ? '10px' : '11px',
      color: '#64748b',
      align: 'right',
    }).setOrigin(1, 0.5)

    const deckInspectHit = this.add.rectangle(summaryPanelX, summaryPanelY - 2, summaryPanelW - 16, 20, 0x000000, 0.001)
      .setInteractive({ useHandCursor: true })
      .setDepth(2)
    deckInspectHit.on('pointerdown', () => {
      // Deck inspection is triggered here.
      const deckLines = runDeck.slice(0, 14).map((card, index) => `${index + 1}. ${card.title} (${card.cost})`)
      if (runDeck.length > 14) {
        deckLines.push(`... +${runDeck.length - 14} more`)
      }
      this.showInfoListPanel('Deck', `${runDeck.length} cards in current run`, deckLines)
    })

    const relicInspectHit = this.add.rectangle(summaryPanelX, summaryPanelY + 18, summaryPanelW - 16, 20, 0x000000, 0.001)
      .setInteractive({ useHandCursor: true })
      .setDepth(2)
    relicInspectHit.on('pointerdown', () => {
      // Relic inspection is triggered here.
      const relicLines = runRelics.length > 0
        ? runRelics.slice(0, 10).map((relic, index) => `${index + 1}. ${relic.name} - ${relic.description}`)
        : ['No relics collected yet.']
      if (runRelics.length > 10) {
        relicLines.push(`... +${runRelics.length - 10} more`)
      }
      this.showInfoListPanel('Relics', `${runRelics.length} relics active`, relicLines)
    })

    // Reward status panel: compact shard + boon inspection for current run state.
    // Active boon summary in route selection is rendered here.
    const rewardsPanelX = width - (compactLayout ? 146 : 172)
    const rewardsPanelY = compactLayout ? 96 : 102
    const rewardsPanelW = compactLayout ? 268 : 316
    const rewardsPanelH = compactLayout ? 64 : 72
    this.add.rectangle(rewardsPanelX, rewardsPanelY, rewardsPanelW, rewardsPanelH, 0x0f172a, 0.82)
      .setStrokeStyle(1, activeBoon ? 0x22c55e : 0x334155, activeBoon ? 0.72 : 0.88)
    this.add.text(rewardsPanelX - rewardsPanelW / 2 + 10, rewardsPanelY - 19, `Shards ${shardProgress}${run.isForgeAvailable ? '  •  Forge Ready' : ''}`, {
      fontSize: compactLayout ? '12px' : '13px',
      color: run.isForgeAvailable ? '#fef3c7' : '#93c5fd',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5)
    if (activeBoon) {
      // Green left accent bar to visually separate the active-boon section.
      this.add.rectangle(
        rewardsPanelX - rewardsPanelW / 2 + 3,
        rewardsPanelY + 14,
        4,
        compactLayout ? 36 : 40,
        0x22c55e,
        0.88,
      )
      this.add.text(rewardsPanelX - rewardsPanelW / 2 + 12, rewardsPanelY + 4, `[B] ${activeBoon.name}`, {
        fontSize: compactLayout ? '12px' : '13px',
        color: '#86efac',
        fontStyle: 'bold',
      }).setOrigin(0, 0.5)
      this.add.text(rewardsPanelX - rewardsPanelW / 2 + 12, rewardsPanelY + 22, `${activeBoon.description}  •  next battle only`, {
        fontSize: compactLayout ? '10px' : '11px',
        color: '#a7f3c8',
        wordWrap: { width: rewardsPanelW - 24 },
      }).setOrigin(0, 0.5)
    } else {
      this.add.text(rewardsPanelX - rewardsPanelW / 2 + 10, rewardsPanelY + 14, 'No active boon', {
        fontSize: compactLayout ? '11px' : '12px',
        color: '#475569',
      }).setOrigin(0, 0.5)
    }

    const boonInspectHit = this.add.rectangle(
      rewardsPanelX,
      rewardsPanelY + 15,
      rewardsPanelW - 12,
      compactLayout ? 38 : 42,
      0x000000,
      0.001,
    ).setInteractive({ useHandCursor: true }).setDepth(2)
    boonInspectHit.on('pointerdown', () => {
      // Boon detail inspection is triggered here.
      if (activeBoon) {
        this.showInfoListPanel(
          'Active Boon',
          'Temporary: consumed in next battle',
          [activeBoon.name, activeBoon.description],
        )
        return
      }

      this.showInfoListPanel('Active Boon', 'No boon active', ['Visit a utility/rest node to gain a temporary boon.'])
    })

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
        choice.rewardBadges,
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
    rewardBadges: RouteChoiceRewardBadge[],
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

    if (rewardBadges.length > 0) {
      // Route reward category display is defined here as compact icon-label badges.
      this.add.text(x, y + (compactLayout ? 34 : 36), this.formatRewardBadgeLine(rewardBadges, compactLayout), {
        fontSize: compactLayout ? '10px' : '11px',
        color: '#bfdbfe',
        align: 'center',
      }).setOrigin(0.5)
    }

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
      const nodeRewardBadges = this.getNodeRewardBadges(node)
      const hasRewardTelegraph = nodeRewardBadges.length > 0

      const fillColor = isCompleted
        ? 0x16a34a
        : isReachable
          ? 0xf59e0b
          : isBoss
            ? 0x7f1d1d
            : 0x334155
      const strokeColor = hasRewardTelegraph
        ? 0x7dd3fc
        : isReachable
          ? 0xfef3c7
          : 0x94a3b8

      this.add.circle(position.x, position.y, nodeRadius, fillColor)
        .setStrokeStyle(2, strokeColor)

      this.add.text(position.x, position.y + nodeRadius + 16, this.getEncounterTypeTag(node.encounterType), {
        fontSize: compactLayout ? '10px' : '11px',
        color: isReachable ? '#fef3c7' : '#cbd5e1',
        fontStyle: isReachable ? 'bold' : 'normal',
      }).setOrigin(0.5)

      if (isReachable && hasRewardTelegraph) {
        this.add.text(position.x, position.y - nodeRadius - 10, this.formatRewardBadgeLine(nodeRewardBadges.slice(0, 2), compactLayout), {
          fontSize: compactLayout ? '9px' : '10px',
          color: '#7dd3fc',
          fontStyle: 'bold',
        }).setOrigin(0.5)
      }
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

  private getNodeRewardBadges(node: RouteGraphNode): RouteChoiceRewardBadge[] {
    const badges: RouteChoiceRewardBadge[] = []

    if (node.encounterType === 'battle') {
      badges.push({ category: 'battle', label: 'Battle' })
    }

    if (node.encounterType === 'elite') {
      badges.push({ category: 'elite', label: 'Elite' })
    }

    const shardChance = node.rewards?.shardChance ?? 0
    if (shardChance > 0) {
      badges.push({ category: 'shard', label: shardChance >= 0.65 ? 'High Shard Chance' : 'Shard Chance' })
    }

    const grantsHealing = node.rewards?.grantsHealing ?? (node.encounterType === 'rest')
    if (grantsHealing) {
      badges.push({ category: 'healing', label: 'Healing' })
    }

    const grantsBoon = node.rewards?.grantsBoon ?? (node.encounterType === 'rest')
    if (grantsBoon) {
      badges.push({ category: 'boon', label: 'Boon' })
    }

    if (node.encounterType === 'elite' || node.rewards?.relicCategoryLabel) {
      badges.push({
        category: 'relic',
        label: node.rewards?.relicCategoryLabel ?? 'Mysterious Relic',
      })
    }

    return badges
  }

  private formatRewardBadgeLine(badges: RouteChoiceRewardBadge[], compactLayout: boolean): string {
    const maxBadges = compactLayout ? 2 : 3
    return badges
      .slice(0, maxBadges)
      .map((badge) => this.getBadgeToken(badge))
      .join('  ')
  }

  // Route node labels/icons are mapped here for quick, lightweight category scanning.
  private getBadgeToken(badge: RouteChoiceRewardBadge): string {
    if (badge.category === 'battle') return '[X] Battle'
    if (badge.category === 'elite') return '[!] Elite'
    if (badge.category === 'shard') return '[S] Shard'
    if (badge.category === 'healing') return '[+] Heal'
    if (badge.category === 'boon') return '[B] Boon'
    return `[?] ${badge.label}`
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
      // Boon gain feedback is presented here — a confirmable overlay replaces the fast auto-toast.
      this.showBoonGainPanel(boon, () => {
        resolveRestEncounter()
        advanceFloorAfterEncounter()
        saveRun()
        this.scene.restart()
      })
      return
    }

    this.scene.start('PlayScene')
  }

  private showBoonGainPanel(boon: BoonContent, onConfirm: () => void) {
    const { width, height } = this.scale
    const cx = width / 2
    const cy = height / 2
    const panelW = 460
    const panelH = 240

    const overlay = this.add.rectangle(cx, cy, width, height, 0x000000, 0.52).setDepth(40)
    const panel = this.add.rectangle(cx, cy, panelW, panelH, 0x0b1a2f, 0.97)
      .setStrokeStyle(2, 0x22c55e).setDepth(41)
    this.add.rectangle(cx, cy - panelH / 2 + 10, panelW - 20, 2, 0x4ade80, 0.85).setDepth(42)

    this.add.text(cx, cy - 82, 'Boon Gained', {
      fontSize: '22px',
      color: '#86efac',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(42)

    this.add.text(cx, cy - 48, boon.name, {
      fontSize: '28px',
      color: '#d1fae5',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(42)

    this.add.text(cx, cy - 8, boon.description, {
      fontSize: '17px',
      color: '#a7f3c8',
      align: 'center',
      wordWrap: { width: panelW - 40 },
    }).setOrigin(0.5).setDepth(42)

    this.add.text(cx, cy + 32, '• Active for next battle only •', {
      fontSize: '13px',
      color: '#4ade80',
      fontStyle: 'italic',
    }).setOrigin(0.5).setDepth(42)

    // Confirm prompt — shown after a short lock so the text is read before dismissal.
    const confirmText = this.add.text(cx, cy + 68, '', {
      fontSize: '14px',
      color: '#64748b',
    }).setOrigin(0.5).setDepth(42)

    const panelObjects = [overlay, panel]
    let confirmReady = false

    const dismiss = () => {
      if (!confirmReady) {
        return
      }
      panelObjects.forEach((obj) => obj.destroy())
      onConfirm()
    }

    this.time.delayedCall(900, () => {
      confirmReady = true
      confirmText.setText('Click or press Space to continue')
      confirmText.setColor('#86efac')

      this.input.once('pointerdown', dismiss)
      this.input.keyboard?.once('keydown-SPACE', dismiss)
    })
  }

  private showInfoListPanel(title: string, subtitle: string, lines: string[]) {
    const { width, height } = this.scale
    const cx = width / 2
    const cy = height / 2
    const panelW = 560
    const panelH = 330

    const overlay = this.add.rectangle(cx, cy, width, height, 0x000000, 0.52).setDepth(60)
    const panel = this.add.rectangle(cx, cy, panelW, panelH, 0x0b1220, 0.96)
      .setStrokeStyle(2, 0x3b82f6)
      .setDepth(61)
    const titleText = this.add.text(cx, cy - 130, title, {
      fontSize: '24px',
      color: '#dbeafe',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(62)
    const subtitleText = this.add.text(cx, cy - 98, subtitle, {
      fontSize: '13px',
      color: '#93c5fd',
      align: 'center',
    }).setOrigin(0.5).setDepth(62)

    const bodyText = this.add.text(cx - panelW / 2 + 22, cy - 70, lines.join('\n'), {
      fontSize: '13px',
      color: '#e2e8f0',
      lineSpacing: 5,
      wordWrap: { width: panelW - 44 },
    }).setOrigin(0, 0).setDepth(62)

    const hintText = this.add.text(cx, cy + panelH / 2 - 24, 'Click or press Space to close', {
      fontSize: '12px',
      color: '#64748b',
    }).setOrigin(0.5).setDepth(62)

    const close = () => {
      overlay.destroy()
      panel.destroy()
      titleText.destroy()
      subtitleText.destroy()
      bodyText.destroy()
      hintText.destroy()
    }

    this.input.once('pointerdown', close)
    this.input.keyboard?.once('keydown-SPACE', close)
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
