# Level-Up Flow

## Purpose

Focused reference for XP thresholds, pending level-up handling, and level-up scene choices.

## Implemented Flow

1. Encounters grant XP by encounter type.
2. When XP crosses threshold, pending level-up count is increased.
3. On post-encounter routing, level-up scene is inserted before the next destination.
4. Player picks one growth option.
5. Pending level-up count is consumed; flow continues.

## Implemented Level-Up Choices

- Upgrade a card
- Gain a passive ability
- Stabilize (max HP gain + heal)

## Runtime Anchors

- XP thresholds and level bookkeeping: `src/game/battle/runState.ts`
- Level-up scene and option UX: `src/game/scenes/LevelUpScene.ts`

## Planned / In Progress

- Expanded level-up option variety: TBD
- Additional pacing/balance tuning for threshold feel: in progress
- More direct visual explanation of level-up impact: TBD

## Design Notes

- Level-ups are intended as meaningful but lightweight run growth.
- The system should complement deck rewards, not replace or overwhelm them.
- Avoid complex tree/talent UI in current scope.

## Open Questions / TODOs

- Confirm target number of level-ups per average run after latest route pacing changes.
- Confirm if level-up options should vary by route/domain in later updates.
- Confirm if stabilize option should remain always available or become conditional.
