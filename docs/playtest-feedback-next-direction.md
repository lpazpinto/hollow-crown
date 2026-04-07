# Playtest Feedback and Next Direction

## Purpose

This document captures the latest playtest feedback and translates it into a focused implementation direction for the next iteration of **Hollow Crown / Shards of the Hollow Crown**.

It should be read **together with**:

- `docs/route-rewards-levelup-direction-update.md`
- existing repo docs covering battle scene, route select, rewards, and RPG direction

This document is intended to help prioritize the next changes before implementation and to guide future Copilot prompts.

---

## Core takeaway from the latest test

The current prototype is playable, but several systems still feel like prototype scaffolding instead of a cohesive game loop.

The main issues identified are:

1. **Route Select still feels too abstract and text-heavy**
2. **Battle readability is not yet strong enough**
3. **Some early balance values are making fights too easy**
4. **Route progression still feels too linear**
5. **Boons and Shards lack visibility and player-facing feedback**
6. **Deck/discard information is not surfaced clearly enough during battle**

The next steps should focus on **clarity, feedback, and structure**, not on adding many new systems.

---

## 1. Route Select - problems and new direction

## Problems observed

- The screen still contains too much text competing for attention
- The currently active route presentation feels more like a status screen than a fantasy route choice screen
- The first playable route, **Ashen March**, does not feel well aligned with the current **Slime Boss** fantasy
- Route progression is still too close to a single path with occasional branch choices
- The route system should feel more like choosing between paths within a domain, not simply selecting the next isolated node

## Direction update

### 1.1 Reduce text density
The Route Select screen should become more visual and more decision-focused.

It should prioritize:

- route/domain identity
- current progress through the route
- next branching choices
- a compact run status summary

It should reduce or defer:

- long descriptive text blocks
- excessive state labels on the main screen
- placeholder-feeling debug text

### 1.2 Improve lore alignment between route and boss
The currently playable route and boss should feel like they belong to the same domain.

For the current slice, one of these should happen:

- either **Ashen March** is rewritten so its enemies and boss better fit the route fantasy
- or the current slime boss is renamed/redesigned to match the Ashen March domain better

### 1.3 Route Select should evolve toward multi-path progression
The route system should no longer feel like a single line with occasional yes/no choices.

Target direction:

- multiple visible path branches inside a route
- paths can bifurcate and sometimes merge again
- route structure can vary from run to run
- choices should feel like selecting a lane of risk/reward, not only picking between two buttons under a straight line

This does **not** require a full Slay the Spire copy. The goal is a cleaner, more thematic branching route structure with replay variety.

### 1.4 Current Route Select priorities
Near-term Route Select priorities:

1. simplify the on-screen text
2. align route lore and boss fantasy
3. support branching path data instead of mostly linear progression
4. improve route presentation so path choice is the focus

---

## 2. Battle Scene - readability and HUD direction

## Problems observed

- Too much information is competing in the current battle layout
- UI boxes and labels overlap visually in a way that weakens readability
- Important combat information still depends too much on text instead of symbols/icons
- Enemy intent is not yet as instantly readable as it should be

## Direction update

The battle scene should move toward a more visual combat HUD, with icon-supported information and less text clutter.

### 2.1 Hero and enemy combat stats should be attached to the characters
For both hero and enemies, key combat info should be displayed near or above the unit:

- **HP** with a heart icon
- **Armor/Block** with a shield icon

This will make combat state easier to parse at a glance.

### 2.2 Enemy intent should become icon-based
Enemy intent should prioritize immediate visual understanding.

Examples:

- sword icon + attack value for direct damage
- flame/burn icon + burn value for burn application
- shield icon + value for self-defense or armor gain
- multiple icons side by side for multi-effect intents

Example intent display:

- sword icon + `7`
- sword icon + `5` and burn icon + `2`
- shield icon + `5`

The player should not need to read a sentence to understand what is about to happen.

### 2.3 Asset-aware but system-ready
Some layout problems may improve once proper art assets exist, but the system direction should already move toward:

- fewer large boxed text panels
- more icon-driven combat state
- clearer spatial separation between hero, enemy, hand, and control areas

---

## 3. Battle balance feedback

## Problems observed

The current early combat balance is too forgiving.

Main reasons:

- player can stack armor too easily
- enemy attack values are too low to pressure the player
- some defensive cards are too efficient for their cost

