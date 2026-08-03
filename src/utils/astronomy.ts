/**
 * utils/astronomy.ts — Positional astronomy engine (pure, no browser APIs).
 *
 * Turns the static star catalog into a *live* night sky: given a time and an
 * observer (latitude/longitude) it computes sidereal time, horizon
 * (altitude/azimuth) coordinates for every star, filters what is actually
 * above the horizon, and — using compact J2000 orbital elements — derives the
 * current geocentric position of the planets.
 *
 * Everything here is pure so it can be unit-tested in a Node environment.
 */

export interface Observer {
  latitude: number; // degrees, +north, -south
  longitude: number; // degrees, +east, -west (use -74.006 for New York)
  label?: string;
}

export interface HorizontalPosition {
  altitude: number; // degrees above the horizon (negative = below)
  azimuth: number; // degrees from North, measured clockwise
}

export interface VisibleStar {
  ra: number;
  dec: number;
  mag: number;
  name: string;
  constellation: string;
  altitude: number;
  azimuth: number;
}

export interface EquatorialPosition {
  ra: number; // degrees, [0, 360)
  dec: number; // degrees, [-90, 90]
}

const J2000 = 2451545.0; // Julian date of the J2000.0 epoch
const OBLIQUITY = 23.4392911; // mean obliquity of the ecliptic (J2000), degrees

/** Neutral fallback observer shown when the browser can't (or won't) give a location. */
export const DEFAULT_OBSERVER: Observer = {
  latitude: 40.7128,
  longitude: -74.006,
  label: 'Default location',
};

const deg2rad = (d: number) => (d * Math.PI) / 180;
const rad2deg = (r: number) => (r * 180) / Math.PI;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const normalize = (deg: number) => ((deg % 360) + 360) % 360;

