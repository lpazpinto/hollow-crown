# Hollow Crown / Shards of the Hollow Crown

## Overview

Hollow Crown is a Phaser 3 + TypeScript fantasy card-crawler prototype built for short, web-friendly runs.

Core loop:

1. Choose a route/domain path.
2. Resolve encounters (battle, utility/rest, elite, boss).
3. Gain layered progression rewards (XP, cards, relics, boons, shards).
4. Continue route progression until boss completion.

This project has moved beyond a template/prototype-only shell and currently includes full scene flow, run-state persistence, and multiple reward/progression systems.

## Current Game Direction

Current direction is a light RPG card-crawler, not a pure deck-only roguelike.

Design priorities:

- route decisions should feel strategic and readable,
- battle information should be clearer and more icon-friendly,
- rewards should be layered and player-facing,
- hero growth should come from both deck changes and run progression systems.

Source-of-truth direction docs:

- `docs/route-rewards-levelup-direction-update.md`
- `docs/playtest-feedback-next-direction.md`
- `docs/route_reward_ux_playtest_guidance_v_2.md`

## Current Implemented Features

### Run and Scene Flow

- Menu with new run / continue run.
- Domain selection scene.
- Route selection scene with graph progression.
- Battle scene with turn flow and outcome routing.
- Level-up scene, card reward scene, relic reward scene, run-end scene.

### Route and Progression Systems

- Branching route graph data with static + procedural layouts.
- Route node reward telegraphing categories (shard/heal/boon/relic/battle/elite).
- Expanded elite-to-boss pacing (post-elite node plus pre-boss preparation).
- Compact route summary and lightweight inspection panels.

### Battle Systems

- Card combat with energy + ember resources.
- Enemy intent action model (attack/armor/burn/poison/reflect).
- Deck/discard inspection during battle.
- Boon visibility in battle HUD.

### Rewards and Growth

- XP by encounter type.
- Pending level-up queue with growth choices.
- Milestone normal-battle card draft cadence.
- Elite relic reward flow.
- Boss signature reward flow.
- Shard progression from route opportunities (not automatic every battle).
- 3/3 shard payoff flow with explicit player-facing reward presentation.
- Temporary next-battle boon grants and readable boon feedback.

### Save/Load

- Local run save/load via `localStorage`.
- Run-state validation and normalization for compatibility.

## In Progress

The following are actively planned or being iterated:

- additional playable domains and bosses,
- broader content pools (cards, enemies, relics, route variants),
- further battle readability and intent presentation polish,
- continued balance tuning for early pressure, armor efficiency, and reward pacing,
- route lore/boss alignment improvements.

## Tech Stack

- Phaser 3
- TypeScript
- Vite
- Poki Phaser plugin (`@poki/phaser-3`)

Project code areas:

- `src/game/scenes/` scene flow and UI
- `src/game/content/` content data (cards, enemies, relics, routes, boons, abilities)
- `src/game/battle/` battle logic, run-state, save/load
- `public/assets/` runtime assets

## Local Setup

### Requirements

- Node.js 18+
- npm

### Install

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Optional No-Log Scripts

```bash
npm run dev-nolog
npm run build-nolog
```

## Documentation Guide

Start with:

- `docs/README.md`

Main docs structure:

- `docs/overview/` project snapshot and status
- `docs/systems/` implementation-facing system references
- `docs/content/` content reference sheets
- `docs/ui-ux/` interface/readability notes
- `docs/playtests/` direction doc entry points
- `docs/implementation/` code anchor and implementation notes

Legacy/supporting direction docs are preserved in `docs/` root for context.

## Next Priorities

1. Expand playable route/domain content while preserving compact run length.
2. Continue battle readability improvements (intent clarity and UI density control).
3. Complete reward clarity pass so shard/boon/relic outcomes stay explicit and understandable.
4. Continue balancing pass for encounter pressure and progression pacing.
5. Keep docs synchronized with implementation after each system/content update.
