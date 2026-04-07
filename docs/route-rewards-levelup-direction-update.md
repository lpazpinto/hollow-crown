# Hollow Crown – Route, Rewards, and Level-Up Direction Update

## Purpose

This document captures the latest direction for route flow, reward cadence, shards, temporary battle buffs, and level-up pacing.

It is intended to align future implementation with the current project goals:

- short but satisfying web-friendly runs
- cleaner route-select presentation
- stronger hero growth during a run
- less deck bloat from frequent card rewards
- more readable and meaningful reward layers

This update should be treated as a follow-up to the current RPG card-crawler direction and route-select work.

---

## 1. Route Select Screen Direction

### Problem

The current Route Select screen shows too much information at once and still feels too close to a prototype status screen or generic run map.

### Direction

The Route Select screen should primarily answer only three questions:

1. What route/domain is the player in?
2. Where are they in that route?
3. What is the next choice?

### Keep visible on the main screen

- route/domain name
- short route flavor text
- boss name
- route progress/path visualization
- current node choices
- compact hero summary: HP, Level, XP

### Remove from the main focus area

These elements should not dominate the Route Select screen:

- deck count
- relic count
- blessing count
- detailed reward cadence text
- overly verbose instructional copy

These can still exist in a secondary layer such as a small collapsed panel, pause screen, tooltip, or run summary.

### UX goal

The screen should feel like a fantasy route decision screen, not a spreadsheet of run stats.

---

## 2. Route Length and Structure

### Problem

The current route is too short. Four total encounters/nodes make the run feel underdeveloped and reduce the value of progression systems such as XP and level-up.

### Direction

A route should feel like a short domain journey, not a tutorial-length sequence.

### Recommended route size

Target:

- 6 to 7 total nodes including the boss
- around 5 meaningful encounters plus boss

### Recommended route pattern

A healthy first structure is:

1. Battle
2. Choice node: Battle or Utility
3. Battle
4. Utility or Special Event
5. Elite
6. Recovery / Preparation
7. Boss

This structure gives enough room for:

- pacing
- attrition
- recovery choices
- XP progression
- route identity
- boss anticipation

### Design goal

The route should remain short enough for Poki and web sessions, while still allowing the run to develop.

---

## 3. Reward Cadence v2

### Problem

Giving a permanent card reward after every battle makes the deck grow too quickly and reduces the importance of hero growth, upgrades, and milestone rewards.

### Core direction

Normal battles should **not** grant permanent card rewards by default.

### New reward philosophy

Rewards should be split into layers:

- **micro rewards** after battles
- **mid-run growth** through level-ups and milestone choices
- **major rewards** from elites, bosses, and forging systems

### Normal battle rewards

Normal battles should grant:

- XP always
- sometimes one small additional reward

Possible small rewards:

- 1 Shard
- 1 consumable/potion card
- 1 temporary Boon for the next battle
- small HP recovery
- no extra reward in some cases

### Permanent card rewards

Permanent card rewards should happen only at selected moments such as:

- milestone draft nodes
- certain utility/shrine nodes
- forge outcomes
- boss rewards
- some level-up choices if desired

### Elite rewards

Elites should feel more important than normal battles.

Recommended elite reward profile:

- higher XP
- stronger reward quality
- high chance of shard reward
- possible upgrade, ability-related reward, or forge progress

### Boss rewards

Boss rewards should remain one of the strongest identity-defining moments in the run.

Boss reward goals:

- route-themed signature reward
- stronger permanent growth
- reinforces Mega Man–style domain completion fantasy

---

## 4. Shards System Direction

### Core idea

The player can receive shards as a recurring reward. Shards represent fragments of power that build toward a stronger permanent reward.

### Important implementation direction

Shards should **not** be implemented as weak cards inside the main deck.

### Why

If shards are weak playable cards in the deck, they risk:

- polluting draws
- lowering deck quality
- creating frustrating dead draws
- adding unnecessary runtime complexity

### Recommended implementation

Shards should exist as a **run resource outside the deck**.

Example presentation:

- Shards: 0/3
- Shards: 1/3
- Shards: 2/3
- Shards: 3/3 → Forge Available

### Initial version

Start with one generic shard type.

Do not begin with multiple shard families unless the base system is already proven fun.

### Forge rule

When the player reaches 3 shards, they unlock a forge opportunity.

### Recommended forge outcome

At 3 shards, the player may choose 1 of 3 stronger card rewards, for example:

- offensive option
- defensive option
- ember/utility option

### Recommended forge timing

Preferred timing:

- resolve the forge at a utility node or dedicated forge node

This is cleaner than interrupting every battle reward flow with another choice screen.

### Design goal

Shards should create satisfying long-form reward tension across the route without bloating the deck.

---

## 5. Temporary Battle Buffs: Boons

### Direction

