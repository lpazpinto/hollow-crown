export type RouteStatus = 'playable' | 'locked'

export type RouteNodeType =
  | 'battle'
  | 'battle_or_utility'
  | 'utility_or_special'
  | 'elite'
  | 'recovery'
  | 'boss'

export type RouteEncounterType = 'battle' | 'rest' | 'elite' | 'boss'

export type RouteGraphNode = {
  id: string
  label: string
  encounterType: RouteEncounterType
  nextNodeIds: string[]
}

export type RouteGraphLayout = {
  id: string
  startNodeId: string
  nodes: RouteGraphNode[]
}

export type RouteContent = {
  id: string
  name: string
  theme: string
  status: RouteStatus
  bossId: string
  rewardHint: string
  signatureCardId: string | null
  graphLayouts: RouteGraphLayout[]
}

const ASHEN_ROUTE_LAYOUT_A: RouteGraphLayout = {
  id: 'ashen-a',
  startNodeId: 'start',
  nodes: [
    { id: 'start', label: 'Scorched Crossing', encounterType: 'battle', nextNodeIds: ['fork-battle', 'fork-rest'] },
    { id: 'fork-battle', label: 'Char Patrol', encounterType: 'battle', nextNodeIds: ['mid-battle'] },
    { id: 'fork-rest', label: 'Mire Refuge', encounterType: 'rest', nextNodeIds: ['mid-battle'] },
    { id: 'mid-battle', label: 'Bog Ambush', encounterType: 'battle', nextNodeIds: ['lane-rest', 'lane-battle'] },
    { id: 'lane-rest', label: 'Ash Shrine', encounterType: 'rest', nextNodeIds: ['elite-gate'] },
    { id: 'lane-battle', label: 'Tarbound Hunt', encounterType: 'battle', nextNodeIds: ['elite-gate'] },
    { id: 'elite-gate', label: 'Knight of Cinders', encounterType: 'elite', nextNodeIds: ['recovery'] },
    { id: 'recovery', label: 'Mire Camp', encounterType: 'rest', nextNodeIds: ['boss'] },
    { id: 'boss', label: 'Crown Slime Heart', encounterType: 'boss', nextNodeIds: [] },
  ],
}

const ASHEN_ROUTE_LAYOUT_B: RouteGraphLayout = {
  id: 'ashen-b',
  startNodeId: 'start',
  nodes: [
    { id: 'start', label: 'Mire Edge', encounterType: 'battle', nextNodeIds: ['upper-battle', 'lower-rest'] },
    { id: 'upper-battle', label: 'Soot Marauders', encounterType: 'battle', nextNodeIds: ['upper-rest'] },
    { id: 'lower-rest', label: 'Sunken Chapel', encounterType: 'rest', nextNodeIds: ['lower-battle'] },
    { id: 'lower-battle', label: 'Swamp Striders', encounterType: 'battle', nextNodeIds: ['merge-elite'] },
    { id: 'upper-rest', label: 'Kindling Pool', encounterType: 'rest', nextNodeIds: ['merge-elite'] },
    { id: 'merge-elite', label: 'Mire Warden', encounterType: 'elite', nextNodeIds: ['prep'] },
    { id: 'prep', label: 'Ember Encampment', encounterType: 'rest', nextNodeIds: ['boss'] },
    { id: 'boss', label: 'Corrupted Slime', encounterType: 'boss', nextNodeIds: [] },
  ],
}

const LOCKED_ROUTE_LAYOUT: RouteGraphLayout = {
  id: 'locked-a',
  startNodeId: 'start',
  nodes: [
    { id: 'start', label: 'Approach', encounterType: 'battle', nextNodeIds: ['choice'] },
    { id: 'choice', label: 'Crossroads', encounterType: 'battle', nextNodeIds: ['mid'] },
    { id: 'mid', label: 'Depths', encounterType: 'battle', nextNodeIds: ['event'] },
    { id: 'event', label: 'Ritual Site', encounterType: 'rest', nextNodeIds: ['elite'] },
    { id: 'elite', label: 'Champion', encounterType: 'elite', nextNodeIds: ['prep'] },
    { id: 'prep', label: 'Sanctum', encounterType: 'rest', nextNodeIds: ['boss'] },
    { id: 'boss', label: 'Domain Ruler', encounterType: 'boss', nextNodeIds: [] },
  ],
}

// Route Select flavor source of truth: name, short theme line, boss pairing, and reward hint.
export const ROUTE_SELECT_ROUTES: RouteContent[] = [
  {
    id: 'ashen-march',
    name: 'Ashen Mire',
    theme: 'Sooted wetlands where crown-slime gathers.',
    status: 'playable',
    bossId: 'corrupted-slime',
    rewardHint: 'Endure the mire and claim ember-forged power.',
    signatureCardId: 'ashen-crown-verdict',
    graphLayouts: [ASHEN_ROUTE_LAYOUT_A, ASHEN_ROUTE_LAYOUT_B],
  },
  {
    id: 'veil-of-thorns',
    name: 'Veil of Thorns',
    theme: 'Briar sanctum watched by thornbound zealots.',
    status: 'locked',
    bossId: 'thorn-queen',
    rewardHint: 'Sealed domain. Verdant relics await beyond.',
    signatureCardId: null,
    graphLayouts: [LOCKED_ROUTE_LAYOUT],
  },
  {
    id: 'starforged-deep',
    name: 'Starforged Deep',
    theme: 'Collapsed observatory lit by cold starglass.',
    status: 'locked',
    bossId: 'star-sentinel',
    rewardHint: 'Unknown route. Arcane vaults remain sealed.',
    signatureCardId: null,
    graphLayouts: [LOCKED_ROUTE_LAYOUT],
  },
]

