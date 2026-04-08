# Shards of the Hollow Crown — Card Art Direction v1

## Purpose

This document defines the **first-pass visual rules for card pixel art** in *Shards of the Hollow Crown*.
It exists to help production stay consistent while we build the first playable slice.

This is focused on three things:

1. **Choosing a controlled palette**
2. **Locking the overall card visual design**
3. **Creating art rules for the card illustrations**

The goal is not maximum detail. The goal is **clarity, charm, fast readability, and easy iteration**.

---

## Source alignment

This art direction follows the current project brief:

- fantasy pixel art with **clarity first**
- readable at small size
- inviting and adventurous rather than grim
- lightweight enough for web play
- visually strong without becoming noisy

That means card art should feel magical and polished, but never overloaded with rendering, gradients, or realistic shadow work.

---

## Core visual principles

### 1. Readability beats detail
A player should understand the card at a glance before reading all text.

### 2. Strong silhouette beats complex rendering
The art on each card should read from shape first, not from tiny decorative details.

### 3. Fewer shades, stronger contrast
We should prefer 2–3 value steps per material instead of many subtle transitions.

### 4. Color coding should help gameplay
The frame color and icon language should instantly suggest the card category.

### 5. The card should still work when shrunk
If the card is reduced in size, the main icon or action should still remain recognizable.

---

## Target style

### Desired feel
- charming fantasy
- heroic and magical
- clean pixel clusters
- simplified materials
- bold highlights
- readable symbols

### Avoid
- excessive texture noise
- painterly shading
- too many shadow layers
- muddy greys and desaturated brown overload
- thin one-pixel details that only work at full zoom
- realistic lighting or airbrushed glow

---

## Master palette v1

We should work from **one shared master palette** and then use only a subset of it per card.

### Palette size recommendation
- **Global project palette for cards:** 24–26 colors
- **Per card illustration:** ideally 6–10 colors
- **Per material:** usually 3 values max
  - base
  - shadow
  - highlight

### Palette preview
See `shards_card_palette_v1.png` in the same folder.

### Approved palette v1

#### Neutrals / UI base
- Outline — `#0A0F1A`
- Deep Navy — `#142232`
- Slate — `#2A3248`
- Stone — `#4A4A56`
- Bone — `#E8E2C6`
- White Pop — `#F6F3E8`

#### Nature / support / exploration
- Forest Dark — `#1A5029`
- Forest Mid — `#2E7A43`
- Leaf Bright — `#63AB51`
- Moss — `#A3C95A`

#### Earth / leather / crown fragments
- Leather Dark — `#6E2518`
- Leather Mid — `#976343`
- Warm Sand — `#C9A16B`
- Gold — `#D2AA42`

#### Damage / fire / aggression
- Ruby Dark — `#8A1F14`
- Ruby Mid — `#C23B22`
- Flame — `#F48A1D`
- Light Flame — `#FBE66A`

#### Defense / clarity / steel / energy
- Blue Dark — `#0B2A4F`
- Blue Mid — `#1F5E9C`
- Sky — `#62B7E6`
- Cyan Glow — `#B8F0FF`

#### Magic / curses / rare effects
- Arcane Dark — `#3A2452`
- Arcane Mid — `#6D45A3`
- Magenta — `#B45AC9`
- Poison — `#7BD24C`

---

## How to use the palette

### Hard rules
- Do not introduce a new color unless there is a real readability reason.
- Avoid smooth gradients.
- Avoid more than **3 shades on one surface**.
- Black should almost never be true black; use `#0A0F1A` as the outline anchor.
- The brightest colors should be saved for:
  - magic accents
  - hot highlights
  - important interaction points

### Practical use
- Frames and UI should mostly live in the neutral palette.
- The illustration should use the card family color as an accent, not flood the whole image.
- Warm highlights should be used sparingly so rare or powerful cards can still pop later.

---

## Card family color language

This should remain simple and readable.

### Attack
**Primary colors:** ruby, flame, gold accents  
**Mood:** impact, aggression, momentum

### Skill / Defense
**Primary colors:** blue dark, blue mid, cyan glow  
**Mood:** protection, technique, control

### Utility / Trick
**Primary colors:** green family with neutral support  
**Mood:** setup, draw, movement, economy

### Magic / Special / Corruption / Rare
**Primary colors:** purple family, poison green, selective glow  
**Mood:** mystery, arcane risk, special power

### Neutral / Starter cards
**Primary colors:** slate, bone, muted blue or muted gold accents  
**Mood:** foundational, readable, basic tools

---

## Overall card design direction

We should aim for a card layout that feels **solid, readable, and game-first**.

### Recommended structure
1. **Top band**
   - card name
   - optional small family icon
2. **Main art window**
   - simple pixel illustration of the action or object
3. **Text box**
   - effect text kept short
4. **Bottom markers**
   - rarity pip, upgrade mark, or class symbol if needed
5. **Energy cost badge**
   - one strong corner anchor

### Design goals
- thick silhouette and frame readability
- enough empty space to breathe
- art window bigger than decorative ornamentation
- frame decoration used sparingly
- no overdesigned corners or heavy filigree

### Frame philosophy
The frame should support the card art, not fight with it.

That means:
- flat readable shapes
- 1px or 2px highlight logic
- limited bevel effect
- minimal internal noise
- decorative crown language only in key spots

---

## Recommended frame construction

### Outer border
- dark outline using `#0A0F1A`
- inner rim in family color
- small bright highlight only on top-facing edges

### Title bar
- solid color plate
- high contrast white or bone text
- optional icon at left of title

