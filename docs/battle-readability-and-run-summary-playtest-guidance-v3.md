# Battle Readability and Run Summary Playtest Guidance V3

## Purpose

This document captures the latest playtest feedback focused on battle readability, reshuffle presentation, stat display clarity, effect terminology, and run-summary inspection.

It should be used together with:

- `docs/project-north-star.md`
- `docs/route-rewards-levelup-direction-update.md`
- `docs/playtest-feedback-next-direction.md`
- `docs/route_reward_ux_playtest_guidance_v2.md`

This document is the current source of truth for the topics below until replaced by a newer playtest pass.

---

## 1. Reshuffle animation must be a readable event

### Problem

The discard-to-deck reshuffle animation is currently too fast, too small, and too low on the screen. It reads like a barely visible background event instead of a meaningful part of the card flow.

### New direction

Reshuffle should feel like a visible mini-event in combat.

### Rules

- Make the reshuffle animation larger than it is now.
- Slow it down so the player can understand what happened.
- Move the animation slightly above the current deck/discard row.
- Make the animation read clearly as cards being pulled from discard back into deck.
- If needed, add a brief `Reshuffle` label or small effect accent.

### Recommended implementation target

- Total duration around `600–900ms`
- Animation center slightly above the current hand/deck area
- Noticeably larger card motion than the current effect
- Clear visual travel from discard toward deck

### Design goal

The player should be able to instantly understand that the discard pile has been recycled back into the deck.

---

## 2. Remove oversized stat boxes from hero and enemy

### Problem

The current health/armor boxes around hero and enemy are too large and take up too much visual space. They compete with the battle stage and make the layout feel heavier than necessary.

### New direction

Health and armor should float near each unit instead of sitting in large boxed panels.

### Rules

- Hero HP and armor should appear above or near the hero sprite.
- Enemy HP and armor should appear above or near the enemy sprite.
- Use compact icon-first display:
  - heart icon + HP value
  - shield icon + armor value
- Avoid large backing panels unless absolutely necessary for readability.
- Keep enough contrast to remain readable on dark backgrounds.

### Design goal

The battle stage should feel more open, and unit stats should feel physically attached to the characters.

---

## 3. Blessings vs Passives is too confusing

### Problem

Players currently have difficulty understanding the difference between Blessings and Passives. The current labels are not clear enough, and the player also cannot easily tell what effects are currently active.

### New direction

Use clearer terminology and consolidate the presentation of active effects.

### Terminology decision

- `Boon` = temporary next-battle effect
- `Passive` = persistent run effect
- Avoid using `Blessings` in the battle HUD if it overlaps with `Boon`

### UI direction

Instead of separate tiny hard-to-read labels, use a clearer active-effects presentation.

Recommended structure:

- `Active Effects`
  - `Boon: <name or none>`
  - `Passives: <count>`

This area should be inspectable.

### Inspection behavior

On click/tap, open a lightweight panel that shows:

- current boon
- list of current passives
- short descriptions of what they do

### Design goal

At any point, the player should understand:

- what temporary effect is active
- what persistent effects exist in the run
- what each effect does

---

## 4. Run Summary in Domain Path must be functional

### Problem

The `Run Summary` area in Domain Path looks interactive, but currently nothing happens when the player clicks it.

### New direction

If the player presses Run Summary, it should open a useful current-run overview.

### Required content

The Run Summary panel should show:

- current HP
- current Level
- current XP
- shard progress
- active boon
- current passives
- relic list
- current deck list

### UI direction

- Keep the summary compact by default on the main screen.
- On click/tap, open a lightweight overlay or panel.
- The panel should be readable and easy to dismiss.
- Reuse any existing inspection UI if possible.

### Design goal

The player should be able to inspect current run state before making route decisions.

This is especially important because route choices now depend on understanding current resources, deck quality, passive effects, and recovery needs.

---

## 5. Battle readability should favor compact information attached to gameplay space

### Problem

Several current UI elements are technically informative but visually heavy. This makes the battle screen harder to read than it should be.

### New direction

Prioritize compact information that sits close to the part of the screen it refers to.

### Rules

- Unit stats belong near units.
- Deck/discard reshuffle belongs visually near deck/discard but should still be readable.
- Temporary and persistent effects should be grouped more clearly.
- Avoid large empty boxes that compete with character sprites and cards.

### Design goal

The battle screen should feel lighter, clearer, and more physically grounded around:

- hero
- enemy
- hand
- deck/discard flow
- current active effects

---

## 6. Implementation priority from this playtest round

### Priority list

1. Improve reshuffle presentation so it reads clearly.
2. Replace large hero/enemy stat boxes with compact floating stats.
3. Clean up Blessings vs Passives terminology and presentation.
4. Make Run Summary clickable and useful in Domain Path.

---

## 7. Implementation guardrails

When implementing these changes:

- prefer focused UX improvements over large rewrites
- keep future art replacement in mind
- preserve current battle logic unless a UI issue requires a small structural change
- reuse existing inspection panels where possible
- keep the interface readable on web-sized layouts
- prefer concise labels and icon-based summaries when possible

---

## 8. Summary

This playtest pass pushes the project toward better battle readability and better run-state inspection.

The player should:

- clearly see when a reshuffle happens
- read health and armor near the actual units
- understand the difference between Boons and Passives
- inspect current run state from Domain Path without confusion

These changes should improve clarity, reduce visual clutter, and make the game easier to understand without changing the core systems direction.
