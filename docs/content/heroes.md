# Heroes Reference

## Purpose

Living reference for hero identity, current runtime implementation, and planned expansion.

## Currently Implemented Content

### Playable Hero Roster

- Playable heroes: 1
- Current hero identity in docs: Un1 (from first design sheet)
- Runtime implementation: single hero profile in run-state

### Runtime Hero State (v1)

Defined in `src/game/battle/runState.ts` at run start:

- Max HP: 40
- Current HP: 40
- Level: 1
- XP: 0

### Hero Build Inputs During Run

- Deck (`currentDeck`)
- Relics (`currentRelics`)
- Abilities (`currentAbilities`)
- Temporary next-battle boon (`currentBoonId`)

### Signature Resource

- Resource used in cards and combat: Ember
- Current status: implemented through card effects and combat resource handling

### Current Abilities (Ability Pool)

Defined in `src/game/content/abilities.ts` and surfaced through level-up choices:

- Cinder Core
- Steady Heart
- Horn Edge
- Warding Horn
- Rhythm Breath
- Golden Oath

### Current Design Direction

- Hero growth should come from combined layers (deck + abilities + shards/boons + level-ups).
- Keep hero expression readable and lightweight for short web sessions.
- Avoid heavyweight RPG systems (large talent trees/equipment grids) in the current phase.

## Current Planned Content

- Additional hero profiles: TBD
- Hero-specific visual/profile sheets: TBD
- Clear in-game hero identity panel outside card/relic/ability systems: TBD
- First-design-sheet passive wording for Un1 should be reconciled with actual runtime logic: TBD

## Balancing / Design Notes

- Direction docs prioritize hero growth during run (XP, level-up, abilities), not deck-only growth.
- Keep hero progression readable and lightweight for web sessions.
- Avoid introducing heavy RPG systems (large trees/equipment grids) in current scope.

## Open Questions / TODOs

- Confirm final in-game wording for Un1 identity and passive fantasy.
- Decide whether first-design-sheet passive becomes explicit runtime mechanic or remains flavor direction.
- Define when additional heroes enter scope versus content expansion for current hero.
