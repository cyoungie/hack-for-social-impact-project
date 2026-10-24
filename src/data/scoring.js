// One scoring system across every scenario: points land on the island's four bars.
export const STATS = [
  { key: 'water', label: 'WATER', color: 'var(--water)' },
  { key: 'soil', label: 'SOIL', color: 'var(--soil)' },
  { key: 'veg', label: 'VEG', color: 'var(--veg)' },
  { key: 'people', label: 'PEOPLE', color: 'var(--people)' },
];

export function addPoints(a = {}, b = {}) {
  const out = { ...a };
  for (const { key } of STATS) {
    if (b[key]) out[key] = (out[key] || 0) + b[key];
  }
  return out;
}

export function sumPoints(list) {
  return list.reduce((acc, p) => addPoints(acc, p), {});
}

export function clampBars(bars) {
  const out = {};
  for (const { key } of STATS) out[key] = Math.min(100, Math.max(0, bars[key] ?? 0));
  return out;
}

// Non-zero entries in stat order, e.g. [{ key: 'veg', label: 'VEG', color, value: 5 }].
export function pointEntries(points = {}) {
  return STATS.filter((s) => points[s.key]).map((s) => ({ ...s, value: points[s.key] }));
}

export function formatPoints(points) {
  const parts = pointEntries(points).map((e) => `${e.value > 0 ? '+' : '−'}${Math.abs(e.value)} ${e.label}`);
  return parts.length ? parts.join(', ') : 'no change to the bars';
}
