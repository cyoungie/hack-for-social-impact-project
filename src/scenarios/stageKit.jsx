import { useState } from 'react';
import { Icon } from '../components/Icons.jsx';

// Flat block scenery in percentages. Designer art at `src` (the scenario's background) replaces it.
export function Scenery({ src, blocks, swap = {} }) {
  const [artOk, setArtOk] = useState(true);
  return (
    <div className="scenery" aria-hidden="true">
      {artOk && (
        <img className="scenery__art" src={src} alt="" onError={() => setArtOk(false)} />
      )}
      {!artOk &&
        blocks.map((b, i) => (
          <div
            key={b.id || i}
            className={`blk blk--${swap[b.id] || b.tone}`}
            style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%` }}
          >
            {b.label && <span className="blk__label">{b.label}</span>}
          </div>
        ))}
    </div>
  );
}

// A small plate pinned to the scene — used for every "scene change" state overlay.
export function Mark({ x, y, icon, tone = 'plain', children }) {
  return (
    <span className={`mark mark--${tone}`} style={{ left: `${x}%`, top: `${y}%` }}>
      {icon && <Icon name={icon} size={14} strokeWidth={2.5} />}
      {children}
    </span>
  );
}

// Dashed trace between two scene points.
export function Trace({ from, to, tone = 'soil' }) {
  return (
    <svg className={`trace trace--${tone}`} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <line x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
