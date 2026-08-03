/**
 * data/catalog.ts — Curated frontend cosmic object catalog.
 *
 * This is an offline-first seed of famous objects (deep-sky Messier/NGC targets,
 * bright stars and the planets). It backs the "learn the cosmos" search
 * autocomplete and the "real sky" star map when the backend is unreachable.
 *
 * The canonical, larger catalog lives on the backend at
 * `backend/src/app/modules/catalog/catalog.data.ts` — keep the shapes identical
 * so the UI can treat either source as the same `CosmicObject`.
 */

export interface CosmicObject {
  id: string;
  name: string;
  aliases?: string[];
  ra: number; // degrees (J2000), for planets an approximate reference
  dec: number; // degrees (J2000)
  objectType: string;
  constellation: string;
  magnitude?: number;
  distanceLy?: number;
  description?: string;
}

const stars: CosmicObject[] = [
  {
    id: 'sirius',
    name: 'Sirius',
    aliases: ['Alpha Canis Majoris'],
    ra: 101.287,
    dec: -16.716,
    objectType: 'Star',
    constellation: 'Canis Major',
    magnitude: -1.47,
    distanceLy: 8.6,
  },
  {
    id: 'canopus',
    name: 'Canopus',
    aliases: ['Alpha Carinae'],
    ra: 95.988,
    dec: -52.696,
    objectType: 'Star',
    constellation: 'Carina',
    magnitude: -0.74,
    distanceLy: 310,
  },
  {
    id: 'rigil-kentaurus',
    name: 'Rigil Kentaurus',
    aliases: ['Alpha Centauri', 'Toliman'],
    ra: 219.902,
    dec: -60.834,
    objectType: 'Star',
    constellation: 'Centaurus',
    magnitude: -0.27,
    distanceLy: 4.37,
  },
  {
    id: 'arcturus',
    name: 'Arcturus',
    aliases: ['Alpha Boötis'],
    ra: 213.915,
    dec: 19.182,
    objectType: 'Star',
    constellation: 'Boötes',
    magnitude: -0.05,
    distanceLy: 36.7,
  },
  {
    id: 'vega',
    name: 'Vega',
    aliases: ['Alpha Lyrae'],
    ra: 279.235,
    dec: 38.784,
    objectType: 'Star',
    constellation: 'Lyra',
    magnitude: 0.03,
    distanceLy: 25,
  },
  {
    id: 'capella',
    name: 'Capella',
    ra: 79.172,
    dec: 45.998,
    objectType: 'Star',
    constellation: 'Auriga',
    magnitude: 0.08,
    distanceLy: 42.9,
  },
  {
    id: 'rigel',
    name: 'Rigel',
    ra: 78.634,
    dec: -8.202,
    objectType: 'Star',
    constellation: 'Orion',
    magnitude: 0.13,
    distanceLy: 860,
  },
  {
    id: 'procyon',
    name: 'Procyon',
    ra: 114.825,
    dec: 5.225,
    objectType: 'Star',
    constellation: 'Canis Minor',
    magnitude: 0.34,
    distanceLy: 11.5,
  },
  {
    id: 'betelgeuse',
    name: 'Betelgeuse',
    ra: 88.793,
    dec: 7.407,
    objectType: 'Red Supergiant',
    constellation: 'Orion',
    magnitude: 0.5,
    distanceLy: 640,
  },
  {
    id: 'achernar',
    name: 'Achernar',
    ra: 24.429,
    dec: -57.237,
    objectType: 'Star',
    constellation: 'Eridanus',
    magnitude: 0.46,
    distanceLy: 139,
  },
  {
    id: 'altair',
    name: 'Altair',
    ra: 297.695,
    dec: 8.868,
    objectType: 'Star',
    constellation: 'Aquila',
    magnitude: 0.77,
    distanceLy: 16.7,
  },
  {
    id: 'aldebaran',
    name: 'Aldebaran',
    ra: 68.98,
    dec: 16.509,
    objectType: 'Red Giant',
    constellation: 'Taurus',
    magnitude: 0.86,
    distanceLy: 65,
  },
  {
    id: 'antares',
    name: 'Antares',
    ra: 247.352,
    dec: -26.432,
    objectType: 'Red Supergiant',
    constellation: 'Scorpius',
    magnitude: 0.96,
    distanceLy: 550,
  },
  {
    id: 'spica',
    name: 'Spica',
    ra: 201.298,
    dec: -11.161,
    objectType: 'Star',
    constellation: 'Virgo',
    magnitude: 0.97,
    distanceLy: 250,
  },
  {
    id: 'deneb',
    name: 'Deneb',
    ra: 310.358,
    dec: 45.28,
    objectType: 'Blue Supergiant',
    constellation: 'Cygnus',
    magnitude: 1.25,
    distanceLy: 2600,
  },
  {
    id: 'fomalhaut',
    name: 'Fomalhaut',
    ra: 344.413,
    dec: -29.622,
    objectType: 'Star',
    constellation: 'Piscis Austrinus',
    magnitude: 1.16,
    distanceLy: 25,
  },
  {
    id: 'pollux',
    name: 'Pollux',
    ra: 116.329,
    dec: 28.026,
    objectType: 'Star',
    constellation: 'Gemini',
    magnitude: 1.15,
    distanceLy: 34,
  },
  {
    id: 'regulus',
    name: 'Regulus',
    ra: 152.093,
    dec: 11.967,
    objectType: 'Star',
    constellation: 'Leo',
    magnitude: 1.35,
    distanceLy: 79,
  },
  {
    id: 'castor',
    name: 'Castor',
    ra: 113.65,
    dec: 31.888,
    objectType: 'Star',
    constellation: 'Gemini',
    magnitude: 1.58,
    distanceLy: 51,
  },
  {
    id: 'polaris',
    name: 'Polaris',
    aliases: ['North Star'],
    ra: 37.955,
    dec: 89.264,
    objectType: 'Cepheid Variable',
    constellation: 'Ursa Minor',
    magnitude: 1.98,
    distanceLy: 433,
  },
  {
    id: 'shaula',
    name: 'Shaula',
    ra: 263.402,
    dec: -37.104,
    objectType: 'Star',
    constellation: 'Scorpius',
    magnitude: 1.62,
    distanceLy: 570,
  },
  {
    id: 'hadar',
    name: 'Hadar',
    aliases: ['Beta Centauri'],
    ra: 210.956,
    dec: -60.373,
    objectType: 'Star',
    constellation: 'Centaurus',
    magnitude: 0.61,
    distanceLy: 390,
  },
];

