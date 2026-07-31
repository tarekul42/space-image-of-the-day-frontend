import browser from './browser';
import { fetchApod, fetchRandomApod } from './services/apod.service';
import { ApodData } from './types/apod';
import { enrichData } from './utils/enrichment';
import { clearOldImages, getAllBlobKeys, saveImageBlob } from './utils/storage';
import { MIN_IMAGE_WIDTH, MIN_IMAGE_HEIGHT, BUFFER_LIMIT, MAX_REFILL_ATTEMPTS } from './constants';

const BUFFER_KEY = 'random_buffer';
const PURGE_KEY = 'cache_purge_v2';
const SEED_CACHE_KEY = 'seed_cache';

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
 * Probe the pixel dimensions of an image URL and return the Blob.
 */
async function getImageData(
  url: string,
): Promise<{ width: number; height: number; blob: Blob } | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    const bitmap = await createImageBitmap(blob);
    const dims = { width: bitmap.width, height: bitmap.height, blob };
    bitmap.close();
    return dims;
  } catch {
    return null;
  }
}

// ─── Message Handling ────────────────────────────────────────

browser.runtime.onMessage.addListener(
  (request: unknown, _sender: browser.Runtime.MessageSender) => {
    const req = request as { type: string; date?: string; lang?: string; allowLowRes?: boolean };

    // Use a pattern that ensures we ALWAYS return a promise or false.
    // This prevents "Receiving end does not exist" synchronously.
    switch (req.type) {
      case 'FETCH_APOD':
      case 'UPDATE_TRANSLATION':
        return handleFetchApod(req.date, req.lang);
      case 'FETCH_RANDOM':
        return handleFetchRandom(req.lang, req.allowLowRes);
      case 'CLEAR_BUFFER':
        return handleClearBuffer(req.lang, req.allowLowRes);
      case 'FETCH_TOP_SITES':
        return handleFetchTopSites();
      default:
        return false; // Not a known message type
    }
  },
);

async function handleFetchApod(date?: string, lang?: string) {
  try {
    const rawData = await fetchApod(date, lang);
    const data = rawData.url ? await getImageData(rawData.hdurl || rawData.url) : null;
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
      .filter((k) => k !== BUFFER_KEY && k !== PURGE_KEY)
      .sort()
      .reverse();
    if (keys.length > 0) {
      return { data: allCache[keys[0]], fromCache: true, offline: true };
    }
    return { error: errorMessage };
  }
}

async function handleClearBuffer(lang?: string, allowLowRes?: boolean) {
  await browser.storage.local.set({ [BUFFER_KEY]: [] });
  // Start the incremental refill chain
  setTimeout(() => refillBufferIfNeeded(lang, allowLowRes), 0);
  return { success: true };
}

async function handleFetchRandom(lang?: string, allowLowRes?: boolean) {
  try {
    const result = await browser.storage.local.get(BUFFER_KEY);
    const buffer: ApodData[] = Array.isArray(result[BUFFER_KEY]) ? result[BUFFER_KEY] : [];

    if (buffer.length > 0) {
      const dataToReturn = buffer.shift();
      await browser.storage.local.set({ [BUFFER_KEY]: buffer });
      setTimeout(() => refillBufferIfNeeded(lang, allowLowRes), 100);
      return { data: dataToReturn };
    }

    // Try IndexedDB fallback: pick a random cached image the user has already seen
    const blobKeys = await getAllBlobKeys();
    if (blobKeys.length > 0) {
      const randomDate = blobKeys[Math.floor(Math.random() * blobKeys.length)];
      const cached = await browser.storage.local.get(randomDate);
      if (cached[randomDate]) {
        setTimeout(() => refillBufferIfNeeded(lang, allowLowRes), 100);
        return { data: cached[randomDate] as ApodData, fromCache: true };
      }
    }

    // Fallback to seed data from user storage
    const seedResult = await browser.storage.local.get(SEED_CACHE_KEY);
    const seeds: ApodData[] = Array.isArray(seedResult[SEED_CACHE_KEY])
      ? seedResult[SEED_CACHE_KEY]
      : [];
    const fallback = seeds.length > 0
      ? seeds[Math.floor(Math.random() * seeds.length)]
      : SEED_APODS[0];

    setTimeout(() => refillBufferIfNeeded(lang, allowLowRes), 100);
    return { data: fallback, fromFallback: true };
  } catch {
    return { data: SEED_APODS[0], fromFallback: true };
  }
}

