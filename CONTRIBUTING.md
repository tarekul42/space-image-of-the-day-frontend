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
