import browser from './browser';
import {
  ALARM_MAINTAIN_PERIOD_MINUTES,
  BUFFER_LIMIT,
  BUFFER_REFILL_DELAY_MS,
  CLEANUP_KEEP_RECENT_DAYS,
  IMAGE_DOWNLOAD_TIMEOUT_MS,
  MAX_REFILL_ATTEMPTS,
  MIN_IMAGE_HEIGHT,
  MIN_IMAGE_WIDTH,
  REFILL_RECENT_SKIP_LIMIT,
} from './constants';
import { fetchApod, fetchApodRange, fetchRandomApod } from './services/apod.service';
import { ApodData } from './types/apod';
import { popFromBuffer } from './utils/buffer';
import { enrichData } from './utils/enrichment';
import { fetchWithTimeout, isOnline, isSaveData } from './utils/http';
import {
  cleanupKeepList,
  isAcceptableResolution,
  makeImageCandidates,
  pushToBuffer,
  shouldSkipRecent,
} from './utils/refill';
import { clearOldImages, getAllBlobKeys, getImageBlob, saveImageBlob } from './utils/storage';

const BUFFER_KEY = 'random_buffer';
const PURGE_KEY = 'cache_purge_v2';
const SEED_CACHE_KEY = 'seed_cache';
const LAST_SHOWN_KEY = 'last_shown_date';
const RECENT_DATES_KEY = 'recent_dates';

const ALARM_REFILL = 'buffer-refill';
const ALARM_MAINTENANCE = 'buffer-maintenance';

const ISO_DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;
const PROBE_RETRY_DELAY_MS = 250;

const SEED_APODS: ApodData[] = [
  {
    date: '2023-02-14',
    title: 'The Heart Nebula (IC 1805)',
    explanation:
      'The Heart Nebula is an emission nebula in the constellation Cassiopeia. It shows glowing ionized hydrogen gas and darker dust lanes.',
    url: 'https://apod.nasa.gov/apod/image/2302/HeartSoul_deHaro_1080.jpg',
    hdurl: 'https://apod.nasa.gov/apod/image/2302/HeartSoul_deHaro_1977.jpg',
    media_type: 'image',
    object_type: 'Nebula',
    width: 2000,
    height: 1600,
  },
  {
    date: '2018-05-04',
    title: 'The View Toward M101',
    explanation:
      "Big, beautiful spiral galaxy M101 is one of the last entries in Charles Messier's famous catalog. Spanning about 170,000 light-years, this galaxy is enormous, almost twice the size of our own Milky Way Galaxy. It is located in the northern constellation Ursa Major, about 25 million light-years away.",
    url: 'https://apod.nasa.gov/apod/image/1805/M101_3Days_New_APOD.jpg',
    hdurl: 'https://apod.nasa.gov/apod/image/1805/M101_3Days_New_APOD.jpg',
    media_type: 'image',
    object_type: 'Galaxy',
    width: 1280,
    height: 1045,
  },
  {
    date: '2024-06-07',
    title: 'Sharpless 308: Star Bubble',
    explanation:
      'Blown by fast winds from a hot, massive star, this cosmic bubble is much larger than the dolphin it sometimes resembles. Cataloged as Sharpless 2-308, it lies some 5,000 light-years away towards the constellation of the Great Dog (Canis Major) and covers slightly more of the sky than a Full Moon.',
    url: 'https://apod.nasa.gov/apod/image/2406/DolphinNebulaHOO_2048.jpg',
    hdurl: 'https://apod.nasa.gov/apod/image/2406/DolphinNebulaHOO_2048.jpg',
    media_type: 'image',
    object_type: 'Nebula',
    width: 1280,
    height: 960,
  },
  {
    date: '2020-05-25',
    title: 'Mystic Mountain Monster Being Destroyed',
    explanation:
      'It is a pillar of gas and dust that measures some three light-years across and is located in the Carina Nebula. The "monster" is being destroyed by the intense radiation and stellar winds of the massive newborn stars surrounding it. Inside the opaque dust, young stars fire off jets of gas that stream out from the peaks.',
    url: 'https://apod.nasa.gov/apod/image/2005/MysticPillar_HubbleSchmidt_1433.jpg',
    hdurl: 'https://apod.nasa.gov/apod/image/2005/MysticPillar_HubbleSchmidt_1433.jpg',
    media_type: 'image',
    object_type: 'Nebula',
    width: 1280,
    height: 1024,
  },
  {
    date: '2022-06-13',
    title: 'The Whirlpool Galaxy (M51)',
    explanation:
      'The Whirlpool Galaxy is a classic spiral galaxy. At only 30 million light years distant and fully 60 thousand light years across, M51 is one of the brightest and most picturesque galaxies on the sky. Its striking spiral structure is thought to be due to its gravitational interaction with the smaller galaxy on the image left.',
    url: 'https://apod.nasa.gov/apod/image/2206/M51_HubbleMiller_5688.jpg',
    hdurl: 'https://apod.nasa.gov/apod/image/2206/M51_HubbleMiller_5688.jpg',
    media_type: 'image',
    object_type: 'Galaxy',
    width: 1280,
    height: 800,
  },
];

