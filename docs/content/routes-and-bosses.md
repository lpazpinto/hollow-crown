# Routes and Bosses Reference

## Domain Status

Defined in `src/game/content/routes.ts`:

- Playable: Ashen Mire (`ashen-march`)
- Locked: Veil of Thorns
- Locked: Starforged Deep

## Route Graph Data

Each route layout uses graph nodes with:

- encounter type (`battle`, `rest`, `elite`, `boss`)
- next node links (`nextNodeIds`)
- optional reward metadata (`shardChance`, `grantsHealing`, `grantsBoon`, `relicCategoryLabel`)

## Current Pacing Pattern

Current route tail is explicitly paced as:

- elite -> post-elite encounter -> pre-boss rest/prep -> boss

This aligns with latest route pacing direction.

## Reward Telegraphing

Route nodes expose compact reward-category badges in map UI, including:

- battle
- elite
- shard chance
- healing
- boon
- relic teaser label

## Boss References

Current boss IDs in route data:

- mire-crowned-slime (playable domain)
- thorn-queen (locked domain)
- star-sentinel (locked domain placeholder)
