import React from 'react';
import { motion } from 'framer-motion';
import { Search, Globe } from 'lucide-react';
import { getSettings } from '../../services/settings.service';
import {
  SearchEngine,
  SEARCH_ENGINE_LABELS,
  SEARCH_ENGINES,
  resolveSearchUrl,
} from '../../utils/settings';

export const SearchBar: React.FC = () => {
  const [query, setQuery] = React.useState('');
  const [engine, setEngine] = React.useState<SearchEngine>('google');
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    getSettings().then((settings) => {
      if (SEARCH_ENGINES.includes(settings.searchEngine)) {
        setEngine(settings.searchEngine);
      }
    });
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    window.location.href = resolveSearchUrl(engine, q);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full max-w-2xl mx-auto"
    >
      <div className="relative flex items-center bg-black/40 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl hover:border-white/20 transition-colors group">
        <Search className="absolute left-5 w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the cosmos..."
          className="w-full bg-transparent text-white text-lg py-4 pl-14 pr-16 rounded-3xl outline-none placeholder:text-white/30"
        />
        <div className="absolute right-4 flex items-center gap-1 text-white/40">
          <Globe className="w-4 h-4" />
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
    </motion.form>
  );
};