/**
 * Cheap API call that resets the service-worker idle timer, so a long
 * download in the background is not abandoned mid-flight.
 */
async function keepAlive(): Promise<void> {
  try {
    await browser.runtime.getPlatformInfo();
  } catch {
    // Best-effort; ignore.
  }
}

/**
 * Probe the pixel dimensions of an image URL and return the Blob.
 * Aborts after IMAGE_DOWNLOAD_TIMEOUT_MS so a hung server cannot pin
 * the service worker or bleed the user's bandwidth forever.
 */
async function getImageData(
  url: string,
  timeoutMs: number = IMAGE_DOWNLOAD_TIMEOUT_MS,
): Promise<{ width: number; height: number; blob: Blob } | null> {
  try {
    await keepAlive();
    const response = await fetchWithTimeout(url, {}, timeoutMs);
    if (!response.ok) return null;
    const blob = await response.blob();
    if (blob.size <= 1024) return null;
    await keepAlive();

    try {
      const bitmap = await createImageBitmap(blob);
      const dims = { width: bitmap.width, height: bitmap.height, blob };
      bitmap.close();
      return dims;
    } catch {
      // Fallback for contexts where createImageBitmap is missing.
      const canvas = new OffscreenCanvas(0, 0);
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      const bitmap = await createImageBitmap(blob);
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      ctx.drawImage(bitmap, 0, 0);
      const dims = { width: bitmap.width, height: bitmap.height, blob };
      bitmap.close();
      return dims;
    }
  } catch {
    return null;
  }
}

async function rememberRecentDate(date: string): Promise<void> {
  try {
    const result = await browser.storage.local.get(RECENT_DATES_KEY);
    const recent: string[] = Array.isArray(result[RECENT_DATES_KEY])
      ? result[RECENT_DATES_KEY]
      : [];
    const next = [...new Set([date, ...recent])].slice(0, CLEANUP_KEEP_RECENT_DAYS);
    await browser.storage.local.set({ [RECENT_DATES_KEY]: next });
  } catch {
    // ignore
  }
}

// ─── Message Handling ────────────────────────────────────────

browser.runtime.onMessage.addListener(
  (request: unknown, _sender: browser.Runtime.MessageSender) => {
    const req = request as {
      type: string;
      date?: string;
      lang?: string;
      allowLowRes?: boolean;
      startDate?: string;
      endDate?: string;
      translate?: boolean;
    };

    // Use a pattern that ensures we ALWAYS return a promise or false.
    // This prevents "Receiving end does not exist" synchronously.
    switch (req.type) {
      case 'FETCH_APOD':
      case 'UPDATE_TRANSLATION':
        return handleFetchApod(req.date, req.lang);
      case 'FETCH_RANDOM':
        return handleFetchRandom(req.lang, req.allowLowRes);
      case 'RESET_CACHE':
        return handleResetCache();
      case 'FETCH_RANGE':
        return handleFetchRange(req.startDate, req.endDate, req.lang, req.translate);
      default:
        return false; // Not a known message type
    }
  },
);

async function handleFetchRange(
  startDate?: string,
  endDate?: string,
  lang?: string,
  translate?: boolean,
): Promise<{ data: ApodData[]; fromCache?: boolean }> {
  try {
    const data = await fetchApodRange(startDate ?? '', endDate ?? '', lang, translate);
    return { data, fromCache: false };
  } catch {
    // Offline fallback: surface any cached APODs within the requested window.
    try {
      const allCache = await browser.storage.local.get(null);
      const cached = Object.keys(allCache)
        .filter((k) => ISO_DATE_KEY.test(k))
        .filter((k) => (!startDate || k >= startDate) && (!endDate || k <= endDate))
        .sort()
        .reverse()
        .map((k) => allCache[k] as ApodData);
      if (cached.length > 0) return { data: cached, fromCache: true };
    } catch {
      // ignore
    }
    return { data: [] };
  }
}