/**
 * Incremental Refill - Fetches EXACTLY ONE item if space remains.
 * This prevents long-running loops that can cause the script to hang.
 */
const refillMutex = new WeakMap<object, Promise<void>>();
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

async function refillBufferIfNeeded(lang?: string, allowLowRes?: boolean) {
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

    if (freshBuffer.length >= BUFFER_LIMIT) {
      freshBuffer.shift();
    }
    freshBuffer.push(enriched);
    await browser.storage.local.set({ [BUFFER_KEY]: freshBuffer });
  });
}

async function performCleanup(buffer: ApodData[]) {
  try {
    const result = await browser.storage.local.get(null);
    const bufferedDates = buffer.map((item: ApodData) => item.date);
    const today = new Date().toISOString().split('T')[0];
    const cachedDates = Object.keys(result).filter((k) => k !== BUFFER_KEY);
    await clearOldImages([...bufferedDates, ...cachedDates, today]);
  } catch (err) {
    console.error('Cleanup failed', err);
  }
}

/**
 * Fetch a random APOD and verify its resolution.
 * Retries until a qualifying image is found (up to 5 attempts).
 */
async function fetchAndValidateRandomApod(lang?: string, allowLowRes?: boolean) {
  const MAX_ATTEMPTS = MAX_REFILL_ATTEMPTS;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const rawData = await fetchRandomApod(lang);
    if (rawData.media_type !== 'image') continue;

    const data = rawData.url ? await getImageData(rawData.hdurl || rawData.url) : null;
    if (!data) continue;

    const isHighRes = data.width >= MIN_IMAGE_WIDTH && data.height >= MIN_IMAGE_HEIGHT;
    if (allowLowRes || isHighRes) {
      if (data.blob) await saveImageBlob(rawData.date, data.blob);
      return await enrichData({ ...rawData, width: data.width, height: data.height });
    }
  }

  // Fallback
  const rawData = await fetchRandomApod(lang);
  const data = rawData.url ? await getImageData(rawData.hdurl || rawData.url) : null;
  if (data?.blob) await saveImageBlob(rawData.date, data.blob);
  return enrichData({ ...rawData, width: data?.width, height: data?.height });
}

async function handleFetchTopSites() {
  try {
    if (typeof chrome !== 'undefined' && chrome.topSites) {
      const sites = await chrome.topSites.get();
      const data = sites.map((s: { title: string; url: string }) => ({
        title: s.title || new URL(s.url).hostname,
        url: s.url,
      }));
      return { data };
    }
    return { data: [] };
  } catch {
    return { data: [] };
  }
}

// ─── Lifecycle ───────────────────────────────────────────────

browser.runtime.onInstalled.addListener(async (details) => {
  // 1. One-time Cache Purge for the ORB fix
  const purgeCheck = await browser.storage.local.get(PURGE_KEY);
  if (!purgeCheck[PURGE_KEY]) {
    // console.log('[install] Purging legacy "poisoned" cache (ORB Migration)...');
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

    // Pre-fetch blobs for all seed images
    for (const item of SEED_APODS) {
      try {
        const data = await getImageData(item.hdurl || item.url);
        if (data?.blob && data.blob.size > 1024) {
          await saveImageBlob(item.date, data.blob);
        }
        await new Promise((r) => setTimeout(r, 500));
      } catch (err) {
        console.error(`[install] Failed to pre-fetch blob:`, err);
      }
    }

    // Kick off 3 parallel refills to fill buffer with real images faster
    for (let i = 0; i < 3; i++) {
      refillBufferIfNeeded();
    }
  }

  // Always check refill on install/update/chrome_update
  refillBufferIfNeeded();
});

browser.runtime.onStartup.addListener(() => {
  refillBufferIfNeeded();
});
