import { describe, expect, it } from 'vitest';
import { pickDisplayUrl } from '../media';

const apod = {
  url: 'https://apod.nasa.gov/apod/image/u.jpg',
  hdurl: 'https://apod.nasa.gov/apod/image/hd.jpg',
};

describe('pickDisplayUrl', () => {
  it('prefers hdurl when data-saver is off', () => {
    expect(pickDisplayUrl(apod, false)).toBe(apod.hdurl);
  });

  it('prefers the lighter url when data-saver is on', () => {
    expect(pickDisplayUrl(apod, true)).toBe(apod.url);
  });

  it('falls back to the other source when the preferred one is missing', () => {
    expect(pickDisplayUrl({ url: '', hdurl: apod.hdurl }, false)).toBe(apod.hdurl);
    expect(pickDisplayUrl({ url: '', hdurl: apod.hdurl }, true)).toBe(apod.hdurl);
    expect(pickDisplayUrl({ url: apod.url, hdurl: undefined }, false)).toBe(apod.url);
  });

  it('returns an empty string when neither source exists', () => {
    expect(pickDisplayUrl({ url: '', hdurl: undefined }, false)).toBe('');
    expect(pickDisplayUrl({ url: '', hdurl: '' }, true)).toBe('');
  });
});
