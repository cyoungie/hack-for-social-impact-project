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

// x/y are percentages of the island image box, so badges stay anchored to the land.
export const PROBLEMS = [
  {
    id: 'lens',
    n: 1,
    title: 'The Lens · Dededo',
    stat: 'Water',
    line: 'saltwater creeping into the wells',
    color: 'var(--water)',
    x: 50,
    y: 12,
    open: true,
    tag: 'WATER',
    body: "One aquifer under this limestone serves most of the island's taps. New housing is going up over it — on septic — while drought years stack. The wells are starting to taste like the sea.",
    difficulty: 2,
  },
  { id: 'fire', n: 2, title: 'Fire Season · South Hills', stat: 'Soil', line: 'human-set fires turning savanna to badlands', color: 'var(--danger)', x: 30, y: 66, tag: 'SOIL' },
  { id: 'coast', n: 3, title: 'The Coast · Tumon', stat: 'Reef', line: 'sediment and build-out pressuring the economy', color: 'var(--veg)', x: 18, y: 32, tag: 'REEF' },
  { id: 'typhoon', n: 4, title: 'Typhoon Alley · East Coast', stat: 'People', line: 'where homes rebuild decides who stays', color: 'var(--people)', x: 66, y: 42, tag: 'PEOPLE' },
  { id: 'dumping', n: 5, title: 'Boonie Dumping · Central', stat: 'All stats', line: 'what households dump reaches the wells', color: 'var(--warning)', x: 42, y: 46, tag: 'ALL STATS' },
];

export const NINA_LINES = [
  'Our tap water started tasting salty last dry season. Grandma says it never did that when the limestone forest above the well was still standing.',
  "Now the village approved 200 new homes uphill from our well. All on septic. Everyone's excited about the jobs — nobody's talking about the water.",
  'The village meeting is Thursday. Help me figure out how much water we can actually afford to pump this dry season — and what to say about those 200 homes.',
];

export const VOTE_OPTIONS = [
  { id: 'A', label: 'Approve as-is — housing now, water later' },
  { id: 'B', label: 'Approve only with required sewer hookup' },
  { id: 'C', label: "Reject — it's over the recharge zone" },
  { id: 'D', label: 'Delay pending an aquifer impact study' },
];

export const SAFE_YIELD = 52;

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

export function consequenceChips(v) {
  return {
    water: -(3 + Math.round(v * 0.11)),
    people: 1 + Math.round(v / 25),
    risk: v <= SAFE_YIELD ? 'low' : v <= 75 ? 'rising' : 'severe',
  };
}

export function forecast(pump, vote) {
  const waterBonus = { B: 8, C: 12, D: 4 }[vote] ?? 0;
  const peopleBonus = { A: 6, B: 5, C: -2 }[vote] ?? 0;
  return [
    { key: 'water', label: 'WATER', color: 'var(--water)', start: 52, end: clamp(52 - Math.round(pump * 0.35) + waterBonus, 5, 95) },
    { key: 'soil', label: 'SOIL', color: 'var(--soil)', start: 58, end: 58 },
    { key: 'veg', label: 'VEG', color: 'var(--veg)', start: 60, end: 59 },
    { key: 'people', label: 'PEOPLE', color: 'var(--people)', start: 55, end: clamp(55 + Math.round(pump / 12) + peopleBonus, 5, 95) },
  ];
}

export const KNOWLEDGE_TITLES = {
  A: 'You bet the aquifer on growth',
  B: 'You kept the sewers between the homes and the lens',
  C: 'You kept housing off the recharge zone',
  D: 'You bought the lens some time',
};

export const VOTE_PHRASES = {
  A: 'approved the 200 homes as-is, on septic',
  B: 'approved the 200 homes only with sewer hookups',
  C: 'rejected the homes over the recharge zone',
  D: 'delayed the homes for an aquifer impact study',
};

export const ACTION_LINKS = [
  { label: 'Guam Watershed Plan', href: 'https://bsp.guam.gov/wp-content/uploads/2026/05/Guam_Watershed_Plan.pdf' },
  { label: 'USGS Guam water study', href: 'https://www.usgs.gov/index.php/publications/water-resources-guam-potential-impacts-and-adaptive-response-climate-change' },
  { label: 'UOG Sea Grant tree plantings', href: 'https://seagrant.uog.edu/' },
];
