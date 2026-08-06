import React, { useState } from 'react';
import { Telescope, Download, Info, X, Map, Heart, Compass } from 'lucide-react';
import { ApodData } from '../../types/apod';
import { GlassCard } from '../UI/GlassCard';
import { CosmicButton } from '../UI/CosmicButton';
import { AnimatePresence, motion } from 'framer-motion';
import { useApod } from '../../context/ApodContext';

interface InfoSectionProps {
  apod: ApodData;
  onFetchRandom: () => void;
  onToggleMap: () => void;
  onOpenDeepDive?: () => void;
}

export const InfoSection: React.FC<InfoSectionProps> = ({
  apod,
  onFetchRandom,
  onToggleMap,
  onOpenDeepDive,
}) => {
  const { toggleFavorite, isFavorite } = useApod();
  const [showDetails, setShowDetails] = useState(false);
  const favorited = isFavorite(apod.date);

  return (
    <GlassCard className="pointer-events-auto max-w-sm w-full flex flex-col gap-4 p-5 backdrop-blur-md bg-black/40 border-white/10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-blue-400 text-[10px] font-bold tracking-[0.2em] uppercase mb-1">
            <Telescope size={12} />
            Cosmic Discovery
          </div>
          <AnimatePresence mode="wait">
            <motion.h1
              key={apod.title}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 5 }}
              className="text-xl font-bold tracking-tight leading-tight line-clamp-2"
            >
              {apod.title}
            </motion.h1>
          </AnimatePresence>
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white/80"
          aria-label="Toggle Details"
        >
          {showDetails ? <X size={18} /> : <Info size={18} />}
        </button>
      </div>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-2 border-t border-white/5">
              <AnimatePresence mode="wait">
                <motion.p
                  key={apod.explanation}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-white/70 text-xs leading-relaxed max-h-48 overflow-y-auto pr-2 custom-scrollbar"
                >
                  {apod.explanation}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {apod.object_type && (
                <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[9px] font-bold uppercase tracking-wider text-blue-300">
                  {apod.object_type}
                </span>
              )}
              {apod.constellation && (
                <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-bold uppercase tracking-wider text-white/50">
                  {apod.constellation}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2 mt-1">
        <CosmicButton onClick={onFetchRandom} className="flex-1 py-2 text-xs">
          <Map size={14} className="mr-1.5" />
          Next
        </CosmicButton>
        <CosmicButton variant="secondary" onClick={onToggleMap} className="flex-1 py-2 text-xs">
          <Telescope size={14} className="mr-1.5" />
          Map Mode
        </CosmicButton>
        {onOpenDeepDive && (
          <CosmicButton
            variant="secondary"
            onClick={onOpenDeepDive}
            className="flex-none px-3 py-2 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/20"
            aria-label="Deep Dive SIMBAD/NED Data"
            title="Deep Dive"
          >
            <Compass size={14} />
          </CosmicButton>
        )}
        <CosmicButton
          variant="secondary"
          onClick={() => toggleFavorite(apod)}
          className="flex-none px-3 py-2"
          aria-label={favorited ? 'Remove from favorites' : 'Save to favorites'}
        >
          <Heart size={14} className={favorited ? 'text-red-500 fill-red-500' : 'text-white/70'} />
        </CosmicButton>
        <CosmicButton
          variant="secondary"
          onClick={() => window.open(apod.hdurl || apod.url)}
          className="flex-none py-2 px-3"
        >
          <Download size={14} />
        </CosmicButton>
      </div>
    </GlassCard>
  );
};
