import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Compass, Star, Eye, Layers, Sparkles } from 'lucide-react';
import { ApodData } from '../../types/apod';
import { COSMIC_CATALOG, CosmicObject } from '../../data/catalog';
import { matchCatalogObjects } from '../../utils/catalogMatch';
import { GlassCard } from '../UI/GlassCard';
import { CosmicButton } from '../UI/CosmicButton';

interface DeepDiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  apod: ApodData;
  onLocateOnMap?: (objects: CosmicObject[]) => void;
}

export const DeepDiveModal: React.FC<DeepDiveModalProps> = ({
  isOpen,
  onClose,
  apod,
  onLocateOnMap,
}) => {
  const matchedObjects = useMemo(
    () => matchCatalogObjects(apod.title, apod.explanation, COSMIC_CATALOG, 4),
    [apod.title, apod.explanation],
  );

  const primaryTargetName = matchedObjects[0]?.name || apod.object_type || apod.title;

  const simbadUrl = `https://simbad.cds.unistra.fr/simbad/sim-basic?ident=${encodeURIComponent(primaryTargetName)}`;
  const nedUrl = `https://ned.ipac.caltech.edu/byname?objname=${encodeURIComponent(primaryTargetName)}`;
  const apodOfficialUrl = `https://apod.nasa.gov/apod/ap${apod.date.replaceAll('-', '').slice(2)}.html`;

  // "What else can I see?" recommendations based on constellation or type
  const recommendations = useMemo(() => {
    const currentIds = new Set(matchedObjects.map((o) => o.id));
    const sameConstellation = COSMIC_CATALOG.filter(
      (o) => !currentIds.has(o.id) && apod.constellation && o.constellation.toLowerCase() === apod.constellation.toLowerCase(),
    );
    const pool = sameConstellation.length >= 3 ? sameConstellation : COSMIC_CATALOG.filter((o) => !currentIds.has(o.id));
    return pool.slice(0, 3);
  }, [matchedObjects, apod.constellation]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/75 backdrop-blur-xl overflow-y-auto custom-scrollbar">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-3xl my-auto"
        >
          <GlassCard className="p-6 md:p-8 border-white/15 bg-slate-950/90 text-white shadow-2xl rounded-3xl">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-6 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold tracking-widest uppercase mb-1">
                  <Compass className="w-4 h-4 text-cyan-400 animate-pulse" />
                  Cosmic Deep Dive — Astronomical Intelligence
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
                  {apod.title}
                </h2>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-white/60 font-mono">
                  <span>Date: {apod.date}</span>
                  {apod.constellation && <span>• Constellation: {apod.constellation}</span>}
                  {apod.object_type && <span>• Classification: {apod.object_type}</span>}
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white/70 hover:text-white transition-all"
                aria-label="Close Deep Dive"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Body */}
            <div className="space-y-6 pt-6">
              {/* Astronomical Database Links */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-3 flex items-center gap-1.5">
                  <ExternalLink size={14} className="text-cyan-400" />
                  External Astronomical Registries
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <a
                    href={simbadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/20 hover:border-cyan-400/40 text-cyan-200 transition-all text-xs font-medium group"
                  >
                    <span>SIMBAD Astronomical Database</span>
                    <ExternalLink size={13} className="text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>

                  <a
                    href={nedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-500/20 hover:border-indigo-400/40 text-indigo-200 transition-all text-xs font-medium group"
                  >
                    <span>NASA / IPAC Extragalactic (NED)</span>
                    <ExternalLink size={13} className="text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>

                  <a
                    href={apodOfficialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-950/40 hover:bg-blue-900/50 border border-blue-500/20 hover:border-blue-400/40 text-blue-200 transition-all text-xs font-medium group"
                  >
                    <span>Official NASA APOD Page</span>
                    <ExternalLink size={13} className="text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                </div>
              </div>

              {/* Matched Catalog Cross-References */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white/50 flex items-center gap-1.5">
                    <Layers size={14} className="text-yellow-400" />
                    Matched Catalog Cross-References ({matchedObjects.length})
                  </h3>
                  {matchedObjects.length > 0 && onLocateOnMap && (
                    <CosmicButton
                      variant="secondary"
                      onClick={() => {
                        onLocateOnMap(matchedObjects);
                        onClose();
                      }}
                      className="text-xs px-3 py-1 bg-yellow-500/10 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/20"
                    >
                      <Eye size={12} className="mr-1" />
                      Locate Matched on Star Map
                    </CosmicButton>
                  )}
                </div>

                {matchedObjects.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white/60 text-xs italic text-center">
                    No explicit catalogue entry matched this APOD text. Explore related celestial targets below.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {matchedObjects.map((obj) => (
                      <div
                        key={obj.id}
                        className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between gap-2"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-cyan-300">{obj.name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono">
                              {obj.objectType}
                            </span>
                          </div>
                          {obj.aliases && obj.aliases.length > 0 && (
                            <p className="text-[11px] text-white/50 italic mt-0.5">
                              Aliases: {obj.aliases.join(', ')}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-white/70 pt-2 border-t border-white/5">
                          <div>
                            <span className="text-white/40 block">RA / Dec:</span>
                            {obj.ra.toFixed(2)}° / {obj.dec.toFixed(2)}°
                          </div>
                          <div>
                            <span className="text-white/40 block">Constellation:</span>
                            {obj.constellation}
                          </div>
                          {obj.magnitude !== undefined && (
                            <div>
                              <span className="text-white/40 block">Mag:</span>
                              {obj.magnitude > 0 ? `+${obj.magnitude}` : obj.magnitude}
                            </div>
                          )}
                          {obj.distanceLy !== undefined && (
                            <div>
                              <span className="text-white/40 block">Distance:</span>
                              {obj.distanceLy.toLocaleString()} ly
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* What Else Can I See? Recommendations */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-3 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-purple-400" />
                  What Else Can I See Tonight? — Celestial Suggestions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {recommendations.map((rec) => (
                    <div
                      key={rec.id}
                      onClick={() => {
                        if (onLocateOnMap) {
                          onLocateOnMap([rec]);
                          onClose();
                        }
                      }}
                      className="p-3.5 rounded-2xl bg-purple-950/30 hover:bg-purple-900/40 border border-purple-500/20 hover:border-purple-400/40 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-purple-200 group-hover:text-purple-100">{rec.name}</span>
                        <Star size={12} className="text-purple-400 group-hover:scale-110 transition-transform" />
                      </div>
                      <p className="text-[10px] text-white/50 font-mono mt-1">
                        {rec.constellation} • {rec.objectType}
                      </p>
                      <span className="text-[10px] text-purple-300 font-medium inline-flex items-center gap-1 mt-2">
                        Inspect on Star Map →
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scientific Explanation Summary */}
              <div className="pt-4 border-t border-white/10">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-2">
                  Full APOD Context
                </h3>
                <p className="text-white/80 text-xs leading-relaxed max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  {apod.explanation}
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
