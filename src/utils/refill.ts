/**
 * utils/refill.ts — Pure helpers for the background buffer-refill flow.
 * No browser APIs; exported so the refill state machine is unit-testable.
 */
import { ApodData } from '../types/apod';

export interface ResolutionThreshold {
  minWidth: number;
  minHeight: number;
  allowLowRes: boolean;
}

/**
 * Whether an image meets the minimum resolution guard.
 * `allowLowRes` opts out of the check entirely.
 */
export function isAcceptableResolution(
  width: number,
  height: number,
  threshold: ResolutionThreshold,
): boolean {
  return threshold.allowLowRes || (width >= threshold.minWidth && height >= threshold.minHeight);
}

/**
 * Ordered candidate URLs to download/probe for an APOD image.
 * The standard `url` (~1024-2048px) is far lighter than `hdurl` (often
 * 10-30MB), so it is always preferred; `hdurl` is only the fallback.
 * Empty/falsy values are dropped and duplicates are merged.
 */
export function makeImageCandidates(url?: string, hdurl?: string): string[] {
  const candidates = [url, hdurl].filter((u): u is string => typeof u === 'string' && u.length > 0);
  return [...new Set(candidates)];
}

/**
 * Whether a date should be skipped because it was shown recently.
 * Never skips the final attempt (so the buffer is not starved) and only
 * activates once enough distinct dates have been seen to make a choice.
 */
export function shouldSkipRecent(
  date: string,
  recentDates: string[],
  attempt: number,
  maxAttempts: number,
  skipLimit: number,
): boolean {
  if (attempt >= maxAttempts - 1) return false;
  if (recentDates.length < skipLimit) return false;
  return recentDates.includes(date);
}

/**
 * Append an item to the FIFO buffer, evicting the oldest entry past `limit`.
 * Returns the SAME array reference when the item is already buffered by date
 * (no-op), so callers can avoid a redundant storage write.
 */
export function pushToBuffer(buffer: ApodData[], item: ApodData, limit: number): ApodData[] {
  if (buffer.some((existing) => existing.date === item.date)) return buffer;
  const next = [...buffer];
  if (next.length >= limit) next.shift();
  next.push(item);
  return next;
}

/**
 * Build the set of IndexedDB blob keys to retain during cleanup.
 * Buffered dates, today, recently shown dates, and the `keepRecent` most
 * recent daily fetches are preserved; everything else is eligible to purge.
 */
export function cleanupKeepList(args: {
  bufferedDates: string[];
  today: string;
  recentDates: string[];
  cachedDates: string[];
  keepRecent: number;
}): string[] {
  const { bufferedDates, today, recentDates, cachedDates, keepRecent } = args;
  const keep = new Set<string>([
    today,
    ...bufferedDates,
    ...recentDates,
    ...cachedDates.slice(0, keepRecent),
  ]);
  return [...keep];
}
