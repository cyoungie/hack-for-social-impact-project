import { pointEntries } from '../data/scoring.js';

// "+5 WATER" chips in the stat colors. `float` plays the rise-and-fade animation once.
export function PointChips({ points, float = false, emptyText }) {
  const entries = pointEntries(points);
  if (!entries.length) return emptyText ? <p className="caption">{emptyText}</p> : null;
  return (
    <span className={`pchips ${float ? 'is-float' : ''}`}>
      {entries.map((e, i) => (
        <span
          key={e.key}
          className={`pchip ${e.value < 0 ? 'is-neg' : ''}`}
          style={{ '--chip-color': e.color, animationDelay: `${i * 120}ms` }}
        >
          {e.value > 0 ? '+' : '−'}
          {Math.abs(e.value)} {e.label}
        </span>
      ))}
    </span>
  );
}
