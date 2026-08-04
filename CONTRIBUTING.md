# Contributing

## Setup

```bash
bun install
cp .env.example .env  # Add your NASA_API_KEY
bun run dev           # Frontend dev server
```

## Project Structure

- `src/Components/Discovery/` — Main APOD display components
- `src/Components/Dashboard/` — Search and top sites dashboard
- `src/Components/Gallery/` — Weekly gallery view
- `src/Components/UI/` — Shared UI primitives
- `src/context/` — React context providers
- `src/services/` — API service layer
- `src/utils/` — Utility functions
- `public/manifest.json` — Chrome extension manifest

## Code Style

- TypeScript with strict mode
- No `any` types (use proper interfaces)
- Use `cn()` utility for Tailwind class merging
- Follow existing component patterns (framer-motion, Tailwind)

## Pull Requests

1. Branch from `main`
2. Run `bun run lint` and `bun run test` before submitting
3. Keep PRs focused on a single concern
4. Update CHANGELOG.md if applicable

## Testing

```bash
bun run test        # Run unit tests
bun run test:watch  # Watch mode
```

## 🌌 Cosmic Catalog Contributions

We welcome community contributions to expand our celestial catalog (Messier/NGC deep sky targets, constellations, bright stars, and planets).

To contribute a new object:
1. Open `src/data/catalog.ts` (and backend equivalent `backend/src/app/modules/catalog/catalog.data.ts`).
2. Add an entry matching the `CosmicObject` interface:
   ```typescript
   {
     id: 'm31',
     name: 'Andromeda Galaxy',
     aliases: ['M31', 'NGC 224'],
     ra: 10.6847,         // Right Ascension in degrees (0–360)
     dec: 41.2687,        // Declination in degrees (-90 to +90)
     objectType: 'Galaxy',
     constellation: 'Andromeda',
     magnitude: 3.44,
     distanceLy: 2500000,
     description: 'The nearest major galaxy to the Milky Way.',
   }
   ```
3. Run `npm test` to ensure search index and catalog matching tests pass cleanly.

