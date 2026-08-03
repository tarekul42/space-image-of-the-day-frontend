import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Heart,
  Loader2,
  RefreshCw,
  Telescope,
  WifiOff,
} from 'lucide-react';
import { useApod } from '../../context/ApodContext';
import { fetchApodRange } from '../../services/apod.service';
import { matchCatalogObjects } from '../../utils/catalogMatch';
import { COSMIC_CATALOG } from '../../data/catalog';
import browser from '../../browser';
import type { ApodData } from '../../types/apod';

const DAY_MS = 86400000;
const EARLIEST_DATE = '1995-06-16'; // APOD archive start
const fmt = (d: Date) => d.toISOString().split('T')[0];

type GalleryTab = 'week' | 'favorites';

export const Gallery: React.FC = () => {
  const {
    setViewMode,
    selectApod,
    language,
    openStarMap,
    favorites,
    favoritesLoaded,
    toggleFavorite,
  } = useApod();

  const [tab, setTab] = useState<GalleryTab>('week');
  const [items, setItems] = useState<ApodData[]>([]);
  const [endDate, setEndDate] = useState(() => fmt(new Date()));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);

  const today = useMemo(() => fmt(new Date()), []);

  const load = useCallback(
    async (end: string) => {
      setLoading(true);
      setError(null);
      setOffline(false);
      try {
        const endD = new Date(`${end}T00:00:00Z`);
        const start = new Date(endD.getTime() - 6 * DAY_MS);
        const startDate = fmt(start);
        let data: ApodData[];
        let fromCache = false;
        if (browser.runtime?.id) {
          const res = (await browser.runtime.sendMessage({
            type: 'FETCH_RANGE',
            startDate,
            endDate: end,
            lang: language,
          })) as { data?: ApodData[]; fromCache?: boolean; error?: string };
          if (res.error) throw new Error(res.error);
          data = res.data ?? [];
          fromCache = !!res.fromCache;
        } else {
          data = await fetchApodRange(startDate, end, language);
        }
        setItems(data);
        setOffline(fromCache);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load images');
      } finally {
        setLoading(false);
      }
    },
    [language],
  );

  useEffect(() => {
    if (tab === 'week') load(endDate);
  }, [tab, endDate, load]);

  const shiftWeek = (dir: 1 | -1) => {
    setEndDate((prev) => {
      const d = new Date(`${prev}T00:00:00Z`);
      d.setDate(d.getDate() + 7 * dir);
      const candidate = fmt(d);
      if (candidate > today) return today;
      if (candidate < EARLIEST_DATE) return EARLIEST_DATE;
      return candidate;
    });
  };

  const handleDateJump = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (v && v >= EARLIEST_DATE && v <= today) setEndDate(v);
  };

  const renderSkyButton = (item: ApodData) => {
    const objects = matchCatalogObjects(item.title, item.explanation, COSMIC_CATALOG);
    if (objects.length === 0) return null;
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          openStarMap(objects);
        }}
        title={`See ${objects.length} object${objects.length > 1 ? 's' : ''} in the night sky`}
        className="absolute top-2 right-2 z-10 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/60 backdrop-blur-md border border-amber-300/30 text-amber-300/90 text-[9px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity hover:bg-amber-400/20"
      >
        <Telescope className="w-3 h-3" />
        {objects.length} in sky
      </button>
    );
  };

  const renderCard = (item: ApodData, index: number, showRemove?: boolean) => (
    <motion.button
      key={item.date}
      onClick={() => selectApod(item)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="relative group rounded-2xl overflow-hidden theme-surface-soft border border-white/10 hover:border-blue-500/30 transition-all duration-300 text-left"
    >
      <div className="aspect-[4/3] overflow-hidden bg-[#0a0a0c] relative">
        <img
          src={item.url}
          alt={item.title}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
          loading="lazy"
        />
        {renderSkyButton(item)}
        {showRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(item);
            }}
            title="Remove from favorites"
            aria-label="Remove from favorites"
            className="absolute top-2 right-2 z-10 flex items-center px-2 py-1 rounded-full bg-black/60 backdrop-blur-md border border-red-300/30 text-red-400/90 text-[9px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-400/20"
          >
            <Heart className="w-3 h-3 fill-red-500 text-red-500" />
          </button>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-center gap-1.5 text-[10px] text-blue-300/60 font-mono mb-1">
          <Calendar className="w-3 h-3" />
          {item.date}
        </div>
        <h3 className="text-sm font-semibold text-white/80 group-hover:text-white line-clamp-2 leading-tight transition-colors">
          {item.title}
        </h3>
        {item.object_type && (
          <span className="inline-block mt-2 px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[9px] font-bold uppercase tracking-wider text-blue-300">
            {item.object_type}
          </span>
        )}
      </div>
    </motion.button>
  );

  const favoriteCount = favorites.length;

  return (
    <div className="absolute inset-0 w-full h-full overflow-y-auto custom-scrollbar theme-bg">
      <div className="px-6 py-8 md:py-12 md:px-10 max-w-6xl mx-auto">
        <motion.button
          onClick={() => setViewMode('apod')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-white/50 hover:text-white/90 transition-colors text-sm mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to cosmos
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl md:text-5xl font-bold text-glow text-white">
            {tab === 'week' ? 'This Week in Space' : 'Sorted Objects'}
          </h1>
          <p className="text-white/40 text-sm mt-2">
            {tab === 'week'
              ? 'A timeline thread — tap a day, then see its objects in the night sky.'
              : `Your personal album of ${favoriteCount} saved ${favoriteCount === 1 ? 'discovery' : 'discoveries'}.`}
          </p>
          {offline && tab === 'week' && (
            <p className="flex items-center gap-1.5 text-amber-300/70 text-xs mt-2">
              <WifiOff className="w-3.5 h-3.5" /> Showing cached images — you're offline
            </p>
          )}
        </motion.div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab('week')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                tab === 'week'
                  ? 'bg-blue-500/15 border-blue-500/30 text-blue-300'
                  : 'bg-white/5 border-white/10 text-white/50 hover:text-white/80'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              This Week
            </button>
            <button
              onClick={() => setTab('favorites')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                tab === 'favorites'
                  ? 'bg-red-500/15 border-red-500/30 text-red-300'
                  : 'bg-white/5 border-white/10 text-white/50 hover:text-white/80'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              Favorites{favoriteCount > 0 ? ` (${favoriteCount})` : ''}
            </button>
          </div>

          {tab === 'week' && (
            <div className="flex items-center gap-2 text-sm">
              <button
                onClick={() => shiftWeek(-1)}
                aria-label="Previous week"
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/60">
                <Calendar className="w-3.5 h-3.5" />
                <input
                  type="date"
                  value={endDate}
                  min={EARLIEST_DATE}
                  max={today}
                  onChange={handleDateJump}
                  aria-label="Jump to date"
                  className="bg-transparent text-white text-xs font-mono outline-none [color-scheme:dark]"
                />
              </label>
              <button
                onClick={() => shiftWeek(1)}
                aria-label="Next week"
                disabled={endDate >= today}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              {endDate < today && (
                <button
                  onClick={() => setEndDate(today)}
                  className="px-3 py-2 rounded-xl text-xs text-blue-300/80 hover:text-blue-300 transition-colors"
                >
                  Back to today
                </button>
              )}
            </div>
          )}
        </div>

        {tab === 'week' && endDate < today && (
          <p className="text-[11px] text-white/30 font-mono mb-6">
            Time-traveling — 30 years of APOD, from June 1995 to today.
          </p>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <p className="text-red-400/70 text-sm">{error}</p>
            <button
              onClick={() => load(endDate)}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all text-sm"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        ) : tab === 'week' ? (
          items.length === 0 ? (
            <div className="text-center py-32 text-white/30">
              <p>No images found for this week.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {items.map((item, i) => renderCard(item, i))}
            </div>
          )
        ) : (
          <>
            {!favoritesLoaded ? (
              <div className="flex items-center justify-center py-32">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              </div>
            ) : favorites.length === 0 ? (
              <div className="text-center py-32 text-white/30">
                <Heart className="w-10 h-10 mx-auto mb-4 opacity-40" />
                <p>Nothing saved yet. Tap the heart on any discovery to keep it here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {favorites.map((item, i) => renderCard(item, i, true))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
