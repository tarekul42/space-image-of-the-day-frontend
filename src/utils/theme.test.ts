import { describe, it, expect } from 'vitest';
import { isTheme, applyTheme } from './theme';

describe('isTheme', () => {
  it('accepts known themes', () => {
    expect(isTheme('cosmic')).toBe(true);
    expect(isTheme('nebula')).toBe(true);
    expect(isTheme('aurora')).toBe(true);
    expect(isTheme('daylight')).toBe(true);
  });

  it('rejects unknown values', () => {
    expect(isTheme('blurple')).toBe(false);
    expect(isTheme(undefined)).toBe(false);
    expect(isTheme('')).toBe(false);
  });
});

describe('applyTheme', () => {
  it('is a no-op when document is unavailable', () => {
    // Node test env has no document — must not throw.
    expect(() => applyTheme('daylight')).not.toThrow();
  });
});