async function handleFetchApod(date?: string, lang?: string) {
  try {
    const rawData = await fetchApod(date, lang);

    // Skip the (heavy) full-res download when this date's blob is already cached.
    const existingBlob = await getImageBlob(rawData.date);
    const data =
      existingBlob && existingBlob.size > 1024
        ? null
        : rawData.url
          ? await getImageData(rawData.hdurl || rawData.url)
          : null;
    const enriched = await enrichData({
      ...rawData,
      width: data?.width,
      height: data?.height,
    });

    if (data?.blob && data.blob.size > 1024) {
      await saveImageBlob(rawData.date, data.blob);
    }

    const today = date || new Date().toISOString().split('T')[0];
    await browser.storage.local.set({ [today]: enriched });
    return { data: enriched, fromCache: false };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const allCache = await browser.storage.local.get(null);
    const keys = Object.keys(allCache)
      .filter((k) => ISO_DATE_KEY.test(k))
      .sort()
      .reverse();
    if (keys.length > 0) {
      return { data: allCache[keys[0]], fromCache: true, offline: true };
    }
    return { error: errorMessage };
  }
}

async function handleResetCache() {
  await browser.storage.local.clear();
  await clearOldImages([]);
  await browser.storage.local.set({ [SEED_CACHE_KEY]: SEED_APODS });
  await browser.storage.local.set({ [BUFFER_KEY]: [...SEED_APODS] });
  if (!isSaveData()) {
    for (const item of SEED_APODS) {
      try {
        const data = await getImageData(makeImageCandidates(item.url, item.hdurl)[0]);
        if (data?.blob && data.blob.size > 1024) {
          await saveImageBlob(item.date, data.blob);
        }
      } catch {
        // Ignore per-image failures during reset
      }
    }
  }
  void scheduleRefill();
  return { success: true };
}

async function handleFetchRandom(lang?: string, allowLowRes?: boolean) {
  try {
    const result = await browser.storage.local.get([BUFFER_KEY, LAST_SHOWN_KEY]);
    const buffer: ApodData[] = Array.isArray(result[BUFFER_KEY]) ? result[BUFFER_KEY] : [];
    const lastShownDate = result[LAST_SHOWN_KEY] as string | undefined;

    if (buffer.length > 0) {
      const { data: dataToReturn, buffer: remaining } = popFromBuffer(buffer, lastShownDate);
      if (dataToReturn) {
        await browser.storage.local.set({
          [BUFFER_KEY]: remaining,
          [LAST_SHOWN_KEY]: dataToReturn.date,
        });
        await rememberRecentDate(dataToReturn.date);
        void scheduleRefill(lang, allowLowRes);
        return { data: dataToReturn };
      }
    }

    // Try IndexedDB fallback: pick a random cached image the user has already seen
    const blobKeys = await getAllBlobKeys();
    if (blobKeys.length > 0) {
      const candidates = blobKeys.filter((d) => d !== lastShownDate);
      const pool = candidates.length > 0 ? candidates : blobKeys;
      const randomDate = pool[Math.floor(Math.random() * pool.length)];
      const cached = await browser.storage.local.get(randomDate);
      if (cached[randomDate]) {
        await browser.storage.local.set({ [LAST_SHOWN_KEY]: randomDate });
        void scheduleRefill(lang, allowLowRes);
        return { data: cached[randomDate] as ApodData, fromCache: true };
      }
    }

    // Fallback to seed data from user storage
    const seedResult = await browser.storage.local.get(SEED_CACHE_KEY);
    const seeds: ApodData[] = Array.isArray(seedResult[SEED_CACHE_KEY])
      ? seedResult[SEED_CACHE_KEY]
      : [];
    const seedPool = seeds.filter((s) => s.date !== lastShownDate);
    const available = seedPool.length > 0 ? seedPool : seeds;
    const fallback =
      available.length > 0
        ? available[Math.floor(Math.random() * available.length)]
        : SEED_APODS[0];

    await browser.storage.local.set({ [LAST_SHOWN_KEY]: fallback.date });
    void scheduleRefill(lang, allowLowRes);
    return { data: fallback, fromFallback: true };
  } catch {
    return { data: SEED_APODS[0], fromFallback: true };
  }
}

/**
 * Incremental Refill - Fetches EXACTLY ONE item if space remains.
 * This prevents long-running loops that can cause the script to hang.
 */
const refillMutex = new WeakMap<object, Promise<unknown>>();
const mutexKey = {};

