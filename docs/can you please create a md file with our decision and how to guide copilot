# Route Select and Boss Reward Direction

## Purpose

This document records the agreed direction for replacing the current generic run map flow with a more distinctive route-select structure.

It exists to:
- define the new map/progression direction
- make the game feel less like a generic node-based deckbuilder roguelike
- document how boss choice and boss rewards should work
- give future AI coding/design help a stable reference
- keep implementation aligned with the new identity of the project

This document should be treated as a high-level product and implementation guide.

---

## Core Decision

The game should move away from a generic “choose the next node before each battle” map flow.

Instead, it should move toward a **route-select structure inspired by stage/boss selection games**, adapted to this project’s fantasy RPG card-crawler identity.

The new structure should feel closer to:

- choosing which dangerous domain or boss route to tackle next
- progressing through a short themed path
- defeating a route boss
- receiving a route-specific reward
- choosing the next route afterward

The goal is **not** to copy Mega Man directly.

The goal is to borrow the strength of that structure:
- clear route identity
- meaningful boss choice
- strong reward fantasy
- memorable progression

---

## Identity Goal

The new route system should make the game feel more like:

> a fantasy pixel-art RPG card-crawler where the player chooses which cursed domain to challenge, defeats its ruler, and claims themed powers/cards from that victory

And less like:

> a generic roguelike map where the player clicks a node before every battle

This supports the project’s broader direction:
- stronger identity
- more hero-centered progression
- more world flavor
- less genre-clone feeling

---

## High-Level Loop Direction

## Old map loop

The current prototype trends toward:

`menu -> map -> battle -> reward -> map -> battle`

## New route loop

The intended direction is:

`menu -> route select -> short route path -> boss -> boss reward -> route select`

### Meaning

The player should not feel like they are just moving from battle to battle on an abstract node map.

They should feel like they are choosing:
- which hostile region to enter
- which route boss to challenge
- what kind of reward/power they want to pursue

---

## Route Select Philosophy

## What the route select screen should do

The route select screen should:
- present multiple route choices
- communicate that each route is different
- make the player feel like they are choosing a meaningful hunt/domain/stage
- preview the reward identity of each route
- become a core progression screen for the run

## What it should not feel like

It should not feel like:
- a plain node screen
- a generic text-only menu
- a spreadsheet of encounters
- a temporary stop before the “real game”

The route select screen should feel important and thematic.

---

## Recommended Route Structure

Each route should represent a themed domain or challenge path.

Each route should ideally have:
- a route name
- a biome/theme
- a boss
- an enemy pool
- a reward identity
- a boss signature reward

### Example structure

A route may be composed of:
- 1 or 2 normal battles
- 1 optional rest or utility stop
- 1 elite or stronger pre-boss encounter
- 1 boss fight

This should remain short and web-friendly.

The route should feel distinct without becoming long or bloated.

---

## Route Select vs Route Progress

The system should be understood as **two layers**.

## Layer 1: Route Select

This is the stage/boss selection screen.

The player chooses **which route to tackle next**.

It should show:
- route name
- boss name or silhouette
- visual route panel/button
- short reward hint
- optionally a danger or theme hint

## Layer 2: Route Progress

After the player chooses a route, they enter a short path associated with that route.

This path can still use familiar encounter logic:
- battle
- elite
- rest
- boss

But it should now be **inside a route**, not the whole world map.

---

## Boss Reward Philosophy

## Core decision

After defeating a route boss, the player should receive a **boss-themed reward**.

This is inspired by the idea of receiving a meaningful power from the defeated boss, similar in spirit to stage/boss reward games.

However, it should be adapted to this project’s deckbuilder/RPG hybrid identity.

## Recommended v1 reward model

For the first implementation, the cleanest version is:

**Boss reward = 1 signature card**

This is recommended because it is:
- easy to understand
- exciting
- thematically strong
- compatible with the current deckbuilder combat
- easier to implement than a large new reward system

## Future possible boss rewards

Later, this may expand into:
- boss signature abilities/blessings
- route-specific passive powers
- small route card packages
- special route unlocks

But for v1 of this system:
- use a single strong signature card reward

---

## Signature Reward Rules

Each boss should eventually have:
- one signature reward identity
- one signature card or equivalent power
- a clear thematic link between boss and reward

The player should feel:
- “I beat this boss”
- “I earned something that belongs to this route”
- “This changes how my run plays”

That is the emotional target.

---

## Current v1 Scope

The system should be introduced in a lightweight way.

## Immediate recommended implementation

Because the project currently has only one fully usable boss path:

- implement the route-select structure now
- show multiple route slots
- allow only one route to be playable at first
- mark the others as locked / sealed / coming soon / unknown

This gives the game the correct structure immediately without requiring all future content to exist now.

## Good v1 presentation

Example route-select state:
- 1 active route
- 2 or 3 locked routes
- route panels still visible so the player understands the intended system

This is better than pretending the game already has a fully populated boss roster.

---

## Naming Direction

