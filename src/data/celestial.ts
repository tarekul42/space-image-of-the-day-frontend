export interface Star {
  ra: number;
  dec: number;
  mag: number;
  name: string;
  constellation: string;
}

export interface ConstellationLine {
  star1: number;
  star2: number;
}

export interface Constellation {
  id: string;
  name: string;
  lines: ConstellationLine[];
}

export const stars: Star[] = [
  { ra: 101.287, dec: -16.716, mag: -1.46, name: 'Sirius', constellation: 'CMa' },
  { ra: 81.573, dec: 28.607, mag: -0.74, name: 'Canopus', constellation: 'Car' },
  { ra: 210.956, dec: -60.373, mag: -0.27, name: 'Rigil Kentaurus', constellation: 'Cen' },
  { ra: 213.915, dec: -19.246, mag: -0.05, name: 'Arcturus', constellation: 'Boo' },
  { ra: 279.235, dec: 38.784, mag: 0.03, name: 'Vega', constellation: 'Lyr' },
  { ra: 75.652, dec: 5.989, mag: 0.08, name: 'Capella', constellation: 'Aur' },
  { ra: 82.061, dec: -0.376, mag: 0.13, name: 'Rigel', constellation: 'Ori' },
  { ra: 95.988, dec: -52.696, mag: 0.18, name: 'Hadar', constellation: 'Cen' },
  { ra: 310.358, dec: 45.28, mag: 0.23, name: 'Deneb', constellation: 'Cyg' },
  { ra: 279.191, dec: -11.871, mag: 0.46, name: 'Altair', constellation: 'Aql' },
  { ra: 88.793, dec: 7.407, mag: 0.5, name: 'Betelgeuse', constellation: 'Ori' },
  { ra: 100.983, dec: 17.676, mag: 0.61, name: 'Procyon', constellation: 'CMi' },
  { ra: 45.57, dec: 4.09, mag: 0.77, name: 'Aldebaran', constellation: 'Tau' },
  { ra: 186.65, dec: -63.099, mag: 0.85, name: 'Mimosa', constellation: 'Cru' },
  { ra: 152.093, dec: 11.967, mag: 0.98, name: 'Regulus', constellation: 'Leo' },
  { ra: 344.412, dec: -28.982, mag: 1.14, name: 'Fomalhaut', constellation: 'PsA' },
  { ra: 103.934, dec: -28.972, mag: 1.16, name: 'Adhara', constellation: 'CMa' },
  { ra: 192.557, dec: 51.141, mag: 1.25, name: 'Alioth', constellation: 'UMa' },
  { ra: 197.497, dec: 54.648, mag: 1.33, name: 'Dubhe', constellation: 'UMa' },
  { ra: 354.839, dec: 46.312, mag: 1.42, name: 'Algenib', constellation: 'Cas' },
  { ra: 46.073, dec: 16.48, mag: 1.48, name: 'Menkib', constellation: 'Per' },
  { ra: 289.216, dec: 14.148, mag: 1.53, name: 'Eltanin', constellation: 'Dra' },
  { ra: 101.287, dec: -16.716, mag: 1.58, name: 'Murzim', constellation: 'CMa' },
  { ra: 259.232, dec: -34.041, mag: 1.63, name: 'Shaula', constellation: 'Sco' },
  { ra: 141.115, dec: -0.65, mag: 1.65, name: 'Alphard', constellation: 'Hya' },
  { ra: 140.464, dec: 8.899, mag: 1.66, name: 'Algieba', constellation: 'Leo' },
  { ra: 222.722, dec: -49.075, mag: 1.68, name: 'Alnair', constellation: 'Gru' },
  { ra: 33.243, dec: 57.296, mag: 1.69, name: 'Schedar', constellation: 'Cas' },
  { ra: 62.394, dec: -0.306, mag: 1.7, name: 'Mintaka', constellation: 'Ori' },
  { ra: 74.248, dec: -1.268, mag: 1.77, name: 'Saiph', constellation: 'Ori' },
  { ra: 108.865, dec: -11.888, mag: 1.82, name: 'Wezen', constellation: 'CMa' },
  { ra: 99.428, dec: 16.399, mag: 1.83, name: 'Alhena', constellation: 'Gem' },
  { ra: 299.849, dec: 35.493, mag: 1.86, name: 'Albireo', constellation: 'Cyg' },
  { ra: 347.224, dec: -41.699, mag: 1.87, name: 'Ankaa', constellation: 'Phe' },
  { ra: 137.191, dec: -42.89, mag: 1.88, name: 'Kochab', constellation: 'UMi' },
  { ra: 12.258, dec: 55.955, mag: 1.97, name: 'Polaris', constellation: 'UMi' },
  { ra: 68.564, dec: 35.333, mag: 2.0, name: 'Menkalinan', constellation: 'Aur' },
  { ra: 117.404, dec: -58.141, mag: 2.02, name: 'Avior', constellation: 'Car' },
  { ra: 335.823, dec: -22.075, mag: 2.05, name: 'Diphda', constellation: 'Cet' },
  { ra: 245.297, dec: -5.796, mag: 2.06, name: 'Sabik', constellation: 'Oph' },
  { ra: 196.058, dec: -55.808, mag: 2.07, name: 'Gacrux', constellation: 'Cru' },
  { ra: 353.058, dec: 52.251, mag: 2.08, name: 'Caph', constellation: 'Cas' },
  { ra: 209.599, dec: 49.263, mag: 2.14, name: 'Alkaid', constellation: 'UMa' },
  { ra: 84.412, dec: 34.036, mag: 2.19, name: 'Elnath', constellation: 'Tau' },
  { ra: 76.219, dec: 42.312, mag: 2.21, name: 'Almaaz', constellation: 'Aur' },
  { ra: 138.301, dec: 14.265, mag: 2.28, name: 'Zosma', constellation: 'Leo' },
  { ra: 143.215, dec: -67.472, mag: 2.3, name: 'Miaplacidus', constellation: 'Car' },
  { ra: 245.517, dec: -43.692, mag: 2.32, name: 'Sargas', constellation: 'Sco' },
  { ra: 273.706, dec: 22.748, mag: 2.37, name: 'Ras Algethi', constellation: 'Her' },
  { ra: 124.128, dec: 20.887, mag: 2.39, name: 'Asellus Australis', constellation: 'Cnc' },
  { ra: 294.011, dec: 12.696, mag: 2.42, name: 'Etamin', constellation: 'Dra' },
  { ra: 263.061, dec: -6.586, mag: 2.44, name: 'Nunki', constellation: 'Sgr' },
  { ra: 84.053, dec: 45.943, mag: 2.49, name: 'Mahasim', constellation: 'Aur' },
  { ra: 71.562, dec: 39.597, mag: 2.51, name: 'Al Thalimain', constellation: 'Aql' },
  { ra: 123.148, dec: -48.186, mag: 2.52, name: 'Aspidiske', constellation: 'Car' },
  { ra: 221.247, dec: 53.614, mag: 2.53, name: 'Thuban', constellation: 'Dra' },
  { ra: 265.139, dec: -25.567, mag: 2.56, name: 'Kaus Australis', constellation: 'Sgr' },
  { ra: 172.945, dec: -40.541, mag: 2.6, name: 'Kraz', constellation: 'Crv' },
  { ra: 193.95, dec: -34.398, mag: 2.61, name: 'Algorab', constellation: 'Crv' },
  { ra: 48.543, dec: 28.104, mag: 2.64, name: 'Mirach', constellation: 'And' },
  { ra: 1.098, dec: 29.117, mag: 2.65, name: 'Alpheratz', constellation: 'And' },
  { ra: 17.726, dec: 30.222, mag: 2.68, name: 'Alamak', constellation: 'And' },
  { ra: 24.759, dec: 72.889, mag: 2.69, name: 'Kochab', constellation: 'UMi' },
  { ra: 95.034, dec: -15.433, mag: 2.7, name: 'Kappa Pupis', constellation: 'Pup' },
  { ra: 207.392, dec: -25.946, mag: 2.71, name: 'Zubenelgenubi', constellation: 'Lib' },
  { ra: 226.681, dec: -44.447, mag: 2.73, name: 'Alkes', constellation: 'Crt' },
  { ra: 205.981, dec: -18.504, mag: 2.75, name: 'Unukalhai', constellation: 'Ser' },
  { ra: 238.216, dec: 11.155, mag: 2.77, name: 'Kornephoros', constellation: 'Her' },
  { ra: 83.482, dec: -7.897, mag: 2.78, name: 'Cursa', constellation: 'Eri' },
  { ra: 93.44, dec: 10.473, mag: 2.8, name: 'Wasat', constellation: 'Gem' },
  { ra: 185.434, dec: 23.755, mag: 2.81, name: 'Denebola', constellation: 'Leo' },
  { ra: 302.447, dec: 39.669, mag: 2.82, name: 'Sadr', constellation: 'Cyg' },
  { ra: 153.551, dec: 24.507, mag: 2.85, name: 'Zubenelhakrabi', constellation: 'Lib' },
  { ra: 252.497, dec: -38.997, mag: 2.87, name: 'Sheliak', constellation: 'Lyr' },
  { ra: 63.535, dec: 44.849, mag: 2.89, name: 'Al Anz', constellation: 'Aur' },
  { ra: 341.669, dec: 26.256, mag: 2.91, name: 'Markab', constellation: 'Peg' },
  { ra: 322.066, dec: 21.477, mag: 2.93, name: 'Enif', constellation: 'Peg' },
  { ra: 310.556, dec: 15.183, mag: 2.95, name: 'Sadalpheretz', constellation: 'Aqr' },
  { ra: 177.266, dec: 15.422, mag: 2.96, name: 'Zavijah', constellation: 'Vir' },
  { ra: 103.789, dec: -14.542, mag: 2.98, name: 'Phakt', constellation: 'Col' },
  { ra: 28.673, dec: 11.933, mag: 2.99, name: 'Baten Kaitos', constellation: 'Cet' },
  { ra: 8.402, dec: 47.855, mag: 3.0, name: 'Rasalmuthalla', constellation: 'Cas' },
  { ra: 340.75, dec: -0.568, mag: 3.01, name: 'Skat', constellation: 'Aqr' },
  { ra: 200.983, dec: 27.898, mag: 3.02, name: 'Seginus', constellation: 'Boo' },
  { ra: 130.531, dec: 22.773, mag: 3.04, name: 'Asterope', constellation: 'Tau' },
  { ra: 119.357, dec: 20.908, mag: 3.05, name: 'Tegmine', constellation: 'Cnc' },
  { ra: 188.597, dec: -16.263, mag: 3.06, name: 'Porrima', constellation: 'Vir' },
  { ra: 95.105, dec: 16.919, mag: 3.08, name: 'Mebsuta', constellation: 'Gem' },
  { ra: 66.532, dec: 14.593, mag: 3.09, name: 'Hyadum I', constellation: 'Tau' },
  { ra: 67.113, dec: 15.528, mag: 3.1, name: 'Hyadum II', constellation: 'Tau' },
  { ra: 311.042, dec: -0.817, mag: 3.11, name: 'Sadalsuud', constellation: 'Aqr' },
  { ra: 8.875, dec: 60.741, mag: 3.12, name: 'Rukbah', constellation: 'Cas' },
  { ra: 219.949, dec: 20.911, mag: 3.13, name: 'Mufrid', constellation: 'Boo' },
  { ra: 10.897, dec: -33.662, mag: 3.14, name: 'Acamar', constellation: 'Eri' },
  { ra: 353.514, dec: -18.602, mag: 3.15, name: 'Deneb Algedi', constellation: 'Cap' },
  { ra: 11.041, dec: 24.144, mag: 3.16, name: 'Atik', constellation: 'Per' },
  { ra: 335.263, dec: -1.015, mag: 3.17, name: 'Sadachbia', constellation: 'Aqr' },
  { ra: 144.531, dec: 32.808, mag: 3.18, name: 'Chara', constellation: 'CVn' },
  { ra: 186.299, dec: -14.161, mag: 3.19, name: 'Vindemiatrix', constellation: 'Vir' },
  { ra: 224.968, dec: -43.303, mag: 3.2, name: 'Alrakis', constellation: 'Sco' },
  { ra: 66.176, dec: -18.334, mag: 3.21, name: 'Azha', constellation: 'Eri' },
  { ra: 347.876, dec: 53.693, mag: 3.22, name: 'Ksora', constellation: 'Cas' },
  { ra: 92.571, dec: 10.571, mag: 3.23, name: 'Mekbuda', constellation: 'Gem' },
  { ra: 231.954, dec: 30.31, mag: 3.24, name: 'Tang', constellation: 'Her' },
  { ra: 167.039, dec: 8.7, mag: 3.25, name: 'Minelava', constellation: 'Vir' },
  { ra: 294.19, dec: -44.2, mag: 3.26, name: 'Sulafat', constellation: 'Lyr' },
  { ra: 122.598, dec: -42.133, mag: 3.27, name: 'Alzirr', constellation: 'Pup' },
  { ra: 192.692, dec: -42.864, mag: 3.28, name: 'Alshain', constellation: 'Aql' },
  { ra: 244.617, dec: -4.209, mag: 3.29, name: 'Cebalrai', constellation: 'Oph' },
  { ra: 116.015, dec: -55.847, mag: 3.3, name: 'Turais', constellation: 'Car' },
  { ra: 143.339, dec: -9.97, mag: 3.31, name: 'Perihelion', constellation: 'Crt' },
  { ra: 290.47, dec: -17.162, mag: 3.32, name: 'Albaldah', constellation: 'Sgr' },
  { ra: 348.576, dec: -17.903, mag: 3.33, name: 'Nashira', constellation: 'Cap' },
  { ra: 9.161, dec: 19.18, mag: 3.34, name: 'Algenib', constellation: 'Peg' },
  { ra: 358.196, dec: 16.502, mag: 3.35, name: 'Almatrieh', constellation: 'Peg' },
  { ra: 17.431, dec: 39.963, mag: 3.36, name: 'Ruch', constellation: 'Cep' },
  { ra: 42.711, dec: 42.547, mag: 3.37, name: 'Almaak', constellation: 'And' },
  { ra: 93.306, dec: 46.049, mag: 3.38, name: 'Talitha', constellation: 'UMa' },
  { ra: 261.857, dec: 54.807, mag: 3.39, name: 'Edasich', constellation: 'Dra' },
  { ra: 105.96, dec: 64.376, mag: 3.4, name: 'Benetnasch', constellation: 'UMa' },
  { ra: 108.986, dec: 31.904, mag: 3.41, name: 'Merak', constellation: 'UMa' },
  { ra: 165.932, dec: 43.155, mag: 3.42, name: 'Cor Caroli', constellation: 'CVn' },
  { ra: 129.208, dec: -3.035, mag: 3.43, name: 'Tania Borealis', constellation: 'UMa' },
  { ra: 147.727, dec: -0.496, mag: 3.44, name: 'Alkes', constellation: 'Crt' },
  { ra: 131.21, dec: 28.326, mag: 3.45, name: 'Tania Australis', constellation: 'UMa' },
  { ra: 156.097, dec: -25.305, mag: 3.46, name: 'Rastaban', constellation: 'Hya' },
  { ra: 181.265, dec: -20.136, mag: 3.47, name: 'Dziban', constellation: 'Hya' },
  { ra: 117.769, dec: -18.928, mag: 3.48, name: 'Alphard', constellation: 'Hya' },
  { ra: 134.802, dec: -5.963, mag: 3.49, name: 'Minchir', constellation: 'Hya' },
  { ra: 167.798, dec: 46.137, mag: 3.5, name: 'Alula Australis', constellation: 'UMa' },
];

