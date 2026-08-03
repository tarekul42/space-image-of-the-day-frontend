import { describe, it, expect } from 'vitest';
import { matchCatalogObjects, findPrimaryObject } from './catalogMatch';
import { COSMIC_CATALOG } from '../data/catalog';

describe('matchCatalogObjects', () => {
  it('matches a Messier object by its catalog id in the title', () => {
    const matches = matchCatalogObjects(
      'M42: The Great Orion Nebula',
      'A towering star forming region',
      COSMIC_CATALOG,
    );
    expect(matches.some((m) => m.id === 'm42')).toBe(true);
  });

  it('matches a deep-sky object by its common name', () => {
    const matches = matchCatalogObjects(
      'Pleiades - Seven Sisters',
      'A sparkling cluster of hot blue stars',
    );
    expect(matches.some((m) => m.id === 'm45')).toBe(true);
  });

  it('matches an object mentioned only in the explanation', () => {
    const matches = matchCatalogObjects(
      'A Pulsing Skyscape',
      'The Crab Nebula was created by a supernova visible in 1054.',
    );
    expect(matches.some((m) => m.id === 'm1-crab')).toBe(true);
  });

  it('matches a bright star by name', () => {
    const matches = matchCatalogObjects('Sirius Rising', 'The brightest star at twilight');
    expect(matches.some((m) => m.id === 'sirius')).toBe(true);
  });

  it('returns an empty list for unrelated content', () => {
    const matches = matchCatalogObjects(
      'Aurora over Iceland',
      'Green lights dance across the polar sky',
    );
    expect(matches).toEqual([]);
  });

  it('does not over-match short aliases inside other words', () => {
    const matches = matchCatalogObjects(
      'Big Bang Simulation',
      'A modern visualization',
      COSMIC_CATALOG,
    );
    // "m13" etc. should not accidentally match the word "simulation".
    expect(matches).toEqual([]);
  });

  it('respects the limit', () => {
    const matches = matchCatalogObjects(
      'Orion Nebula and Pleiades and the Moon',
      'features M42 and M45',
      COSMIC_CATALOG,
      2,
    );
    expect(matches.length).toBeLessThanOrEqual(2);
  });

  it('sorts title matches above explanation matches', () => {
    const matches = matchCatalogObjects(
      'The Whirlpool Galaxy',
      'The Ring Nebula also appeared in the same field',
    );
    const first = matches[0];
    expect(first?.id).toBe('m51');
  });
});

describe('findPrimaryObject', () => {
  it('returns the top match or null', () => {
    expect(
      findPrimaryObject('Andromeda Galaxy at a glance', 'The nearest spiral galaxy'),
    ).not.toBeNull();
    expect(findPrimaryObject('No object here at all', 'Just some clouds')).toBeNull();
  });
});
