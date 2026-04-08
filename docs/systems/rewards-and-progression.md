# Rewards and Progression

## Purpose

Reference for current progression systems and reward cadence.

## XP and Level-Up

- XP by encounter type is defined in `src/game/battle/runState.ts`.
- Level thresholds are step-based (`LEVEL_XP_STEP_COSTS`).
- Pending level-ups are queued and resolved in `LevelUpScene`.
- Level-up options include card upgrade, passive ability, and stabilize (max HP + heal).

## Card Rewards

- Normal battles do not always grant permanent cards.
- Milestone cadence: every N normal battle wins grants card draft (`BATTLE_CARD_REWARD_INTERVAL`).
- Elite victories route to relic rewards.
- Boss victories route to signature reward flow.

## Shards

- Shards are run-state resource (outside deck).
- Shard chance is data-driven per route node (`rewards.shardChance`).
- 3/3 shards unlock forge availability.
- Shard completion now has a dedicated payoff presentation flow before claim.

## Boons

- Boons are temporary next-battle effects (`currentBoonId`).
- Usually granted from utility/rest nodes.
- Consumed at battle start.
- Exposed in route and battle UI with compact readable panels.

## Relics and Abilities

- Relics are mostly earned from elite reward flow.
- Abilities are primarily earned through level-up choices.
- Both are stored in run-state and cloned into battle session creation.
