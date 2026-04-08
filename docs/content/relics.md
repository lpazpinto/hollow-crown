# Relics Reference

## Core Types

Defined in `src/game/content/relics.ts`:

- `RelicContent`: id, name, description, effectType, value

## Current Relic Pool

- Ember Ring: battle-start ember gain
- Worn Buckler: first block bonus
- Rat Fang: first attack bonus damage
- Crown Shard: extra draw every third turn
- Pilgrim Lantern: heal after elite/boss victories

## Acquisition

- Primary flow: elite reward scene (`RelicRewardScene`)
- Stored in run-state as `currentRelics`
