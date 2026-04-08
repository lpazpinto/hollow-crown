# Cards Reference

## Core Types

Defined in `src/game/content/cards.ts`:

- `CardContent`: id, title, description, effectType, value, cost, optional emberCost, rarity
- Rarities: common, uncommon, rare

## Card Pools

- Main pool: `UN1_CARD_POOL`
- Starter deck: `STARTER_DECK`
- Reward pool: `REWARD_CARD_POOL`
- Signature card pool includes:
  - Ashen Crown Verdict

## Reward Choice Weights

By encounter reward type:

- battle: common 70, uncommon 25, rare 5
- elite: common 45, uncommon 40, rare 15
- boss: common 20, uncommon 50, rare 30

## Upgrade Rules

Card upgrade behavior is data-rule based in `createUpgradedCard()`:

- some cards reduce cost on upgrade
- others gain value
- descriptions are recalculated for upgraded output

## Notable Cards in Current Pool

Common:

- Unicorn Strike
- Golden Shield
- Ember Fire
- Charge
- Crown Diamonds
- Double Strike

Uncommon:

- Silver Protection
- Golden Horseshoe

Rare:

- Reliquary Pulse
- Crownfall

Boss signature:

- Ashen Crown Verdict