async function withMutex<T>(key: object, fn: () => Promise<T>): Promise<T | undefined> {
  const existing = refillMutex.get(key);
  if (existing) return;

  const promise = fn().finally(() => {
    if (refillMutex.get(key) === promise) {
      refillMutex.delete(key);
    }
  });
  refillMutex.set(key, promise);
  return promise;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Schedule the next buffer refill through a one-shot alarm.
 *
 * MV3 terminates idle service workers and drops detached `setTimeout` work,
 * which is why background downloads used to silently fail. An alarm fires
 * inside an active event, keeping the service worker alive until the
 * (potentially long) image download finishes.
 */
const pendingRefillOptions = new Map<string, { lang?: string; allowLowRes?: boolean }>();

async function scheduleRefill(
  lang?: string,
  allowLowRes?: boolean,
  delayMs: number = BUFFER_REFILL_DELAY_MS,
): Promise<void> {
  if (!isOnline() || isSaveData()) return;
  pendingRefillOptions.set(ALARM_REFILL, { lang, allowLowRes });
  try {
    await browser.alarms.create(ALARM_REFILL, { when: Date.now() + delayMs });
  } catch (err) {
    console.warn('[refill] Alarm scheduling failed; running inline:', err);
    startRefill(lang, allowLowRes);
  }
}

function startRefill(lang?: string, allowLowRes?: boolean): void {
  if (!isOnline() || isSaveData()) return;
  void refillBufferIfNeeded(lang, allowLowRes).catch((err) => {
    console.error('[refill] Buffer refill failed; scheduling a retry:', err);
    void scheduleRefill(lang, allowLowRes, 5 * 60_000);
  });
}

async function ensureMaintenanceAlarm(): Promise<void> {
  try {
    const existing = await browser.alarms.get(ALARM_MAINTENANCE);
    if (!existing) {
      await browser.alarms.create(ALARM_MAINTENANCE, {
        periodInMinutes: ALARM_MAINTAIN_PERIOD_MINUTES,
      });
    }
  } catch (err) {
    console.warn('[refill] Could not create maintenance alarm:', err);
  }
}

browser.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_REFILL) {
    const opts = pendingRefillOptions.get(ALARM_REFILL);
    pendingRefillOptions.delete(ALARM_REFILL);
    startRefill(opts?.lang, opts?.allowLowRes);
  } else if (alarm.name === ALARM_MAINTENANCE) {
    // Periodic top-up: keeps the buffer full even when the user does not
    // open a new tab for days.
    startRefill();
  }
});

async function refillBufferIfNeeded(lang?: string, allowLowRes?: boolean) {
  if (!isOnline() || isSaveData()) return;
  await withMutex(mutexKey, async () => {
    const result = await browser.storage.local.get(BUFFER_KEY);
    const currentBuffer: ApodData[] = Array.isArray(result[BUFFER_KEY]) ? result[BUFFER_KEY] : [];

    if (currentBuffer.length >= BUFFER_LIMIT) {
      performCleanup(currentBuffer);
      return;
    }

    const enriched = await fetchAndValidateRandomApod(lang, allowLowRes);

    const freshResult = await browser.storage.local.get(BUFFER_KEY);
    const freshBuffer: ApodData[] = Array.isArray(freshResult[BUFFER_KEY])
      ? freshResult[BUFFER_KEY]
      : [];

    // Dedupe by date and evict FIFO past the cap; skip the write on a no-op.
    const nextBuffer = pushToBuffer(freshBuffer, enriched, BUFFER_LIMIT);
    if (nextBuffer !== freshBuffer) {
      await browser.storage.local.set({ [BUFFER_KEY]: nextBuffer });
    }
  });
}

/**
 * Bound the image cache so IndexedDB cannot grow unbounded on the
 * user's disk. Keeps buffered dates, today, recently shown dates, and the
 * most recent daily fetches.
 */
async function performCleanup(buffer: ApodData[]) {
  try {
    const result = await browser.storage.local.get(null);
    const recents = await getRecentDates();
    const keep = cleanupKeepList({
      bufferedDates: buffer.map((item: ApodData) => item.date),
      today: new Date().toISOString().split('T')[0],
      recentDates: recents,
      cachedDates: Object.keys(result)
        .filter((k) => ISO_DATE_KEY.test(k))
        .sort()
        .reverse(),
      keepRecent: CLEANUP_KEEP_RECENT_DAYS,
    });
    await clearOldImages(keep);
  } catch (err) {
    console.error('Cleanup failed', err);
  }
}

async function getRecentDates(): Promise<string[]> {
  try {
    const result = await browser.storage.local.get(RECENT_DATES_KEY);
    const recent: unknown[] = Array.isArray(result[RECENT_DATES_KEY])
      ? result[RECENT_DATES_KEY]
      : [];
    return recent.filter((d): d is string => typeof d === 'string');
  } catch {
    return [];
  }
}

