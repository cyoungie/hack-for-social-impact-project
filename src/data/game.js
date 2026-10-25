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

// The five places on the map. x/y are percentages of the island image box, so badges stay anchored
// to the land. Players can start anywhere. Title, place (the map icon) and resident come from
// src/content/scenario{n}.json; `line` is the one line shown when hovering the icon.
const SLOTS = [
  { id: 'field', n: 1, stat: 'Soil', tag: 'SOIL', color: 'var(--soil)', x: 40, y: 80, line: 'Storms keep washing her topsoil into the stream.' },
  { id: 'ridge', n: 2, stat: 'People', tag: 'PEOPLE', color: 'var(--people)', x: 22, y: 64, line: 'The river came into her house, and the rebuild meeting is Saturday.' },
  { id: 'coast', n: 3, stat: 'Reef', tag: 'REEF', color: 'var(--veg)', x: 53, y: 33, line: 'A new road up the hill turns his bay brown every time it rains.' },
  { id: 'lens', n: 4, stat: 'Water', tag: 'WATER', color: 'var(--water)', x: 74, y: 30, line: 'Her water keeps cutting out, and an old septic tank sits over the aquifer.' },
  { id: 'industry', n: 5, stat: 'All stats', tag: 'ALL STATS', color: 'var(--warning)', x: 63, y: 18, line: 'The tap runs grey some mornings, and nobody up the hill tells the town anything.' },
];

export const PROBLEMS = SLOTS.map((slot) => {
  const c = CONTENT[slot.id];
  return { ...slot, scenarioTitle: c.title, place: c.location, title: `${c.title} · ${c.location}`, resident: c.persona.name, persona: c.persona };
});

