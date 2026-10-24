export const AVATAR_COLORS = [
  { id: 'green', label: 'Green', value: 'var(--veg)' },
  { id: 'blue', label: 'Blue', value: 'var(--water)' },
  { id: 'amber', label: 'Amber', value: 'var(--warning)' },
  { id: 'violet', label: 'Violet', value: 'var(--people)' },
  { id: 'clay', label: 'Clay', value: 'var(--soil)' },
];

export function avatarColorValue(id) {
  return (AVATAR_COLORS.find((c) => c.id === id) || AVATAR_COLORS[0]).value;
}

export const BIOMES = [
  { id: 'tropical', title: 'Tropical Island', icon: 'palm', body: 'Small land, one aquifer, big ocean. Everything connects fast.', open: true },
  { id: 'arid', title: 'Arid Drylands', icon: 'sun', body: "UNCCD's home turf — every drop and every root counts." },
  { id: 'delta', title: 'Coastal Delta', icon: 'waves', body: 'Rivers, floods, and the richest soil anyone keeps building on.' },
  { id: 'mountain', title: 'Mountain Valley', icon: 'mountain', body: 'Slopes decide everything — water, roads, and where homes hold.' },
  { id: 'grassland', title: 'Grassland Plains', icon: 'grass', body: 'Farm it right and it feeds millions. Farm it wrong — dust.' },
  { id: 'urban', title: 'Urban Megacity', icon: 'city', body: 'Heat islands, sealed soil, and ten million everyday decisions.' },
];

// Map slots in unlock order (1 -> 5). x/y are percentages of the island image box, so badges stay
// anchored to the land. Slots without an entry in src/scenarios are shown as "in production".
export const PROBLEMS = [
  {
    id: 'field',
    n: 1,
    title: 'The Field · South',
    stat: 'Soil',
    line: "team scenario — in production",
    color: 'var(--soil)',
    x: 40,
    y: 80,
    tag: 'SOIL',
  },
  {
    id: 'ridge',
    n: 2,
    title: 'The Ridge · South Hills',
    stat: 'People',
    line: 'team scenario — in production',
    color: 'var(--danger)',
    x: 22,
    y: 64,
    tag: 'PEOPLE',
  },
  {
    id: 'coast',
    n: 3,
    title: 'The Coast · Tumon',
    stat: 'Reef',
    line: 'half the reef gone grey in ten years',
    color: 'var(--veg)',
    x: 53,
    y: 33,
    tag: 'REEF',
    body: "Tatan Ben has fished this reef for forty years. Half of it has bleached, and some of what's killing it starts up on the land.",
    difficulty: 2,
  },
  {
    id: 'lens',
    n: 4,
    title: 'The Lens · Dededo',
    stat: 'Water',
    line: 'saltwater creeping into the wells',
    color: 'var(--water)',
    x: 74,
    y: 30,
    tag: 'WATER',
    body: "One aquifer under this limestone serves most of the island's taps. Pumping, leaks, and septic all reach it. The wells are starting to taste like the sea.",
    difficulty: 2,
  },
  {
    id: 'industry',
    n: 5,
    title: 'Industry & Military · Ysengsong',
    stat: 'All stats',
    line: 'a buildup the town can shape, not stop',
    color: 'var(--warning)',
    x: 63,
    y: 18,
    tag: 'ALL STATS',
    body: "The water turned funny the week they cleared the parcel uphill. The town can't veto the project — but it can make them measure and build it right.",
    difficulty: 3,
  },
];

export const SAFE_YIELD = 52;
