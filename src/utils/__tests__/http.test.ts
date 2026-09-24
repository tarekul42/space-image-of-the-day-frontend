import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchWithTimeout, isOnline, isSaveData } from '../http';

describe('fetchWithTimeout', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    globalThis.fetch = originalFetch;
  });

  it('returns the response when it resolves in time', async () => {
    const response = { ok: true, status: 200 } as Response;
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));

    await expect(fetchWithTimeout('https://example.com/a', {}, 5000)).resolves.toBe(response);
  });

  it('aborts with an AbortError when the request exceeds the timeout', async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, init?: RequestInit) =>
          new Promise((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () =>
              reject(new DOMException('The operation was aborted.', 'AbortError')),
            );
          }),
      ),
    );

    const promise = fetchWithTimeout('https://example.com/slow', {}, 1000);
    promise.catch(() => {});
    await vi.advanceTimersByTimeAsync(1000);

    await expect(promise).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('clears the timer on success', async () => {
    vi.useFakeTimers();
    const response = { ok: true } as Response;
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));

    await fetchWithTimeout('https://example.com/a', {}, 1000);
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('isSaveData', () => {
  it('returns true when navigator.connection.saveData is set', () => {
    Object.defineProperty(navigator, 'connection', {
      value: { saveData: true },
      configurable: true,
    });
    expect(isSaveData()).toBe(true);
  });

  it('returns false when saveData is off', () => {
    Object.defineProperty(navigator, 'connection', {
      value: { saveData: false },
      configurable: true,
    });
    expect(isSaveData()).toBe(false);
  });

  it('returns false when the Network Information API is unavailable', () => {
    Object.defineProperty(navigator, 'connection', { value: undefined, configurable: true });
    expect(isSaveData()).toBe(false);
  });
});

describe('isOnline', () => {
  const originalOnLine = navigator.onLine;

  afterEach(() => {
    Object.defineProperty(navigator, 'onLine', { value: originalOnLine, configurable: true });
  });

  it('reports online when navigator.onLine is true (or unsupported)', () => {
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
    expect(isOnline()).toBe(true);
    Object.defineProperty(navigator, 'onLine', { value: undefined, configurable: true });
    expect(isOnline()).toBe(true);
  });

  it('reports offline when navigator.onLine is false', () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
    expect(isOnline()).toBe(false);
  });
});
