# Hollow Crown / Shards of the Hollow Crown

Hollow Crown is a Phaser 3 + TypeScript card-crawler prototype focused on a compact, web-friendly run loop:

- choose a route path,
- fight tactical card battles,
- gain progression rewards,
- reach and defeat a domain boss.

## Genre Direction

Current direction is a short-session fantasy RPG card-crawler with:

- branching route choices,
- readable battle UX,
- layered rewards (cards, relics, boons, shards),
- level-up growth decisions inside each run.

## Current Playable State

The current playable slice includes:

- Menu with new run and continue run.
- Domain selection scene.
- Route map scene with branching node choices and reward telegraphing.
- Utility/rest node behavior (healing + temporary boon flow).
- Card battle scene with enemy intents, statuses, and turn loop.
- Victory flow with readable reward summary and confirmation gate.
- Level-up scene with growth choices.
- Card reward scene and relic reward scene.
- Boss completion and run end flow.
- Local save/load persistence with run-state normalization.

## Major Implemented Systems

### Route Selection

- Route graph layouts with branching and merge points.
- Node metadata drives reward telegraphing:
  - shard chance
  - healing
  - boon
  - relic category teaser
- Expanded elite-to-boss pacing with post-elite content and pre-boss prep.

### Battle

- Turn-based card combat with energy/ember resources.
- Enemy intent preview based on structured action parts.
- Hero/enemy status, armor, burn, poison, and reflect handling.
- Deck/discard visibility and inspection in battle.

### Rewards and Progression

- XP gains by encounter type.
- Level thresholds and pending level-up queue.
- Milestone card-draft cadence for normal battles (not every battle).
- Elite relic rewards.
- Boss signature reward flow.

### Shards and Boons

- Shards are out-of-deck run resource from route opportunities.
- 3/3 shards unlock forge availability and a dedicated powerful card payoff flow.
- Boons are temporary next-battle effects with readable gain and active-state UI.

## Current Direction Docs (Source of Truth)

Treat these docs as the active product/design direction:

- `docs/route-rewards-levelup-direction-update.md`
- `docs/playtest-feedback-next-direction.md`
- `docs/route_reward_ux_playtest_guidance_v_2.md`

## Documentation Map

Start here:

- `docs/README.md`

Structured references:

- `docs/overview/`
- `docs/systems/`
- `docs/content/`
- `docs/ui-ux/`
- `docs/playtests/`
- `docs/implementation/`

## Tech Stack

- Phaser 3 (`phaser`)
- TypeScript
- Vite
- Poki Phaser plugin (`@poki/phaser-3`)

## Project Layout

- `src/game/scenes/`: scene flow and UI.
- `src/game/content/`: data/content definitions (cards, enemies, relics, routes, boons, abilities).
- `src/game/battle/`: battle logic, run-state, save/load.
- `public/assets/`: runtime art assets.
- `docs/`: direction, references, implementation notes.

## Run Locally

Requirements:

- Node.js 18+ (recommended)
- npm

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Build production bundle:

```bash
npm run build
```

Optional no-telemetry variants:

```bash
npm run dev-nolog
npm run build-nolog
```

## In Progress

Active areas still being iterated:

- additional playable domains and bosses,
- broader content pools (cards, enemies, relics),
- further route/reward readability polish,
- ongoing encounter and progression balancing.
