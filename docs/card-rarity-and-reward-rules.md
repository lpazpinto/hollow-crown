# Card Rarity and Reward Rules

## Goal

Keep the first version of the game easy to understand, while still making rewards feel exciting and varied during a run.

This document defines:

- card rarity tiers
- starter deck size
- how rewards are generated
- how often each rarity should appear

---

## Card Rarity Tiers

For v1, the game uses 3 rarity tiers:

- Common
- Uncommon
- Rare

We are intentionally not using Epic / Legendary in the first version.

### Design intent

- **Common** cards are simple, reliable, and easy to understand.
- **Uncommon** cards introduce stronger synergy or more specialized effects.
- **Rare** cards are stronger payoff cards and should feel exciting when they appear.

---

## Starter Deck Philosophy

The hero should **not** begin the run with all cards from the first design sheet.

Instead:

- the hero has an initial **card pool** of 10 designed cards
- the **starter deck** begins with 8 cards
- the remaining cards can appear as rewards during the run

This helps:
- keep early turns simple
- make post-battle rewards more exciting
- avoid giving the player every tool immediately
- support repeated simple cards in the starting deck

---

## Starter Deck Size

For v1, the starter deck should have **8 cards**.

### Initial recommended starter deck for Un1

- 3x Chifrada de Unicórnio
- 3x Escudo Dourado
- 1x Investida
- 1x Diamantes da Coroa

This gives the player:
- repeated basic attack/defense cards
- simple early decisions
- a stable deck size
- room to grow through rewards

---

## Initial Rarity Assignment for Un1 Card Pool

### Common
- Chifrada de Unicórnio
- Escudo Dourado
- Investida
- Diamantes da Coroa
- Fogo em Brasa
- Chifrada Dupla

### Uncommon
- Proteção Prateada
- Ferradura Dourada

### Rare
- Pulso do Relicário
- Queda da Coroa

---

## Reward Generation Rules

A reward screen shows **3 card options**.

### General rules

- reward cards should be **unique within the same reward screen**
- cards already shown in the same reward screen cannot be shown twice
- the system should select a rarity first, then pick a random card from that rarity pool
- if no valid card exists in the selected rarity pool, the system should fall back to another pool

### Fallback rule

If the selected rarity has no available valid card:

1. try the next lower rarity
2. if still unavailable, try the next higher rarity
3. if still unavailable, choose any valid card from the global reward pool

---

## Reward Rarity Frequency

For v1, reward rarity should depend on the encounter type.

### Normal Battle Reward
- Common: 70%
- Uncommon: 25%
- Rare: 5%

### Elite Battle Reward
- Common: 45%
- Uncommon: 40%
- Rare: 15%

### Boss Reward
Bosses should primarily reward relics or end-of-run progression, not normal card rewards.

If a boss card reward is ever used:
- Common: 20%
- Uncommon: 50%
- Rare: 30%

---

## How a Reward Screen Is Generated

For each of the 3 reward slots:

1. roll rarity based on the current encounter type
2. pick a random valid card from that rarity pool
3. exclude already chosen cards for this reward screen
4. repeat until 3 unique reward cards are generated

---

## Duplicate Rules

For v1:

- duplicates are allowed across the run
- duplicates are allowed in the player deck
- duplicates are **not** allowed within the same reward screen

This keeps implementation simple and supports deckbuilding growth.

---

## Design Notes

### Why 8 starting cards instead of 10?

Because the run already gives card rewards after battles.

If the player starts with all designed cards:
- rewards feel less meaningful
- the deck grows too fast
- the game becomes more complex too early

### Why only 3 rarities?

Because v1 should stay easy to balance and easy to read.

Three tiers are enough to:
- create excitement
- control reward frequency
- define power bands
- support future expansion

---

## Implementation Notes

Recommended fields for card data:

- id
- title
- description
- cost
- rarity
- effectType
- value

Recommended reward generation input:

- encounterType
- candidate card pool
- already selected reward ids

Recommended encounter types for reward generation:

- battle
- elite
- boss

---

## Future Extensions

Possible future improvements after v1:

- floor-based rarity scaling
- character-specific reward bias
- synergy-weighted rewards
- removing starter basics from late reward pools
- upgraded cards
- rarity-specific card frames/colors
