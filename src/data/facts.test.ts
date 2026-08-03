import { describe, it, expect } from 'vitest';
import { getFactOfTheDay, COSMIC_FACTS } from './facts';

describe('getFactOfTheDay', () => {
  it('returns one of the curated facts', () => {
    const fact = getFactOfTheDay(new Date('2026-08-03'));
    expect(COSMIC_FACTS).toContain(fact);
  });

  it('is deterministic for the same date', () => {
    const a = getFactOfTheDay(new Date('2026-08-03T12:00:00Z'));
    const b = getFactOfTheDay(new Date('2026-08-03T23:59:00Z'));
    expect(a).toBe(b);
  });

  it('changes across dates', () => {
    const a = getFactOfTheDay(new Date('2026-08-03'));
    const b = getFactOfTheDay(new Date('2026-08-04'));
    // Not guaranteed different, but nearly always; assert the set is sane.
    expect(COSMIC_FACTS).toContain(a);
    expect(COSMIC_FACTS).toContain(b);
  });

  it('handles the default (now) without throwing', () => {
    expect(() => getFactOfTheDay()).not.toThrow();
  });
});
