# Routes and Bosses Reference

## Purpose

Living reference for domain routes, boss mapping, and route-reward direction.

## Currently Implemented Content

### Domain / Route Availability

Defined in `src/game/content/routes.ts`:

- Playable domain: Ashen Mire (`ashen-march`)
- Locked domain: Veil of Thorns
- Locked domain: Starforged Deep

### Current Boss Mapping

- Ashen Mire -> `mire-crowned-slime`
- Veil of Thorns -> `thorn-queen` (locked)
- Starforged Deep -> `star-sentinel` (locked placeholder)

### Route Graph Model

Each route node can include:

- encounter type: battle/rest/elite/boss
- graph links (`nextNodeIds`)
- reward metadata (`shardChance`, `grantsHealing`, `grantsBoon`, `relicCategoryLabel`)

### Current Route Reward Categories (Telegraphed)

- battle
- elite
- shard chance
- healing
- boon
- relic opportunity (category label only)

### Current Branching / Pacing Implementation

- Branch and merge lane structure is implemented.
- Route tail pacing currently targets:
  - elite -> post-elite meaningful node -> pre-boss preparation/rest -> boss

### Boss Reward Direction (Current)

- Boss encounters route to a signature reward flow in `RewardScene`.
- Shard payoff is separate: reaching 3/3 shards triggers a distinct powerful card reward presentation.
- Combined direction goal: boss rewards should feel route-themed and identity-defining.

## Current Planned Content

- Additional fully playable domains (currently locked) with their own route identity: TBD
- More route variation per domain while keeping web-friendly length: TBD
- Expanded boss roster and boss-specific reward identity for each domain: TBD
- Additional route-themed signature reward cards for future bosses/domains: TBD

## Balancing / Design Notes

- Direction docs prioritize route decisions as risk/reward lanes, not linear node clicking.
- Shards should be route-opportunity driven, not automatic every battle.
- Boss rewards should feel route-themed and identity-defining.
- Exact relic identity should remain hidden until reward resolution.

## Open Questions / TODOs

- Confirm final naming/lore alignment for playable route and current boss presentation.
- Confirm rollout order for unlocking additional domains.
- Decide when route-specific enemy pools are exposed in route UI (if at all).
- Validate final forge timing model versus utility-node timing recommendation in direction docs.
