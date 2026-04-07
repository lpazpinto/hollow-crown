export type RouteStatus = 'playable' | 'locked'

export type RouteNodeType =
  | 'battle'
  | 'battle_or_utility'
  | 'utility_or_special'
  | 'elite'
  | 'recovery'
  | 'boss'

export type RouteContent = {
  id: string
  name: string
  theme: string
  status: RouteStatus
  bossId: string
  rewardHint: string
  signatureCardId: string | null
  path: RouteNodeType[]
}

const DEFAULT_ROUTE_PATH: RouteNodeType[] = [
  'battle',
  'battle_or_utility',
  'battle',
  'utility_or_special',
  'elite',
  'recovery',
  'boss',
]

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
    path: DEFAULT_ROUTE_PATH,
  },
  {
    id: 'veil-of-thorns',
    name: 'Veil of Thorns',
    theme: 'Briar sanctum watched by thornbound zealots.',
    status: 'locked',
    bossId: 'thorn-queen',
    rewardHint: 'Sealed domain. Verdant relics await beyond.',
    signatureCardId: null,
    path: DEFAULT_ROUTE_PATH,
  },
  {
    id: 'starforged-deep',
    name: 'Starforged Deep',
    theme: 'Collapsed observatory lit by cold starglass.',
    status: 'locked',
    bossId: 'star-sentinel',
    rewardHint: 'Unknown route. Arcane vaults remain sealed.',
    signatureCardId: null,
    path: DEFAULT_ROUTE_PATH,
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
  return firstPlayableRoute?.path ?? DEFAULT_ROUTE_PATH
}

export function getRoutePathById(routeId: string | null | undefined): RouteNodeType[] {
  const route = getRouteById(routeId)
  return route?.path ?? getDefaultRoutePath()
}

export function getRouteNodeLabel(nodeType: RouteNodeType): string {
  if (nodeType === 'battle') return 'Battle'
  if (nodeType === 'battle_or_utility') return 'Battle / Utility'
  if (nodeType === 'utility_or_special') return 'Utility / Special'
  if (nodeType === 'elite') return 'Elite'
  if (nodeType === 'recovery') return 'Recovery'
  return 'Boss'
}
