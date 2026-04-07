export type RouteStatus = 'playable' | 'locked'

export type RouteContent = {
  id: string
  name: string
  theme: string
  status: RouteStatus
  bossId: string
  rewardHint: string
  signatureCardId: string | null
}

export const ROUTE_SELECT_ROUTES: RouteContent[] = [
  {
    id: 'ashen-march',
    name: 'Ashen March',
    theme: 'Burning ruins and ember beasts.',
    status: 'playable',
    bossId: 'corrupted-slime',
    rewardHint: 'Balanced rewards with card growth.',
    signatureCardId: 'ashen-crown-verdict',
  },
  {
    id: 'veil-of-thorns',
    name: 'Veil of Thorns',
    theme: 'Overgrown sanctum and thorn cultists.',
    status: 'locked',
    bossId: 'thorn-queen',
    rewardHint: 'Nature relic path. Locked for now.',
    signatureCardId: null,
  },
  {
    id: 'starforged-deep',
    name: 'Starforged Deep',
    theme: 'Fallen observatory and void echoes.',
    status: 'locked',
    bossId: 'star-sentinel',
    rewardHint: 'Arcane relic path. Coming soon.',
    signatureCardId: null,
  },
]

export function getRouteById(routeId: string | null | undefined): RouteContent | null {
  if (!routeId) {
    return null
  }

  return ROUTE_SELECT_ROUTES.find((route) => route.id === routeId) ?? null
}
