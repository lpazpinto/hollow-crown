# Relics Reference

## Purpose

Living reference for relic content, reveal behavior, and reward-direction constraints.

## Currently Implemented Content

### Data Model

Defined in `src/game/content/relics.ts`:

- `RelicContent`: id, name, description, effectType, value

### Implemented Relics

- Ember Ring: gain 1 Ember at battle start
- Worn Buckler: first block gain each combat gets bonus block
- Rat Fang: first attack each combat gains bonus damage
- Crown Shard: extra draw every third turn
- Pilgrim Lantern: heal after elite/boss victories

### Acquisition Flow (Current)

- Primary source: elite reward scene (`RelicRewardScene`)
- Run-state storage: `currentRelics`

### Hidden-Reward Direction (Current)

- Route map should telegraph relic category/opportunity, not exact relic identity.
- Exact relic is revealed only when reward is granted/resolved.

### Current Reveal Labels for Route Telegraphing

- Mysterious Relic
- Relic Cache
- Corrupted Reliquary
- Shrine Reward

## Current Planned Content

- Domain-specific relic pools by route/domain: TBD
- More relic variety per effect family: TBD
- Non-elite relic acquisition methods beyond current scope: TBD

## Balancing / Design Notes

- Relics should be passive and readable in one line.
- Keep relic effects compact and easy to reason about during quick web sessions.
- Preserve mystery/anticipation in route telegraphing by hiding exact relic identity.

## Open Questions / TODOs

- Confirm when locked-domain relic pools are ready for implementation.
- Decide if rarity tiers for relics are needed or intentionally avoided.
- Define whether shard-forge outcomes can include relic-adjacent rewards in future versions.
