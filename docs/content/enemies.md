# Enemies Reference

## Core Types

Defined in `src/game/content/enemies.ts`:

- `EnemyContent`: id, name, tier, maxHp, intents
- `EnemyIntent`: structured action parts
- Tiers: common, elite, boss

## Current Enemy Pools

Common pool:

- Hollow Rat
- Thorn Acolyte
- Ruin Beetle

Elite pool:

- Ashen Knight

Boss pool:

- Corrupted Slime

## Intent System

`getEnemyIntentActions()` converts intent fields into ordered action parts:

1. attack
2. armor
3. burn
4. poison
5. reflect

This shared structure is used by both UI preview and combat resolution.

## Boss Behavior

Corrupted Slime includes `phaseTwoIntents`, enabling escalation in boss flow.
