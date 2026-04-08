# Art Rules — Hollow Crown

This document defines the visual rules for **Hollow Crown / Shards of the Hollow Crown**.
Its purpose is to keep the game's art readable, consistent, and fast to produce.
When there is doubt, prefer **clarity, charm, and gameplay readability** over detail.

---

## 1. Visual north star

The game must look like **charming fantasy pixel art** with a sense of magical adventure.
It should feel **inviting**, **readable**, and **memorable**, never muddy, overly grim, or visually noisy.

### Core pillars
- Clarity first
- Strong silhouettes
- Simple, readable shapes
- Controlled colors with a few bright magical accents
- Charming danger, not horror
- Easy to read at small web-game sizes

### One-line target
**A cute but strategic fantasy card-crawler with readable pixel art, clean UI, and magical accents over controlled backgrounds.**

---

## 2. Non-negotiable rules

These rules override personal preference, AI creativity, and unnecessary detail.

1. **Readability beats detail.**
2. **Every important element must be readable at a glance.**
3. **Assets must still work when scaled small on a browser screen.**
4. **Do not overrender.** Avoid painterly shading, excessive texture, and noisy effects.
5. **Do not make the world grim for the sake of it.** Corruption should feel mystical and dangerous, not gorey or oppressive.
6. **All assets must feel like they belong to the same game.**
7. **If an asset is hard to replicate by hand, it is too complex.**

---

## 3. Mood and tone

### Desired tone
- Adventurous
- Magical
- Playful but not silly
- Slightly mysterious
- Tense during combat, rewarding after victory
- Charming even when cursed

### Avoid
- Horror visuals
- Excessive darkness
- Muddy palettes
- Hyper-detailed fantasy armor
- Realistic anatomy
- Heavy, dramatic rendering
- Visual clutter that competes with gameplay

---

## 4. Pixel art style rules

### General rendering
- Use **simple pixel art**, not faux-pixel images with smooth gradients.
- Keep shading minimal and intentional.
- Prefer **1 to 3 levels of shading** per main material.
- Avoid airbrush-style blending.
- Avoid unnecessary sub-pixel noise.
- Use highlights sparingly and only to support form or magic.

### Outlines
- Use clean outlines when needed for readability.
- Outline treatment should be consistent across similar asset families.
- Do not use overly thick outlines unless the asset is tiny and needs help reading.
- Internal linework should be minimal.

### Detail density
- Faces, armor, cloth, and props should be simplified.
- Suggest detail with shape language first, not texture.
- One clear visual idea per asset is better than many small ideas.

---

## 5. Shape language

### Heroes
- Soft, appealing, readable silhouettes
- Slightly rounded forms
- Friendly proportions
- Clear focal features

### Enemies
- Clear role-driven silhouettes
- Small/basic enemies: simple and instantly readable
- Elites: more angular, heavier, more imposing
- Bosses: broad silhouette with one memorable gimmick

### UI and cards
- Rectangular, clean, readable shapes
- Ornament only where it helps identity
- Avoid excessive filigree or tiny decoration

---

## 6. Character proportions

Use slightly stylized proportions that support charm and readability.

### General guidelines
- Heads/features should read clearly at small size.
- Limbs should not be too thin to animate or read.
- Accessories should be bold enough to identify quickly.
- Small asymmetry is welcome if it reinforces identity.

### Hero baseline
For the starter hero style, favor:
- a charismatic silhouette
- readable magical details
- one crown-shard motif integrated into the design
- an overall cute, brave, approachable presence

---

## 7. Color and palette rules

### Palette philosophy
Use **controlled palettes**. Each asset should feel disciplined, not rainbow-heavy.

### Rules
- Limit colors per asset whenever possible.
- Use a restrained base palette plus **one or two accent colors**.
- Magical effects may be brighter than the base character.
- Backgrounds must stay more controlled than interactive gameplay elements.
- Do not let effects overpower gameplay readability.

### Functional color language
Use color to support instant recognition.

Suggested gameplay color anchors:
- **Attack**: warm reds / ember tones
- **Defense / block**: cool blues
- **Magic / relic / blessing energy**: golds, teals, or violet accents depending on the system
- **Corruption / curse**: sickly purple-green or dark magical tones, but still readable
- **Unique / rare card emphasis**: yellow-gold treatment used carefully and consistently

Do not use color coding inconsistently across screens.

---

## 8. Contrast rules

- Gameplay-critical objects must pop from the background.
- Heroes and enemies must be separable in value and color.
- Cards must remain legible while fanned in hand.
- Important icons must still read without zooming.
- Background contrast should support atmosphere without stealing focus.

When unsure, increase **shape clarity first**, then value contrast, then color contrast.

---

## 9. Backgrounds and environments

Backgrounds should support the fantasy mood without distracting from combat.

### Rules
- Keep backgrounds simpler than characters and cards.
- Use broader shapes and fewer attention-grabbing highlights.
- Each biome should have its own recognizable palette identity.
- Background storytelling is welcome, but secondary.
- Avoid excessive detail directly behind characters or UI.

### Region direction
The world is cursed, but the art should still feel adventurous.
Think: ancient ruins, magical remnants, corrupted relic energy, mysterious paths, soft fantasy danger.

