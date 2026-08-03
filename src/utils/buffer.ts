/**
 * utils/buffer.ts — Pure FIFO buffer logic (no browser APIs).
 * Extracted so the prefetch queue's pop/eviction rules are unit-testable.
 */
import { ApodData } from '../types/apod';

/**
 * Pop the front item of the random buffer.
 * Avoids returning the same image that was shown last time when possible.
 * Returns the remaining buffer (never mutates the input).
 */
export function popFromBuffer(
  buffer: ApodData[],
  lastShownDate?: string,
): { data: ApodData | null; buffer: ApodData[] } {
  const next = [...buffer];
  let data = next.shift() ?? null;
  if (data && data.date === lastShownDate && next.length > 0) {
    data = next.shift() ?? null;
  }
  return { data, buffer: next };
}

/** Cap the buffer to BUFFER_LIMIT by evicting from the front (FIFO). */
export function evictToLimit(buffer: ApodData[], limit: number): ApodData[] {
  if (buffer.length <= limit) return buffer;
  return buffer.slice(buffer.length - limit);
}
