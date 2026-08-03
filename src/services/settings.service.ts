/**
 * services/settings.service.ts — Storage-backed settings access.
 * Source of truth: browser.storage.local["settings"].
 * Legacy localStorage keys (userLang / allowLowRes) are migrated on read.
 */
import browser from '../browser';
import {
  Settings,
  DEFAULT_SETTINGS,
  mergeSettings,
  detectBrowserLanguage,
  PartialSettings,
} from '../utils/settings';

const SETTINGS_KEY = 'settings';

function readLegacy(): PartialSettings {
  const legacy: PartialSettings = {};
  try {
    const userLang = localStorage.getItem('userLang');
    if (userLang) legacy.language = userLang;
    const allowLowRes = localStorage.getItem('allowLowRes');
    if (allowLowRes !== null) legacy.allowLowRes = allowLowRes === 'true';
  } catch {
    // localStorage unavailable (e.g. service worker context) — ignore
  }
  return legacy;
}

export async function getSettings(): Promise<Settings> {
  const stored = (await browser.storage.local.get(SETTINGS_KEY))[SETTINGS_KEY] as
    | PartialSettings
    | undefined;
  const legacy = readLegacy();
  const settings = mergeSettings(DEFAULT_SETTINGS, { ...legacy, ...stored });

  // First run: if the user never chose a language explicitly, honor the browser locale.
  if (!stored?.language && !legacy.language) {
    settings.language = detectBrowserLanguage();
  }

  return settings;
}

export async function updateSettings(patch: PartialSettings): Promise<Settings> {
  const current = await getSettings();
  const next = mergeSettings(current, patch);
  await browser.storage.local.set({ [SETTINGS_KEY]: next });
  return next;
}