### Art window
- simple inset panel
- little to no texture
- background values kept lower than the main subject

### Text box
- calm and readable
- darker than title bar
- enough contrast for short text at small size

### Cost badge
- strong color contrast
- should be readable instantly from peripheral vision
- circular gem or blocky medallion both work, but it must be consistent

---

## Pixel art rules for the card illustrations

These rules matter more than the exact subject.

### 1. One action per card image
Each card art should communicate **one idea only**.

Examples:
- sword slash
- shield raise
- horn charge
- ember burst
- crown shard
- arrow shot
- healing spark

Do not try to show a full scene with multiple actors unless the card truly requires it.

### 2. Use iconic composition
The subject should be centered around a strong silhouette.

Good examples:
- shield front view
- diagonal sword slash
- glowing ember in open palm
- crown fragment floating over dark background

### 3. Keep backgrounds minimal
Card art backgrounds should support contrast, not tell a story.

Use:
- flat dark panel
- subtle shape backdrop
- soft abstract magic pattern
- simple stone or smoke suggestion

Avoid:
- full environment paintings
- perspective-heavy scenes
- detailed backgrounds that reduce readability

### 4. Use cluster-based shading
Favor large pixel groups over noisy single-pixel dithering.

### 5. Selective highlights only
Use bright highlight pixels to guide focus:
- weapon edge
- flame core
- shield rim
- shard glint
- eye glow

### 6. Minimal anti-aliasing
Only use selective AA when a diagonal shape truly needs it.
Most edges should remain crisp.

---

## Shadow and lighting rules

Because we want simplicity and web readability:

### Allowed
- 1 main shadow value
- 1 highlight value
- optional brightest accent for magic or metal pop

### Not recommended
- 4–5 step ramps on tiny objects
- soft blended shadows
- multi-directional lighting
- ambient occlusion style rendering

### Lighting logic
Use a simple readable light bias:
- top/front light for UI objects
- glow from inside for magic
- darkest values reserved for outline separation

---

## Suggested card art size workflow

Exact engine dimensions can be adjusted later, but the art process should stay stable.

### Working recommendation
- design card at **large pixel mockup size first**
- keep illustration area on a fixed grid
- export with nearest-neighbor scaling only

### Practical illustration area
A good starting point is to treat the art window as something like:
- **48x48 px** for simple icons
- **64x64 px** for richer hero-action cards

That is enough for readable pixel art without inviting over-detail.

---

## Content hierarchy inside the card

When the player looks at a card, the order of recognition should be:

1. family color
2. main illustration silhouette
3. cost
4. title
5. effect text

If the text is the first thing the eye notices, the card is probably too visually weak.

---

## Rarity handling

Rarity should not completely recolor the whole card.
Use small controlled signals instead.

### Common
- restrained frame accents
- low glow

### Uncommon
- slightly richer accent color
- tiny crown shard or jewel detail

### Rare
- stronger highlight contrast
- more luminous badge, gem, or crown marker
- subtle arcane or gold accent, but still readable

---

## Upgrade handling

Upgraded cards should be identifiable without redrawing the entire card.

Recommended signals:
- brighter title accent
- one extra pip or gem
- enhanced border corner mark
- slightly stronger highlight on the art frame

---

## Icon language suggestions

To keep cards readable, some effects should rely on recurring mini-icons.

Examples:
- sword = attack
- shield = block
- ember = burn / brasa
- shard = crown energy
- droplet / spark = magic resource
- boot / arrow = movement / quick action
- coin = economy / reward

These icons should share the same outline and shading philosophy as the card art.

---

## Card image subject guidelines for this project

Because the world is based on a broken magical crown and fantasy adventure, the card art should frequently draw from:

- unicorn horn strikes
- glowing embers
- crown shards
- defensive sigils
- blades and shields
- magical sparks
- simple enemy silhouettes
- relic-like objects
- banners, charms, and tokens

The card art should reinforce the world identity instead of feeling like generic fantasy clip art.

---

## What the first batch of cards should prove

Before making a huge card set, the first batch should test the style.

### Recommended test batch
Create 6 sample cards:

1. basic attack
2. basic defend
3. ember attack
4. healing/support card
5. crown shard utility card
6. rare flashy signature card

If these six feel coherent together, the system is working.

---

## Production workflow recommendation

### Phase 1 — palette lock
Approve this palette or revise it once.
Do not keep endlessly changing colors after implementation starts.

### Phase 2 — frame exploration
Create 2 or 3 grayscale card frame mockups.
Choose one before painting many cards.

### Phase 3 — sample card set
Make the 6 test cards listed above.

### Phase 4 — review at in-game size
Check them in actual combat UI, not only zoomed in.

### Phase 5 — full card production
Only after readability is proven should we scale the set.

---

## Quality checklist for every card

Before approving a card, confirm:

- Is the main action readable in one second?
- Does the silhouette work at small size?
- Is the frame supporting the art instead of overpowering it?
- Are there too many colors for this card?
- Are shadows simple enough?
- Is the family color obvious?
- Does it still fit the project's inviting fantasy tone?

---

## First conclusion

For *Shards of the Hollow Crown*, the best card art direction is:

- a **controlled fantasy pixel palette**
- **simple and iconic card illustrations**
- **low-noise frames with strong category colors**
- **minimal shadow complexity**
- **consistent world motifs** tied to embers, relics, unicorn energy, and crown shards

This should help the game feel readable, charming, and scalable for a web-first deckbuilder.

---

## Immediate next step

After approval of this document, the next production task should be:

**Create 3 card frame mockups and 6 sample card arts using this palette.**
