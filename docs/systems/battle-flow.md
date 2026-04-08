# Battle Flow

## Purpose

Reference for current battle sequence and outcome routing.

## Scene and Session

- Battle scene: `src/game/scenes/PlayScene.ts`
- Session logic: `src/game/battle/battleSession.ts`
- Core resolution: `src/game/battle/battleLogic.ts`

## Turn Loop

1. Player turn starts; hand and resources refresh according to session rules.
2. Player plays cards or ends turn.
3. Enemy intent resolves as action parts (attack, armor, burn, poison, reflect).
4. Outcome check (`ongoing`, `victory`, `defeat`) is performed.

## HUD and Readability

- Hero/enemy state shown near combatants (HP/armor/status).
- Intent preview is icon-token style, based on structured intent actions.
- Deck/discard counts and inspection are available in battle.
- Active boon is shown in a dedicated compact battle UI area.

## Victory Routing

On first victory detection, the scene applies:

- battle result persistence,
- XP gain,
- shard roll/progression,
- reward route resolution (map, card draft, relic reward, shard payoff, boss signature).

A readable victory panel gates transition on player confirmation.
