/**
 * services/catalog.service.ts — Cosmic catalog search ("search that learns the cosmos").
 * Queries the backend `/catalog/search` endpoint, silently falling back to the
 * bundled offline seed catalog so suggestions keep working on slow or offline
 * moments.
 */
import { CosmicObject, searchLocalCatalog } from '../data/catalog';

const BACKEND_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
const CATALOG_SEARCH_URL = `${BACKEND_BASE}/catalog/search`;

export async function searchCosmicCatalog(q: string, limit = 8): Promise<CosmicObject[]> {
  const needle = q.trim();
  if (needle.length < 2) return [];

  try {
    const url = new URL(CATALOG_SEARCH_URL);
    url.searchParams.set('q', needle);
    url.searchParams.set('limit', String(limit));
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Catalog search failed (${res.status})`);
    const json = (await res.json()) as { data?: CosmicObject[] };
    if (Array.isArray(json.data) && json.data.length > 0) return json.data;
    return searchLocalCatalog(needle, limit);
  } catch {
    return searchLocalCatalog(needle, limit);
  }
}
