import { useEffect, useState } from 'react';
import { Icon } from '../../components/Icons.jsx';
import VillageMap from './VillageMap.jsx';

const BARS = [
  { key: 'leaf', icon: 'grass', label: 'Leaf — soil, water, vegetation', color: 'var(--veg)' },
  { key: 'people', icon: 'people', label: 'People — safety and wellbeing', color: 'var(--people)' },
  { key: 'coin', icon: 'coin', label: 'Coin — jobs and money', color: 'var(--warning)' },
];

const STEP_MS = 800;
const reducedMotion = () => Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

export function Bars({ frame }) {
  return (
    <div className="ybars">
      {BARS.map((b) => (
        <div key={b.key} className="ybar" title={b.label}>
          <Icon name={b.icon} size={14} />
          <span className="ybar__track" aria-hidden="true">
            <span className="ybar__fill" style={{ width: `${frame[b.key]}%`, background: b.color }} />
          </span>
          <span className="ybar__num">
            <span className="sr-only">{b.label}: </span>
            {frame[b.key]}
          </span>
        </div>
      ))}
    </div>
  );
}

// Five years, one frame each; storms in years 2 and 4. Plays in once, then stays.
export default function YearStrip({ title, result, plan, vote, onDone, instant = false }) {
  const [shown, setShown] = useState(() => (instant || reducedMotion() ? 5 : 1));

  useEffect(() => {
    if (shown >= 5) {
      onDone?.();
      return undefined;
    }
    const t = setTimeout(() => setShown((n) => n + 1), STEP_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown]);

  return (
    <section className="ystrip" aria-label={title}>
      <p className="label ystrip__title">{title}</p>
      <ol className="ystrip__years" aria-live="polite">
        {result.frames.slice(0, shown).map((f) => (
          <li key={f.year} className={`yframe ${f.storm ? 'is-storm' : ''}`}>
            <div className="yframe__map">
              <VillageMap frame={f} plan={plan} vote={vote} label={`Year ${f.year} map`} />
              <span className="yframe__year">
                Year {f.year}
                {f.storm && ' · Storm'}
              </span>
            </div>
            <div className="yframe__body">
              <Bars frame={f} />
              <p className="yframe__line">{f.line}</p>
            </div>
          </li>
        ))}
      </ol>
      {shown >= 5 && <p className="ystrip__summary">{result.summary}</p>}
    </section>
  );
}
