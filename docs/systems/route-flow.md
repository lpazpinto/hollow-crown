# Route Flow

## Purpose

Reference for route selection and route progression behavior in the current implementation.

## High-Level Flow

1. `DomainSelectScene`: choose a domain.
2. `MapScene`: inspect route graph and choose one reachable node.
3. Encounter scene based on selected node type:
   - `battle` / `elite` / `boss` -> `PlayScene`
   - `rest` -> utility resolution in `MapScene`
4. Return to progression scenes (`MapScene`, reward scenes, or run-end) based on outcome.

## Route Graph Model

Defined in `src/game/content/routes.ts`:

- `RouteGraphLayout`: graph layout with `startNodeId` and `nodes`.
- `RouteGraphNode` includes:
  - `encounterType`: `battle` | `rest` | `elite` | `boss`
  - `nextNodeIds`
  - optional reward metadata (`shardChance`, `grantsHealing`, `grantsBoon`, `relicCategoryLabel`)

## Progression State

Stored in `RunState` (`src/game/battle/runState.ts`):

- `currentRouteChoiceNodeIds`: currently reachable nodes.
- `currentRouteNodeId`: currently selected node being resolved.
- `pendingRouteChoiceNodeIds`: becomes next choices after encounter resolves.
- `completedRouteNodeIds`: used for graph visuals.
- `currentRouteStep`, `currentFloor`, `maxFloors`.

## Current Direction Alignment

- Branching routes with lane-style risk/reward decisions.
- More post-elite content before boss.
- Pre-boss preparation/rest opportunity in most runs.

See source-of-truth direction docs in `../README.md`.
