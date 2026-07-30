# Privacy Policy

**Space Image of the Day** does not collect, store, or transmit any personal data.

## Data Storage

- **Settings** (language preference, NASA API key, display options) are stored locally in `chrome.storage.local` and never leave your device.
- **Image cache** (APOD images and metadata) is stored locally in your browser's IndexedDB and extension storage. Cached data can be cleared at any time via the extension's Options page.
- **Top sites** (if you enable the Dashboard) are read via the `topSites` API and displayed locally. This data is never transmitted or stored.

## Network Requests

The extension makes requests to:
- **NASA APOD API** — to fetch astronomy pictures
- **SIMBAD** (CDS, Strasbourg) — to enrich astronomical data
- **Your configured backend** (default: `space-image-of-the-day-backend.vercel.app`) — to proxy and cache API responses

No identifying information is included in these requests beyond standard HTTP headers.

## Third-Party Services

No analytics, tracking, or advertising services are used. The extension has no telemetry.

## Changes

If this policy changes, the extension version will be updated and the changes documented here.
