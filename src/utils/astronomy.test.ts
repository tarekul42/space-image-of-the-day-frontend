import { describe, it, expect } from 'vitest';
import {
  julianDate,
  greenwichSiderealTime,
  localSiderealTime,
  equatorialToAltAz,
  getVisibleStars,
  projectToSky,
  planetPosition,
  resolveObserver,
  altitudeOf,
  DEFAULT_OBSERVER,
} from './astronomy';

const J2000 = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));

describe('time keeping', () => {
  it('computes the J2000.0 Julian date', () => {
    expect(julianDate(J2000)).toBeCloseTo(2451545.0, 6);
  });

  it('computes GMST at J2000.0 (280.4606°)', () => {
    expect(greenwichSiderealTime(J2000)).toBeCloseTo(280.46061837, 4);
  });

  it('shifts local sidereal time by longitude (east positive)', () => {
    expect(localSiderealTime(J2000, 30)).toBeCloseTo(310.46061837, 4);
    expect(localSiderealTime(J2000, -30)).toBeCloseTo(250.46061837, 4);
  });

  it('normalizes sidereal time into [0, 360)', () => {
    const lst = localSiderealTime(new Date(Date.UTC(2026, 7, 3, 18, 0)), 174.7633);
    expect(lst).toBeGreaterThanOrEqual(0);
    expect(lst).toBeLessThan(360);
  });
});

describe('equatorialToAltAz', () => {
  it('places an object at the zenith when it transits the equator observer', () => {
    const result = equatorialToAltAz(100, 0, 100, 0); // hour angle = 0
    expect(result.altitude).toBeCloseTo(90, 4);
  });

  it('places a star below the horizon when the Sun-side is up', () => {
    // A star at RA opposite the local sidereal time is below the horizon.
    const result = equatorialToAltAz(10, 0, 190, 0); // hour angle = 180°
    expect(result.altitude).toBeCloseTo(-90, 4);
  });

  it('returns azimuth within [0, 360)', () => {
    const result = equatorialToAltAz(100, 20, 80, 45);
    expect(result.azimuth).toBeGreaterThanOrEqual(0);
    expect(result.azimuth).toBeLessThan(360);
  });
});

describe('altitudeOf', () => {
  it('is positive for a circumpolar star at high latitude', () => {
    const alt = altitudeOf(37.955, 89.264, J2000, { latitude: 70, longitude: 0 });
    expect(alt).toBeGreaterThan(0);
  });
});

describe('getVisibleStars', () => {
  const stars = [
    { ra: 101.287, dec: -16.716, mag: -1.46, name: 'Sirius' },
    { ra: 279.235, dec: 38.784, mag: 0.03, name: 'Vega' },
    { ra: 310.358, dec: 45.28, mag: 0.23, name: 'Deneb' },
    { ra: 88.793, dec: 7.407, mag: 0.5, name: 'Betelgeuse' },
    { ra: 12.258, dec: 55.955, mag: 8.0, name: 'Too faint' },
  ];

  it('filters out stars fainter than the magnitude limit', () => {
    const visible = getVisibleStars(stars, J2000, { latitude: 40.7, longitude: -74.006 });
    expect(visible.some((s) => s.name === 'Too faint')).toBe(false);
  });

  it('only returns stars above the horizon', () => {
    const visible = getVisibleStars(stars, J2000, { latitude: 40.7, longitude: -74.006 });
    for (const star of visible) {
      expect(star.altitude).toBeGreaterThan(0);
    }
  });

  it('sorts brightest first', () => {
    const visible = getVisibleStars(stars, J2000, { latitude: 40.7, longitude: -74.006 });
    for (let i = 1; i < visible.length; i++) {
      expect(visible[i - 1].mag).toBeLessThanOrEqual(visible[i].mag);
    }
  });

  it('is stable for a fixed moment', () => {
    const a = getVisibleStars(stars, J2000, { latitude: 40.7, longitude: -74.006 });
    const b = getVisibleStars(stars, J2000, { latitude: 40.7, longitude: -74.006 });
    expect(a.map((s) => s.name)).toEqual(b.map((s) => s.name));
  });
});

describe('projectToSky', () => {
  it('maps the horizon to the bottom edge', () => {
    const { y } = projectToSky({ altitude: 0, azimuth: 90 }, 1000, 600);
    expect(y).toBeCloseTo(600, 4);
  });

  it('maps the zenith to the top edge', () => {
    const { y } = projectToSky({ altitude: 90, azimuth: 90 }, 1000, 600);
    expect(y).toBeCloseTo(0, 4);
  });

  it('scales azimuth linearly across the width', () => {
    const north = projectToSky({ altitude: 30, azimuth: 0 }, 1000, 600);
    const east = projectToSky({ altitude: 30, azimuth: 90 }, 1000, 600);
    expect(east.x - north.x).toBeCloseTo(250, 4);
  });

  it('clamps below-horizon altitudes to the horizon line', () => {
    const { y } = projectToSky({ altitude: -45, azimuth: 90 }, 1000, 600);
    expect(y).toBeCloseTo(600, 4);
  });
});

describe('planetPosition', () => {
  it('rejects Earth', () => {
    expect(() => planetPosition('earth', J2000)).toThrow();
  });

  it('returns valid RA/Dec ranges for every planet', () => {
    for (const id of ['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune']) {
      const { ra, dec } = planetPosition(id, J2000);
      expect(ra).toBeGreaterThanOrEqual(0);
      expect(ra).toBeLessThan(360);
      expect(dec).toBeGreaterThanOrEqual(-90);
      expect(dec).toBeLessThanOrEqual(90);
    }
  });

  it('places Jupiter within the zodiac around the J2000 epoch', () => {
    // J2000 mean elements put Jupiter near RA ~ 40°; eccentricity/kepler
    // solution keeps it within a generous zodiac band.
    const { ra, dec } = planetPosition('jupiter', J2000);
    expect(dec).toBeGreaterThan(-10);
    expect(dec).toBeLessThan(15);
    expect(ra).toBeGreaterThan(20);
    expect(ra).toBeLessThan(70);
  });
});

describe('resolveObserver', () => {
  it('falls back when geolocation is unavailable', async () => {
    // Node test env has no navigator.geolocation.
    const observer = await resolveObserver();
    expect(observer.latitude).toBe(DEFAULT_OBSERVER.latitude);
    expect(observer.longitude).toBe(DEFAULT_OBSERVER.longitude);
  });
});
