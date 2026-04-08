# Enemies Reference

## Purpose

Living reference for enemy roster, intent style, and expansion planning.

## Currently Implemented Content

### Data Model

Defined in `src/game/content/enemies.ts`:

- `EnemyContent`: id, name, tier, maxHp, initialIntent, intents, optional `phaseTwoIntents`
- `EnemyIntent` with structured action fields
- Tiers: common, elite, boss

### Normal Enemies

- Hollow Rat
- Thorn Acolyte
- Ruin Beetle

### Elites

- Ashen Knight

### Bosses

- Corrupted Slime (phase two enabled)

### Intent Style (Current)

`getEnemyIntentActions()` normalizes intent into ordered action parts:

1. attack
2. armor
3. burn
4. poison
5. reflect

This order is shared by both preview UI and combat resolution.

## Current Planned Content

- Additional elite and boss rosters for locked domains: TBD
- Domain-aligned enemy pool expansion (Ashen Mire vs future domains): TBD
- Additional boss mechanics beyond simple phase escalation: TBD

## Balancing / Design Notes

- Playtest direction calls for stronger early pressure than the first prototype.
- Intent readability remains a top requirement; avoid opaque action chains.
- Keep v1 enemies as small intent cycles rather than complex AI.

## Open Questions / TODOs

- Confirm target enemy count per domain for next content drop.
- Confirm if poison/reflect are expanded across more enemies in near-term scope.
- Define when minion/summon style boss behavior enters implementation (currently TBD).
