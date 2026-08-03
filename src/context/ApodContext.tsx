import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { ApodData } from '../types/apod';
import {
  fetchApod as fetchDirect,
  fetchRandomApod as fetchRandomDirect,
} from '../services/apod.service';
import { getSettings, updateSettings } from '../services/settings.service';
import { ViewMode, detectBrowserLanguage } from '../utils/settings';
import { enrichData } from '../utils/enrichment';
import { CosmicObject } from '../data/catalog';
import browser from '../browser';

interface ApodContextType {
  apod: ApodData | null;
  loading: boolean;
  error: string | null;
  language: string;
  setLanguage: (lang: string) => void;
  allowLowRes: boolean;
  setAllowLowRes: (allow: boolean) => void;
  highContrast: boolean;
  setHighContrast: (value: boolean) => void;
  reducedMotion: boolean;
  setReducedMotion: (value: boolean) => void;
  fetchApod: (type?: 'FETCH_APOD' | 'FETCH_RANDOM') => Promise<void>;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  selectApod: (apod: ApodData) => void;
  isStarMapOpen: boolean;
  starMapObjects: CosmicObject[];
  openStarMap: (objects?: CosmicObject[]) => void;
  closeStarMap: () => void;
}

const ApodContext = createContext<ApodContextType | undefined>(undefined);

function detectDefaultLanguage(): string {
  try {
    const legacy = localStorage.getItem('userLang');
    if (legacy) return legacy;
  } catch {
    // ignore
  }
  return detectBrowserLanguage();
}

export const ApodProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apod, setApod] = useState<ApodData | null>(null);
  const [loading, setLoading] = useState(true); // Default to true while we check cache
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<string>(() => detectDefaultLanguage());
  const [allowLowRes, setAllowLowRes] = useState<boolean>(() => {
    try {
      return localStorage.getItem('allowLowRes') === 'true';
    } catch {
      return false;
    }
  });
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('apod');
  const [isStarMapOpen, setIsStarMapOpen] = useState(false);
  const [starMapObjects, setStarMapObjects] = useState<CosmicObject[]>([]);

  const openStarMap = useCallback((objects: CosmicObject[] = []) => {
    setStarMapObjects(objects);
    setIsStarMapOpen(true);
  }, []);

  const closeStarMap = useCallback(() => setIsStarMapOpen(false), []);

  const isInitialMount = useRef(true);
  const prevLanguage = useRef(language);

  const fetchApod = useCallback(
    async (type: 'FETCH_APOD' | 'FETCH_RANDOM' = 'FETCH_APOD') => {
      setLoading(true);
      setError(null);
      try {
        if (browser.runtime?.id) {
          const response = await browser.runtime.sendMessage({ type, lang: language, allowLowRes });
          const res = response as { data?: ApodData; error?: string };
          if (res.error) throw new Error(res.error);
          setApod(res.data ?? null);
        } else {
          console.warn('Extension runtime not found. Using development fallback.');
          const rawData =
            type === 'FETCH_APOD'
              ? await fetchDirect(undefined, language)
              : await fetchRandomDirect(language);
          const enriched = await enrichData(rawData);
          setApod(enriched);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Signal lost with the cosmos.');
      } finally {
        setLoading(false);
      }
    },
    [language, allowLowRes],
  );

  // ─── Initial Hydration (settings + queue consumption) ────────
  const hydrateStarted = useRef(false);
  useEffect(() => {
    if (hydrateStarted.current) return;
    hydrateStarted.current = true;

    (async () => {
      try {
        const settings = await getSettings();
        setLanguage(settings.language);
        setAllowLowRes(settings.allowLowRes);
        setHighContrast(settings.highContrast);
        setReducedMotion(settings.reducedMotion);
        setViewMode(settings.viewMode);
      } catch (err) {
        console.error('Failed to hydrate settings', err);
      }

      isInitialMount.current = false;

      // Consume the prefetch queue through the service worker so the
      // first image is popped (last_shown tracked) instead of peeked.
      await fetchApod('FETCH_RANDOM');
    })();
  }, [fetchApod]);

  // ─── Persist preference changes to the shared settings store ──
  useEffect(() => {
    if (isInitialMount.current) return;

    if (language !== prevLanguage.current) {
      prevLanguage.current = language;
      if (browser.runtime?.id && apod) {
        setLoading(true);
        (
          browser.runtime.sendMessage({
            type: 'UPDATE_TRANSLATION',
            date: apod.date,
            lang: language,
          }) as Promise<{ data?: ApodData; error?: string }>
        )
          .then((res) => {
            if (res?.data) setApod(res.data);
          })
          .catch(console.error)
          .finally(() => setLoading(false));
      }
    }

    updateSettings({ language, allowLowRes }).catch(() => {});
  }, [language, allowLowRes, apod]);

  useEffect(() => {
    if (isInitialMount.current) return;
    updateSettings({ viewMode }).catch(() => {});
  }, [viewMode]);

  useEffect(() => {
    if (isInitialMount.current) return;
    updateSettings({ highContrast, reducedMotion }).catch(() => {});
  }, [highContrast, reducedMotion]);

  // ─── Apply accessibility classes to the document ─────────────
  useEffect(() => {
    const el = document.body;
    el.classList.toggle('high-contrast', highContrast);
    el.classList.toggle('reduced-motion', reducedMotion);
  }, [highContrast, reducedMotion]);

  // ─── Live sync: options page → new tab ───────────────────────
  useEffect(() => {
    if (!browser.runtime?.id || !browser.storage?.onChanged) return;
    const onChange = (changes: Record<string, { newValue?: unknown }>, areaName: string) => {
      if (areaName !== 'local' || !changes.settings) return;
      const next = changes.settings.newValue as Record<string, unknown> | undefined;
      if (!next) return;
      if (typeof next.language === 'string') setLanguage(next.language);
      if (typeof next.allowLowRes === 'boolean') setAllowLowRes(next.allowLowRes);
      if (typeof next.highContrast === 'boolean') setHighContrast(next.highContrast);
      if (typeof next.reducedMotion === 'boolean') setReducedMotion(next.reducedMotion);
      if (
        next.viewMode === 'apod' ||
        next.viewMode === 'dashboard' ||
        next.viewMode === 'gallery'
      ) {
        setViewMode(next.viewMode);
      }
    };
    browser.storage.onChanged.addListener(onChange);
    return () => browser.storage.onChanged.removeListener(onChange);
  }, []);

  return (
    <ApodContext.Provider
      value={{
        apod,
        loading,
        error,
        language,
        setLanguage,
        allowLowRes,
        setAllowLowRes,
        highContrast,
        setHighContrast,
        reducedMotion,
        setReducedMotion,
        fetchApod,
        viewMode,
        setViewMode,
        selectApod: (a: ApodData) => {
          setApod(a);
          setViewMode('apod');
        },
        isStarMapOpen,
        starMapObjects,
        openStarMap,
        closeStarMap,
      }}
    >
      {children}
    </ApodContext.Provider>
  );
};

export const useApod = () => {
  const context = useContext(ApodContext);
  if (!context) throw new Error('useApod must be used within an ApodProvider');
  return context;
};