/**
 * Download and validate one APOD image.
 *
 * Probes the lightest candidate (`url`, typically 1024-2048px) first and only
 * upgrades to the full-resolution `hdurl` (often 10-30MB) when the standard
 * image is below the minimum resolution — a large bandwidth win. Skips images
 * shown recently so the same picture is not re-downloaded. Every network call
 * is time-boxed, and each attempt is spaced out so flaky servers cannot
 * hammer the user's connection.
 */
async function fetchAndValidateRandomApod(lang?: string, allowLowRes?: boolean) {
  const MAX_ATTEMPTS = MAX_REFILL_ATTEMPTS;
  const recentDates = await getRecentDates();

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    let rawData: ApodData;
    try {
      rawData = await fetchRandomApod(lang);
    } catch {
      break; // Backend unreachable — abort and surface the failure.
    }
    if (rawData.media_type !== 'image') {
      await delay(PROBE_RETRY_DELAY_MS);
      continue;
    }

    // Skip anything we showed recently without burning bandwidth on it,
    // but always accept the final attempt so the buffer is never starved.
    if (
      shouldSkipRecent(rawData.date, recentDates, attempt, MAX_ATTEMPTS, REFILL_RECENT_SKIP_LIMIT)
    ) {
      await delay(PROBE_RETRY_DELAY_MS);
      continue;
    }

    const result = await probeCandidates(rawData, allowLowRes);
    if (!result) {
      await delay(PROBE_RETRY_DELAY_MS);
      continue;
    }

    if (result.data.blob) {
      await saveImageBlob(rawData.date, result.data.blob);
      await rememberRecentDate(rawData.date);
    }
    return await enrichData({
      ...rawData,
      width: result.data.width,
      height: result.data.height,
    });
  }

  // Fallback: accept the best available image so the buffer keeps working
  // even when the pool is full of low-resolution 1990s scans.
  const fallbackRaw = await fetchRandomApod(lang);
  const fallbackUrl = makeImageCandidates(fallbackRaw.url, fallbackRaw.hdurl)[0];
  const fallbackData = fallbackRaw.media_type === 'image' ? await getImageData(fallbackUrl) : null;
  if (fallbackData?.blob) {
    await saveImageBlob(fallbackRaw.date, fallbackData.blob);
    await rememberRecentDate(fallbackRaw.date);
  }
  return await enrichData({
    ...fallbackRaw,
    width: fallbackData?.width,
    height: fallbackData?.height,
  });
}

async function probeCandidates(
  rawData: ApodData,
  allowLowRes?: boolean,
): Promise<{ data: { width: number; height: number; blob: Blob } } | null> {
  for (const url of makeImageCandidates(rawData.url, rawData.hdurl)) {
    const data = await getImageData(url);
    if (!data) continue;
    if (
      isAcceptableResolution(data.width, data.height, {
        minWidth: MIN_IMAGE_WIDTH,
        minHeight: MIN_IMAGE_HEIGHT,
        allowLowRes: Boolean(allowLowRes),
      })
    ) {
      return { data };
    }
  }
  return null;
}

// ─── Lifecycle ───────────────────────────────────────────────

browser.runtime.onInstalled.addListener(async (details) => {
  // 1. One-time Cache Purge for the ORB fix
  const purgeCheck = await browser.storage.local.get(PURGE_KEY);
  if (!purgeCheck[PURGE_KEY]) {
    try {
      await clearOldImages([]); // Empty array = clear all
      await browser.storage.local.set({ [PURGE_KEY]: true });
    } catch (err) {
      console.error('[install] Purge failed:', err);
    }
  }

  if (details.reason === 'install' || details.reason === 'update') {
    // Write seed data to user-side storage so the codebase has no hardcoded dependency
    await browser.storage.local.set({ [SEED_CACHE_KEY]: SEED_APODS });

    // Prime buffer with seed data for instant first impression
    await browser.storage.local.set({ [BUFFER_KEY]: [...SEED_APODS] });

    // Pre-fetch blobs for all seed images (skip on data-saver connections).
    if (!isSaveData()) {
      for (const item of SEED_APODS) {
        try {
          const data = await getImageData(makeImageCandidates(item.url, item.hdurl)[0]);
          if (data?.blob && data.blob.size > 1024) {
            await saveImageBlob(item.date, data.blob);
          }
          await new Promise((r) => setTimeout(r, 500));
        } catch (err) {
          console.error('[install] Failed to pre-fetch blob:', err);
        }
      }
    }
  }

  await ensureMaintenanceAlarm();
  void scheduleRefill();
});

browser.runtime.onStartup.addListener(() => {
  void ensureMaintenanceAlarm();
  void scheduleRefill();
});