Small temporary buffs that last only for the next battle are a good fit for the route loop.

### Naming direction

These should not replace the more persistent hero-growth layer.

To avoid confusion with longer-lasting progression systems, these temporary effects should be named:

**Boons**

This creates a cleaner separation:

- **Abilities** = more persistent hero growth during the run
- **Boons** = temporary next-battle preparation buffs

### Boon rules

- lasts only for the next battle
- should be small and readable
- should not require complex tracking
- should feel useful, but not run-defining on their own

### Example Boons

- **Kindled Start**: start next battle with +1 Ember
- **Warded Step**: start next battle with 5 Block
- **Quick Draw**: draw +1 card on turn 1 of next battle
- **Mender's Sip**: recover a small amount of HP when next battle begins
- **Sharp Resolve**: the first attack next battle gains bonus damage

### Design goal

Boons add short-term excitement and route texture without competing with permanent progression.

---

## 6. Level-Up Direction and Balance Priority

### Problem

The level-up system currently exists, but it does not occur often enough during a run to be meaningfully tested or felt by the player.

### Core direction

Level-up must become one of the main sources of visible run growth.

If permanent card rewards are reduced, level-ups must carry more of the run's progression weight.

### Immediate balance goal

A player should level up inside a normal run often enough to evaluate whether the system is fun.

### Target cadence for testing

- weak run: at least 1 level-up
- average run: 2 to 3 level-ups
- strong/victorious run: 3 to 4 level-ups

### Very important rule

The first level-up should happen before the first boss.

Ideally, the player should reach the first level-up after roughly:

- 2 normal battles, or
- 1 battle plus 1 higher-value encounter

### XP direction

XP thresholds should be reduced enough to allow real testing of the system within current run length.

A simple test progression could be:

- Level 1 → 2: 8 XP
- Level 2 → 3: 12 XP
- Level 3 → 4: 16 XP
- Level 4 → 5: 20 XP

This is a starting point for tuning, not a final commitment.

### XP reward targets for testing

Example test values:

- normal battle: 4 to 5 XP
- elite: 7 to 8 XP
- boss: 10 to 12 XP
- utility/special nodes: usually 0 XP

These values should be used to make the level-up system visible during runs and then tuned from playtest feedback.

---

## 7. What Level-Up Should Reward

### Direction

Level-up should grant meaningful, semi-permanent run growth rather than only a raw stat increase.

It should feel like the hero is evolving, not just filling a number bar.

### Recommended level-up choice structure

Each level-up should ideally offer 1 out of 3 choices such as:

- upgrade a card
- gain a small hero ability/passive
- recover some HP or gain a small stability bonus

### What level-up should emphasize

- hero identity
- long-term run shaping
- clear, readable improvement

### What should not be the focus of level-up

Avoid making level-up primarily about:

- temporary next-battle buffs
- guaranteed permanent card gain every time
- frequent Ember cap increases
- abstract stat inflation without player choice

### Design goal

Level-up should sit between battle rewards and boss rewards as a reliable mid-run progression layer.

---

## 8. Updated Run Reward Structure

The run should now be understood through three reward layers:

### Layer 1: Immediate battle reward

After normal combat, the player usually gets:

- XP
- maybe one small extra reward

### Layer 2: Mid-run growth

This includes:

- level-ups
- forge opportunities from shards
- utility node choices
- upgrades and small persistent abilities

### Layer 3: Major route reward

This includes:

- elite rewards
- boss signature rewards
- route completion identity moments

This structure is healthier than giving a permanent card after nearly every fight.

---

## 9. Practical Implementation Priorities

Recommended next implementation order:

1. simplify Route Select presentation
2. increase route length to the new target structure
3. remove default permanent card rewards from normal battles
4. add small post-battle reward table: XP + occasional shard/boon/consumable/heal
5. add shard counter and 3-shard forge flow
6. rename next-battle temporary blessings to Boons
7. reduce XP thresholds so level-up can happen during normal runs
8. make level-up choices visible and testable before further expansion

---

## 10. Working Design Rules

Use these as the practical rules for the next iteration:

- Do not overload Route Select with secondary stats.
- Do not give permanent cards after every normal battle.
- Use shards as out-of-deck progression, not as weak filler cards.
- Use Boons as small next-battle buffs only.
- Make level-up a visible and frequent part of a run.
- Keep route structure short, readable, and boss-focused.
- Prefer simple, testable systems over content-heavy complexity.

---

## Summary

The current direction shifts the run away from generic deck inflation and toward layered hero growth.

The intended feel is:

- cleaner route decisions
- longer but still web-friendly domain paths
- smaller and more interesting battle rewards
- forge progress through shards
- temporary tactical support through Boons
- visible and testable level-ups during a run

This should make Hollow Crown feel more like a light RPG card-crawler and less like a thin Slay the Spire-style prototype.
