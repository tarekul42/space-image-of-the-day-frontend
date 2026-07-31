# Changelog

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
