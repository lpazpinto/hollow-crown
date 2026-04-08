# Shards and Boons

## Purpose

Focused reference for temporary boon flow and shard payoff flow, including how they are surfaced to players.

## Shards (Implemented)

### Core Rules

- Shards are a run-state resource outside the deck.
- Shards come from route-node opportunities (`rewards.shardChance`), not default battle rewards.
- Target threshold is 3/3.

### Current Runtime Behavior

- Shard grant attempt happens on victory flow for the current encounter.
- On reaching 3/3, forge availability is set.
- 3/3 completion now triggers a dedicated shard-payoff presentation flow.
- Claiming the shard-payoff card consumes forge availability and resets shard count.

### Current Player-Facing UX

- Route UI shows shard progress.
- Victory flow surfaces shard gain and shard-payoff unlock.
- Shard payoff is presented as a distinct reward step (not hidden background state).

## Boons (Implemented)

### Core Rules

- Boons are temporary and apply to the next battle only.
- Boons are usually granted from utility/rest encounters.
- Boons are stored in run-state (`currentBoonId`) and consumed at battle start.

### Current Player-Facing UX

- Boon gain uses a confirmable readable panel.
- Route UI shows current active boon in compact form.
- Battle HUD includes dedicated active-boon area with effect text.

## Planned / In Progress

- Additional boon variety by domain/theme: TBD
- Additional shard opportunity node types beyond current set: TBD
- Forge-timing refinements versus utility-node timing guidance: TBD

## Design Notes

- Keep boon and shard feedback explicit and readable.
- Keep shard rewards route-choice driven to maintain tension.
- Maintain compact UX suitable for short web sessions.

## Open Questions / TODOs

- Confirm final long-term forge timing model (always immediate vs specific node timing).
- Confirm whether multiple shard families are ever needed (currently not planned for near-term).
- Define whether boons gain icon art in all contexts or remain token/text for now.
