import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { select } from 'd3-selection';
import { zoom, zoomIdentity } from 'd3-zoom';
import { stars, constellations } from '../../data/celestial';
import { CosmicObject } from '../../data/catalog';
import {
  Observer,
  resolveObserver,
  localSiderealTime,
  equatorialToAltAz,
  planetPosition,
  projectToSky,
} from '../../utils/astronomy';
import { useApod } from '../../context/ApodContext';

const MAG_LIMIT = 3.6;

interface Tooltip {
  x: number;
  y: number;
  title: string;
  subtitle: string;
}

export const StarMapOverlay: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { starMapObjects } = useApod();
  const svgRef = useRef<SVGSVGElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const [observer, setObserver] = useState<Observer | null>(null);
  const [now] = useState(() => new Date());

  const showTooltip = useCallback((event: MouseEvent, title: string, subtitle: string) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltip({
        x: event.clientX - rect.left + 12,
        y: event.clientY - rect.top - 8,
        title,
        subtitle,
      });
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    closeBtnRef.current?.focus();

    const overlay = overlayRef.current;
    if (!overlay) return;

    const focusable = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const elements = overlay.querySelectorAll<HTMLElement>(focusable);
      if (elements.length === 0) return;
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    overlay.addEventListener('keydown', handleKeyDown);
    return () => overlay.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Resolve the observer's location (with graceful fallback) when the map opens.
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setObserver(null);
    resolveObserver().then((obs) => {
      if (!cancelled) setObserver(obs);
    });
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  // Draw the live sky whenever the observer or highlight target changes.
  useEffect(() => {
    if (!isOpen || !observer || !svgRef.current) return;

    const svg = select(svgRef.current);
    const width = svgRef.current.clientWidth || 600;
    const height = svgRef.current.clientHeight || 400;

    svg.selectAll('*').remove();
    const g = svg.append('g').attr('class', 'map-group');

    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoomBehavior);
    svg.call(zoomBehavior.transform, zoomIdentity.translate(0, 0).scale(1));

    const lst = localSiderealTime(now, observer.longitude);
    const lat = observer.latitude;

    // Horizon baseline + cardinal direction labels.
    g.append('line')
      .attr('x1', 0)
      .attr('y1', height)
      .attr('x2', width)
      .attr('y2', height)
      .attr('stroke', 'rgba(251, 191, 36, 0.4)')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '4 4');

    const cardinals = [
      { label: 'N', az: 0 },
      { label: 'E', az: 90 },
      { label: 'S', az: 180 },
      { label: 'W', az: 270 },
    ];
    cardinals.forEach(({ label, az }) => {
      const x = (az / 360) * width;
      g.append('text')
        .attr('x', x)
        .attr('y', height - 6)
        .attr('text-anchor', 'middle')
        .attr('fill', 'rgba(251, 191, 36, 0.5)')
        .attr('font-size', 10)
        .attr('font-family', 'monospace')
        .text(label);
    });

    // Compute which stars are actually above the horizon (by catalog index).
    const sky = stars.map((star, index) => ({
      star,
      index,
      horiz: equatorialToAltAz(star.ra, star.dec, lst, lat),
    }));
    const aboveHorizon = sky
      .filter((s) => s.horiz.altitude > 0 && s.star.mag <= MAG_LIMIT)
      .sort((a, b) => a.star.mag - b.star.mag);
    const visibleIndex = new Set(aboveHorizon.map((s) => s.index));

    // Constellation stick-figures, only where both endpoints are up.
    constellations.forEach((constellation) => {
      constellation.lines.forEach((line) => {
        if (!visibleIndex.has(line.star1) || !visibleIndex.has(line.star2)) return;
        const a = sky[line.star1];
        const b = sky[line.star2];
        if (!a || !b) return;
        const p1 = projectToSky(a.horiz, width, height);
        const p2 = projectToSky(b.horiz, width, height);
        g.append('line')
          .attr('x1', p1.x)
          .attr('y1', p1.y)
          .attr('x2', p2.x)
          .attr('y2', p2.y)
          .attr('stroke', 'rgba(100, 200, 255, 0.25)')
          .attr('stroke-width', 1.2)
          .attr('stroke-dasharray', '3 4');
      });
    });

    // Live stars.
    aboveHorizon.forEach(({ star, horiz }) => {
      const pos = projectToSky(horiz, width, height);
      const radius = Math.max(1.5, 4.5 - star.mag * 0.4);

      g.append('circle')
        .attr('cx', pos.x)
        .attr('cy', pos.y)
        .attr('r', radius)
        .attr('fill', '#ffffff')
        .attr('stroke', 'rgba(100, 200, 255, 0.6)')
        .attr('stroke-width', 0.5)
        .attr('class', 'cursor-pointer')
        .on('mouseenter', (event: MouseEvent) =>
          showTooltip(
            event,
            star.name,
            `mag ${star.mag.toFixed(2)} · ${star.constellation} · alt ${horiz.altitude.toFixed(0)}°`,
          ),
        )
        .on('mousemove', (event: MouseEvent) => {
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) {
            setTooltip((prev) =>
              prev
                ? {
                    ...prev,
                    x: event.clientX - rect.left + 12,
                    y: event.clientY - rect.top - 8,
                  }
                : prev,
            );
          }
        })
        .on('mouseleave', () => setTooltip(null));
    });

    // Highlighted cosmic objects (from search / gallery / current APOD).
    starMapObjects.forEach((obj: CosmicObject) => {
      const eq =
        obj.objectType === 'Planet' ? planetPosition(obj.id, now) : { ra: obj.ra, dec: obj.dec };
      const horiz = equatorialToAltAz(eq.ra, eq.dec, lst, lat);
      const isUp = horiz.altitude > 0;
      const pos = projectToSky(horiz, width, height);
      const color = isUp ? '#fbbf24' : 'rgba(148, 163, 184, 0.35)';

      g.append('circle')
        .attr('cx', pos.x)
        .attr('cy', pos.y)
        .attr('r', 11)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 1.6)
        .attr('opacity', isUp ? 1 : 0.5);

      g.append('circle')
        .attr('cx', pos.x)
        .attr('cy', pos.y)
        .attr('r', 2.4)
        .attr('fill', color)
        .attr('opacity', isUp ? 1 : 0.5);

      g.append('text')
        .attr('x', pos.x)
        .attr('y', pos.y - 16)
        .attr('text-anchor', 'middle')
        .attr('fill', color)
        .attr('font-size', 11)
        .attr('font-weight', 600)
        .attr('stroke', '#05080f')
        .attr('stroke-width', 2.5)
        .attr('paint-order', 'stroke')
        .attr('opacity', isUp ? 1 : 0.5)
        .text(isUp ? obj.name : `${obj.name} ↓`);

      const horizon = projectToSky({ altitude: 0, azimuth: horiz.azimuth }, width, height);

      g.append('circle')
        .attr('class', 'cursor-pointer')
        .attr('cx', pos.x)
        .attr('cy', pos.y)
        .attr('r', 16)
        .attr('fill', 'transparent')
        .on('mouseenter', (event: MouseEvent) =>
          showTooltip(
            event,
            obj.name,
            `${obj.objectType} · ${obj.constellation || 'solar system'} · alt ${horiz.altitude.toFixed(1)}°${
              isUp ? '' : ' (below horizon)'
            }`,
          ),
        )
        .on('mousemove', (event: MouseEvent) => {
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) {
            setTooltip((prev) =>
              prev
                ? {
                    ...prev,
                    x: event.clientX - rect.left + 12,
                    y: event.clientY - rect.top - 8,
                  }
                : prev,
            );
          }
        })
        .on('mouseleave', () => setTooltip(null));

      // A faint "horizon marker" so users can still find below-the-horizon targets.
      if (!isUp) {
        g.append('circle')
          .attr('cx', horizon.x)
          .attr('cy', height - 3)
          .attr('r', 3)
          .attr('fill', 'rgba(148, 163, 184, 0.5)');
      }
    });

    return () => {
      svg.on('.zoom', null);
      svg.selectAll('*').remove();
    };
  }, [isOpen, observer, starMapObjects, now, showTooltip]);

  const visibleCount = useMemo(() => {
    if (!observer) return 0;
    const lst = localSiderealTime(now, observer.longitude);
    return stars.filter(
      (s) =>
        s.mag <= MAG_LIMIT && equatorialToAltAz(s.ra, s.dec, lst, observer.latitude).altitude > 0,
    ).length;
  }, [observer, now]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 z-40 bg-[#05080f]/95 backdrop-blur-sm"
        >
          <div className="absolute inset-0 opacity-15 bg-[linear-gradient(rgba(100,200,255,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(100,200,255,0.15)_1px,transparent_1px)] bg-[size:80px_80px]" />

          <div className="absolute top-6 left-6 z-50 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h3 className="text-blue-400 font-mono tracking-[0.3em] text-xs uppercase opacity-80">
                Live Night Sky
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold tracking-widest text-emerald-400">
                LIVE
              </span>
            </div>
            <p className="text-white/40 font-mono text-[10px]">
              {observer ? (
                <>
                  {observer.label} · {observer.latitude.toFixed(2)}°,{' '}
                  {observer.longitude.toFixed(2)}°
                </>
              ) : (
                'Locating…'
              )}
            </p>
            <p className="text-white/40 font-mono text-[10px]">
              {now.toLocaleString()} · {visibleCount} stars above the horizon now
            </p>
            {starMapObjects.length > 0 && (
              <p className="text-amber-300/70 font-mono text-[10px]">
                Locating {starMapObjects.length} object{starMapObjects.length > 1 ? 's' : ''}
              </p>
            )}
          </div>

          <button
            ref={closeBtnRef}
            onClick={onClose}
            className="absolute top-6 right-6 z-50 px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all text-sm"
          >
            Close
          </button>

          <div ref={containerRef} className="absolute inset-0">
            <svg ref={svgRef} className="w-full h-full" style={{ cursor: 'grab' }} />
          </div>

          {tooltip && (
            <div
              className="absolute z-50 pointer-events-none px-3 py-2 rounded-xl bg-black/80 backdrop-blur-xl border border-white/10 shadow-2xl"
              style={{ left: tooltip.x, top: tooltip.y }}
            >
              <p className="text-white text-sm font-semibold whitespace-nowrap">{tooltip.title}</p>
              <p className="text-blue-300/60 text-[10px] font-mono mt-0.5">{tooltip.subtitle}</p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
