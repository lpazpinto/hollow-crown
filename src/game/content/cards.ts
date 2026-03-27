import type { CardEffectType } from '../battle/battleLogic'

export type CardRarity = 'common' | 'uncommon' | 'rare'

export type CardContent = {
  id: string
  title: string
  description: string
  effectType: CardEffectType
  value: number
  cost: number
  rarity: CardRarity
}

export const STARTER_DECK: CardContent[] = [
  {
    id: 'strike-1',
    title: 'Strike',
    description: 'Deal 6 damage',
    effectType: 'damage',
    value: 6,
    cost: 1,
    rarity: 'common',
  },
  {
    id: 'strike-2',
    title: 'Strike',
    description: 'Deal 6 damage',
    effectType: 'damage',
    value: 6,
    cost: 1,
    rarity: 'common',
  },
  {
    id: 'strike-3',
    title: 'Strike',
    description: 'Deal 6 damage',
    effectType: 'damage',
    value: 6,
    cost: 1,
    rarity: 'common',
  },
  {
    id: 'strike-4',
    title: 'Strike',
    description: 'Deal 6 damage',
    effectType: 'damage',
    value: 6,
    cost: 1,
    rarity: 'common',
  },
  {
    id: 'strike-5',
    title: 'Strike',
    description: 'Deal 6 damage',
    effectType: 'damage',
    value: 6,
    cost: 1,
    rarity: 'common',
  },
  {
    id: 'defend-1',
    title: 'Defend',
    description: 'Gain 5 armor',
    effectType: 'armor',
    value: 5,
    cost: 1,
    rarity: 'common',
  },
  {
    id: 'defend-2',
    title: 'Defend',
    description: 'Gain 5 armor',
    effectType: 'armor',
    value: 5,
    cost: 1,
    rarity: 'common',
  },
  {
    id: 'defend-3',
    title: 'Defend',
    description: 'Gain 5 armor',
    effectType: 'armor',
    value: 5,
    cost: 1,
    rarity: 'common',
  },
]

export const REWARD_CARD_POOL: CardContent[] = [
  {
    id: 'spark-reward',
    title: 'Spark',
    description: 'Deal 4 damage',
    effectType: 'damage',
    value: 4,
    cost: 0,
    rarity: 'common',
  },
  {
    id: 'jab-reward',
    title: 'Jab',
    description: 'Deal 5 damage',
    effectType: 'damage',
    value: 5,
    cost: 1,
    rarity: 'common',
  },
  {
    id: 'guard-reward',
    title: 'Guard',
    description: 'Gain 6 armor',
    effectType: 'armor',
    value: 6,
    cost: 1,
    rarity: 'common',
  },
  {
    id: 'cleave-reward',
    title: 'Cleave',
    description: 'Deal 10 damage',
    effectType: 'damage',
    value: 10,
    cost: 2,
    rarity: 'uncommon',
  },
  {
    id: 'barrier-reward',
    title: 'Barrier',
    description: 'Gain 8 armor',
    effectType: 'armor',
    value: 8,
    cost: 2,
    rarity: 'uncommon',
  },
  {
    id: 'focus-strike-reward',
    title: 'Focus Strike',
    description: 'Deal 8 damage',
    effectType: 'damage',
    value: 8,
    cost: 1,
    rarity: 'uncommon',
  },
  {
    id: 'steelwall-reward',
    title: 'Steelwall',
    description: 'Gain 11 armor',
    effectType: 'armor',
    value: 11,
    cost: 2,
    rarity: 'uncommon',
  },
  {
    id: 'inferno-reward',
    title: 'Inferno',
    description: 'Deal 14 damage',
    effectType: 'damage',
    value: 14,
    cost: 2,
    rarity: 'rare',
  },
  {
    id: 'fortress-reward',
    title: 'Fortress',
    description: 'Gain 16 armor',
    effectType: 'armor',
    value: 16,
    cost: 2,
    rarity: 'rare',
  },
]

export type RewardEncounterType = 'battle' | 'elite'

const REWARD_RARITY_WEIGHTS: Record<RewardEncounterType, Record<CardRarity, number>> = {
  battle: {
    common: 70,
    uncommon: 24,
    rare: 6,
  },
  elite: {
    common: 45,
    uncommon: 40,
    rare: 15,
  },
}

export function generateRewardChoices(encounterType: RewardEncounterType): CardContent[] {
  const weights = REWARD_RARITY_WEIGHTS[encounterType]
  const availableCards = [...REWARD_CARD_POOL]
  const picks: CardContent[] = []

  while (picks.length < 3 && availableCards.length > 0) {
    const availableRarities = getAvailableRarities(availableCards)
    const chosenRarity = pickRarity(weights, availableRarities)
    const candidates = availableCards.filter((card) => card.rarity === chosenRarity)
    const selected = candidates[Math.floor(Math.random() * candidates.length)]

    picks.push({ ...selected })

    const selectedIndex = availableCards.findIndex((card) => card.id === selected.id)
    availableCards.splice(selectedIndex, 1)
  }

  return picks
}

function getAvailableRarities(cards: CardContent[]): CardRarity[] {
  const raritySet = new Set<CardRarity>()
  cards.forEach((card) => raritySet.add(card.rarity))
  return Array.from(raritySet)
}

function pickRarity(
  weights: Record<CardRarity, number>,
  availableRarities: CardRarity[],
): CardRarity {
  const totalWeight = availableRarities.reduce((sum, rarity) => sum + weights[rarity], 0)
  let roll = Math.random() * totalWeight

  for (const rarity of availableRarities) {
    roll -= weights[rarity]
    if (roll <= 0) {
      return rarity
    }
  }

  return availableRarities[availableRarities.length - 1]
}

export const STARTER_HAND = STARTER_DECK
export const CURRENT_HAND = STARTER_DECK