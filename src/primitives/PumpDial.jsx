import { useState } from 'react';
import { SAFE_YIELD } from '../data/game.js';
import { PixelButton } from '../components/ui.jsx';
import { PumpSlider } from '../components/PumpSlider.jsx';

// Chloride reading climbs slowly up to safe yield, then fast past it.
export function chloride(v) {
  return v <= SAFE_YIELD ? Math.round(v * 0.6) : Math.round(31 + (v - SAFE_YIELD) * 1.4);
}

const ZONES = [
  { max: 35, id: 'low', label: 'Normal', color: 'var(--veg)' },
  { max: 65, id: 'mid', label: 'Rising', color: 'var(--warning)' },
  { max: 101, id: 'high', label: 'High', color: 'var(--danger)' },
];

export function chlorideZone(v) {
  const c = chloride(v);
  return ZONES.find((z) => c <= z.max);
}

// P2 — slider with a live meter. Scores against the safe-yield line.
export default function PumpDial({ config, onComplete }) {
  const [value, setValue] = useState(config.start ?? 60);
  const c = chloride(value);
  const zone = chlorideZone(value);
  const filled = Math.max(1, Math.round(c / 10));

  return (
    <div className="prim">
      <PumpSlider value={value} onChange={setValue} />
      <div className="meter" aria-live="polite">
        <span className="label">Chloride meter · pump shed</span>
        <div className="meter__row">
          <span className="meter__blocks" aria-hidden="true">
            {Array.from({ length: 10 }, (_, i) => (
              <span key={i} className="meter__block" style={i < filled ? { background: zone.color } : undefined} />
            ))}
          </span>
          <span className="meter__reading" style={{ color: zone.id === 'low' ? 'var(--deep)' : 'var(--ink)' }}>
            {zone.label}
          </span>
        </div>
      </div>
      <p className="caption">
        {value > SAFE_YIELD
          ? `${value - SAFE_YIELD}% past safe yield. Comfortable pressure now.`
          : 'At or under safe yield. The lens refills as fast as the village drinks.'}
      </p>
      <PixelButton
        className="pbtn--block"
        onClick={() => {
          const ok = value <= SAFE_YIELD;
          const r = ok ? config.under : config.over;
          onComplete({ points: r.points, feedback: r.feedback, verdict: ok ? 'correct' : 'wrong', state: value });
        }}
      >
        Set the dial
      </PixelButton>
    </div>
  );
}
