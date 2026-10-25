import { useState } from 'react';
import { PixelButton } from '../../components/ui.jsx';
import { Icon } from '../../components/Icons.jsx';
import { usePick } from '../../components/usePick.js';
import { useCountdown } from '../../primitives/useCountdown.js';
import { budgetColor } from './budget.js';

// Water Detective: tap the water wasters, then drag the right fix onto each.
const WASTERS = [
  { id: 'faucet', label: 'Dripping faucet', icon: 'faucet', fix: 'repair', gallons: 20 },
  { id: 'toilet', label: 'Leaking toilet', icon: 'toilet', fix: 'repair', gallons: 60 },
  { id: 'hose', label: 'Hose running while washing the car', icon: 'hose', fix: 'bucket', gallons: 80 },
  { id: 'sprinkler', label: 'Sprinkler at noon', icon: 'lawn', fix: 'timer', gallons: 50 },
  { id: 'shower', label: 'Long showers', icon: 'drop', fix: 'shower', gallons: 40 },
];
const FIXES = [
  { id: 'repair', label: 'Repair' },
  { id: 'shower', label: 'Shower timer' },
  { id: 'bucket', label: 'Bucket' },
  { id: 'timer', label: 'Off-peak timer' },
];
const BUDGET_PER_FIX = 7; // Water Budget points per waster fixed (illustrative)

export default function WaterDetective({ config, onComplete }) {
  const [phase, setPhase] = useState('ready');
  const [spotted, setSpotted] = useState([]);
  const [fixed, setFixed] = useState([]);
  const [msg, setMsg] = useState('');
  const { picked, itemProps, targetProps } = usePick();
  const saved = WASTERS.filter((w) => fixed.includes(w.id)).reduce((n, w) => n + w.gallons, 0);
  const meter = Math.max(0, Math.min(100, config.budgetNow + fixed.length * BUDGET_PER_FIX));

  const finish = () => {
    const color = budgetColor(meter);
    const tier = config.tiers[color];
    onComplete({
      ...tier,
      feedback: `You fixed ${fixed.length} of ${WASTERS.length} water wasters (${saved} gallons a day saved, illustrative). The Water Budget meter ends in the ${color}. ${tier.feedback}`,
      verdict: color === 'green' ? 'correct' : color === 'yellow' ? 'ok' : 'wrong',
      budget: fixed.length * BUDGET_PER_FIX + (tier.budget || 0),
      state: { fixed: fixed.length },
    });
  };
  const left = useCountdown(config.seconds, phase === 'running', finish);

  const applyFix = (w) => (fixId) => {
    if (!spotted.includes(w.id) || fixed.includes(w.id)) return;
    if (fixId === w.fix) {
      setFixed((f) => [...f, w.id]);
      setMsg(`${w.label}: fixed.`);
    } else setMsg(`${FIXES.find((f) => f.id === fixId).label} doesn't fix the ${w.label.toLowerCase()}.`);
  };

  return (
    <div className="prim">
      <div className="timer" aria-live="polite">
        <span className="label">{phase === 'ready' ? `${config.seconds} seconds` : 'Time left'}</span>
        <span className="leak__lost">
          <Icon name="drop" size={16} /> {saved} gal/day saved
        </span>
        <span className={`timer__num ${left <= 10 ? 'is-low' : ''}`}>{left}s</span>
      </div>
      <div className="budget budget--inline">
        <span className="label">Water Budget</span>
        <span className="budget__track">
          <span className={`budget__fill is-${budgetColor(meter)}`} style={{ width: `${meter}%` }} />
        </span>
      </div>
      <div className={`detective ${phase === 'ready' ? 'is-waiting' : ''}`}>
        {WASTERS.map((w) => {
          const isSpotted = spotted.includes(w.id);
          const isFixed = fixed.includes(w.id);
          return (
            <button
              key={w.id}
              type="button"
              className={`grab__item ${isFixed ? 'is-leak' : isSpotted ? 'is-spotted' : ''} ${picked && isSpotted && !isFixed ? 'is-target' : ''}`}
              disabled={phase !== 'running' || isFixed}
              aria-label={`${w.label}${isFixed ? ', fixed' : isSpotted ? ', spotted — drop a fix here' : ''}`}
              {...(isSpotted ? targetProps(applyFix(w)) : { onClick: () => setSpotted((s) => [...s, w.id]) })}
            >
              <Icon name={w.icon} size={28} />
              <span className="grab__label">{w.label}</span>
              {isSpotted && <span className="grab__status">{isFixed ? 'Fixed' : 'Spotted'}</span>}
            </button>
          );
        })}
      </div>
      <div className="riskmap__toggles">
        {FIXES.map((f) => (
          <button key={f.id} type="button" className={`token ${picked === f.id ? 'is-picked' : ''}`} disabled={phase !== 'running'} {...itemProps(f.id)}>
            {f.label}
          </button>
        ))}
      </div>
      <p className="caption" role="status">
        {msg || 'Tap a water waster to spot it, then drag the right fix onto it — or click a fix, then the waster.'}
      </p>
      {phase === 'ready' ? (
        <PixelButton className="pbtn--block" onClick={() => setPhase('running')}>
          Start the hunt
        </PixelButton>
      ) : (
        <button type="button" className="pbtn pbtn--ghost pbtn--block" onClick={finish}>
          Done
        </button>
      )}
    </div>
  );
}
