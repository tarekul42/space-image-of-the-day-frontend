import React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

export const SearchBar: React.FC = () => {
  const [query, setQuery] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    window.location.href = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
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
          className="w-full bg-transparent text-white text-lg py-4 pl-14 pr-6 rounded-3xl outline-none placeholder:text-white/30"
        />
      </div>
    </motion.form>
  );
};