## Proposed balance adjustments

### 3.1 Golden Shield
Current value feels too strong for the cost.

**Change proposal:**
- reduce armor gain from **7** to **4**

### 3.2 Charge
Current version is too efficient because it gives armor and card draw at no meaningful cost.

**Change proposal:**
- keep the effect identity
- cost should become:
  - **0 energy**
  - **1 Ember**

This makes it part of Un1's signature resource economy instead of a free tempo card.

### 3.3 Thorn Acolyte
Current enemy pressure is too low.

**Change proposals:**
- increase attack pattern from around **4-5 + 1 burn** to stronger values
- suggested intent options:
  - **7 attack**
  - **5 attack + 2 burn**
- increase self-shield from **3** to **5**

These changes should help prevent the player from trivializing early encounters by over-stacking armor.

---

## 4. Rewards feedback - Boons and Shards

## Problems observed

- Boons and Shards are currently granted automatically without meaningful player-facing feedback
- The player is not clearly informed when one is received
- The player has no strong way to understand what they currently hold
- This weakens the value of the new reward systems

## Direction update

Boons and Shards should remain part of the reward model, but they need stronger communication and clearer player ownership.

### 4.1 Reward feedback must be explicit
When the player receives a Boon or a Shard, the game should clearly show it.

Examples of acceptable feedback:

- reward popup
- compact reward banner
- floating panel after battle
- route-side summary update with highlight

The reward should feel earned and acknowledged.

### 4.2 Shards must be visible in a clear place
Shard progress should be easy to inspect during a run.

Required clarity:

- current shard count should be visible in Route Select
- shard count should use a compact visual treatment
- the player should understand that **3 Shards = a forge opportunity / strong card reward**

### 4.3 Boons must show both ownership and effect
The player should be able to see:

- whether they currently hold a Boon
- the name of the Boon
- what it does for the next battle

A compact tooltip, small panel, or hover/focus detail is enough.

### 4.4 Avoid invisible automatic rewards
Even when rewards are automatically assigned by the system, they should still be surfaced to the player with visible feedback.

---

## 5. Deck and discard visibility during battle

## Problem observed

The player needs a way to inspect which cards are currently in the deck and which cards are in the discard pile.

## Direction update

During battle, the player should be able to inspect:

- remaining draw pile
- discard pile contents

This does not need to be visually complex.

Good lightweight options:

- click deck pile to open a card list/panel
- click discard pile to open a card list/panel
- hover preview if feasible

Priority is clarity, not animation complexity.

---

## 6. Updated priorities

The next phase should not try to solve everything at once.

Recommended priority order:

### Priority 1 - Route Select structure and lore
- simplify Route Select text density
- improve route/boss fantasy alignment
- redesign route path structure toward branching lanes

### Priority 2 - Combat readability
- define icon-based combat information
- attach HP/Armor display closer to characters
- improve enemy intent readability

### Priority 3 - Immediate balance pass
- nerf overly efficient defensive cards
- increase early enemy pressure
- retest whether armor stacking is still too safe

### Priority 4 - Reward feedback clarity
- surface Boon and Shard acquisition clearly
- make current Boons/Shards easy to inspect

### Priority 5 - Card pile inspection
- allow inspection of deck and discard during battle

---

## 7. Design principles reinforced by this feedback

This playtest reinforces a few important principles for the project:

- **Clarity over text volume**
- **Visual communication over descriptive UI**
- **Player-facing feedback over hidden system changes**
- **Meaningful route choice over linear progression**
- **Pressure and risk over passive armor safety**

---

## 8. Suggested documentation follow-up

Before implementation prompts, future docs or prompt batches should probably be separated into these topics:

1. `route-select-branching-and-lore-update.md`
2. `battle-hud-readability-direction.md`
3. `early-balance-pass.md`
4. `reward-feedback-and-visibility.md`
5. `battle-pile-inspection.md`

This would keep each implementation batch focused and reduce the chance of Copilot making broad, messy changes.

---

## 9. Immediate next step

Use this document as the basis for the next Copilot prompt sequence.

The next prompts should be grouped into small implementation passes instead of one large rewrite.

Recommended first prompt batch:

1. Route Select UI simplification + lore alignment
2. Branching route data/path model
3. Battle HUD readability structure
4. Early card/enemy balance pass
5. Reward feedback for Boons/Shards
6. Deck/discard inspection support

