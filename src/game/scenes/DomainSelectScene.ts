import Phaser from 'phaser'
import {
  getCurrentBoon,
  getRunAbilities,
  getRunRelics,
  getRunState,
  getShardTarget,
  getXpForNextLevel,
  setSelectedRouteId,
} from '../battle/runState'
import { saveRun } from '../battle/runSave'
import {
  getDefaultRoutePath,
  getRouteNodeLabel,
  ROUTE_SELECT_ROUTES,
  type RouteContent,
  type RouteNodeType,
} from '../content/routes'

export class DomainSelectScene extends Phaser.Scene {
  constructor() {
    super('DomainSelectScene')
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

    if (run.selectedRouteId) {
      this.scene.start('MapScene')
      return
    }

    saveRun()

    this.cameras.main.setBackgroundColor('#0f172a')

    const statusXp = nextLevelXp === null ? `${run.heroXp}` : `${run.heroXp}/${nextLevelXp}`
    const activeBoon = getCurrentBoon()
    const runAbilities = getRunAbilities()
    const runRelics = getRunRelics()
    const shardProgress = `${run.shardCount}/${getShardTarget()}`
    // Visible terminology is defined here for domain selection summaries.
    const effectTerms = {
      boon: 'Boon',
      passives: 'Passives',
      none: 'None',
    }

    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.start('MenuScene')
    })

    this.add.text(width / 2, compactLayout ? 42 : 46, 'Domain Select', {
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

    const rewardsPanelX = width - (compactLayout ? 146 : 172)
    const rewardsPanelY = compactLayout ? 96 : 102
    const rewardsPanelW = compactLayout ? 268 : 316
    const rewardsPanelH = compactLayout ? 82 : 92
    this.add.rectangle(rewardsPanelX, rewardsPanelY, rewardsPanelW, rewardsPanelH, 0x0f172a, 0.82)
      .setStrokeStyle(1, 0x334155, 0.88)
    this.add.text(rewardsPanelX - rewardsPanelW / 2 + 10, rewardsPanelY - 19, `Shards ${shardProgress}${run.isForgeAvailable ? '  •  Forge Ready' : ''}`, {
      fontSize: compactLayout ? '12px' : '13px',
      color: run.isForgeAvailable ? '#fef3c7' : '#93c5fd',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5)
    // Active effect summary is rendered here.
    this.add.text(rewardsPanelX - rewardsPanelW / 2 + 10, rewardsPanelY + 2, 'Active Effects  •  Tap to inspect', {
      fontSize: compactLayout ? '10px' : '11px',
      color: '#93c5fd',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5)
    this.add.text(rewardsPanelX - rewardsPanelW / 2 + 10, rewardsPanelY + 22, `${effectTerms.boon}: ${activeBoon ? activeBoon.name : effectTerms.none}`, {
      fontSize: compactLayout ? '12px' : '13px',
      color: activeBoon ? '#86efac' : '#94a3b8',
      fontStyle: 'bold',
      wordWrap: { width: rewardsPanelW - 20 },
    }).setOrigin(0, 0.5)
    this.add.text(rewardsPanelX - rewardsPanelW / 2 + 10, rewardsPanelY + 42, `${effectTerms.passives}: ${runAbilities.length}`, {
      fontSize: compactLayout ? '11px' : '12px',
      color: '#cbd5e1',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5)
    const effectInspectHit = this.add.rectangle(
      rewardsPanelX,
      rewardsPanelY + 12,
      rewardsPanelW - 12,
      rewardsPanelH - 20,
      0x000000,
      0.001,
    ).setInteractive({ useHandCursor: true })
    effectInspectHit.on('pointerdown', () => {
      // Effect inspection panel or overlay is triggered here.
      const effectLines = [
        `Boon: ${activeBoon ? activeBoon.name : 'None'}`,
        activeBoon ? activeBoon.description : 'No next-battle boon is active.',
        '',
        `Passives (${runAbilities.length})`,
        ...(runAbilities.length > 0
          ? runAbilities.map((ability, index) => `${index + 1}. ${ability.name} - ${ability.description}`)
          : ['None']),
        '',
        `Relics (${runRelics.length})`,
        ...(runRelics.length > 0
          ? runRelics.map((relic, index) => `${index + 1}. ${relic.name} - ${relic.description}`)
          : ['None']),
      ]
      this.showInfoListPanel(
        'Active Effects',
        'Boon = temporary next-battle effect • Passives = run-long hero effects',
        effectLines,
      )
    })

    this.add.text(width / 2, compactLayout ? 130 : 138, 'Choose a domain to begin this run path.', {
      fontSize: compactLayout ? '15px' : '16px',
      color: '#cbd5e1',
    }).setOrigin(0.5)

    this.renderPathPreview(compactLayout)

    // Domain selection UI is rendered as lightweight cards for each available/locked domain.
    this.renderDomainCards(compactLayout)
  }

  private renderPathPreview(compactLayout: boolean) {
    this.renderPathProgress(compactLayout, getDefaultRoutePath(), 0, compactLayout ? 230 : 248)
  }

  private renderDomainCards(compactLayout: boolean) {
    const { width, height } = this.scale
    const routes = ROUTE_SELECT_ROUTES
    const panelWidth = compactLayout ? 258 : 300
    const panelHeight = compactLayout ? 204 : 220
    const spacing = compactLayout ? panelWidth + 16 : panelWidth + 24
    const startX = width / 2 - ((routes.length - 1) * spacing) / 2

    routes.forEach((route, index) => {
      const x = startX + index * spacing
      this.createDomainCard(
        x,
        height / 2 + (compactLayout ? 80 : 72),
        panelWidth,
        panelHeight,
        compactLayout,
        route,
      )
    })
  }

  private createDomainCard(
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

    this.add.text(x, y + panelHeight / 2 - 18, isPlayable ? 'Enter Domain' : 'Locked', {
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
      this.handleDomainSelection(route.id)
    })
  }

  private handleDomainSelection(routeId: string) {
    // Domain -> route path transition: persist selected domain, then enter route progression scene.
    setSelectedRouteId(routeId)
    saveRun()
    this.scene.start('MapScene')
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
}
