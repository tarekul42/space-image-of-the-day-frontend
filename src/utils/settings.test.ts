import { describe, it, expect } from 'vitest';
import {
  mergeSettings,
  resolveSearchUrl,
  detectBrowserLanguage,
  DEFAULT_SETTINGS,
} from './settings';

describe('mergeSettings', () => {
  it('merges a patch over defaults without mutating them', () => {
    const result = mergeSettings(DEFAULT_SETTINGS, { language: 'fr' });
    expect(result.language).toBe('fr');
    expect(result.allowLowRes).toBe(false);
    expect(DEFAULT_SETTINGS.language).toBe('en');
  });

  it('applies partial patches immutably', () => {
    const current = mergeSettings(DEFAULT_SETTINGS, { highContrast: true });
    const next = mergeSettings(current, { reducedMotion: true });
    expect(next.highContrast).toBe(true);
    expect(next.reducedMotion).toBe(true);
    expect(current.reducedMotion).toBe(false);
  });
});

describe('resolveSearchUrl', () => {
  it('builds a Google URL by default', () => {
    expect(resolveSearchUrl('google', 'nebula photos')).toBe(
      'https://www.google.com/search?q=nebula%20photos',
    );
  });

  it('builds a Bing URL', () => {
    expect(resolveSearchUrl('bing', 'orion')).toBe('https://www.bing.com/search?q=orion');
  });

  it('builds a DuckDuckGo URL', () => {
    expect(resolveSearchUrl('duckduckgo', 'andromeda')).toBe('https://duckduckgo.com/?q=andromeda');
  });

  it('trims the query', () => {
    expect(resolveSearchUrl('google', '  spaced  ')).toBe('https://www.google.com/search?q=spaced');
  });
});

describe('detectBrowserLanguage', () => {
  it('maps a supported locale to its language code', () => {
    expect(detectBrowserLanguage('fr-FR')).toBe('fr');
    expect(detectBrowserLanguage('de')).toBe('de');
    expect(detectBrowserLanguage('PT-BR')).toBe('pt');
  });

  it('falls back to English for unsupported locales', () => {
    expect(detectBrowserLanguage('xx-ZZ')).toBe('en');
    expect(detectBrowserLanguage('')).toBe('en');
  });
});
