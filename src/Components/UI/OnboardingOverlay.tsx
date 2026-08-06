import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Orbit } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { CosmicButton } from './CosmicButton';
import browser from '../../browser';

const ONBOARDED_KEY = 'cosmos_onboarded';

export const OnboardingOverlay: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    async function checkOnboarded() {
      try {
        const result = await browser.storage.local.get(ONBOARDED_KEY);
        if (!result[ONBOARDED_KEY] && !localStorage.getItem(ONBOARDED_KEY)) {
          setIsVisible(true);
        }
      } catch {
        if (!localStorage.getItem(ONBOARDED_KEY)) {
          setIsVisible(true);
        }
      }
    }
    checkOnboarded();
  }, []);

  const handleDismiss = async () => {
    setIsVisible(false);
    try {
      await browser.storage.local.set({ [ONBOARDED_KEY]: true });
    } catch {
      // Fallback
    }
    try {
      localStorage.setItem(ONBOARDED_KEY, 'true');
    } catch {
      // Ignore
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/85 backdrop-blur-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-lg text-center"
          >
            <GlassCard className="p-8 md:p-10 border-cyan-500/20 bg-slate-950/80 shadow-[0_0_80px_rgba(6,182,212,0.15)] flex flex-col items-center">
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 mb-6 shadow-inner"
              >
                <Orbit size={32} />
              </motion.div>

              <div className="flex items-center justify-center gap-2 text-cyan-400 text-xs font-bold tracking-[0.25em] uppercase mb-2">
                <Sparkles size={14} />
                Welcome to Cosmos Tab
              </div>

              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-4 leading-snug">
                Every new tab, a new corner of the universe.
              </h1>

              <p className="text-white/70 text-sm leading-relaxed mb-8 max-w-md">
                Immerse yourself in NASA Astronomy Pictures, interactive live star maps, SIMBAD astronomical enrichment, and deep cosmic exploration.
              </p>

              <CosmicButton
                onClick={handleDismiss}
                className="w-full py-3.5 text-sm tracking-wide bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 border-0 font-bold"
              >
                Begin Cosmic Exploration
              </CosmicButton>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
