# Enemy and Relic Implementation Rules

## Goal

Translate the approved content from first-design-sheet.md into simple, v1-friendly gameplay rules.

The goal is not to implement every possible future mechanic.
The goal is to preserve the spirit of the approved design while keeping the implementation compact and readable.

---

## Enemy Implementation Principles

For v1:
- enemies should be easy to read
- intents should be visible and understandable
- enemies should use small intent cycles instead of complex AI
- each enemy should teach one clear lesson

Recommended enemy fields:
- id
- name
- tier (`common`, `elite`, `boss`)
- maxHp
- intents
- visualHint or spriteKey later
- reward profile if needed later

Recommended intent fields:
- id
- label
- effectType
- value
- armorValue (optional)
- burnValue (optional)
- reflectValue (optional)

---

## Common Enemies

### Rato Oco
Design intent:
- introductory enemy
- weak attacks
- sometimes protects itself

Suggested implementation:
- HP: low
- Intent cycle:
  - Attack 5
  - Defend 4
  - Attack 6

Purpose:
- teach attacking and defending
- low complexity first enemy

### Acólito de Espinhos
Design intent:
- attrition enemy
- applies a light negative effect

Suggested implementation:
- HP: medium-low
- Intent cycle:
  - Attack 4 + Burn 1
  - Defend 3
  - Attack 5 + Burn 1

Purpose:
- teach pressure over time
- introduce a small status effect without becoming overwhelming

### Besouro das Ruínas
Design intent:
- defensive enemy
- gains armor, then attacks harder

Suggested implementation:
- HP: medium-high
- Intent cycle:
  - Gain 6 armor
  - Attack 8
  - Gain 4 armor
  - Attack 10

Purpose:
- teach timing and burst windows

---

## Elite Enemy

### Cavaleiro Cinzento
Design intent:
- first real skill check
- alternates between heavy blows and a fortified stance
- may reflect a small amount of damage

Suggested implementation:
- HP: high
- Intent cycle:
  - Heavy Attack 10
  - Fortify: Gain 8 armor and Reflect 2
  - Attack 7
  - Fortify: Gain 6 armor and Reflect 2

Purpose:
- punish autopilot play
- force balance between defense and burst

Reflect rule for v1:
- when reflect is active, the hero takes a fixed small amount of damage when attacking
- keep reflect simple and visible

---

## Boss Enemy

### Slime Corrompida
Design intent:
- memorable first boss
- phase-based escalation
- visually unstable and increasingly dangerous

Suggested implementation:
- HP: boss-tier
- Two phases

Phase 1 intent cycle:
- Slam 8
- Defend 6
- Slime Burst 6 + Burn 1

Phase 2 trigger:
- activate when boss HP falls below 50%

Phase 2 intent cycle:
- Empower: Gain 6 armor
- Heavy Slam 14
- Corrupt Burst 8 + Burn 2

Purpose:
- create a clear escalation moment
- keep the fight readable without adding minions yet

For v1:
- do not implement summoned slime minions yet
- keep phase change simple and explicit

---

## Relic Implementation Principles

For v1:
- relics should be passive
- relics should be easy to explain in one line
- relics should hook into existing systems
- avoid relics that require a new subsystem unless very small

Recommended relic fields:
- id
- name
- description
- effectType
- value

---

## Approved Relics

### Anel de Brasa
Effect:
- gain 1 Ember at the start of each combat

Implementation timing:
- apply when a new battle session is created

### Broquel Gasto
Effect:
- the first time each combat that the hero gains block, gain +3 additional block

Implementation timing:
- apply during combat when block is granted
- only once per combat

### Presa de Rato
Effect:
- the first Attack played each combat deals +2 damage

Implementation timing:
- apply when resolving the first attack card of the combat
- only once per combat

### Lasca da Coroa
Effect:
- every 3 turns, draw 1 extra card

Implementation timing:
- check on player turn start
- if turn number is divisible by 3, draw +1

### Lanterna do Peregrino
Effect:
- heal 4 HP after elite and boss battles

Implementation timing:
- apply after victory, only for elite and boss encounters

---

## V1 Simplification Rules

To keep implementation lightweight:
- do not add complex debuff stacks beyond what the current game can already support cleanly
- keep burn simple
- keep reflect fixed and visible
- use small intent cycles instead of procedural AI
- preserve readability over system depth

---

## Priority Order for Implementation

1. common enemies
2. elite enemy
3. relic behavior
4. boss phase behavior
5. extra polish / better balancing
