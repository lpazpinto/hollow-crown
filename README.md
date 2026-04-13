# Hollow Crown / Shards of the Hollow Crown

## Overview

Hollow Crown is a Phaser 3 + TypeScript fantasy card-crawler for short, web-friendly runs.

Current loop:

1. Choose a domain route path.
2. Resolve encounters (battle, utility/rest, elite, boss).
3. Gain layered progression (XP, cards, relics, boons, shards).
4. Continue route progression until boss resolution.

This repository is no longer a bare template state. It already contains full scene flow, route progression, battle resolution, reward scenes, and run persistence.

## Current Game Direction

The project is moving toward a light RPG card-crawler identity (not a deck-only roguelike clone).

Direction priorities:

- route choices should communicate clear risk/reward categories,
- battle HUD should improve readability and intent clarity,
- rewards should be explicit and player-facing,
- run growth should come from multiple layers (deck + level-up + passives + temporary effects).

Latest direction source-of-truth docs:

- `docs/route-rewards-levelup-direction-update.md`
- `docs/playtest-feedback-next-direction.md`
- `docs/route_reward_ux_playtest_guidance_v_2.md`

Related preserved direction/reference docs (historical + supporting):

- `docs/battle-scene-v2.md`
- `docs/card-rarity-and-reward-rules.md`
- `docs/core-loop-v2-rpg-direction.md`
- `docs/enemy-and-relic-implementation-rules.md`
- `docs/first-design-sheet.md`
- `docs/route-select-and-boss-reward-direction.md`
- `docs/route-reward-ux-playtest-guidance-v2.md` (filename compatibility alias)

## Current Implemented Features

### Scene Flow

- Menu: new run / continue run
- Character select
- Domain select
- Route map select
- Battle scene
- Level-up scene
- Card reward scene (post-battle card selection)
- Relic reward scene
- Run end scene

### Character Selection

- Character select screen before domain selection
- Currently features the Unicorn hero with expandable framework for additional characters
- Supports future character-specific cosmetics and starting deck modifications

### Route Selection and Progression

- Branching route graph layouts (static + deterministic procedural)
- Extended run path: 11 encounters per run (battles, elites, rest, boss)
- Reachable-node progression with clickable circles and buttons
- Reward-category telegraphing (battle, elite, shard, healing, boon, relic teaser)
- Elite-to-boss pacing with post-elite and pre-boss preparation nodes
- Compact route summary with lightweight deck/relic/boon inspection

### Battle and Combat Data

- Turn-based card combat with energy + ember resource model
- Enemy intents normalized into action parts (attack/armor/burn/poison/reflect)
- Deck/discard inspection in battle
- Active-boon HUD display during battle

### Rewards and Growth

- XP by encounter type
- Pending level-up queue + level-up choice scene
- Card draft after every normal battle victory (3 card choices)
- Elite relic reward flow
- Boss signature reward flow
- Route-driven shard opportunities (not auto-per-battle)
- 3/3 shard payoff flow with explicit reward presentation
- Temporary boon grant/consume flow with readable UX

### Save / Load

- Local save/load via `localStorage`
- Run-state validation + normalization for compatibility

## In Progress

The following are planned or currently iterated, not fully complete:

- additional playable domains and bosses (currently one playable domain)
- expanded content pools (cards, enemies, relics, route variants)
- battle readability polish (UI density and intent communication)
- continuing balance pass (early pressure, armor efficiency, reward pacing)
- route lore and boss alignment refinement

## Tech Stack

- Phaser 3
- TypeScript
- Vite
- `@poki/phaser-3` plugin

Project areas:

- `src/game/scenes/` scene and UI flow
- `src/game/content/` content data (cards, enemies, relics, routes, boons, abilities)
- `src/game/battle/` run-state, combat logic, reward routing, save/load
- `public/assets/` runtime assets

## Local Setup

### Requirements

- Node.js 18+
- npm

### Install

```bash
npm install
```

### Run Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Optional No-Log Commands

```bash
npm run dev-nolog
npm run build-nolog
```

## Documentation Guide

Start here:

- `docs/README.md`

Documentation structure:

- `docs/overview/` project snapshot and status
- `docs/systems/` system behavior references
- `docs/content/` content reference sheets
- `docs/ui-ux/` UI and readability notes
- `docs/playtests/` playtest-direction index
- `docs/implementation/` code anchors and implementation notes

Key systems references:

- `docs/systems/route-flow.md`
- `docs/systems/rewards-and-progression.md`
- `docs/systems/shards-and-boons.md`
- `docs/systems/level-up-flow.md`
- `docs/systems/battle-flow.md`
- `docs/systems/run-state-and-save.md`

## Next Priorities

1. Expand domain/boss content while preserving compact run length.
2. Continue battle readability improvements (especially intent and HUD density).
3. Keep reward feedback explicit for shards, boons, relic opportunities, and level-up outcomes.
4. Continue balance iteration for early-game pressure and progression cadence.
5. Keep documentation synchronized with code after each feature pass.
