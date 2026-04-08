# Game Status Snapshot

## Project

- Name: Hollow Crown / Shards of the Hollow Crown
- Genre direction: web-friendly fantasy card-crawler RPG loop
- Core loop: route choice -> encounter -> rewards/progression -> boss

## Current Playable State

- Menu flow with new run and continue run.
- Domain selection with one playable domain (`Ashen Mire`) and locked future domains.
- Route selection with branching graph progression and node reward telegraphing.
- Battle scene with card combat, intents, status effects, and turn flow.
- Reward scenes for cards, relics, and level-up growth choices.
- Run-end flow after boss completion.

## Major Implemented Systems

- Route graph progression with deterministic procedural layout IDs for save-safe rebuild.
- Node-based shard opportunities (not automatic every battle).
- Temporary boon system (earned from utility/rest nodes, consumed in next battle).
- Shard payoff unlock at 3/3 with dedicated reward presentation step.
- XP and level-up progression with pending level-up queue.
- Milestone card draft cadence for normal battles.
- Elite relic reward flow.
- Local save/load with run-state normalization.

## Active Direction (Source-of-Truth)

Current design direction is defined by:

- `../route-rewards-levelup-direction-update.md`
- `../playtest-feedback-next-direction.md`
- `../route_reward_ux_playtest_guidance_v_2.md`

These should be treated as final direction when conflicts appear.

## In Progress Themes

- Continued UI readability and compact information hierarchy.
- Further route/content expansion beyond the current playable slice.
- Additional domain and boss content.
- Ongoing balancing for rewards, pacing, and encounter pressure.
