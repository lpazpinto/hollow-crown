# Core Loop V2 — RPG Card-Crawler Direction

## Purpose

This document captures the current design direction for the project after the first playable prototype.

It exists to:
- record the agreed gameplay pivot
- give future AI coding/design help a stable reference
- keep implementation aligned with the intended identity of the game
- avoid drifting back into a generic Slay the Spire-like structure

This document should be treated as a high-level product and implementation guide.

---

## Current Strategic Direction

The game should evolve from a **deckbuilder roguelike prototype** into a **light RPG card-crawler**.

The goal is **not** to abandon the deckbuilder combat core.

The goal is to:
- keep the card-based combat
- keep short-run replayability
- keep web-friendly scope
- add stronger hero identity
- add progression that feels more like an RPG
- reduce the feeling that the game is only “another Slay the Spire-like”

### Identity statement

The game should feel like:

> a fantasy pixel-art RPG card-crawler where the hero grows during the run, learns powers, upgrades cards, and becomes more expressive through animation and presentation

Not:
- a pure deck-only roguelike
- a heavy RPG with stats/equipment trees
- a clone of Slay the Spire
- a clone of Monster Train

It should sit in the middle:
- simple deckbuilder combat
- light RPG progression
- strong visual character identity
- readable and compact systems

---

## Core Philosophy

### Keep the spine

The following should remain core to the game:
- turn-based card combat
- compact deck management
- roguelike run structure
- encounter map
- elites and boss
- card rewards
- short runs
- readable strategy

### Add hero-centered progression

The hero should feel like a character on a journey, not just a container for the deck.

This means adding:
- XP per battle
- level-ups during the run
- level-up choices
- card upgrades
- hero abilities / blessings / shard powers

### Avoid overcomplication

The game should **not** become a full RPG with:
- permanent stat point allocation
- large talent trees
- equipment grids
- many nested progression currencies
- complex board mechanics
- too many active abilities

The project should stay:
- compact
- readable
- fast to learn
- technically lightweight
- suitable for Poki/web play

---

## New Core Loop Direction

## Previous loop

The prototype currently trends toward:

`battle -> reward card -> relic -> battle`

## New loop

The intended direction is:

`battle -> gain XP -> occasional card reward -> level-up choice -> stronger battle -> elite/boss spike`

### Meaning

The deck should no longer be the only important source of progression during a run.

The player should grow through:
- deck changes
- hero level-ups
- hero abilities / blessings
- card upgrades
- visual and emotional feedback

---

## XP and Leveling

## Goal

The hero should gain XP after battles and level up during a run.

This gives the game a stronger RPG identity and creates a second layer of progression besides deckbuilding.

## XP Rules

For v1 of this new direction:
- normal battles should grant XP
- elite battles should grant more XP
- boss fights should grant a large XP spike or trigger special progression
- XP should be run-based, not permanent meta progression

## Level-Up Choice

When the hero levels up, the player should choose one reward.

Recommended initial choices:
- **Upgrade a card**
- **Gain a hero ability**
- **Optional small heal or utility option** if needed for balance

### Important

Level-ups should feel meaningful but lightweight.

Do not create:
- huge upgrade menus
- giant branching trees
- permanent account progression yet

---

## Card Rewards vs Hero Progression

## New reward philosophy

Card rewards should still exist, but they should happen **less often** than in the current prototype.

### Reason

If the player gains cards after every battle and also grows in other ways, the deck can bloat too fast and the deck becomes the only thing that matters.

### New balance intention

- some battles give card rewards
- some progression comes from XP and level-ups
- elites and bosses create larger power spikes
- the run should feel like hero growth, not just deck accumulation

### Card acquisition intent

Cards should still matter, but they should not be the only way the player improves.

---

## Relics vs Abilities

## New direction

The current relic system should **not** simply be deleted.

Instead, its role should shift.

### Recommendation

Treat current relic-like effects as one of the following:
- **Abilities**
- **Blessings**
- **Crown Gifts**
- **Shard Powers**
- **Talents**

The exact final name can be decided later.

## Why

This keeps the useful passive-run-modifier structure, but presents it in a way that feels more connected to the hero and world.

This is better than removing the system completely and rebuilding from scratch.

## Practical rule

For implementation purposes:
- passive run modifiers can still behave similarly to relics
- but their fantasy/presentation should feel more hero-centered and less generic

---

## Hero Identity

## Un1 should feel like a real protagonist

The hero is not just a deck owner.

Un1 should feel like:
- a fantasy hero
- a character who grows during the run
- a central visual presence in battle
- someone with a unique combat identity

### Current identity direction

Un1 is built around:
- direct attacks
- defense
- magical ember/brasa effects
- a playful but magical fantasy tone

That identity should remain intact.

---

## Ember / Brasa Philosophy

## Ember should remain the hero signature resource

Ember/Brasa is part of what makes Un1 distinct.

It should stay in the game.

### But it must be managed carefully

Ember should:
- feel special
- not flood the player constantly
- have good spend payoffs
- remain readable

### Current agreed direction

