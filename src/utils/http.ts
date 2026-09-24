import { NASA_API_TIMEOUT_MS } from '../constants';

/**
 * fetch() with a hard timeout bound.
 * Aborts the request if the server does not respond within `timeoutMs`.
 */
export async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs: number = NASA_API_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * True when the browser reports the user opted into data saving.
 * Always false when the Network Information API is unavailable.
 */
export function isSaveData(): boolean {
  try {
    const connection = (navigator as { connection?: { saveData?: boolean } }).connection;
    return connection?.saveData === true;
  } catch {
    return false;
  }
}

/** True when the browser reports connectivity is down. */
export function isOnline(): boolean {
  try {
    return navigator.onLine !== false;
  } catch {
    return true;
  }
}
