import { useState } from 'react';
import { PixelButton } from '../components/ui.jsx';
import { Icon } from '../components/Icons.jsx';
import { addPoints } from '../data/scoring.js';
import { useCountdown } from './useCountdown.js';

// P5 — tap the right items before the timer runs out.
export default function TimedGrab({ config, onComplete }) {
  const [phase, setPhase] = useState('ready'); // ready | running
  const [tapped, setTapped] = useState({});
  const targets = config.items.filter((i) => i.kind !== 'fine');

  const finish = (state = tapped) => {
    let points = {};
    for (const item of config.items) {
      if (!state[item.id]) continue;
      if (item.kind === 'leak') points = addPoints(points, config.perLeak);
      if (item.kind === 'bonus') points = addPoints(points, config.bonus);
    }
    const leaks = config.items.filter((i) => i.kind === 'leak');
    const found = leaks.filter((i) => state[i.id]).length;
    onComplete({
      points,
      feedback: `You found ${found} of ${leaks.length} leaks. ${config.feedback}`,
      verdict: found === leaks.length ? 'correct' : found ? 'ok' : 'wrong',
      state: found,
    });
  };

  const left = useCountdown(config.seconds, phase === 'running', () => finish());

  const tap = (item) => {
    if (phase !== 'running' || tapped[item.id]) return;
    const next = { ...tapped, [item.id]: true };
    setTapped(next);
    if (targets.every((t) => next[t.id])) {
      setPhase('done');
      finish(next);
    }
  };

  return (
    <div className="prim">
      <div className="timer" aria-live="polite">
        <span className="label">{phase === 'ready' ? `${config.seconds} seconds on the clock` : 'Time left'}</span>
        <span className={`timer__num ${left <= 5 ? 'is-low' : ''}`}>{left}s</span>
      </div>

      <div className={`grab ${phase === 'ready' ? 'is-waiting' : ''}`}>
        {config.items.map((item) => {
          const hit = tapped[item.id];
          const status = hit ? (item.kind === 'fine' ? 'Fine' : item.kind === 'bonus' ? 'Bonus' : 'Leak found') : '';
          return (
            <button
              key={item.id}
              type="button"
              className={`grab__item ${hit ? `is-${item.kind}` : ''}`}
              disabled={phase !== 'running'}
              aria-label={`${item.label}${status ? ` — ${status}` : ''}`}
              onClick={() => tap(item)}
            >
              <Icon name={item.icon} size={28} />
              <span className="grab__label">{item.label}</span>
              {hit && <span className="grab__status">{status}</span>}
              {hit && item.note && <span className="grab__note">{item.note}</span>}
            </button>
          );
        })}
      </div>

      {phase === 'ready' ? (
        <PixelButton className="pbtn--block" onClick={() => setPhase('running')}>
          Start the hunt
        </PixelButton>
      ) : (
        <button type="button" className="pbtn pbtn--ghost pbtn--block" onClick={() => finish()}>
          I'm done looking
        </button>
      )}
    </div>
  );
}