export function getRouteById(routeId: string | null | undefined): RouteContent | null {
  if (!routeId) {
    return null
  }

  return ROUTE_SELECT_ROUTES.find((route) => route.id === routeId) ?? null
}

export function getDefaultRoutePath(): RouteNodeType[] {
  const firstPlayableRoute = ROUTE_SELECT_ROUTES.find((route) => route.status === 'playable')
  const layout = firstPlayableRoute?.graphLayouts[0]
  if (!firstPlayableRoute || !layout) {
    return ['battle', 'battle_or_utility', 'battle', 'utility_or_special', 'elite', 'recovery', 'boss']
  }

  return summarizeLayoutToPath(layout)
}

export function getRoutePathById(routeId: string | null | undefined, layoutId?: string | null): RouteNodeType[] {
  const route = getRouteById(routeId)
  if (!route) {
    return getDefaultRoutePath()
  }

  const layout = getRouteLayoutById(route.id, layoutId) ?? route.graphLayouts[0]
  return summarizeLayoutToPath(layout)
}

export function getDefaultRouteLayoutId(routeId: string | null | undefined): string | null {
  const route = getRouteById(routeId)
  return route?.graphLayouts[0]?.id ?? null
}

export function pickRandomRouteLayoutId(routeId: string | null | undefined): string | null {
  const route = getRouteById(routeId)
  if (!route || route.graphLayouts.length === 0) {
    return null
  }

  const index = Math.floor(Math.random() * route.graphLayouts.length)
  return route.graphLayouts[index].id
}

export function getRouteLayoutById(routeId: string | null | undefined, layoutId?: string | null): RouteGraphLayout | null {
  const route = getRouteById(routeId)
  if (!route || route.graphLayouts.length === 0) {
    return null
  }

  if (!layoutId) {
    return route.graphLayouts[0]
  }

  return route.graphLayouts.find((layout) => layout.id === layoutId) ?? route.graphLayouts[0]
}

export function getRouteChoiceNodes(
  routeId: string | null | undefined,
  layoutId: string | null | undefined,
  nodeIds: string[],
): RouteGraphNode[] {
  const layout = getRouteLayoutById(routeId, layoutId)
  if (!layout) {
    return []
  }

  return nodeIds
    .map((nodeId) => layout.nodes.find((node) => node.id === nodeId))
    .filter((node): node is RouteGraphNode => Boolean(node))
}

export function getRouteNodeById(
  routeId: string | null | undefined,
  layoutId: string | null | undefined,
  nodeId: string,
): RouteGraphNode | null {
  const layout = getRouteLayoutById(routeId, layoutId)
  if (!layout) {
    return null
  }

  return layout.nodes.find((node) => node.id === nodeId) ?? null
}

export function getRouteNodeIdsForStep(
  routeId: string | null | undefined,
  layoutId: string | null | undefined,
  step: number,
): string[] {
  const layout = getRouteLayoutById(routeId, layoutId)
  if (!layout) {
    return []
  }

  const analysis = analyzeRouteLayout(layout)
  const targetStep = Math.max(0, step)
  return analysis.nodesByDepth[targetStep]?.map((node) => node.id) ?? []
}

export function getRouteNodeLabel(nodeType: RouteNodeType): string {
  if (nodeType === 'battle') return 'Battle'
  if (nodeType === 'battle_or_utility') return 'Battle / Utility'
  if (nodeType === 'utility_or_special') return 'Utility / Special'
  if (nodeType === 'elite') return 'Elite'
  if (nodeType === 'recovery') return 'Recovery'
  return 'Boss'
}

function summarizeLayoutToPath(layout: RouteGraphLayout): RouteNodeType[] {
  const analysis = analyzeRouteLayout(layout)
  const depths = Object.keys(analysis.nodesByDepth)
    .map((value) => Number(value))
    .sort((a, b) => a - b)

  return depths.map((depth) => summarizeDepthNodes(analysis.nodesByDepth[depth]))
}

function summarizeDepthNodes(nodes: RouteGraphNode[]): RouteNodeType {
  const encounterTypes = new Set(nodes.map((node) => node.encounterType))

  if (encounterTypes.has('boss')) return 'boss'
  if (encounterTypes.has('elite')) return 'elite'
  if (encounterTypes.has('battle') && encounterTypes.has('rest')) return 'battle_or_utility'
  if (encounterTypes.has('battle')) return 'battle'

  return 'utility_or_special'
}

function analyzeRouteLayout(layout: RouteGraphLayout): {
  depthById: Record<string, number>
  nodesByDepth: Record<number, RouteGraphNode[]>
} {
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

  const nodesByDepth: Record<number, RouteGraphNode[]> = {}
  layout.nodes.forEach((node) => {
    const depth = depthById[node.id] ?? 0
    nodesByDepth[depth] = [...(nodesByDepth[depth] ?? []), node]
  })

  return { depthById, nodesByDepth }
}
