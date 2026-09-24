import React, { useMemo } from 'react';
import type { CSSProperties } from 'react';

export const StarField: React.FC = () => {
  const stars = useMemo(
    () =>
      Array.from({ length: 100 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        duration: Math.random() * 3 + 2,
        delay: Math.random() * 5,
      })),
    [],
  );

  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-[#0a0a0c]">
      {stars.map((star) => (
        <div
          key={star.id}
          className="star-field__star absolute bg-white rounded-full"
          style={
            {
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              '--twinkle-duration': `${star.duration}s`,
              '--twinkle-delay': `${star.delay}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
};
