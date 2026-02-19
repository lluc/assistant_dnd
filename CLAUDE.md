# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Assistant D&D MJ** is a vanilla JavaScript PWA (Progressive Web App) for Dungeons & Dragons 5E game masters. It provides equipment search (via the D&D5E API), dice rolling, and favorites management. The UI is in French.

No build step, no bundler, no framework — static files served directly. ES6 modules work natively in modern browsers.

## Development Commands

```bash
npm run serve        # HTTP server on http://localhost:8000
npm run serve-https  # HTTPS server (required to test PWA install prompt)
```

No linting or test framework is configured.

## Architecture

### Entry Point & Routing

[index.html](index.html) bootstraps the app. [js/app.js](js/app.js) is the main controller — it handles hash-based SPA routing (`#equipment`, `#favorites`, `#dice`), event delegation between components, and PWA lifecycle (service worker registration, install prompt, update prompts).

### Web Components (Shadow DOM)

All UI is built with native Web Components in [js/components/](js/components/):

- **[header.js](js/components/header.js)** — Navigation tabs, active state
- **[equipment-search.js](js/components/equipment-search.js)** — Search input, category filters, results list
- **[equipment-card.js](js/components/equipment-card.js)** — Equipment detail cards, modal, favorite toggle, unit conversions (ft→m, lbs→kg), French currency translation
- **[dice-roller.js](js/components/dice-roller.js)** — Quick dice buttons (d4–d20, d100), custom rolls, history (50 entries), modifier support

Components communicate via custom DOM events (`navigation`, `search-results`, `favorite-toggled`, `show-details`) dispatched up to `app.js`.

### Services

- **[js/api.js](js/api.js)** — Wraps the D&D5E API (`https://www.dnd5eapi.co/api/2024`) with a 5-minute in-memory cache. Methods: `getEquipmentList()`, `getEquipmentDetails(index)`, `getEquipmentCategories()`, `searchEquipment(query)`.
- **[js/utils/storage.js](js/utils/storage.js)** — LocalStorage manager for favorites, search history, dice history, and user preferences.
- **[js/utils/performance.js](js/utils/performance.js)** — Performance metrics and API request monitoring (dev utility).

### PWA / Service Worker

[sw.js](sw.js) uses a **cache-first** strategy. Cache name is versioned (`dnd-assistant-v5`) — increment this when assets change to trigger the update prompt in `app.js`. The HTTPS server is required to test the install prompt locally.

### Styling

Two CSS files, no preprocessor:
- [css/main.css](css/main.css) — Global theme via CSS variables (medieval parchment palette, Cinzel/Crimson Text fonts), layout
- [css/components.css](css/components.css) — Component-specific styles

CSS variables for theming are defined on `:root` in `main.css`. BEM naming convention is used.

## Key Conventions

- **French UI** — All user-facing strings are in French. Currency units are translated (`gp`→`po`, `sp`→`pa`, etc.) in `equipment-card.js`.
- **Commit format** — Conventional Commits: `type(scope): description` (types: feat, fix, docs, style, refactor, test, chore).
- **No dependencies** — Do not add npm runtime packages. The project is intentionally zero-dependency.
- **Shadow DOM** — Component styles live inside Shadow DOM; global CSS does not reach them. Use CSS parts or custom properties to style from outside if needed.
