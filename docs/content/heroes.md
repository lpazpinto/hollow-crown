# Heroes Reference

## Current Playable Hero State

The current prototype uses one playable hero profile tracked in run-state.

Baseline run values (`src/game/battle/runState.ts`):

- max HP: 40
- current HP at run start: 40
- level at run start: 1
- XP at run start: 0

## Hero Build Sources

Hero power is defined by:

- deck (`currentDeck`)
- relics (`currentRelics`)
- abilities (`currentAbilities`)
- temporary boon (`currentBoonId`)

## Starter Deck Snapshot

`src/game/content/cards.ts` starter deck:

- Unicorn Strike x3
- Golden Shield x3
- Charge x1
- Crown Diamonds x1

## Notes

- A distinct lore/profile sheet for multiple heroes is not yet implemented.
- This reference tracks the currently implemented hero runtime model.
