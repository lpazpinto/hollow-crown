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
    id: 'chifrada-de-unicornio',
    title: 'Chifrada de Unicórnio',
    description: 'Cause 6 de dano',
    effectType: 'damage',
    value: 6,
    cost: 1,
    rarity: 'common',
  },
  {
    id: 'escudo-dourado',
    title: 'Escudo Dourado',
    description: 'Ganhe 7 de bloqueio',
    effectType: 'armor',
    value: 7,
    cost: 1,
    rarity: 'common',
  },
  {
    id: 'fogo-em-brasa',
    title: 'Fogo em Brasa',
    description: 'Cause 5 de dano. Se você tiver Brasa, cause +3 de dano',
    effectType: 'damage',
    value: 5,
    cost: 1,
    rarity: 'common',
  },
  {
    id: 'investida',
    title: 'Investida',
    description: 'Ganhe 4 de bloqueio. Compre 1 carta',
    effectType: 'armor',
    value: 4,
    cost: 0,
    rarity: 'common',
  },
  {
    id: 'diamantes-da-coroa',
    title: 'Diamantes da Coroa',
    description: 'Ganhe 1 Brasa. Compre 1 carta',
    effectType: 'armor',
    value: 2,
    cost: 1,
    rarity: 'common',
  },
  {
    id: 'chifrada-dupla',
    title: 'Chifrada Dupla',
    description: 'Cause 4 de dano duas vezes',
    effectType: 'damage',
    value: 8,
    cost: 1,
    rarity: 'common',
  },
  {
    id: 'protecao-prateada',
    title: 'Proteção Prateada',
    description: 'Ganhe 9 de bloqueio. Se você jogou um Ataque neste turno, ganhe 1 Brasa',
    effectType: 'armor',
    value: 9,
    cost: 1,
    rarity: 'uncommon',
  },
  {
    id: 'ferradura-dourada',
    title: 'Ferradura Dourada',
    description: 'Cause 7 de dano e aplique 2 de Queimadura',
    effectType: 'damage',
    value: 7,
    cost: 1,
    rarity: 'uncommon',
  },
  {
    id: 'pulso-do-relicario',
    title: 'Pulso do Relicário',
    description: 'Gaste toda a sua Brasa. Ganhe 5 de bloqueio e compre 1 carta para cada Brasa gasta',
    effectType: 'armor',
    value: 5,
    cost: 1,
    rarity: 'rare',
  },
  {
    id: 'queda-da-coroa',
    title: 'Queda da Coroa',
    description: 'Cause 12 de dano. Gaste 1 Brasa para causar +6 de dano',
    effectType: 'damage',
    value: 12,
    cost: 2,
    rarity: 'rare',
  },
]

export const STARTER_DECK: CardContent[] = [
  makeStarterCard('chifrada-de-unicornio', 1),
  makeStarterCard('chifrada-de-unicornio', 2),
  makeStarterCard('chifrada-de-unicornio', 3),
  makeStarterCard('escudo-dourado', 1),
  makeStarterCard('escudo-dourado', 2),
  makeStarterCard('escudo-dourado', 3),
  makeStarterCard('investida', 1),
  makeStarterCard('diamantes-da-coroa', 1),
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