# Project North Star

## Shards of the Hollow Crown

Project pitch and guiding brief for a Poki-oriented fantasy pixel-art card-crawler.

**Genre:** Roguelike card-crawler / light deckbuilder  
**Theme:** Stylized fantasy pixel art  
**Purpose:** North-star project brief

---

## Document purpose

This brief captures the project north star: what kind of game we are building, why it fits the platform, how the player experience should feel, and what the first execution priorities should be.

---

## Core idea

A replayable fantasy card-crawler with short runs, quick choices, and lightweight deckbuilding.

---

## Player promise

Easy to start, satisfying to learn, and inviting enough to trigger “one more run.”

---

## Run length

Around 10–15 minutes per full run, with individual battles usually under a minute.

---

## Controls

Mouse or touch. Tap or drag cards, pick encounters, and end turns with minimal friction.

---

## Creative guardrail

Charming, readable pixel art and adventure tone — never muddy, text-heavy, or grim for the sake of it.

**Working principle:** every decision in the project should support fast web-friendly onboarding, short but satisfying sessions, and a clean visual identity that is easy to read on small screens.

---

## 1. Project vision

Shards of the Hollow Crown is intended to be a compact, replayable fantasy game built specifically for the habits of web players. The long-term ambition is not to create a giant desktop-style, systems-heavy card game. It is to create a game that feels instantly inviting, strategically satisfying, and easy to return to.

The project should combine three strengths into one package:

- the clean readability of pixel art
- the replayability of roguelike structure
- the tactical pleasure of card-based combat

The result should feel like an adventure the player can understand quickly and still enjoy mastering over repeated runs.

### Fast entry

The player should start making meaningful choices almost immediately.

### Short satisfying loops

Battles and encounters should resolve quickly, but each one should matter.

### Readable strategy

Cards, enemies, relics, and status effects must remain understandable at a glance.

### Replay value

Runs should vary enough to create curiosity and support “one more run” behavior.

---

## 2. The core pitch

The kingdom has been broken apart by the Hollow Crown, an ancient force that corrupted the land and scattered its remnants into dangerous regions. The player controls a wandering hero who ventures into those cursed areas, battles corrupted creatures, collects shards, and grows stronger across repeated expeditions.

Each run is a small adventure. The player chooses which encounter card to face next, survives turn-based battles using a compact deck, collects new cards and relics, and pushes toward a region boss. Success unlocks deeper progress; failure still feeds the broader progression of the account.

---

## 3. How the game is played

The main interaction loop should remain clear and simple.

- Start a run with one hero and a starter deck.
- Choose between visible encounter cards on the path.
- Enter turn-based battles or special events.
- Play cards using limited energy each turn.
- Win rewards such as cards, relics, healing, or gold.
- Reach the boss, survive, and carry progress into future runs.

The strategic depth should come from small repeated decisions rather than overwhelming complexity. The player should regularly face simple but meaningful tradeoffs: attack now or defend, heal now or risk one more elite battle, take a strong card or preserve deck consistency.

---

## 4. Why this concept is a good fit

This concept is intentionally shaped around web-first realities. It supports short sessions, teaches itself through visuals, and does not require heavy lore or lengthy setup before the player can start having fun. The card-crawler structure also works well with touch and mouse input, which keeps the project friendly to both desktop and mobile-first play.

Just as importantly, the concept leaves room for strong thumbnails, memorable characters, and a distinct visual signature. Those are major advantages when the game needs to look appealing before a player has even clicked into it.

---

## 5. Core systems

### Combat

Turn-based card combat. The player draws a small hand, spends limited energy, and reacts to enemy intentions. Systems should stay compact during the first version: direct damage, block, poison or burn, draw, and a small number of signature hero mechanics.

### Exploration

Runs are made of encounter cards rather than free movement. This keeps the game readable and production-friendly while still delivering tension and route planning.

### Relics

Relics provide run-defining modifiers. They are crucial because they make repeated runs feel distinct and help create memorable stories.

### Heroes

The first version should begin with one hero only. Additional heroes can be introduced later once the core loop proves fun and understandable.

### Meta progression

Losing a run should still grant some form of progress such as unlock currency, card pool expansion, or access to a new region.

### Included in the first playable slice

- One hero
- One region
- A compact starter deck
- Basic enemy intents
- A first relic pool
- One boss and a clean win / lose loop

### Explicitly out of scope for version one

- Deep narrative campaign
- Many heroes at launch
- Overloaded status systems
- Large amount of dialogue
- Complex economy systems
- Anything that slows the first minutes of play

---

## 6. Art direction

The art direction should be fantasy pixel art with clarity first. The visual target is adventurous and magical, not grim or muddy. Even when the setting is cursed, the game should still feel inviting rather than oppressive.

- Readable silhouettes and strong contrast between heroes, enemies, and interactive cards
- Bright magical accents against controlled backgrounds
- Distinct biome palettes so each region feels memorable
- Card art that remains legible at small sizes
- A tone closer to charming danger than to horror or tragedy

Because pixel art will carry much of the game’s charm, the project should establish a visual rulebook early: character proportions, palette ranges, card frame treatment, UI icon style, and how effects such as fire, poison, shields, and curses should look.

---

## 7. Player fantasy and emotional tone

The player should feel like a clever adventurer entering dangerous ruins, squeezing value out of scarce resources, and surviving just one more encounter. The emotional rhythm should alternate between tension and reward: danger, choice, payoff, and curiosity about what comes next.

The game should avoid emotional flatness. Winning a battle should feel punchy. Taking a relic should feel meaningful. Approaching a boss should feel slightly intimidating. The best outcome is a game that feels small in scope but rich in moment-to-moment satisfaction.

---

## 8. Success criteria

The first playable build should be considered successful if it demonstrates the following:

- A new player can understand the basic loop without a long explanation.
- A single run is enjoyable even with only one hero and one biome.
- The game already creates the desire to replay.
- The visual style feels coherent and memorable.
- The project remains technically lightweight and easy to iterate.

---

## 9. Recommended first production steps

### Step 1 — Lock the fantasy lane

Confirm the tone, world shape, and visual references. Define what the kingdom, corruption, relics, and hero silhouettes should feel like before producing broad art.

### Step 2 — Write the first design sheet

List the starter hero, starter deck, ten to fifteen basic cards, first relic pool, first enemy set, and first boss concept.

### Step 3 — Create concept art targets

Produce rough concepts for the hero, two basic enemies, one elite enemy, one boss, one region background, and card frame ideas.

### Step 4 — Build the vertical slice

Implement the minimum playable flow: title, run start, encounter selection, card combat, reward screen, boss fight, and end-of-run state.

### Step 5 — Test clarity before scale

Check whether players understand the loop and whether the battles already feel satisfying before expanding content.

---

## 10. Guiding rules for future decisions

- Prefer clarity over feature count.
- Prefer short fun loops over long explanations.
- Prefer strong visual identity over generic fantasy decoration.
- Prefer systems that feel good immediately over systems that only become interesting after hours.
- Prefer a polished small slice over a large unfinished design.

---

## Project north star

Build a fantasy pixel-art card-crawler that feels welcoming in seconds, strategic within minutes, and replayable over many short runs.
