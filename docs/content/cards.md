# Cards Reference

## Purpose

Living reference for card data, reward usage, and current content scope.

## Currently Implemented Content

### Data Model

Defined in `src/game/content/cards.ts`:

- `CardContent`: id, title, description, effectType, value, cost, optional emberCost, rarity
- Card UI type system: `attack | defense | utility` (resolved by `getCardType()`)
- Rarity tiers: common, uncommon, rare
- Reward encounter types: battle, elite, boss

### Card Type Rules (UI + Frame)

- `attack`: direct damage-focused cards
- `defense`: armor/protection-focused cards
- `utility`: setup, draw, ember management, or hybrid tempo cards

Current explicit utility overrides in implementation:

- Charge
- Crown Diamonds
- Reliquary Pulse

### Cost Types

- Energy cost (`cost`) is the base card-play cost type.
- Ember requirement (`emberCost`) is optional and currently used on selected cards.

### Starter Deck (Run Start)

- Unicorn Strike x3
- Golden Shield x3 (Defense, blue frame)
- Charge x1 (Utility, green frame)
- Crown Diamonds x1 (Utility, green frame)

### Implemented Reward/Pool Content

Main card pool (`UN1_CARD_POOL`):

- Common: Unicorn Strike, Golden Shield, Ember Fire, Charge, Crown Diamonds, Double Strike
- Uncommon: Silver Protection, Golden Horseshoe
- Rare: Reliquary Pulse, Crownfall

Signature card currently implemented:

- Ashen Crown Verdict

### Reward Rarity Weights (Current)

- Battle: common 70, uncommon 25, rare 5
- Elite: common 45, uncommon 40, rare 15
- Boss: common 20, uncommon 50, rare 30

### Upgrade Behavior (Current)

- Implemented in `createUpgradedCard()`.
- Some cards reduce cost on upgrade; others increase value.
- Descriptions are recalculated for upgraded values.

## Current Planned Content

- Additional card families by domain/theme: TBD
- Clear shard-payoff themed card package split (offense/defense/utility): direction set, exact package TBD
- More signature boss cards for additional domains: TBD

## Balancing / Design Notes

- Direction docs specify less permanent-card spam from normal battles.
- Card growth is intended to be layered with XP/level-up/boons/shards, not deck-only scaling.
- Keep card wording concise and web-friendly.

## Open Questions / TODOs

- Confirm whether consumable/potion-like cards enter v1.5 or later.
- Define late-run reward bias rules (if any) for avoiding over-repeated basics.
- Decide if domain-specific reward pools are introduced before additional heroes.
