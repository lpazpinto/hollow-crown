# Run State and Save

## Purpose

Reference for persistent run-state and save/load compatibility.

## Run State Source

- Primary state model: `src/game/battle/runState.ts`
- Save I/O and validation: `src/game/battle/runSave.ts`

## Key Stored Data

- Route selection and graph progression fields.
- Deck, relics, abilities.
- Hero HP/max HP, XP, level, pending level-ups.
- Shards and forge availability.
- Current boon ownership.
- Encounter context and run completion state.

## Save Behavior

- Save key: `hollow-crown-run` in `localStorage`.
- Save writes happen at important transitions (map, rewards, level-up progression, etc.).
- Load validates shape and field types before restore.
- Invalid/corrupt saves are ignored and cleared safely.

## Compatibility Notes

- `normalizeRunState()` backfills defaults for newer fields.
- Route layout IDs are deterministic enough to rebuild procedural paths.
- Route floor/step values are clamped and corrected.
- Shard and forge state are normalized to valid ranges.
