import React from 'react';
import { createRoot } from 'react-dom/client';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutDashboard, GalleryVertical } from 'lucide-react';
import './styles/tailwind.css';
import { ApodProvider, useApod } from './context/ApodContext';
import { StarField } from './Components/Discovery/StarField';
import { ApodDisplay } from './Components/Discovery/ApodDisplay';
import { Dashboard } from './Components/Dashboard/Dashboard';
import { Gallery } from './Components/Gallery/Gallery';
import { StarMapOverlay } from './Components/Discovery/StarMapOverlay';

const App: React.FC = () => {
  const { viewMode, setViewMode, isStarMapOpen, closeStarMap } = useApod();

  return (
    <div className="relative w-full h-full min-h-screen">
      <StarField />
      <main className="relative z-10 w-full min-h-screen">
        <AnimatePresence mode="wait">
          {viewMode === 'apod' ? (
            <motion.div
              key="apod"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <ApodDisplay />
            </motion.div>
          ) : viewMode === 'dashboard' ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <Dashboard />
            </motion.div>
          ) : (
            <motion.div
              key="gallery"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <Gallery />
            </motion.div>
          )}
        </AnimatePresence>

        {viewMode === 'apod' && (
          <div className="fixed top-6 right-6 z-[100] flex items-center gap-2">
            <button
              onClick={() => setViewMode('gallery')}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/40 backdrop-blur-3xl border border-white/10 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200 shadow-xl text-sm"
            >
              <GalleryVertical className="w-4 h-4" /> Week
            </button>
            <button
              onClick={() => setViewMode('dashboard')}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/40 backdrop-blur-3xl border border-white/10 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200 shadow-xl text-sm"
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </button>
          </div>
        )}
      </main>

      <StarMapOverlay isOpen={isStarMapOpen} onClose={closeStarMap} />
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <ApodProvider>
        <App />
      </ApodProvider>
    </React.StrictMode>,
  );
}