/** Julian date for a JS Date. */
export function julianDate(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

/** Greenwich Mean Sidereal Time (degrees). */
export function greenwichSiderealTime(date: Date): number {
  const days = julianDate(date) - J2000;
  return normalize(280.46061837 + 360.98564736629 * days);
}

/** Local mean sidereal time (degrees) for an east-positive longitude. */
export function localSiderealTime(date: Date, longitude: number): number {
  return normalize(greenwichSiderealTime(date) + longitude);
}

/**
 * Convert equatorial (RA/Dec) coordinates to horizon (alt/az) coordinates.
 * All angles in degrees.
 */
export function equatorialToAltAz(
  ra: number,
  dec: number,
  lst: number,
  latitude: number,
): HorizontalPosition {
  const hourAngle = normalize(lst - ra);
  const har = deg2rad(hourAngle);
  const latr = deg2rad(latitude);
  const decr = deg2rad(dec);

  const sinAlt = Math.sin(latr) * Math.sin(decr) + Math.cos(latr) * Math.cos(decr) * Math.cos(har);
  const altitude = Math.asin(clamp(sinAlt, -1, 1));

  const cosAlt = Math.cos(altitude);
  let azimuth = 0;
  if (cosAlt > 1e-6) {
    const cosAz = clamp(
      (Math.sin(decr) - Math.sin(latr) * Math.sin(altitude)) / (Math.cos(latr) * cosAlt),
      -1,
      1,
    );
    azimuth = rad2deg(Math.acos(cosAz));
    if (Math.sin(har) > 0) azimuth = 360 - azimuth;
  }

  return { altitude: rad2deg(altitude), azimuth: normalize(azimuth) };
}

/** Convenience altitude lookup for a single star. */
export function altitudeOf(ra: number, dec: number, date: Date, observer: Observer): number {
  const lst = localSiderealTime(date, observer.longitude);
  return equatorialToAltAz(ra, dec, lst, observer.latitude).altitude;
}

/**
 * Compute which catalog stars are above the horizon for an observer at `date`,
 * returning them with their live altitude/azimuth (brightest first).
 */
export function getVisibleStars<T extends { ra: number; dec: number; mag: number }>(
  stars: T[],
  date: Date,
  observer: Observer,
  magLimit = 3.6,
): (T & HorizontalPosition)[] {
  const lst = localSiderealTime(date, observer.longitude);
  return stars
    .filter((s) => s.mag <= magLimit)
    .map((s) => {
      const horiz = equatorialToAltAz(s.ra, s.dec, lst, observer.latitude);
      return { ...s, altitude: horiz.altitude, azimuth: horiz.azimuth };
    })
    .filter((s) => s.altitude > 0)
    .sort((a, b) => a.mag - b.mag);
}

/**
 * Project a horizon position onto a dome view.
 * Azimuth wraps across the width (0° = far left), altitude rises from the
 * bottom (horizon) toward the top (zenith).
 */
export function projectToSky(
  horiz: HorizontalPosition,
  width: number,
  height: number,
): { x: number; y: number } {
  const x = (horiz.azimuth / 360) * width;
  const y = height - (clamp(horiz.altitude, 0, 90) / 90) * height;
  return { x, y };
}

// ─── Planet positions (compact Keplerian elements) ───────────────────────
// Mean orbital elements for epoch J2000.0, IAU. Angular quantities in degrees.
// Good to tens of arcminutes for the planets — plenty for the night-sky map.

interface Elements {
  a: number; // semi-major axis (AU)
  e: number; // eccentricity
  i: number; // inclination (°)
  L: number; // mean longitude at epoch (°)
  varpi: number; // longitude of perihelion (°)
  Omega: number; // longitude of ascending node (°)
}

const PLANET_ELEMENTS: Record<string, Elements> = {
  mercury: {
    a: 0.38709893,
    e: 0.20563069,
    i: 7.00487,
    L: 252.2503235,
    varpi: 77.456145,
    Omega: 48.33167,
  },
  venus: {
    a: 0.72333199,
    e: 0.00677323,
    i: 3.39467605,
    L: 181.9790995,
    varpi: 131.53298,
    Omega: 76.67984,
  },
  earth: {
    a: 1.00000011,
    e: 0.01671022,
    i: 0.00005,
    L: 100.46457166,
    varpi: 102.93768193,
    Omega: 0,
  },
  mars: {
    a: 1.52371034,
    e: 0.0933941,
    i: 1.84969142,
    L: 355.45332,
    varpi: 336.04084,
    Omega: 49.55954,
  },
  jupiter: {
    a: 5.202887,
    e: 0.04838624,
    i: 1.30439695,
    L: 34.39644051,
    varpi: 14.728479,
    Omega: 100.47391,
  },
  saturn: {
    a: 9.53667594,
    e: 0.05386179,
    i: 2.48599187,
    L: 49.95424423,
    varpi: 92.598878,
    Omega: 113.6624245,
  },
  uranus: {
    a: 19.18916464,
    e: 0.04725744,
    i: 0.77263783,
    L: 313.23810451,
    varpi: 170.954276,
    Omega: 74.016925,
  },
  neptune: {
    a: 30.06992276,
    e: 0.00859048,
    i: 1.77004347,
    L: 304.88003313,
    varpi: 44.964762,
    Omega: 131.78422574,
  },
};

function solveKepler(meanAnomaly: number, e: number): number {
  let euler = meanAnomaly;
  for (let i = 0; i < 8; i++) {
    euler = meanAnomaly + e * Math.sin(euler);
  }
  return euler;
}

/** Heliocentric ecliptic rectangular coordinates for a body. */
function heliocentricEcliptic(id: string, date: Date): { x: number; y: number; z: number } {
  const el = PLANET_ELEMENTS[id];
  if (!el) throw new Error(`No orbital elements for "${id}"`);
  const days = julianDate(date) - J2000;
  const meanMotion = 0.9856076686 / Math.pow(el.a, 1.5); // °/day

  const M = normalize(el.L + meanMotion * days - el.varpi);
  const Mr = deg2rad(M);
  const E = solveKepler(Mr, el.e);

  const x = el.a * (Math.cos(E) - el.e);
  const y = el.a * Math.sqrt(1 - el.e * el.e) * Math.sin(E);
  const r = Math.sqrt(x * x + y * y);
  const v = Math.atan2(y, x); // true anomaly

  const u = v + deg2rad(el.varpi - el.Omega); // argument of latitude
  const ir = deg2rad(el.i);
  const or = deg2rad(el.Omega);

  return {
    x: r * (Math.cos(or) * Math.cos(u) - Math.sin(or) * Math.sin(u) * Math.cos(ir)),
    y: r * (Math.sin(or) * Math.cos(u) + Math.cos(or) * Math.sin(u) * Math.cos(ir)),
    z: r * (Math.sin(u) * Math.sin(ir)),
  };
}

/**
 * Current geocentric equatorial (RA/Dec) position of a planet for `date`.
 * Circular (not Sun-perturbed) Keplerian solution — accurate to ~arcminutes,
 * which is indistinguishable on a star map.
 */
export function planetPosition(id: string, date: Date): EquatorialPosition {
  if (id === 'earth') {
    throw new Error('planetPosition cannot be used for Earth');
  }
  const b = heliocentricEcliptic(id, date);
  const earth = heliocentricEcliptic('earth', date);

  const dx = b.x - earth.x;
  const dy = b.y - earth.y;
  const dz = b.z;

  const lambda = normalize(rad2deg(Math.atan2(dy, dx)));
  const beta = rad2deg(Math.atan2(dz, Math.sqrt(dx * dx + dy * dy)));

  const eps = deg2rad(OBLIQUITY);
  const lr = deg2rad(lambda);
  const br = deg2rad(beta);
  const ra = normalize(
    rad2deg(Math.atan2(Math.sin(lr) * Math.cos(eps) - Math.tan(br) * Math.sin(eps), Math.cos(lr))),
  );
  const dec = rad2deg(
    Math.asin(
      clamp(Math.sin(br) * Math.cos(eps) + Math.cos(br) * Math.sin(eps) * Math.sin(lr), -1, 1),
    ),
  );

  return { ra, dec };
}

/** Resolve an observer, preferring the browser's location with a fallback. */
export function resolveObserver(fallback: Observer = DEFAULT_OBSERVER): Promise<Observer> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve(fallback);
      return;
    }
    const timer = setTimeout(() => resolve(fallback), 4000);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timer);
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          label: 'Your location',
        });
      },
      () => {
        clearTimeout(timer);
        resolve(fallback);
      },
      { timeout: 4000, maximumAge: 300000 },
    );
  });
}
