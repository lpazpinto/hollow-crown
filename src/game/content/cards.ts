import type { CardEffectType } from '../battle/battleLogic'

export type CardRarity = 'common' | 'uncommon' | 'rare'
export type RewardEncounterType = 'battle' | 'elite' | 'boss'

export type CardContent = {
  id: string
  title: string
  description: string
  effectType: CardEffectType
  value: number
  cost: number
  rarity: CardRarity
}

export const UN1_CARD_POOL: CardContent[] = [
  {
    id: 'unicorn-strike',
    title: 'Unicorn Strike',
    description: 'Deal 6 damage',
    effectType: 'damage',
    value: 6,
    cost: 1,
    rarity: 'common',
  },
  {
    id: 'golden-shield',
    title: 'Golden Shield',
    description: 'Gain 6 armor',
    effectType: 'armor',
    value: 6,
    cost: 1,
    rarity: 'common',
  },
  {
    id: 'ember-fire',
    title: 'Ember Fire',
    description: 'Deal 5 damage. If you have Ember, deal +3 damage',
    effectType: 'damage',
    value: 5,
    cost: 1,
    rarity: 'common',
  },
  {
    id: 'charge',
    title: 'Charge',
    description: 'Gain 3 armor. Draw 1 card',
    effectType: 'armor',
    value: 3,
    cost: 0,
    rarity: 'common',
  },
  {
    id: 'crown-diamonds',
    title: 'Crown Diamonds',
    description: 'Gain 2 armor, gain 1 Ember, and draw 1 card',
    effectType: 'armor',
    value: 2,
    cost: 1,
    rarity: 'common',
  },
  {
    id: 'double-strike',
    title: 'Double Strike',
    description: 'Deal 8 damage',
    effectType: 'damage',
    value: 8,
    cost: 2,
    rarity: 'common',
  },
  {
    id: 'silver-protection',
    title: 'Silver Protection',
    description: 'Gain 8 armor. If you played an Attack this turn, gain 1 Ember',
    effectType: 'armor',
    value: 8,
    cost: 1,
    rarity: 'uncommon',
  },
  {
    id: 'golden-horseshoe',
    title: 'Golden Horseshoe',
    description: 'Deal 9 damage',
    effectType: 'damage',
    value: 9,
    cost: 1,
    rarity: 'uncommon',
  },
  {
    id: 'reliquary-pulse',
    title: 'Reliquary Pulse',
    description: 'Spend all Ember. Gain 5 armor + 1 armor per Ember spent. Draw 1 card per Ember spent',
    effectType: 'armor',
    value: 5,
    cost: 1,
    rarity: 'rare',
  },
  {
    id: 'crownfall',
    title: 'Crownfall',
    description: 'Deal 12 damage. If you have Ember, spend 1 to deal +6 damage',
    effectType: 'damage',
    value: 12,
    cost: 2,
    rarity: 'rare',
  },
]

export const STARTER_DECK: CardContent[] = [
  makeStarterCard('unicorn-strike', 1),
  makeStarterCard('unicorn-strike', 2),
  makeStarterCard('unicorn-strike', 3),
  makeStarterCard('golden-shield', 1),
  makeStarterCard('golden-shield', 2),
  makeStarterCard('golden-shield', 3),
  makeStarterCard('charge', 1),
  makeStarterCard('crown-diamonds', 1),
]

export const REWARD_CARD_POOL: CardContent[] = UN1_CARD_POOL

const REWARD_RARITY_WEIGHTS: Record<RewardEncounterType, Record<CardRarity, number>> = {
  battle: {
    common: 70,
    uncommon: 25,
    rare: 5,
  },
  elite: {
    common: 45,
    uncommon: 40,
    rare: 15,
  },
  boss: {
    common: 20,
    uncommon: 50,
    rare: 30,
  },
}

export function generateRewardChoices(encounterType: RewardEncounterType): CardContent[] {
  const weights = REWARD_RARITY_WEIGHTS[encounterType]
  const availableCards = [...REWARD_CARD_POOL]
  const picks: CardContent[] = []

  while (picks.length < 3 && availableCards.length > 0) {
    const selected = pickCardForRewardSlot(weights, availableCards)
    if (!selected) {
      break
    }

    picks.push({ ...selected })
    const selectedIndex = availableCards.findIndex((card) => card.id === selected.id)
    availableCards.splice(selectedIndex, 1)
  }

  return picks
}

function makeStarterCard(baseId: string, index: number): CardContent {
  const template = UN1_CARD_POOL.find((card) => card.id === baseId)
  if (!template) {
    throw new Error(`Starter card template not found: ${baseId}`)
  }

  return {
    ...template,
    id: `${template.id}-starter-${index}`,
  }
}

function pickCardForRewardSlot(
  weights: Record<CardRarity, number>,
  availableCards: CardContent[],
): CardContent | null {
  const rolledRarity = rollRarity(weights)
  const rarityOrder = getFallbackOrder(rolledRarity)

  for (const rarity of rarityOrder) {
    const candidates = availableCards.filter((card) => card.rarity === rarity)
    if (candidates.length > 0) {
      return candidates[Math.floor(Math.random() * candidates.length)]
    }
  }

  if (availableCards.length === 0) {
    return null
  }

  return availableCards[Math.floor(Math.random() * availableCards.length)]
}

function rollRarity(
  weights: Record<CardRarity, number>,
): CardRarity {
  const totalWeight = weights.common + weights.uncommon + weights.rare
  let roll = Math.random() * totalWeight

  for (const rarity of ['common', 'uncommon', 'rare'] as CardRarity[]) {
    roll -= weights[rarity]
    if (roll <= 0) {
      return rarity
    }
  }

  return 'rare'
}

function getFallbackOrder(rolledRarity: CardRarity): CardRarity[] {
  if (rolledRarity === 'common') {
    return ['common', 'uncommon', 'rare']
  }

  if (rolledRarity === 'uncommon') {
    return ['uncommon', 'common', 'rare']
  }

  return ['rare', 'uncommon', 'common']
}

export const STARTER_HAND = STARTER_DECK
export const CURRENT_HAND = STARTER_DECK