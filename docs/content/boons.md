# Boons Reference

## Core Types

Defined in `src/game/content/boons.ts`:

- `BoonContent`: id, name, description, effectType, value
- Boons are temporary and apply to the next battle.

## Current Boon Pool

- Kindled Start: start next battle with +1 Ember
- Warded Step: start next battle with 5 Block
- Quick Draw: draw +1 card on turn 1 of next battle
- Mender's Sip: recover 4 HP at battle start
- Sharp Resolve: first attack gains +3 damage

## Runtime Flow

- Granted mostly via utility/rest node flow.
- Stored in run-state as `currentBoonId`.
- Consumed at battle start by `consumeCurrentBoonForBattle()`.
- Presented in map and battle UI with compact readable panels.
