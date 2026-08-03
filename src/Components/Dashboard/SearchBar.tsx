import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Globe, Telescope, Loader2, CornerDownLeft } from 'lucide-react';
import { getSettings } from '../../services/settings.service';
import {
  SearchEngine,
  SEARCH_ENGINE_LABELS,
  SEARCH_ENGINES,
  resolveSearchUrl,
} from '../../utils/settings';
import { searchCosmicCatalog } from '../../services/catalog.service';
import { CosmicObject } from '../../data/catalog';
import { useApod } from '../../context/ApodContext';

export const SearchBar: React.FC = () => {
  const { openStarMap } = useApod();
  const [query, setQuery] = useState('');
  const [engine, setEngine] = useState<SearchEngine>('google');
  const [suggestions, setSuggestions] = useState<CosmicObject[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getSettings().then((settings) => {
      if (SEARCH_ENGINES.includes(settings.searchEngine)) {
        setEngine(settings.searchEngine);
      }
    });
    inputRef.current?.focus();
  }, []);

  // Debounced backend "cosmic knowledge" autocomplete.
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setOpen(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      const results = await searchCosmicCatalog(trimmed, 6);
      setSuggestions(results);
      setOpen(true);
      setLoading(false);
    }, 220);
    return () => clearTimeout(timer);
  }, [query]);

  const runWebSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    window.location.href = resolveSearchUrl(engine, q);
  };

  const locateOnSky = (obj: CosmicObject) => {
    openStarMap([obj]);
    setOpen(false);
    setQuery('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
    } else if (e.key === 'Enter' && activeIndex >= 0 && suggestions[activeIndex]) {
      e.preventDefault();
      locateOnSky(suggestions[activeIndex]);
    }
  };

  return (
    <motion.form
      onSubmit={runWebSearch}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full max-w-2xl mx-auto"
    >
      <div className="relative flex items-center theme-surface backdrop-blur-3xl border rounded-3xl shadow-2xl hover:border-white/20 transition-colors group">
        <Search className="absolute left-5 w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search the cosmos..."
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls="cosmic-suggestions"
          className="w-full bg-transparent text-white text-lg py-4 pl-14 pr-16 rounded-3xl outline-none placeholder:text-white/30"
        />
        <div className="absolute right-4 flex items-center gap-1 text-white/40">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
          <select
            value={engine}
            onChange={(e) => setEngine(e.target.value as SearchEngine)}
            className="bg-transparent text-xs text-white/70 outline-none appearance-none cursor-pointer"
            aria-label="Search engine"
          >
            {SEARCH_ENGINES.map((name) => (
              <option key={name} value={name} className="bg-[#1a1a1f] text-white">
                {SEARCH_ENGINE_LABELS[name]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {open && suggestions.length > 0 && (
        <div
          id="cosmic-suggestions"
          role="listbox"
          className="absolute top-full mt-2 w-full rounded-3xl theme-surface backdrop-blur-3xl border shadow-2xl overflow-hidden z-50"
        >
          <div className="px-4 pt-3 pb-1 text-[9px] font-bold uppercase tracking-widest text-blue-300/60">
            Cosmic objects
          </div>
          {suggestions.map((obj, i) => (
            <button
              key={obj.id}
              type="button"
              role="option"
              aria-selected={i === activeIndex}
              onClick={() => locateOnSky(obj)}
              onMouseEnter={() => setActiveIndex(i)}
              className={`flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors ${
                i === activeIndex ? 'bg-white/10' : 'hover:bg-white/5'
              }`}
            >
              <Telescope className="w-4 h-4 shrink-0 text-amber-300/70" />
              <span className="flex-1 min-w-0">
                <span className="block text-sm text-white/90 truncate">{obj.name}</span>
                <span className="block text-[10px] text-white/40 font-mono truncate">
                  {obj.objectType}
                  {obj.constellation ? ` · ${obj.constellation}` : ''}
                  {obj.magnitude !== undefined ? ` · mag ${obj.magnitude.toFixed(1)}` : ''}
                </span>
              </span>
              <CornerDownLeft className="w-3.5 h-3.5 text-white/30 shrink-0" />
            </button>
          ))}
          <div className="px-4 py-2 border-t border-white/5">
            <button
              type="button"
              onClick={runWebSearch}
              className="flex items-center gap-2 text-xs text-white/40 hover:text-white/80 transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              Search the web for &ldquo;{query.trim()}&rdquo;
            </button>
          </div>
        </div>
      )}
    </motion.form>
  );
};