const deepSkyMessier: CosmicObject[] = [
  {
    id: 'm31',
    name: 'Andromeda Galaxy',
    aliases: ['M31', 'Messier 31', 'NGC 224'],
    ra: 10.684,
    dec: 41.269,
    objectType: 'Galaxy',
    constellation: 'Andromeda',
    magnitude: 3.44,
    distanceLy: 2500000,
  },
  {
    id: 'm42',
    name: 'Orion Nebula',
    aliases: ['M42', 'Messier 42', 'NGC 1976'],
    ra: 83.822,
    dec: -5.391,
    objectType: 'HII Region',
    constellation: 'Orion',
    magnitude: 4.0,
    distanceLy: 1344,
  },
  {
    id: 'm45',
    name: 'Pleiades',
    aliases: ['M45', 'Seven Sisters', 'Messier 45'],
    ra: 56.75,
    dec: 24.117,
    objectType: 'Open Cluster',
    constellation: 'Taurus',
    magnitude: 1.6,
    distanceLy: 444,
  },
  {
    id: 'm13',
    name: 'Hercules Cluster',
    aliases: ['M13', 'Messier 13', 'NGC 6205'],
    ra: 250.423,
    dec: 36.461,
    objectType: 'Globular Cluster',
    constellation: 'Hercules',
    magnitude: 5.8,
    distanceLy: 22000,
  },
  {
    id: 'm51',
    name: 'Whirlpool Galaxy',
    aliases: ['M51', 'Messier 51', 'NGC 5194'],
    ra: 202.47,
    dec: 47.195,
    objectType: 'Galaxy',
    constellation: 'Canes Venatici',
    magnitude: 8.4,
    distanceLy: 23000000,
  },
  {
    id: 'm57',
    name: 'Ring Nebula',
    aliases: ['M57', 'Messier 57', 'NGC 6720'],
    ra: 283.396,
    dec: 33.029,
    objectType: 'Planetary Nebula',
    constellation: 'Lyra',
    magnitude: 8.8,
    distanceLy: 2300,
  },
  {
    id: 'm104',
    name: 'Sombrero Galaxy',
    aliases: ['M104', 'Messier 104', 'NGC 4594'],
    ra: 189.998,
    dec: -11.623,
    objectType: 'Galaxy',
    constellation: 'Virgo',
    magnitude: 8.0,
    distanceLy: 29000000,
  },
  {
    id: 'm1-crab',
    name: 'Crab Nebula',
    aliases: ['M1', 'Messier 1', 'NGC 1952'],
    ra: 83.633,
    dec: 22.014,
    objectType: 'Supernova Remnant',
    constellation: 'Taurus',
    magnitude: 8.4,
    distanceLy: 6500,
  },
  {
    id: 'ngc7000',
    name: 'North America Nebula',
    aliases: ['NGC 7000'],
    ra: 314.5,
    dec: 44.5,
    objectType: 'HII Region',
    constellation: 'Cygnus',
    magnitude: 6.0,
    distanceLy: 1800,
  },
  {
    id: 'double-cluster',
    name: 'Double Cluster',
    aliases: ['NGC 869', 'NGC 884', 'h and chi Perseii'],
    ra: 35.27,
    dec: 57.13,
    objectType: 'Open Cluster',
    constellation: 'Perseus',
    magnitude: 4.3,
    distanceLy: 7500,
  },
  {
    id: 'omega-centauri',
    name: 'Omega Centauri',
    aliases: ['NGC 5139'],
    ra: 201.697,
    dec: -47.48,
    objectType: 'Globular Cluster',
    constellation: 'Centaurus',
    magnitude: 3.9,
    distanceLy: 18000,
  },
  {
    id: 'm13-ngc',
    name: 'Orion Nebula Trapezium',
    aliases: ['Theta Orionis'],
    ra: 83.819,
    dec: -5.39,
    objectType: 'Star Cluster',
    constellation: 'Orion',
    magnitude: 6.0,
    distanceLy: 1344,
  },
];

