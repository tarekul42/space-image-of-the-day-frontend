import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { select } from 'd3-selection';
import { zoom, zoomIdentity } from 'd3-zoom';
import { stars, constellations, raToX, decToY, type Star } from '../../data/celestial';

export const StarMapOverlay: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredStar, setHoveredStar] = useState<Star | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !svgRef.current) return;

    const svg = select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    svg.selectAll('*').remove();

    const g = svg.append('g').attr('class', 'map-group');

    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoomBehavior);
    svg.call(zoomBehavior.transform, zoomIdentity.translate(0, 0).scale(1));

    constellations.forEach((constellation) => {
      constellation.lines.forEach((line) => {
        const s1 = stars[line.star1];
        const s2 = stars[line.star2];
        if (!s1 || !s2) return;

        g.append('line')
          .attr('x1', raToX(s1.ra, width))
          .attr('y1', decToY(s1.dec, height))
          .attr('x2', raToX(s2.ra, width))
          .attr('y2', decToY(s2.dec, height))
          .attr('stroke', 'rgba(100, 200, 255, 0.25)')
          .attr('stroke-width', 1.2)
          .attr('stroke-dasharray', '3 4');
      });
    });

    stars.forEach((star) => {
      const radius = Math.max(1.5, 4.5 - star.mag * 0.4);

      g.append('circle')
        .attr('cx', raToX(star.ra, width))
        .attr('cy', decToY(star.dec, height))
        .attr('r', radius)
        .attr('fill', '#ffffff')
        .attr('stroke', 'rgba(100, 200, 255, 0.6)')
        .attr('stroke-width', 0.5)
        .attr('class', 'cursor-pointer hover:drop-shadow-[0_0_6px_rgba(100,200,255,0.8)]')
        .on('mouseenter', (event: MouseEvent) => {
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) {
            setTooltipPos({
              x: event.clientX - rect.left + 12,
              y: event.clientY - rect.top - 8,
            });
          }
          setHoveredStar(star);
        })
        .on('mouseleave', () => setHoveredStar(null))
        .on('mousemove', (event: MouseEvent) => {
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) {
            setTooltipPos({
              x: event.clientX - rect.left + 12,
              y: event.clientY - rect.top - 8,
            });
          }
        });
    });

    return () => {
      svg.on('.zoom', null);
      svg.selectAll('*').remove();
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 z-40 bg-[#05080f]/90 backdrop-blur-sm"
        >
          <div className="absolute inset-0 opacity-15 bg-[linear-gradient(rgba(100,200,255,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(100,200,255,0.15)_1px,transparent_1px)] bg-[size:80px_80px]" />

          <div className="absolute top-6 left-6 z-50 flex flex-col gap-1">
            <h3 className="text-blue-400 font-mono tracking-[0.3em] text-xs uppercase opacity-80">
              Celestial Map
            </h3>
            <p className="text-white/40 font-mono text-[10px]">
              {stars.length} stars &middot; {constellations.length} constellations
            </p>
          </div>

          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-50 px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all text-sm"
          >
            Close
          </button>

          <div ref={containerRef} className="absolute inset-0">
            <svg ref={svgRef} className="w-full h-full" style={{ cursor: 'grab' }} />
          </div>

          {hoveredStar && (
            <div
              className="absolute z-50 pointer-events-none px-3 py-2 rounded-xl bg-black/80 backdrop-blur-xl border border-white/10 shadow-2xl"
              style={{ left: tooltipPos.x, top: tooltipPos.y }}
            >
              <p className="text-white text-sm font-semibold whitespace-nowrap">
                {hoveredStar.name}
              </p>
              <p className="text-blue-300/60 text-[10px] font-mono mt-0.5">
                mag {hoveredStar.mag.toFixed(2)} &middot; {hoveredStar.constellation}
              </p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