export const constellations: Constellation[] = [
  {
    id: 'UMa',
    name: 'Ursa Major',
    lines: [
      { star1: 17, star2: 18 },
      { star1: 18, star2: 105 },
      { star1: 105, star2: 106 },
      { star1: 106, star2: 17 },
    ],
  },
  {
    id: 'Ori',
    name: 'Orion',
    lines: [
      { star1: 6, star2: 28 },
      { star1: 28, star2: 10 },
      { star1: 10, star2: 29 },
      { star1: 29, star2: 6 },
      { star1: 6, star2: 10 },
    ],
  },
  {
    id: 'Cas',
    name: 'Cassiopeia',
    lines: [
      { star1: 19, star2: 27 },
      { star1: 27, star2: 42 },
      { star1: 42, star2: 19 },
      { star1: 19, star2: 43 },
      { star1: 43, star2: 42 },
    ],
  },
  {
    id: 'Cyg',
    name: 'Cygnus',
    lines: [
      { star1: 8, star2: 33 },
      { star1: 8, star2: 72 },
      { star1: 72, star2: 33 },
    ],
  },
  {
    id: 'Lyr',
    name: 'Lyra',
    lines: [{ star1: 4, star2: 73 }],
  },
  {
    id: 'Leo',
    name: 'Leo',
    lines: [
      { star1: 14, star2: 25 },
      { star1: 25, star2: 46 },
      { star1: 46, star2: 70 },
      { star1: 70, star2: 14 },
    ],
  },
  {
    id: 'Tau',
    name: 'Taurus',
    lines: [
      { star1: 12, star2: 44 },
      { star1: 12, star2: 83 },
      { star1: 83, star2: 44 },
    ],
  },
  {
    id: 'Sco',
    name: 'Scorpius',
    lines: [
      { star1: 23, star2: 47 },
      { star1: 47, star2: 80 },
    ],
  },
  {
    id: 'CMa',
    name: 'Canis Major',
    lines: [
      { star1: 0, star2: 16 },
      { star1: 16, star2: 30 },
      { star1: 30, star2: 0 },
    ],
  },
  {
    id: 'Boo',
    name: 'Boötes',
    lines: [
      { star1: 3, star2: 113 },
      { star1: 3, star2: 43 },
    ],
  },
  {
    id: 'Aur',
    name: 'Auriga',
    lines: [
      { star1: 5, star2: 37 },
      { star1: 5, star2: 45 },
      { star1: 37, star2: 45 },
    ],
  },
  {
    id: 'Cru',
    name: 'Crux',
    lines: [
      { star1: 13, star2: 41 },
      { star1: 41, star2: 13 },
    ],
  },
  {
    id: 'Her',
    name: 'Hercules',
    lines: [{ star1: 49, star2: 67 }],
  },
  {
    id: 'Peg',
    name: 'Pegasus',
    lines: [
      { star1: 74, star2: 75 },
      { star1: 75, star2: 93 },
      { star1: 93, star2: 94 },
      { star1: 94, star2: 74 },
    ],
  },
  {
    id: 'And',
    name: 'Andromeda',
    lines: [
      { star1: 60, star2: 61 },
      { star1: 61, star2: 62 },
      { star1: 62, star2: 60 },
    ],
  },
];

export function raToX(ra: number, width: number): number {
  return (ra / 360) * width;
}

export function decToY(dec: number, height: number): number {
  return ((90 - dec) / 180) * height;
}
