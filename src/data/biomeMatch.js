// Offline hometown -> biome lookup. The longest matching place name wins, so
// "Mexico City" beats "Mexico" and "West Texas" beats "Texas".
const PLACES = {
  tropical: [
    'guam', 'dededo', 'hagatna', 'tamuning', 'yigo', 'mangilao', 'saipan', 'northern mariana', 'mariana islands',
    'hawaii', 'honolulu', 'maui', 'oahu', 'kauai', 'puerto rico', 'san juan', 'fiji', 'samoa', 'tonga', 'palau',
    'micronesia', 'marshall islands', 'kiribati', 'tuvalu', 'vanuatu', 'solomon islands', 'tahiti', 'maldives',
    'bali', 'philippines', 'cebu', 'jamaica', 'bahamas', 'barbados', 'caribbean', 'cuba', 'dominican republic',
    'trinidad', 'sri lanka', 'mauritius', 'seychelles', 'okinawa', 'zanzibar', 'madagascar', 'papua new guinea',
  ],
  arid: [
    'arizona', 'phoenix', 'tucson', 'nevada', 'las vegas', 'new mexico', 'albuquerque', 'utah', 'death valley',
    'west texas', 'el paso', 'mojave', 'palm springs', 'sahara', 'sahel', 'egypt', 'saudi arabia', 'riyadh', 'dubai',
    'abu dhabi', 'united arab emirates', 'uae', 'qatar', 'kuwait', 'oman', 'yemen', 'jordan', 'israel', 'libya',
    'algeria', 'morocco', 'mali', 'niger', 'chad', 'sudan', 'mauritania', 'somalia', 'djibouti', 'eritrea',
    'namibia', 'botswana', 'kalahari', 'gobi', 'iran', 'afghanistan', 'outback', 'alice springs', 'atacama',
  ],
  delta: [
    'bangladesh', 'sundarbans', 'mekong', 'can tho', 'nile delta', 'alexandria', 'new orleans', 'louisiana',
    'mississippi delta', 'netherlands', 'holland', 'rotterdam', 'amsterdam', 'ganges', 'niger delta',
    'port harcourt', 'irrawaddy', 'myanmar', 'yangon', 'venice', 'camargue', 'sacramento delta', 'pearl river delta',
  ],
  mountain: [
    'colorado', 'denver', 'boulder', 'montana', 'idaho', 'wyoming', 'west virginia', 'appalachia', 'nepal',
    'kathmandu', 'tibet', 'bhutan', 'himalaya', 'kashmir', 'switzerland', 'swiss', 'alps', 'austria', 'andorra',
    'andes', 'peru', 'cusco', 'bolivia', 'la paz', 'ecuador', 'quito', 'ethiopia', 'addis ababa', 'rwanda',
    'lesotho', 'kyrgyzstan', 'tajikistan', 'banff', 'rocky mountains',
  ],
  grassland: [
    'kansas', 'nebraska', 'iowa', 'oklahoma', 'north dakota', 'south dakota', 'texas', 'great plains', 'prairie',
    'saskatchewan', 'manitoba', 'ukraine', 'kazakhstan', 'mongolia', 'steppe', 'argentina', 'pampas', 'uruguay',
    'serengeti', 'tanzania', 'kenya', 'zambia', 'zimbabwe',
  ],
  urban: [
    'new york', 'nyc', 'manhattan', 'brooklyn', 'los angeles', 'chicago', 'toronto', 'mexico city', 'sao paulo',
    'rio de janeiro', 'buenos aires', 'lima', 'bogota', 'london', 'paris', 'moscow', 'istanbul', 'cairo', 'lagos',
    'kinshasa', 'tehran', 'karachi', 'delhi', 'mumbai', 'kolkata', 'dhaka', 'bangkok', 'jakarta', 'manila',
    'ho chi minh city', 'singapore', 'hong kong', 'shenzhen', 'guangzhou', 'shanghai', 'beijing', 'seoul', 'tokyo',
    'osaka',
  ],
};

const normalize = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// Returns a biome id, or null when the place isn't recognized.
export function matchBiome(hometown) {
  const text = ` ${normalize(hometown)} `;
  if (!text.trim()) return null;
  let best = null;
  for (const [biome, places] of Object.entries(PLACES)) {
    for (const place of places) {
      if (text.includes(` ${place} `) && (!best || place.length > best.place.length)) best = { biome, place };
    }
  }
  return best ? best.biome : null;
}

const ACRONYMS = new Set(['nyc', 'uae']);
const displayName = (place) =>
  ACRONYMS.has(place) ? place.toUpperCase() : place.replace(/\b[a-z]/g, (c) => c.toUpperCase());

// Place suggestions for the search box: names starting with the query first, then names containing it.
export function searchPlaces(query, limit = 6) {
  const q = normalize(query);
  if (!q) return [];
  const starts = [];
  const contains = [];
  for (const [biome, places] of Object.entries(PLACES)) {
    for (const place of places) {
      if (place.startsWith(q) || place.split(' ').some((w) => w.startsWith(q))) starts.push({ name: displayName(place), biome });
      else if (place.includes(q)) contains.push({ name: displayName(place), biome });
    }
  }
  starts.sort((a, b) => a.name.length - b.name.length);
  return [...starts, ...contains].slice(0, limit);
}
