import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { getFactOfTheDay } from '../../data/facts';

/**
 * First Contact — a subtle one-line cosmic fact that changes daily.
 * Quiet by design: small, muted, and never asks for attention.
 */
export const FirstContact: React.FC = () => {
  const fact = useMemo(() => getFactOfTheDay(), []);

  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.8 }}
      className="flex items-center justify-center gap-1.5 text-center text-[11px] text-white/30"
    >
      <Sparkles className="w-3 h-3 shrink-0 text-blue-300/60" />
      <span className="max-w-md truncate md:whitespace-normal">{fact}</span>
    </motion.p>
  );
};
