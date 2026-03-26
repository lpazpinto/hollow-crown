# Copilot Instructions for Hollow Crown

## Project Overview

**Hollow Crown** is a card-based roguelite game built with [Phaser 3](https://phaser.io/) and TypeScript, bundled with Vite. The game features pixel art fantasy aesthetics, turn-based combat, a resource system called **Brasa** (Ember), and procedural progression inspired by games like Slay the Spire.

## Tech Stack

- **Language:** TypeScript (strict mode, ES2020 target)
- **Game Framework:** Phaser 3 (`^3.90.0`)
- **Bundler:** Vite (`^6.3.1`)
- **Node.js** is required for development

## Project Structure

| Path | Description |
|------|-------------|
| `index.html` | Main HTML entry point |
| `public/assets/` | Static game assets (sprites, audio, etc.) served at runtime |
| `src/main.ts` | Application bootstrap — mounts the game on `DOMContentLoaded` |
| `src/game/main.ts` | Phaser game configuration and factory function |
| `src/game/scenes/` | All Phaser game scenes (e.g., `Game.ts`) |
| `vite/` | Vite config files for dev (`config.dev.mjs`) and prod (`config.prod.mjs`) |
| `docs/` | Design documentation (in Portuguese) |

## Development Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm run dev` | Start local dev server (hot reload at `http://localhost:8080`) |
| `npm run build` | Create a production build in `dist/` |
| `npm run dev-nolog` | Dev server without anonymous telemetry |
| `npm run build-nolog` | Production build without anonymous telemetry |

## Game Design Context

The game is designed in **Brazilian Portuguese** in all design documents. The in-game content (card names, abilities, UI text) is also in Portuguese.

### Hero: Un1 — The Unicorn of the Broken Crown

- **Passive — Faísca da Coroa (Crown Spark):** the first time each turn the player plays both an Attack card and a Skill card, they gain 1 Brasa.
- **Brasa (Ember):** a combat resource consumed by certain cards for bonus effects.

### Card Types

- **Ataque (Attack):** deal damage to enemies
- **Habilidade (Skill):** provide block, draw cards, or generate Brasa

### Core Game Concepts

- **Bloqueio (Block):** temporary shield that absorbs damage for one turn
- **Queimadura (Burn):** a damage-over-time debuff
- **Relíquias (Relics):** passive items that provide persistent bonuses throughout a run

## Coding Conventions

- All source files use **TypeScript** with strict mode enabled (`strict: true`).
- Phaser scenes extend the `Scene` class and follow Phaser lifecycle hooks: `preload()`, `create()`, `update()`.
- Assets are loaded via `this.load.setPath('assets')` and referenced by key string.
- Keep scene logic inside the appropriate lifecycle method; avoid side effects in constructors beyond calling `super()`.
- Unused locals and parameters are disallowed (`noUnusedLocals`, `noUnusedParameters`).
- Use `ESNext` module syntax (`import`/`export`).

## Asset Conventions

- Static assets (images, audio) go in `public/assets/` and are referenced by relative path (e.g., `'assets/bg.png'`).
- Bundled assets can be imported directly in TypeScript with `import img from './assets/file.png'`.

## Notes for Copilot

- When adding new Phaser scenes, create them in `src/game/scenes/` and register them in the `scene` array in `src/game/main.ts`.
- Game design decisions and card/enemy/relic specifications are documented in `docs/first-design-sheet.md`.
- The project has no test framework set up yet; do not add tests unless explicitly requested.
- The game resolution is **1024×768** with `Scale.FIT` and `Scale.CENTER_BOTH` for responsive scaling.