The route-select screen should not necessarily keep the generic label “Run Map”.

Possible naming directions:
- Route Select
- Choose Your Route
- Choose Your Hunt
- Shattered Roads
- Crown Paths
- Choose a Domain

The chosen name should fit the fantasy tone of the game.

Similarly, the short progression inside a chosen route may later be named:
- Route Path
- Domain Path
- Expedition Path

The important thing is:
- route choice should feel thematic
- not generic

---

## Thematic Route Examples

These are example structures for future design intent, not immediate implementation requirements.

### Hollow Warrens
- theme: rats, scavengers, decay
- reward identity: speed, chip damage, swarm pressure
- boss reward: a rapid multi-hit or vermin-themed attack card

### Ashen Bastion
- theme: ruined knights, armor, fortification
- reward identity: armor, counterplay, heavy impacts
- boss reward: a fortified strike or guard-break style card

### Corrupt Mire
- theme: slime, corruption, burning decay
- reward identity: burn, spread, scaling corruption
- boss reward: a corruption/slime-themed burst card

These examples exist to explain the direction:
- each route should feel distinct
- each boss should have identity
- each reward should reflect that identity

---

## UX Goals for Route Select

The route-select screen should communicate:
- this is a meaningful choice
- each route is different
- the player is choosing a challenge, not just a node
- the run has multiple possible paths
- future expansion is possible

The screen should remain:
- readable
- compact
- web-friendly
- visually thematic

---

## Implementation Strategy

The route-select direction should be implemented in phases.

## Phase 1 — Route Select Refactor
Replace the current generic Run Map with a route-select style screen.

Requirements:
- multiple route panels
- only one may be playable at first
- other routes may be visibly locked
- route choice should feel intentional

## Phase 2 — Route Path Integration
After a route is chosen, enter a short route progression path.

Requirements:
- route-specific encounter progression
- still lightweight
- boss remains the climax of the route

## Phase 3 — Boss Signature Reward
After defeating the route boss:
- award a boss-themed signature card
- make the reward feel stronger than a normal card reward

## Phase 4 — Future Expansion
Later, when content exists:
- add more playable routes
- add more bosses
- add more signature rewards
- improve route-specific enemy pools and route identity

---

## Design Rules

Future design and implementation should follow these rules:

1. Do not fall back to a generic node-before-every-battle flow if the route-select identity can be preserved.
2. Route choice should feel meaningful.
3. Boss rewards should feel earned and thematic.
4. The system should stay compact and web-friendly.
5. Route identity should support the game’s fantasy tone.
6. Avoid overengineering.
7. Prefer lightweight route-specific content over large abstract map systems.
8. Do not require many bosses to exist before the route-select structure is introduced.
9. Keep the implementation future-proof so more routes can be added later.
10. Document major changes before large implementation shifts.

---

## Guidance for Copilot / Future AI Work

When helping with this part of the game, AI should follow these rules:

### Structural rules
- Treat the current direction as a route-select system, not a generic run map.
- Prefer route-based flow:
  - route select
  - short route progression
  - boss
  - boss reward
- Keep the system lightweight.

### UX rules
- Make route panels visually distinct and easy to understand.
- Communicate playable vs locked routes clearly.
- Keep reward hints short and readable.
- Do not overload the screen with too much text.

### Reward rules
- Boss rewards should feel more special than normal card rewards.
- Prefer signature cards first.
- Keep the reward strongly tied to the route/boss identity.

### Scope rules
- Do not require a full roster of real bosses before implementing the new screen structure.
- Support 1 real route + placeholder locked routes as a valid first version.
- Avoid building a huge world map or complex route tree in the first implementation.

### Theme rules
- Keep the fantasy pixel-art identity.
- Avoid UI that feels too generic or too sci-fi/modern.
- Route selection should feel like choosing a cursed domain, hunt, or path.

---

## What Is Approved

The following ideas are approved as direction:

- replace the generic run map feel with a route-select structure
- make boss choice a stronger part of the run identity
- use a short route path before each boss
- give boss-themed rewards after victory
- use signature boss cards as the first boss reward model
- allow placeholder/locked routes in the first implementation
- keep the system compact and future-expandable

---

## What Is Not Approved Yet

The following should not be treated as immediate requirements:

- a giant world map
- many fully implemented bosses right away
- route-specific shops/events for every route
- highly complex branching route trees
- large meta progression systems tied to route selection
- a full Mega Man clone structure

The inspiration is selective:
- choose a route
- defeat its boss
- gain its themed reward

---

## Short Summary

The new direction is:

- replace the generic run map feel with a route-select structure
- let the player choose which boss route to tackle
- make each route feel like a themed domain/challenge
- keep the path inside the route short and readable
- reward boss victories with a signature themed card
- support 1 playable route + locked placeholders as a valid first implementation

In one sentence:

> The game should move from a generic run map toward a fantasy route-select structure where the player chooses which domain/boss path to challenge next, defeats that route’s boss, and earns a themed signature reward from that victory.