- Ember should be capped
- Ember should not be generated too freely
- Ember spenders should feel stronger than simple “if you have Ember” checks
- cards and abilities should clearly state when they gain or spend Ember

### Presentation rule

Use a single term consistently across the project:
- either **Ember**
- or **Brasa**

Do not mix terms inconsistently in UI and content text.

---

## Starter Deck and Card Progression

## Starter deck

The hero should **not** start with all designed cards.

### Current agreed rule

- initial designed card pool: 10 cards
- starting deck: 8 cards
- repeated basic cards are acceptable
- some designed cards should be discovered later as rewards

### Why

This helps:
- simplify early turns
- make rewards more exciting
- support growth during the run
- avoid giving every tool at once

## Rarity

Cards should use a light rarity system:
- Common
- Uncommon
- Rare

No Epic/Legendary for now.

Rarity should help:
- shape reward frequency
- control power level
- make rewards feel more exciting

---

## Battle Presentation Direction

The battle scene should become much more characterful.

It should no longer feel like a bare prototype.

## Battle Scene V2

The intended layout is:
- top center: small encounter info
- left side: hero visual area
- right side: enemy visual area
- bottom center: hand / draw / discard
- bottom right: End Turn

The hero and enemy should be the visual focus.

The battle scene spec is documented separately in:

`docs/battle-scene-v2.md`

---

## Animation and Juice Direction

## General principle

The game should become more expressive and less static.

Animation should improve player satisfaction and help sell the hero fantasy.

## Agreed direction

### Hero idle
- pixel-art style
- simple 2-step idle
- not a smooth float tween
- active mainly during player turn

### Damage feedback
Both hero and enemy should have:
- red hit flash
- floating damage number
- quick readable feedback

### Stronger battle moments
The game should gradually add:
- different hero motion on special cards
- stronger hit reactions
- screen shake on heavy damage
- small camera emphasis on signature moves
- more exciting special attack presentation

## Important scope rule

These effects should be layered in gradually.

Do not build a huge animation framework too early.

---

## Desired Feel Compared to Other Games

## Slay the Spire comparison

The game should move away from feeling like:
- “a fantasy Slay the Spire clone”

### What to keep from that tradition
- readable card combat
- replayable runs
- meaningful choices

### What to change
- stronger hero identity
- more in-run hero growth
- more expressive battle presentation
- less deck-only progression

## Monster Train inspiration

The inspiration is **not** to make the hero a card.

The useful inspiration is:
- the character itself matters
- the hero should feel like an actual unit/protagonist
- progression should involve the character, not only the deck

---

## What We Are Greenlighting

The following ideas are currently approved as direction:

- move toward a light RPG card-crawler identity
- add XP per battle
- add level-ups during the run
- allow level-up choices
- allow card upgrades through progression
- reduce the dominance/frequency of card-only rewards
- preserve the deckbuilder combat core
- keep Ember/Brasa as Un1’s signature resource
- make battle presentation more expressive
- make special cards feel more special through animation/camera feedback
- keep the visual/art direction coherent with the fantasy pixel-art identity

---

## What We Are Not Greenlighting Yet

The following should **not** be treated as approved for immediate implementation:

- turning the hero into a playable card
- full RPG stat sheets
- large skill trees
- inventory systems
- equipment systems
- permanent account-wide progression trees
- many active abilities at once
- complex board positioning systems
- large-scale combat system rewrites without documentation first

---

## Implementation Strategy

The change should be implemented in phases.

## Phase 1 — Documentation and alignment
- update design docs
- clarify progression model
- define XP and level-up rules
- define how abilities/blessings replace or reframe relics
- clarify reward cadence

## Phase 2 — Systems
- add XP tracking
- add level-up triggers
- add first level-up choice flow
- add card upgrade flow
- rebalance reward cadence

## Phase 3 — Presentation
- improve hero animation
- improve special-card feedback
- improve heavy-hit feedback
- add small camera emphasis for important actions

## Phase 4 — Content and polish
- align abilities/blessings with hero identity
- rebalance card pool
- rebalance Ember economy
- improve visual cohesion

---

## AI Guidance Rules

Future AI help should follow these rules:

1. Do not treat the game as a pure Slay the Spire clone.
2. Do not remove the deckbuilder combat core.
3. Favor light RPG progression layered on top of the existing combat loop.
4. Favor hero identity and character growth.
5. Keep systems compact and web-friendly.
6. Avoid overengineering.
7. Prefer small readable modules and simple flows.
8. Use the hero, not only the deck, as a source of progression and personality.
9. Preserve fantasy pixel-art coherence in presentation choices.
10. Document major design changes before implementing them.

---

## Short Summary

The new direction is:

- keep the deckbuilder roguelike spine
- add a light RPG layer
- make the hero grow during the run
- reduce the feeling of being a genre clone
- improve battle presentation and character expression
- preserve readability, compact scope, and web-friendliness

In one sentence:

> The game should become a fantasy pixel-art RPG card-crawler where the hero grows during the run through XP, level-ups, abilities, and card upgrades, while still keeping a compact, readable deckbuilder combat core.
