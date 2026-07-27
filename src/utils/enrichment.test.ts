import { describe, it, expect } from 'vitest';
import { extractObjectName, inferFromExplanation } from './enrichment';

describe('extractObjectName', () => {
  it('extracts object name from simple title', () => {
    expect(extractObjectName('Andromeda Galaxy')).toBe('Andromeda Galaxy');
  });

  it('strips APOD prefix', () => {
    expect(extractObjectName('APOD: Andromeda Galaxy')).toBe('Andromeda Galaxy');
  });

  it('strips Image of the Day prefix', () => {
    expect(extractObjectName('Image of the Day: Orion Nebula')).toBe('Orion Nebula');
  });

  it('strips year prefix', () => {
    expect(extractObjectName('2024 Andromeda Galaxy')).toBe('Andromeda Galaxy');
  });

  it('strips attribution text', () => {
    expect(extractObjectName('Orion Nebula by John Doe')).toBe('Orion Nebula');
  });

  it('strips bracketed content', () => {
    expect(extractObjectName('Orion Nebula [constellation]')).toBe('Orion Nebula');
  });

  it('strips parenthesized content', () => {
    expect(extractObjectName('Orion Nebula (M42)')).toBe('Orion Nebula');
  });

  it('returns first 3 words for long names', () => {
    expect(extractObjectName('The Great Andromeda Galaxy M31')).toBe('The Great Andromeda');
  });

  it('returns name as-is for short input', () => {
    expect(extractObjectName('Sirius')).toBe('Sirius');
  });
});

describe('inferFromExplanation', () => {
  it('detects galaxy from title', () => {
    const result = inferFromExplanation('Andromeda Galaxy', 'A beautiful spiral galaxy');
    expect(result.objectType).toBe('Galaxy');
  });

  it('detects nebula from explanation', () => {
    const result = inferFromExplanation('Orion', 'A nebula where new stars are born');
    expect(result.objectType).toBe('Nebula');
  });

  it('detects supernova remnant', () => {
    const result = inferFromExplanation('Crab', 'This supernova remnant was observed in 1054');
    expect(result.objectType).toBe('Supernova Remnant');
  });

  it('detects star cluster', () => {
    const result = inferFromExplanation('Pleiades', 'A bright star cluster in Taurus');
    expect(result.objectType).toBe('Star Cluster');
  });

  it('detects planet', () => {
    const result = inferFromExplanation('Jupiter', 'The largest planet in our solar system');
    expect(result.objectType).toBe('Planet');
  });

  it('falls back to Celestial Object', () => {
    const result = inferFromExplanation('Unknown', 'Something in the sky');
    expect(result.objectType).toBe('Celestial Object');
  });

  it('searches in both title and explanation', () => {
    const result = inferFromExplanation('Spiral', 'A beautiful object');
    expect(result.objectType).toBe('Galaxy');
  });
});
