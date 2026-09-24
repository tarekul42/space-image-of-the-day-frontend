import { ApodData } from '../types/apod';

/**
 * Choose the most economical URL for the current viewer.
 * The standard-res `url` is far lighter than `hdurl`, so it is preferred
 * whenever the user has data-saver enabled.
 */
export function pickDisplayUrl(apod: Pick<ApodData, 'url' | 'hdurl'>, saveData: boolean): string {
  if (saveData) return apod.url || apod.hdurl || '';
  return apod.hdurl || apod.url || '';
}
