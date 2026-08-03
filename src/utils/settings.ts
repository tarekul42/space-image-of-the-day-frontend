/**
 * utils/settings.ts — Pure settings model & helpers (no browser APIs).
 * Kept pure so it is trivially unit-testable.
 */

export type SearchEngine = 'google' | 'bing' | 'duckduckgo';
export type ViewMode = 'apod' | 'dashboard' | 'gallery';

export interface Settings {
  language: string;
  allowLowRes: boolean;
  nasaApiKey: string;
  reducedMotion: boolean;
  highContrast: boolean;
  viewMode: ViewMode;
  searchEngine: SearchEngine;
}

export const DEFAULT_SETTINGS: Settings = {
  language: 'en',
  allowLowRes: false,
  nasaApiKey: '',
  reducedMotion: false,
  highContrast: false,
  viewMode: 'apod',
  searchEngine: 'google',
};

export type PartialSettings = Partial<Settings>;

/** Merge a partial patch into a settings object (immutably). */
export function mergeSettings(current: Settings, patch: PartialSettings): Settings {
  return { ...current, ...patch };
}

export const SUPPORTED_LANGUAGES = [
  'en',
  'es',
  'fr',
  'de',
  'it',
  'pt',
  'ja',
  'zh-CN',
  'ru',
  'bn',
  'hi',
];

/** Pick the browser's locale if it maps to a supported language, else 'en'. */
export function detectBrowserLanguage(locale?: string): string {
  const raw = (
    locale || (typeof navigator !== 'undefined' ? navigator.language : '')
  ).toLowerCase();
  const code = raw.split('-')[0];
  return SUPPORTED_LANGUAGES.includes(code) ? code : 'en';
}

const ENGINE_BASE: Record<SearchEngine, string> = {
  google: 'https://www.google.com/search?q=',
  bing: 'https://www.bing.com/search?q=',
  duckduckgo: 'https://duckduckgo.com/?q=',
};

export const SEARCH_ENGINES: SearchEngine[] = ['google', 'bing', 'duckduckgo'];

export const SEARCH_ENGINE_LABELS: Record<SearchEngine, string> = {
  google: 'Google',
  bing: 'Bing',
  duckduckgo: 'DuckDuckGo',
};

/** Build a search URL for a given engine and query (falls back to Google). */
export function resolveSearchUrl(engine: SearchEngine, query: string): string {
  const base = ENGINE_BASE[engine] || ENGINE_BASE.google;
  return `${base}${encodeURIComponent(query.trim())}`;
}