---

## 10. Corruption language

Corruption is part of the setting and should have a consistent visual treatment.

### Corruption should feel
- magical
- unstable
- ancient
- invasive
- readable

### Corruption should not feel
- gorey
- slimy in every case
- realistic body horror
- visually noisy

### Visual cues
Use a small set of recurring cues:
- crown shard fragments
- cracked magical glow
- thorny or fractured motifs
- floating particles
- warped edges or asymmetry
- contained but noticeable glow accents

---

## 11. FX rules

Effects must be satisfying but simple.

### Desired feeling
- punchy
- magical
- easy to read
- quick to understand

### Rules
- Do not cover the whole screen with particles.
- Keep hit effects readable and brief.
- Fire, shields, curses, poison, and relic energy should each have a distinct look.
- Use FX to reinforce mechanics, not to decorate randomly.
- The player should understand the effect category immediately.

### Examples
- **Block/shield**: clean, solid, cool-toned shapes
- **Fire/ember**: sharp, warm, bright, energetic
- **Corruption/curse**: unstable, fractured, dark-magic feel
- **Relic/blessing**: elegant, luminous, special but controlled

---

## 12. Card art rules

Cards are gameplay-first assets.

### Non-negotiables
- Card type must be visually obvious.
- Rarity or uniqueness must be readable quickly.
- The card should still read when small and partially overlapped.
- Frames must be simpler than traditional TCG illustration frames.
- Avoid decoration that is hard to reproduce consistently.

### Card layout priorities
1. Type recognition
2. Cost readability
3. Name readability
4. Art readability
5. Rarity recognition
6. Effect text support

### Card frame philosophy
- Simple frame structures
- Strong type identity
- Limited ornament
- Repeatable by hand
- Easy to expand later

---

## 13. UI rules

UI should be clean, readable, and secondary to the fantasy charm.

### Rules
- UI must never feel mobile-game noisy.
- Icons should be simple and distinct.
- Numbers must be readable instantly.
- Health, armor, energy, and status indicators should be understandable with minimal text.
- Use ornament carefully and consistently.
- Remove decorative elements that do not improve understanding.

### Health and combat readability
- Combat information should be easy to parse from the main play area.
- Floating values or compact indicators are preferred over oversized containers.
- Buffs, passives, blessings, and relic-like systems must not visually blend together.

---

## 14. Asset family rules

Every family should have internal consistency.

### Characters
- Same pixel density
- Same shading logic
- Same outline philosophy
- Same style of highlights

### Enemies
- Clear tier separation: common, elite, boss
- Consistent corruption language
- Role legibility before detail

### Cards
- Same proportions
- Same text hierarchy
- Same corner treatment
- Same icon system

### UI
- Shared icon language
- Shared spacing logic
- Shared panel treatment
- Shared typography logic

---

## 15. Production rules for AI-assisted art

These rules apply whenever using PixelLab or other AI tools.

1. AI generates **first pass**, not final truth.
2. Approved assets must be cleaned before final use.
3. Do not commit raw exploratory generations as final assets.
4. Keep all experiments in a separate `_raw` folder.
5. Do not allow the model to reinvent the project style each prompt.
6. Reuse the same project language, palette targets, and silhouette rules every time.
7. Prefer iterative refinement over one-shot generation.

### Prompting rules
Every art prompt should specify:
- asset type
- gameplay role
- silhouette goal
- mood
- palette restraint
- readability requirement
- what to avoid

---

## 16. Complexity limits

If an asset breaks any of these, simplify it.

### Too complex means
- too many colors
- too many tiny details
- unclear silhouette
- hard to identify at small size
- hard to animate
- hard to redraw consistently
- FX overpower the sprite
- frame/UI decoration distracts from function

---

## 17. Approval checklist

Before an asset is approved, ask:

- Is it readable at game scale?
- Is the silhouette distinct?
- Does it match the project's tone?
- Is the palette controlled?
- Is the gameplay function obvious?
- Is the corruption/magic language consistent?
- Could this be replicated by hand without pain?
- Does it fit the existing asset family?
- Is it simpler than the previous version while keeping identity?

If the answer to any major item is no, revise it.

---

## 18. Current starter visual anchors

These are the first approved direction anchors for the vertical slice.

### Starter hero
**Un1, o Unicórnio da Coroa Partida**
- charismatic unicorn hero
- fantasy pixel art
- bright magical details
- integrated crown fragment motif
- balanced between cute and heroic

### First enemy set direction
- **Rato Oco**: small, quick, lightly corrupted
- **Acólito de Espinhos**: corrupted cultist with thorny/magical cues
- **Besouro das Ruínas**: heavier defensive beetle with ancient plated shell

### First elite and boss direction
- **Cavaleiro Cinzento**: corrupted armored elite, intimidating but readable
- **Slime Corrompida**: memorable corrupted slime boss with visible crown fragments and unstable magical energy

---

## 19. Final rule

When forced to choose between:
- beauty vs readability
- richness vs speed
- complexity vs consistency
- spectacle vs clarity

Choose:
**readability, speed, consistency, and clarity.**

That is the Hollow Crown art style.
