# Route Reward and UX Playtest Guidance V2

## Purpose

This document captures the latest playtest feedback and the updated direction for route rewards, route pacing, boon presentation, shard cadence, and route selection UX.

It should be used together with:

- `docs/route-rewards-levelup-direction-update.md`
- `docs/playtest-feedback-next-direction.md`

This document is the current source of truth for the topics below until replaced by a newer playtest pass.

---

## 1. Shards should not be awarded automatically after every battle

### Problem

The current shard cadence is too predictable.

If the player gains one shard after every battle, then the system becomes guaranteed and loses its tension. The player quickly learns that after three wins they will always get a strong card, which makes shards feel automatic instead of meaningful.

### New direction

Shards should come from specific route opportunities, not from every battle by default.

### Rules

- Normal battles should not automatically grant a shard.
- Shard rewards should come from route choices, special reward nodes, or selected path opportunities.
- The route selection screen should clearly communicate when a path offers a shard opportunity.
- Once the player reaches `3/3` shards, they should unlock a powerful card reward.
- The shard payoff should feel like a route-planning reward, not an inevitable timer.

### Design goal

The player should sometimes choose between:

- a safer route
- a healing route
- a shard route
- a relic route
- another utility reward

This makes route choice more strategic and improves replay value.

---

## 2. Boons need clearer presentation and persistent visibility

### Problem

When the player gains a boon, the information currently flashes too fast and is difficult to understand.

During battle, it is also not easy to see which boon is active or what it does.

### New direction

Boons must be readable both when earned and while active.

### Rules

When a boon is gained:

- do not flash the information too quickly
- show a readable reward panel, toast, or summary
- keep it visible long enough for the player to understand it
- allow click/tap/confirm if needed before dismissing

During battle:

- show the active boon in a small dedicated UI area
- show at minimum:
  - boon icon
  - boon name
  - short effect text
- make it clear that the boon is temporary and tied to the next battle

During route selection:

- also show the currently active boon in a compact but readable way
- the player should be able to understand which boon they have before choosing the next node

### Design goal

At any moment, the player should be able to answer:

- what boon do I currently have?
- what does it do?
- when will it be consumed?

---

## 3. There should be more content between the elite and the boss

### Problem

The route currently reaches the boss too quickly after the elite.

This reduces tension, recovery planning, and the feeling of a small adventure arc.

### New direction

Add more route content between the elite and the boss, including a preparation or healing opportunity before the boss.

### Rules

A good first pattern is:

1. Battle
2. Split / route choice
3. Battle or utility
4. Battle
5. Elite
6. Battle or event
7. Recovery / shrine / camp / preparation
8. Boss

### Requirements

- There should usually be at least one more meaningful node after the elite.
- There should usually be a pre-boss preparation or healing opportunity.
- The route should still remain compact and web-friendly.

### Design goal

The player should feel:

- rising pressure through the elite
- one more stretch of decision-making
- a clear moment to prepare for the boss

---

## 4. Route selection needs a compact but useful run summary

### Problem

The route selection screen currently does not give enough information about the player’s current run state.

The player needs to understand what they already have before making route decisions.

### New direction

The route selection screen should show a compact run summary and allow lightweight inspection of important systems.

### Main info that should be visible

- HP
- Level
- XP
- shard progress
- current boon
- relic count
- deck count

### Inspection direction

The screen should stay visually clean, but important details should be accessible.

Good examples:

- click/tap deck summary to inspect current deck
- click/tap relic summary to inspect relics
- click/tap boon area to inspect boon details

### Design goal

Use compact summaries for the main screen and optional inspection panels for deeper information.

This keeps the route screen readable while still giving the player decision-making context.

---

## 5. Relic rewards should be hidden until chosen or earned

### Problem

If a route node directly reveals the exact relic reward before the player chooses it, the system loses mystery and becomes too optimization-heavy.

### New direction

Route selection should communicate relic reward category, not the exact relic identity.

### Rules

On the route selection screen:

- show that a node can grant a relic
- do not reveal exactly which relic it is
- present it as a hidden or mysterious reward

Possible labels:

- Mysterious Relic
- Relic Cache
- Corrupted Reliquary
- Shrine Reward

Only reveal the exact relic after:

- the player selects and resolves the node, or
- the reward is actually granted

### Design goal

This adds surprise, tension, and a mild gambling feeling to route choice, which improves excitement and discovery.

---

## 6. Updated reward telegraphing rules for route nodes

The route UI should communicate reward categories clearly, but not always exact reward content.

### Show clearly

- this path can lead to a shard
- this path can lead to healing
- this path can lead to a boon
- this path can lead to a relic
- this path can lead to a battle or elite

### Keep hidden when appropriate

- exact relic identity
- exact mystery reward content
- full details of special random outcomes

### Design goal

The player should understand the type of risk/reward they are choosing without turning every route choice into fully solved math.

---

## 7. Updated reward cadence direction

### Normal battle

Normal battles should primarily grant XP.

They should not automatically grant:

- a permanent card
- a shard
- a revealed relic

They may still support specific reward outcomes if design requires it, but those should not be the default every time.

### Route choice rewards

Shards, relic opportunities, healing opportunities, and some boons should come from route structure and route choice.

### Strong payoff rewards

When the player completes `3/3` shards:

- unlock a powerful card reward
- present it clearly as a payoff
- do not let it feel like an invisible background process

---

## 8. UX priorities from this playtest round

The next implementation pass should prioritize readability and player-facing clarity.

### Priority list

1. Move shards away from automatic battle rewards and into route-node opportunities.
2. Improve boon presentation when gained and while active.
3. Extend route pacing after elite and add pre-boss preparation.
4. Add compact run summary info to the route selection screen.
5. Hide exact relic identity until the player earns it.

---

## 9. Implementation guardrails

When implementing these changes:

- prefer focused changes over large rewrites
- keep the system data-driven where possible
- preserve current save/load compatibility where reasonable
- keep the route screen readable on web-sized layouts
- avoid adding too much text to route nodes
- prefer icons and concise labels when possible

---

## 10. Summary

This playtest direction pushes the project toward a better route-planning loop.

The player should:

- choose routes based on meaningful reward categories
- understand their current run state while choosing
- experience shards as a route-earned payoff, not an automatic timer
- read boon rewards clearly and know when they are active
- feel a stronger tension arc before the boss
- enjoy some uncertainty around relic rewards

This should make the game feel more strategic, more readable, and more replayable without requiring a large systems rewrite.
