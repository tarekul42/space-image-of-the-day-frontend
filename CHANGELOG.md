# Changelog

## [1.5.0] - 2026-08-03

### Added
- **Live sky engine** — a pure `astronomy` module (JD/GMST/LST, equatorial→horizontal, visibility filtering) drives a real star map that resolves the user's location (with graceful fallback), shows only what's above the horizon now, and plots live planet positions from compact Keplerian elements
- **Cosmic search** — new backend `/api/v1/catalog/search` over a curated catalog (stars, Messier/NGC deep-sky, planets) with ranked autocomplete; the search box surfaces cosmic suggestions and can open them on the live sky map, with an offline local catalog fallback
- **Timeline thread** — gallery cards now match objects to the catalog; a per-day "N in sky" button and the detail view highlight confirmed objects on the live star map
- **Daily "First Contact" trivia** — a one-line cosmic fact picked deterministically from the date (no network) shown on the dashboard and under the current image
- **Favorites ("Sorted Objects")** — heart a discovery to save it to IndexedDB, browsable in a new gallery Favorites tab with remove, shared across tabs
- **Gentle theme engine** — `cosmic`, `nebula`, `aurora`, and `daylight` themes applied via CSS variables, selectable in the in-tab Settings menu and on the Options page, live-synced across tabs
- **Historical time travel** — the gallery jumps to any date from `1995-06-16` (APOD's first day) onward; the backend range endpoint now chunks long windows past NASA's 30-day limit and can skip translation for bulk backfills

### Changed
- Manifests (Chrome + Firefox) synced to `1.5.0`; added `geolocation` permission for the live sky
- Settings store, options, and menus extended with `theme`
- Test suite grew to 70 tests (astronomy, catalog matching, daily facts, theme helpers)

## [1.4.2] - 2026-08-03

### Added
- Unified settings store: `language`, `allowLowRes`, `highContrast`, `reducedMotion`, `searchEngine`, and `viewMode` now live in one `storage.settings` object via a new `settings.service` (legacy `localStorage` keys migrated on read)
- Options page gains Language, Allow Low-Res, and Search Engine settings
- New-tab settings live-sync with the Options page via `storage.onChanged`
- Search-engine choice in the Dashboard (Google / Bing / DuckDuckGo)
- `FETCH_RANGE` background handler routes the "This Week" gallery through the service worker with an offline cached fallback + "you're offline" badge
- `check:version` script + CI step that fails the build if manifests drift from `package.json`
- Top-sites fallback message when the `topSites` permission is unavailable
- Unit tests for buffer pop/evict rules and settings/search helpers (suite now 34 tests)

### Changed
- New-tab hydration now consumes the prefetch queue through the service worker (`FETCH_RANDOM` pops + tracks `last_shown`) instead of peeking `buffer[0]`; removed the duplicate fetch in `App`
- First-run language defaults to the browser locale when no explicit choice is stored
- High-contrast / reduced-motion toggles now reach the new-tab UI
- Manifests (Chrome + Firefox) synced to `1.4.2`

## [1.4.1] - 2026-08-02

### Fixed
- Offline fallback in `FETCH_APOD` could return the seed list or settings object as the APOD; now only ISO date-keyed entries are considered
- Removed dead `CLEAR_BUFFER` message handler (superseded by `RESET_CACHE`)
- Cache cleanup keep-list now only includes real APOD date keys instead of storage meta keys

### Changed
- Buffer and fallback paths now avoid showing the same image twice in a row by tracking the last-shown date

## [1.4.0] - 2026-07-31

### Added
- `RESET_CACHE` background handler for full cache reset (storage + IndexedDB + seed re-seed)

### Changed
- Seed images moved from hardcoded `starterApods.ts` into user-side `chrome.storage.local` (`seed_cache`) on install
- Buffer now uses FIFO eviction: newly downloaded images replace the oldest buffered images
- Empty-buffer fallback now prefers a random previously-cached image from IndexedDB before falling back to seed data
- Install kicks off 3 parallel refills so the buffer fills with real NASA images faster
- Options "Clear Cache" now resets via `RESET_CACHE`, returning the extension to a fresh-install state
- Fixed pre-existing TypeScript error in buffer refill mutex typing

## [1.3.0] - 2026-07-27

### Added
- Productivity dashboard with search bar and top sites grid
- D3-based interactive celestial star map (150+ stars, 15 constellations)
- "This Week in Space" gallery view (7-day APOD grid)
- Backend `/api/v1/apod/range` endpoint for date-range fetching
- Content Security Policy in Chrome manifest
- Docker Compose setup for full-stack local development
- Unit tests (20 tests for utility functions)
- GitHub Actions CI with test step
- Privacy policy, contributing guide, code of conduct
- Issue templates (bug report + feature request)

### Changed
- Replaced full d3 bundle with d3-selection + d3-zoom (-400KB)
- Pinned Vercel host permission (removed wildcard `*.vercel.app`)
- Added `unlimitedStorage` to Firefox manifest
- Deep health check endpoint (probes Redis + MongoDB)
- NASA API key moved from sync to local storage
- Translation failures now propagate a warning to the frontend

### Fixed
- Race condition in buffer refill (replaced boolean flag with async mutex)
- Gallery now shows error state with retry button on fetch failure
- Removed unused LanguageSelector component
- Added 10s timeout to all NASA API calls
