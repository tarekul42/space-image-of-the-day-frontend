import { describe, it, expect } from 'vitest';
import { popFromBuffer, evictToLimit } from './buffer';
import { ApodData } from '../types/apod';

const make = (date: string): ApodData => ({
  date,
  title: `APOD ${date}`,
  explanation: '',
  url: `https://example.com/${date}.jpg`,
  media_type: 'image',
});

describe('popFromBuffer', () => {
  it('returns null for an empty buffer', () => {
    const { data, buffer } = popFromBuffer([]);
    expect(data).toBeNull();
    expect(buffer).toEqual([]);
  });

  it('pops the front item and does not mutate the input', () => {
    const input = [make('2026-01-01'), make('2026-01-02')];
    const { data, buffer } = popFromBuffer(input, '2020-01-01');
    expect(data?.date).toBe('2026-01-01');
    expect(buffer.map((a) => a.date)).toEqual(['2026-01-02']);
    expect(input).toHaveLength(2);
  });

  it('skips a front item that equals lastShown when alternatives exist', () => {
    const input = [make('2026-01-01'), make('2026-01-02')];
    const { data, buffer } = popFromBuffer(input, '2026-01-01');
    expect(data?.date).toBe('2026-01-02');
    expect(buffer.map((a) => a.date)).toEqual([]);
  });

  it('returns the only item even if it matches lastShown', () => {
    const input = [make('2026-01-01')];
    const { data, buffer } = popFromBuffer(input, '2026-01-01');
    expect(data?.date).toBe('2026-01-01');
    expect(buffer).toEqual([]);
  });
});

describe('evictToLimit', () => {
  it('keeps buffers under the limit untouched', () => {
    const input = [make('2026-01-01'), make('2026-01-02')];
    expect(evictToLimit(input, 5)).toEqual(input);
  });

  it('evicts oldest items from the front when over the limit', () => {
    const input = [make('a'), make('b'), make('c')];
    const result = evictToLimit(input, 2);
    expect(result.map((a) => a.date)).toEqual(['b', 'c']);
  });
});
