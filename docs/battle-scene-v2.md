# Battle Scene V2

## Goal

Upgrade the current battle screen from a functional prototype into a clearer and more expressive combat layout.

This version should:
- improve readability
- make the hero and enemy feel more present
- support current gameplay systems without large architectural changes
- prepare the scene for future art improvements

The battle scene should still remain lightweight and easy to iterate on.

---

## Main Layout Direction

The battle screen should move away from the current centered prototype layout and follow this structure:

- **top center**: small encounter/run information
- **left side**: hero visual area
- **right side**: enemy visual area
- **bottom center**: hand, draw pile, discard pile
- **bottom right**: End Turn button

The hero and enemy visuals should become the main focal points of the battle scene.

Status boxes should support the visuals, not replace them.

---

## Layout Specification

## Top Center

Show only small run/combat information, such as:
- Encounter type
- Floor number

Examples:
- `Encounter: Battle`
- `Floor 1 / 4`

Notes:
- keep this area compact
- avoid large prototype text like "Battle Prototype"
- this area should inform, not dominate the scene

---

## Left Side: Hero Area

The hero visual area should be placed in the upper-left battle area.

### Hero Sprite

Use the current unicorn sprite files stored at:

- `public/assets/hero/hero_idle.png`
- `public/assets/hero/hero_victory.png`

Rules:
- use `hero_idle.png` during normal battle
- `hero_victory.png` is reserved for victory-related states later
- the sprite should be clearly visible and larger than a card
- do not stretch it disproportionately
- keep enough empty space around the sprite so combat feedback can be read

### Hero Status Box

Place the hero status box below the hero sprite.

It should show:
- Hero HP
- Hero Armor
- Energy

The hero status box should remain readable and stable during combat.

---

## Right Side: Enemy Area

The enemy visual area should be placed in the upper-right battle area.

### Enemy Visual

For now:
- use current placeholder enemy visual logic if needed
- position future enemy art in this same area

### Enemy Status Box

Place the enemy status box near the enemy visual area.

It should show:
- Enemy name
- Enemy HP
- Enemy Intent

The intent should remain easy to read during combat.

---

## Bottom Center: Card Area

The bottom center area should contain:
- Draw Pile label/count
- Hand label
- Discard Pile label/count
- current hand cards

### Card Layout

- cards should remain centered
- spacing should be readable on desktop and mobile landscape
- cards should remain fully touch-friendly
- hand layout should avoid feeling too cramped

---

## Bottom Right: End Turn

The End Turn button should remain anchored on the bottom-right side of the battle screen.

Requirements:
- large enough for touch input
- visually distinct
- readable at a glance
- should not overlap with hand cards

---

## Animation and Feedback Rules

## Hero Idle Animation

During the **player's turn**, the idle unicorn sprite should move gently up and down.

### Behavior
- small vertical bob only
- subtle movement
- slow looping tween
- yoyo motion
- continuous while player turn is active

### Suggested feel
- movement range: about 4 to 8 pixels
- duration: about 900ms to 1400ms
- repeat: infinite while active

### Turn behavior
- active during player turn
- paused or stopped during enemy turn

This helps communicate that the player currently has control.

---

## Damage Feedback

Both hero and enemy should use the same general damage feedback system.

### On damage taken
- target flashes slightly red
- a floating damage number appears above the target
- the number moves slightly upward
- the number fades out and disappears

### Suggested feel
- flash duration: about 100ms to 180ms
- floating text rise: about 20 to 35 pixels
- fade duration: about 350ms to 500ms

### Visual rule
Damage feedback should be readable but fast.
It should feel responsive without cluttering the screen.

---

## Armor Gain Feedback

Armor gain feedback is recommended for clarity.

### On armor gain
- show a floating positive number above the target
- use a distinct non-damage color, such as blue/cyan
- move slightly upward
- fade out

This should be more subtle than damage feedback.

---

## Victory Visual Rule

For this version:
- use the idle unicorn sprite during normal combat
- the victory unicorn sprite may be used later during battle win state, reward scene, or end-of-run victory
- victory sprite integration is not required for the first implementation of Battle Scene V2

---

## Focus Hierarchy

The player's eye should naturally read the scene in this order:

1. Hero
2. Enemy
3. Hand
4. End Turn button

This is the intended visual priority.

The old centered enemy box should no longer be the primary visual anchor of the battle scene.

---

## Implementation Guidelines

Keep implementation lightweight.

Recommended helper behaviors:
- start hero idle tween
- stop/pause hero idle tween
- flash a target when damaged
- show floating combat text
- play hit feedback for hero and enemy

These helpers can live in `PlayScene.ts` or a very small UI helper if needed.

Do not introduce:
- large animation systems
- managers
- class-heavy abstractions

Keep the scene easy to understand and easy to adjust.

---

## Compatibility Requirements

Battle Scene V2 must preserve the current working systems:
- battle flow
- hand interactions
- turn system
- enemy actions
- map flow
- rewards
- relics
- save/load

The refactor should improve presentation without breaking the playable loop.

---

## Mobile / Touch Notes

Battle Scene V2 is intended to be **landscape-first** on mobile.

Requirements:
- all main controls remain readable in landscape
- cards remain easy to tap
- End Turn remains easy to tap
- layout should not depend on hover behavior
- portrait handling is managed separately through the rotate-device flow

---

## V2 Scope Boundaries

Included in Battle Scene V2:
- layout update
- hero sprite placement
- hero idle bob animation
- hero damage feedback
- enemy damage feedback
- floating combat text
- cleaner visual hierarchy

Not required in Battle Scene V2:
- enemy sprite art overhaul
- card frame art overhaul
- victory sprite integration everywhere
- advanced animation systems
- screen shake
- particle systems
- full polish pass

---

## Success Criteria

Battle Scene V2 is successful when:
- the scene looks closer to a real game than a prototype
- the hero is visually present on the left side
- the enemy is visually present on the right side
- the hand remains readable
- End Turn remains clear and easy to tap
- player turn feels alive through hero idle movement
- taking damage feels responsive through flash + floating text
- the current gameplay loop still works correctly
