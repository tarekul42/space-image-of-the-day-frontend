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
    date: '2026-11-15',
    title: 'Leonid Meteors Through Orion',
    explanation:
      'Where will the next meteor appear? Even during a meteor shower, it is practically impossible to know. Therefore, a good way to enjoy a meteor shower is to find a place where you can sit comfortably and monitor a great expanse of dark sky. And it may be satisfying to share this experience with a friend. The meteor shower depicted was the 2022 Leonids and the view is from Hainan, China looking out over the South China Sea. Meteor streaks captured over a few hours were isolated and added to a foreground image recorded earlier. Leonid meteor streaks trace back to the constellation of Leo and were here seen streaking across the constellation of Orion. The bright red planet Mars appears near the top of the image. The Leonids peak in mid-November every year and so will peak again this week. Bonding over their love of astronomy, the two pictured meteor enthusiasts, shown celebrating their common birthday this month, were later married.',
    url: 'https://assets.science.nasa.gov/content/dam/science/cds/apod/apod/2026/november/Leonids2022_Hongyang_2880.jpg/jcr:content/renditions/cq5dam.web.1280.1280.jpeg',
    hdurl:
      'https://assets.science.nasa.gov/dynamicimage/assets/science/cds/apod/apod/2026/november/Leonids2022_Hongyang_2880.jpg?w=2880&h=3600&fit=clip',
    media_type: 'image',
    object_type: 'Meteor Shower',
    width: 1024,
    height: 1280,
  },
  {
    date: '2026-11-13',
    title: 'NGC 206 and the Star Clouds of Andromeda',
    explanation:
      "The large stellar association cataloged as NGC 206 is nestled within the dusty arms of the neighboring Andromeda galaxy along with the galaxy's pinkish star-forming regions. Also known as M31, the spiral galaxy is a mere 2.5 million light-years away. NGC 206 is found at the center of this sharp and detailed close-up of the southwestern extent of Andromeda's disk. The bright, blue stars of NGC 206 indicate its youth. In fact, its youngest massive stars are less than 10 million years old. Much larger than the open or galactic clusters of young stars in the disk of our Milky Way galaxy, NGC 206 spans about 4,000 light-years. That's comparable in size to the giant stellar nurseries NGC 604 in nearby spiral M33 and the Tarantula Nebula in the Large Magellanic Cloud.",
    url: 'https://assets.science.nasa.gov/content/dam/science/cds/apod/apod/2026/november/Andromeda_closeupCruz4096.jpg/jcr:content/renditions/cq5dam.web.1280.1280.jpeg',
    hdurl:
      'https://assets.science.nasa.gov/dynamicimage/assets/science/cds/apod/apod/2026/november/Andromeda_closeupCruz4096.jpg?w=4096&h=2902&fit=clip',
    media_type: 'image',
    object_type: 'Galaxy',
    width: 1280,
    height: 906,
  },
  {
    date: '2026-11-11',
    title: 'NGC 4449: Small Galaxy, Big Impact',
    explanation:
      'Don’t judge a galaxy by its size. Our home galaxy, the Milky Way, is about 100,000 light years across. This huge expanse of space contains hundreds of billions of stars! The smallest galaxies, called dwarf galaxies, are about 1/10th the size of the Milky Way and only contain a few billion stars. They are also the most common type of galaxy in the whole universe. Today’s image shows one such dwarf galaxy, NGC 4449, captured by the Hubble Space Telescope. NGC 4449 and similar dwarf galaxies are missing more oxygen than models predict. This suggests their stellar winds and supernovae are surprisingly effective at blowing away oxygen and other heavy elements. Turns out these tiny galaxies may play a big role in spreading heavy elements — the building blocks of stars, planets, and life — throughout the universe!',
    url: 'https://assets.science.nasa.gov/content/dam/science/missions/hubble/galaxies/irregular/NGC%204449.jpg/jcr:content/renditions/cq5dam.web.1280.1280.jpeg',
    hdurl:
      'https://assets.science.nasa.gov/dynamicimage/assets/science/missions/hubble/galaxies/irregular/NGC%204449.jpg?w=2048&h=1320&fit=clip',
    media_type: 'image',
    object_type: 'Galaxy',
    width: 1280,
    height: 825,
  },
  {
    date: '2026-11-10',
    title: 'Saturn Behind the Moon',
    explanation:
      "Sometimes Saturn disappears. It doesn't really go away, of course -- it just disappears from our view when Earth's Moon moves in front. Such a Saturnian eclipse, more formally called an occultation, was visible in early 2025 along a small swath of Earth -- from Greenland through central Europe and into northern Africa. The featured image is a digital fusion of three images, the first of just Saturn before it disappeared, and then two more of the Moon with different exposure lengths. The images were taken from Sardinia, Italy, after sunset. The bright dot near Saturn is not a moon of Saturn, but rather the star 85 Aquarii, which is further behind Saturn than Saturn is behind the Moon. The next time the Moon moves in front of Saturn, as visible from some place on Earth, will be in 2031.",
    url: 'https://assets.science.nasa.gov/content/dam/science/cds/apod/apod/2026/november/Moonsaturn6_Ortu_2124.jpg/jcr:content/renditions/cq5dam.web.1280.1280.jpeg',
    hdurl:
      'https://assets.science.nasa.gov/dynamicimage/assets/science/cds/apod/apod/2026/november/Moonsaturn6_Ortu_2124.jpg?w=2124&h=1582&fit=clip',
    media_type: 'image',
    object_type: 'Planet',
    width: 1280,
    height: 953,
  },
  {
    date: '2026-11-09',
    title: 'Rigel and the Witch Head Nebula',
    explanation:
      "Does the blue nebula look like the head of a witch? The nebula is known popularly as the Witch Head Nebula because, it is said, the nebula's shape resembles a Halloween-style caricature of a witch's head. Exactly how, though, can be a topic of imaginative speculation. What is clear is that IC 2118 is about 50 light-years across and made of gas and dust that points to -- because it has been partly eroded by -- the nearby star Rigel. One of the brighter stars in the constellation Orion, Rigel lies just below the center of the featured image. The blue color of the Witch Head Nebula and is caused not only by Rigel's intense blue starlight but also because the dust grains scatter blue light more efficiently than red. The same physical process causes Earth's daytime sky to appear blue, although the scatterers in planet Earth's atmosphere are molecules of nitrogen and oxygen.",
    url: 'https://assets.science.nasa.gov/content/dam/science/cds/apod/apod/2026/november/WitchHead_Czerski_3000.jpg/jcr:content/renditions/cq5dam.web.1280.1280.jpeg',
    hdurl:
      'https://assets.science.nasa.gov/dynamicimage/assets/science/cds/apod/apod/2026/november/WitchHead_Czerski_3000.jpg?w=3000&h=1990&fit=clip',
    media_type: 'image',
    object_type: 'Nebula',
    width: 1280,
    height: 849,
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

/** True when the first bytes look like a raster image the <img> tag can render. */
async function hasImageSignature(blob: Blob): Promise<boolean> {
  const bytes = new Uint8Array(await blob.slice(0, 12).arrayBuffer());
  const ascii = (start: number, end: number) =>
    String.fromCharCode(...bytes.subarray(start, Math.min(end, bytes.length)));

  // JPEG, PNG, GIF, BMP
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return true;
  if (bytes[0] === 0x89 && ascii(1, 4) === 'PNG' && bytes[4] === 0x0d && bytes[5] === 0x0a)
    return true;
  if (ascii(0, 4) === 'GIF8') return true;
  if (ascii(0, 2) === 'BM') return true;

  // WebP: RIFF....WEBP
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return true;

  // AVIF / HEIC: ....ftyp<brand>
  if (ascii(4, 8) === 'ftyp') return true;

  return false;
}

/**
 * Probe the pixel dimensions of an image URL and return the Blob.
 * Aborts after IMAGE_DOWNLOAD_TIMEOUT_MS so a hung server cannot pin
 * the service worker or bleed the user's bandwidth forever.
 *
 * Also rejects HTML/JSON payloads: the old apod.nasa.gov URLs now redirect
 * to a 200 HTML page, which previously ended up cached as if it were an image.
 */
async function getImageData(
  url: string,
  timeoutMs: number = IMAGE_DOWNLOAD_TIMEOUT_MS,
): Promise<{ width: number; height: number; blob: Blob } | null> {
  try {
    await keepAlive();
    const response = await fetchWithTimeout(url, {}, timeoutMs);
    if (!response.ok) return null;

    const contentType = (response.headers.get('content-type') ?? '').toLowerCase();
    if (contentType.includes('text/html') || contentType.includes('application/json')) return null;

    const blob = await response.blob();
    if (blob.size <= 1024) return null;
    if (!(await hasImageSignature(blob))) return null;
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