const planets: CosmicObject[] = [
  {
    id: 'mercury',
    name: 'Mercury',
    ra: 120,
    dec: 15,
    objectType: 'Planet',
    constellation: '',
    magnitude: -0.4,
  },
  {
    id: 'venus',
    name: 'Venus',
    ra: 175,
    dec: 0,
    objectType: 'Planet',
    constellation: '',
    magnitude: -4.2,
  },
  {
    id: 'mars',
    name: 'Mars',
    ra: 84,
    dec: 23,
    objectType: 'Planet',
    constellation: '',
    magnitude: 0.3,
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    ra: 129,
    dec: 19,
    objectType: 'Planet',
    constellation: '',
    magnitude: -2.4,
  },
  {
    id: 'saturn',
    name: 'Saturn',
    ra: 14,
    dec: 3,
    objectType: 'Planet',
    constellation: '',
    magnitude: 0.8,
  },
  {
    id: 'uranus',
    name: 'Uranus',
    ra: 63,
    dec: 21,
    objectType: 'Planet',
    constellation: '',
    magnitude: 5.7,
  },
  {
    id: 'neptune',
    name: 'Neptune',
    ra: 4,
    dec: 0,
    objectType: 'Planet',
    constellation: '',
    magnitude: 7.7,
  },
];

export const COSMIC_CATALOG: CosmicObject[] = [...stars, ...deepSkyMessier, ...planets];

/** Simple, pure local search used as an offline fallback. */
export function searchLocalCatalog(query: string, limit = 8): CosmicObject[] {
  const needle = query.trim().toLowerCase();
  if (needle.length < 2) return [];

  const scored = COSMIC_CATALOG.map((obj) => {
    const name = obj.name.toLowerCase();
    const aliases = (obj.aliases ?? []).map((a) => a.toLowerCase());
    const id = obj.id.toLowerCase();

    let score = 0;
    if (name === needle) score = 300;
    else if (aliases.some((a) => a === needle)) score = 260;
    else if (name.startsWith(needle)) score = 180;
    else if (aliases.some((a) => a.startsWith(needle))) score = 150;
    else if (name.includes(needle)) score = 90;
    else if (aliases.some((a) => a.includes(needle))) score = 60;
    else if (id.includes(needle)) score = 40;
    return { obj, score };
  })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || a.obj.name.localeCompare(b.obj.name))
    .slice(0, limit)
    .map((s) => s.obj);

  return scored;
}
