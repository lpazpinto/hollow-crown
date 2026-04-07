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

export const ROUTE_SELECT_ROUTES: RouteContent[] = [
  {
    id: 'ashen-march',
    name: 'Ashen March',
    theme: 'Burning ruins and ember beasts.',
    status: 'playable',
    bossId: 'corrupted-slime',
    rewardHint: 'Balanced rewards with card growth.',
    signatureCardId: 'ashen-crown-verdict',
    path: DEFAULT_ROUTE_PATH,
  },
  {
    id: 'veil-of-thorns',
    name: 'Veil of Thorns',
    theme: 'Overgrown sanctum and thorn cultists.',
    status: 'locked',
    bossId: 'thorn-queen',
    rewardHint: 'Nature relic path. Locked for now.',
    signatureCardId: null,
    path: DEFAULT_ROUTE_PATH,
  },
  {
    id: 'starforged-deep',
    name: 'Starforged Deep',
    theme: 'Fallen observatory and void echoes.',
    status: 'locked',
    bossId: 'star-sentinel',
    rewardHint: 'Arcane relic path. Coming soon.',
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
