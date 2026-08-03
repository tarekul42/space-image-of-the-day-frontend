/**
 * data/facts.ts — "First Contact" daily cosmic trivia.
 * One short, human fact per day, picked deterministically from the date so it
 * quietly changes on return visits without any network dependency.
 */

export const COSMIC_FACTS: string[] = [
  'A day on Venus is longer than its year — it spins on its axis more slowly than it orbits the Sun.',
  'Neutron stars are so dense that a teaspoon of their material would weigh about 4 billion tonnes.',
  'The Moon is drifting about 3.8 cm away from Earth every year.',
  'A year on Mercury is just 88 Earth days long.',
  'Saturn is the only planet less dense than water — it would float in a big enough bathtub.',
  'Light from the Sun takes about 8 minutes and 20 seconds to reach Earth.',
  "There are more stars in the universe than grains of sand on all of Earth's beaches.",
  'The footprints left on the Moon by Apollo astronauts will last millions of years — there is no wind to erase them.',
  'The Andromeda Galaxy is on a collision course with the Milky Way — in about 4.5 billion years.',
  'Jupiter has 95 confirmed moons; at least four are bigger than Pluto.',
  'A day on Earth was only about 22 hours long 600 million years ago — it keeps slowing down.',
  'The Sun makes up about 99.86% of the mass of our entire solar system.',
  'Space is completely silent because there is no air to carry sound waves.',
  'The hottest planet in the solar system is Venus, even though Mercury is closer to the Sun.',
  'Uranus rotates on its side, at a 98° tilt, so its poles get 42-year-long days and nights.',
  'The Milky Way galaxy is a moving target — it travels at about 600 km/s through the universe.',
  'Olympus Mons on Mars is the tallest volcano known, nearly three times the height of Mount Everest.',
  'A single gamma-ray burst can release more energy in seconds than the Sun will emit in its entire lifetime.',
  'Earth is not a perfect sphere — it is slightly flattened at the poles and bulges at the equator.',
  'The Voyager 1 probe, launched in 1977, is now over 24 billion km from Earth and still talking.',
  "Saturn's rings are made almost entirely of water ice, from dust-sized grains to house-sized chunks.",
  'The first stars in the universe were giants, hundreds of times the mass of our Sun.',
  'There is a giant cloud of alcohol at the center of our galaxy — the Sagittarius B2 cloud.',
  'The ISS orbits Earth every 90 minutes, so its crew sees 16 sunrises and sunsets each day.',
  'A Martian day, called a sol, is just 37 minutes longer than an Earth day.',
  "The North Star, Polaris, is not the brightest star — it just happens to sit almost exactly above Earth's north pole.",
  'Pluto is smaller than the Moon and has five known moons of its own.',
  'The Crab Nebula is the wreckage of a supernova that Chinese astronomers recorded in 1054 AD.',
  'Every star you see with your naked eye tonight belongs to the Milky Way galaxy.',
  'Cosmic rays — high-energy particles from space — constantly shower Earth; our magnetic field deflects most of them.',
  'There are more possible chess games than there are atoms in the observable universe.',
  'The core of the Sun is hot enough to convert about 600 million tonnes of hydrogen into helium every second.',
  'A "light year" is a measure of distance, not time — about 9.46 trillion kilometers.',
  'The Big Dipper is not a constellation but an asterism — part of the larger constellation Ursa Major.',
  "Ganymede, Jupiter's largest moon, is bigger than the planet Mercury.",
  'If you could fall into a black hole, the view of the universe would appear to speed up dramatically behind you.',
  "Comets are essentially dirty snowballs — chunks of ice and dust left over from the solar system's birth.",
  'The Milky Way and Andromeda galaxies are part of a cluster that also includes about 80 smaller galaxies.',
  "Titan, Saturn's largest moon, has rivers and lakes of liquid methane instead of water.",
  'The visible universe is about 93 billion light-years across.',
];

/** Deterministically pick the fact of the day from a YYYY-MM-DD date. */
export function getFactOfTheDay(date: Date = new Date()): string {
  const iso = date.toISOString().slice(0, 10);
  let hash = 0;
  for (let i = 0; i < iso.length; i++) {
    hash = (hash * 31 + iso.charCodeAt(i)) >>> 0;
  }
  return COSMIC_FACTS[hash % COSMIC_FACTS.length];
}
