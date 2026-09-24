import { describe, expect, it } from 'vitest';
import { ApodData } from '../../types/apod';
import {
  cleanupKeepList,
  isAcceptableResolution,
  makeImageCandidates,
  pushToBuffer,
  shouldSkipRecent,
} from '../refill';

const make = (date: string): ApodData =>
  ({
    date,
    title: `${date} title`,
    explanation: 'test explanation',
    url: 'https://apod.nasa.gov/apod/image/x.jpg',
    media_type: 'image',
  }) as ApodData;

describe('isAcceptableResolution', () => {
  const threshold = { minWidth: 1000, minHeight: 700, allowLowRes: false };

  it('accepts images meeting the minimum', () => {
    expect(isAcceptableResolution(1280, 800, threshold)).toBe(true);
    expect(isAcceptableResolution(1000, 700, threshold)).toBe(true);
  });

  it('rejects images below minimum width or height', () => {
    expect(isAcceptableResolution(999, 800, threshold)).toBe(false);
    expect(isAcceptableResolution(1280, 699, threshold)).toBe(false);
  });

  it('accepts everything when allowLowRes is set', () => {
    expect(isAcceptableResolution(480, 320, { ...threshold, allowLowRes: true })).toBe(true);
  });
});

describe('makeImageCandidates', () => {
  it('prefers the standard url over hdurl', () => {
    expect(makeImageCandidates('https://a/u.jpg', 'https://a/hd.jpg')).toEqual([
      'https://a/u.jpg',
      'https://a/hd.jpg',
    ]);
  });

  it('drops empty and duplicate entrants', () => {
    expect(makeImageCandidates('https://a/u.jpg', 'https://a/u.jpg')).toEqual(['https://a/u.jpg']);
    expect(makeImageCandidates(undefined, undefined)).toEqual([]);
    expect(makeImageCandidates('', 'https://a/hd.jpg')).toEqual(['https://a/hd.jpg']);
  });
});

describe('shouldSkipRecent', () => {
  const recent = ['2024-01-01', '2024-01-02', '2024-01-03'];

  it('skips a recently shown date once enough history exists', () => {
    expect(shouldSkipRecent('2024-01-02', recent, 0, 5, 3)).toBe(true);
  });

  it('never skips the final attempt so the buffer is not starved', () => {
    expect(shouldSkipRecent('2024-01-02', recent, 4, 5, 3)).toBe(false);
  });

  it('does not skip when the date is fresh or history is thin', () => {
    expect(shouldSkipRecent('2024-06-06', recent, 0, 5, 3)).toBe(false);
    expect(shouldSkipRecent('2024-01-02', ['2024-01-01'], 0, 5, 3)).toBe(false);
  });
});

describe('pushToBuffer', () => {
  const a = make('2024-01-01');
  const b = make('2024-01-02');
  const c = make('2024-01-03');

  it('appends and evicts the oldest entry past the limit', () => {
    expect(pushToBuffer([a, b], c, 2)).toEqual([b, c]);
  });

  it('keeps a bounded buffer under the limit', () => {
    expect(pushToBuffer([a], b, 10)).toEqual([a, b]);
  });

  it('is a no-op (same reference) for a duplicate date', () => {
    const buffer = [a, b];
    expect(pushToBuffer(buffer, a, 10)).toBe(buffer);
  });

  it('does not mutate the input buffer', () => {
    const buffer = [a, b];
    pushToBuffer(buffer, c, 2);
    expect(buffer).toEqual([a, b]);
  });
});

describe('cleanupKeepList', () => {
  it('keeps buffered, today, recent, and newest cached dates', () => {
    const keep = cleanupKeepList({
      bufferedDates: ['2024-06-01'],
      today: '2024-06-10',
      recentDates: ['2024-05-01', '2024-05-02'],
      cachedDates: ['2024-06-09', '2024-06-08', '2024-01-01', '2023-01-01'],
      keepRecent: 2,
    });
    expect(keep.sort()).toEqual([
      '2024-05-01',
      '2024-05-02',
      '2024-06-01',
      '2024-06-08',
      '2024-06-09',
      '2024-06-10',
    ]);
  });

  it('drops cached dates older than the keepRecent window', () => {
    const keep = cleanupKeepList({
      bufferedDates: [],
      today: '2024-06-10',
      recentDates: [],
      cachedDates: ['2024-06-09', '2024-06-08', '2024-01-01', '2023-01-01'],
      keepRecent: 2,
    });
    expect(keep.includes('2024-01-01')).toBe(false);
    expect(keep.includes('2023-01-01')).toBe(false);
    expect(keep).toContain('2024-06-09');
  });
});
