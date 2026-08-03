import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Loader2, RefreshCw, Telescope, WifiOff } from 'lucide-react';
import { useApod } from '../../context/ApodContext';
import { fetchApodRange } from '../../services/apod.service';
import { matchCatalogObjects } from '../../utils/catalogMatch';
import { COSMIC_CATALOG } from '../../data/catalog';
import browser from '../../browser';
import type { ApodData } from '../../types/apod';

export const Gallery: React.FC = () => {
  const { setViewMode, selectApod, language, openStarMap } = useApod();
  const [items, setItems] = useState<ApodData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setOffline(false);
    try {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 6);
      const fmt = (d: Date) => d.toISOString().split('T')[0];
      let data: ApodData[];
      let fromCache = false;
      if (browser.runtime?.id) {
        const res = (await browser.runtime.sendMessage({
          type: 'FETCH_RANGE',
          startDate: fmt(start),
          endDate: fmt(end),
          lang: language,
        })) as { data?: ApodData[]; fromCache?: boolean; error?: string };
        if (res.error) throw new Error(res.error);
        data = res.data ?? [];
        fromCache = !!res.fromCache;
      } else {
        data = await fetchApodRange(fmt(start), fmt(end), language);
      }
      setItems(data);
      setOffline(fromCache);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load images');
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-y-auto custom-scrollbar bg-[#05080f]">
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
          className="mb-10"
        >
          <h1 className="text-3xl md:text-5xl font-bold text-glow text-white">
            This Week in Space
          </h1>
          <p className="text-white/40 text-sm mt-2">Browse the last 7 days of cosmic discoveries</p>
          {offline && (
            <p className="flex items-center gap-1.5 text-amber-300/70 text-xs mt-2">
              <WifiOff className="w-3.5 h-3.5" /> Showing cached images — you're offline
            </p>
          )}
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <p className="text-red-400/70 text-sm">{error}</p>
            <button
              onClick={load}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all text-sm"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-32 text-white/30">
            <p>No images found for this week.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item, i) => (
              <motion.button
                key={item.date}
                onClick={() => selectApod(item)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="relative group rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all duration-300 text-left"
              >
                <div className="aspect-[4/3] overflow-hidden bg-[#0a0a0c] relative">
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                    loading="lazy"
                  />
                  {(() => {
                    const objects = matchCatalogObjects(
                      item.title,
                      item.explanation,
                      COSMIC_CATALOG,
                    );
                    return objects.length > 0 ? (
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
                    ) : null;
                  })()}
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
