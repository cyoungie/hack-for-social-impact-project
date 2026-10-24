import { SAFE_YIELD } from '../data/game.js';

// The chunky 0–100 pumping slider with the fixed SAFE YIELD tick (shared by every pump decision).
export function PumpSlider({ value, onChange, label = 'Village pumping rate' }) {
  return (
    <div className="slider" style={{ '--v': value }}>
      <span className="slider__tick" style={{ '--tick': SAFE_YIELD }} aria-hidden="true">
        <span className="slider__tick-label">Safe yield</span>
      </span>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        aria-label={label}
        aria-valuetext={`${value} percent, safe yield is ${SAFE_YIELD}`}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="slider__ends" aria-hidden="true">
        <span>Low</span>
        <span>Max</span>
      </div>
    </div>
  );
}
