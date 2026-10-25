import { useState } from 'react';
import { PixelButton } from '../../components/ui.jsx';
import { useCountdown } from '../../primitives/useCountdown.js';

// 20 corals; the healthy ones are fixed so every player sees the same reef.
const HEALTHY = new Set([1, 4, 6, 9, 12, 13, 17, 19]);
const CORALS = Array.from({ length: 20 }, (_, i) => ({ id: i, healthy: HEALTHY.has(i), shape: i % 3 }));

function CoralSprite({ shape }) {
  return (
    <svg viewBox="0 0 40 40" shapeRendering="crispEdges" aria-hidden="true">
      {shape === 0 && (
        <>
          <rect x="17" y="14" width="6" height="22" />
          <rect x="8" y="8" width="6" height="18" />
          <rect x="26" y="6" width="6" height="20" />
          <rect x="8" y="22" width="24" height="6" />
        </>
      )}
      {shape === 1 && (
        <>
          <rect x="6" y="18" width="28" height="18" rx="6" />
          <rect x="12" y="10" width="16" height="10" rx="4" />
        </>
      )}
      {shape === 2 && (
        <>
          <rect x="10" y="10" width="6" height="26" />
          <rect x="24" y="14" width="6" height="22" />
          <rect x="4" y="16" width="8" height="5" />
          <rect x="28" y="20" width="8" height="5" />
        </>
      )}
    </svg>
  );
}

// Coral count: tap only the healthy corals in 20 seconds.
export default function CoralCount({ config, onComplete }) {
  const [phase, setPhase] = useState('ready');
  const [tapped, setTapped] = useState({});
  const total = HEALTHY.size;

  const finish = (state = tapped) => {
    const right = CORALS.filter((c) => c.healthy && state[c.id]).length;
    const wrong = CORALS.filter((c) => !c.healthy && state[c.id]).length;
    onComplete({
      points: { veg: right - wrong },
      feedback: `${total} of the 20 corals are still healthy; you counted ${right}${wrong ? ` and tapped ${wrong} bleached` : ''}. ${config.feedback}`,
      verdict: right === total && !wrong ? 'correct' : right >= total / 2 ? 'ok' : 'wrong',
      state: { counted: right, healthy: total },
    });
  };

  const left = useCountdown(config.seconds, phase === 'running', () => finish());

  const tap = (c) => {
    if (phase !== 'running' || tapped[c.id]) return;
    const next = { ...tapped, [c.id]: true };
    setTapped(next);
    if (CORALS.filter((x) => x.healthy).every((x) => next[x.id])) {
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
      <div className={`reefgrid ${phase === 'ready' ? 'is-waiting' : ''}`}>
        {CORALS.map((c, i) => {
          const hit = tapped[c.id];
          return (
            <button
              key={c.id}
              type="button"
              className={`coral ${c.healthy ? 'is-healthy' : 'is-bleached'} ${hit ? (c.healthy ? 'is-counted' : 'is-wrong') : ''}`}
              disabled={phase !== 'running'}
              aria-label={`Coral ${i + 1}, ${c.healthy ? 'colorful' : 'white'}${hit ? (c.healthy ? ', counted' : ', not healthy') : ''}`}
              onClick={() => tap(c)}
            >
              <CoralSprite shape={c.shape} />
            </button>
          );
        })}
      </div>
      {phase === 'ready' ? (
        <PixelButton className="pbtn--block" onClick={() => setPhase('running')}>
          Start counting
        </PixelButton>
      ) : (
        <button type="button" className="pbtn pbtn--ghost pbtn--block" onClick={() => finish()}>
          Done counting
        </button>
      )}
    </div>
  );
}
