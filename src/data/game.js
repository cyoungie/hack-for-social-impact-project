import { CONTENT } from '../content/index.js';

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
// anchored to the land. Every slot opens its intro; slots without gameplay in src/scenarios land on
// the GameScene stub.
const SLOTS = [
  {
    id: 'field',
    n: 1,
    stat: 'Soil',
    line: 'Help a farmer — storms are stealing the topsoil',
    color: 'var(--soil)',
    x: 40,
    y: 80,
    tag: 'SOIL',
  },
  {
    id: 'ridge',
    n: 2,
    stat: 'People',
    line: 'Help Nina’s village get ready before the next storm',
    color: 'var(--people)',
    x: 22,
    y: 64,
    tag: 'PEOPLE',
  },
  {
    id: 'coast',
    n: 3,
    stat: 'Reef',
    line: 'Help a fisherman — half his reef has gone grey',
    color: 'var(--veg)',
    x: 53,
    y: 33,
    tag: 'REEF',
    body: 'Last year the water got too warm and the coral went white. Now every rain turns the bay brown.',
    difficulty: 2,
  },
  {
    id: 'lens',
    n: 4,
    stat: 'Water',
    line: 'One aquifer under everyone — and the taps taste salty',
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
    stat: 'All stats',
    line: 'The water’s gone funny near the buildup — act, don’t move',
    color: 'var(--warning)',
    x: 63,
    y: 18,
    tag: 'ALL STATS',
    body: "The water turned funny the week they cleared the parcel uphill. The town can't veto the project — but it can make them measure and build it right.",
    difficulty: 3,
  },
];

// Title, location and persona come from src/content/scenario{n}.json.
export const PROBLEMS = SLOTS.map((slot) => {
  const c = CONTENT[slot.id];
  return { ...slot, title: `${c.title} · ${c.location}`, persona: c.persona };
});

export const SAFE_YIELD = 52;
