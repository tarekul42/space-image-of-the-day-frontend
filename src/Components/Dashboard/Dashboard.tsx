import React from 'react';
import { motion } from 'framer-motion';
import { SearchBar } from './SearchBar';
import { TopSites } from './TopSites';
import { useApod } from '../../context/ApodContext';
import { ArrowLeft } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { setViewMode } = useApod();

  return (
    <div className="absolute inset-0 w-full h-full overflow-y-auto custom-scrollbar">
      <div className="flex flex-col items-center justify-start min-h-full px-6 py-12 md:py-20 gap-12">
        <motion.button
          onClick={() => setViewMode('apod')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="self-start flex items-center gap-2 text-white/50 hover:text-white/90 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to cosmos
        </motion.button>

        <div className="w-full max-w-2xl flex flex-col gap-4 items-center">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold text-glow text-white"
          >
            Dashboard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-white/40 text-sm md:text-base"
          >
            Search the web and jump to your favorite sites
          </motion.p>
        </div>

        <div className="w-full max-w-2xl">
          <SearchBar />
        </div>

        <div className="w-full max-w-2xl">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-4"
          >
            Top Sites
          </motion.h2>
          <TopSites />
        </div>
      </div>
    </div>
  );
};
