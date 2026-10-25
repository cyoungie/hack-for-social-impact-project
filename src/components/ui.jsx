import { forwardRef } from 'react';
import { useGame } from '../state/GameState.jsx';
import { avatarColorValue } from '../data/game.js';
import { Avatar } from './Avatar.jsx';
import { Icon } from './Icons.jsx';

export const PixelButton = forwardRef(function PixelButton({ className = '', children, ...props }, ref) {
  return (
    <button type="button" ref={ref} className={`pbtn ${className}`} {...props}>
      {children}
    </button>
  );
});

export function PixelCard({ hero = false, as: Tag = 'div', className = '', children, ...props }) {
  return (
    <Tag className={`pcard ${hero ? 'pcard--hero' : ''} ${className}`} {...props}>
      {children}
    </Tag>
  );
}

// Small ink-bordered label. `tone` picks the fill: panel | water | wood | tag | plain.
export function Plate({ tone = 'panel', className = '', style, children }) {
  return (
    <span className={`plate plate--${tone} ${className}`} style={style}>
      {children}
    </span>
  );
}

export function StepSquares({ step, total = 3, label }) {
  return (
    <div className="steps">
      <span className="steps__squares" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={`steps__sq ${i < step ? 'is-filled' : ''}`} />
        ))}
      </span>
      <span className="label">
        Step {step} of {total} · {label}
      </span>
    </div>
  );
}

export function SegmentBar({ value, color, label }) {
  const filled = Math.round(value / 10);
  return (
    <div
      className="segbar"
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      style={{ '--seg-color': color }}
    >
      {Array.from({ length: 10 }, (_, i) => (
        <span key={i} className={`segbar__block ${i < filled ? 'is-filled' : ''}`} />
      ))}
    </div>
  );
}

export function SquareRadio({ name, value, checked, onChange, children }) {
  return (
    <label className={`sqradio ${checked ? 'is-checked' : ''}`}>
      <input
        className="sr-only"
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
      />
      <span className="sqradio__box" aria-hidden="true">
        {checked && <Icon name="check" size={16} strokeWidth={3} />}
      </span>
      <span className="sqradio__text">{children}</span>
    </label>
  );
}

const NAV_LINKS = [
  { id: 'GAME', scene: 'map' },
  { id: 'ACT', scene: 'act' },
];

export function Nav({ plate, active }) {
  const { state, goTo } = useGame();
  return (
    <header className="nav">
      <div className="nav__left">
        <span className="wordmark">Common Ground</span>
        <Plate>{plate}</Plate>
      </div>
      <nav className="nav__right" aria-label="Main">
        {NAV_LINKS.map((link) => (
          <button
            key={link.id}
            type="button"
            className={`nav__link ${active === link.id ? 'is-active' : ''}`}
            aria-current={active === link.id ? 'page' : undefined}
            onClick={() => goTo(link.scene)}
          >
            {link.id}
          </button>
        ))}
        <span className="nav__chip" title={state.playerName}>
          <Avatar color={avatarColorValue(state.avatarColor)} size={28} />
        </span>
      </nav>
    </header>
  );
}
