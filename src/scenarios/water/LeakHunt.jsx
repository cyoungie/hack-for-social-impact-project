import { useEffect, useRef, useState } from 'react';
import { PixelButton } from '../../components/ui.jsx';
import { Icon } from '../../components/Icons.jsx';
import { useCountdown } from '../../primitives/useCountdown.js';

// Leak Hunt: tap the pipe map to listen; ripples grow stronger near hidden leaks. Report each one to GWA.
const COLS = 12;
const ROWS = 7;
const LEAKS = [
  [2, 1],
  [9, 1],
  [5, 3],
  [1, 5],
  [10, 5],
];
const GALLONS_PER_SEC = 3; // per running leak (illustrative)
const strengthWord = (d) => (d === 0 ? 'Leak!' : d <= 1 ? 'Very strong' : d <= 2 ? 'Stronger' : d <= 4 ? 'Faint' : 'Nothing');

export default function LeakHunt({ config, onComplete }) {
  const [phase, setPhase] = useState('ready');
  const [taps, setTaps] = useState({}); // "c,r" -> distance to nearest leak at tap time
  const [found, setFound] = useState([]); // leak indexes
  const [reported, setReported] = useState([]);
  const [lost, setLost] = useState(0);
  const stateRef = useRef({ found, reported });
  stateRef.current = { found, reported };

  const finish = () => {
    const { found: f, reported: r } = stateRef.current;
    const n = f.length;
    // Tiers: 4–5 found and reported; found but not reported; 2–3; 0–1.
    const key = n >= 4 && r.length >= 4 ? 'most' : n > r.length ? 'unreported' : n >= 2 ? 'some' : 'few';
    const tier = config.tiers[key];
    onComplete({
      ...tier,
      feedback: `You found ${n} of ${LEAKS.length} leaks and reported ${r.length}. ${tier.feedback}`,
      verdict: key === 'most' ? 'correct' : key === 'some' ? 'ok' : 'wrong',
      state: { found: n, reported: r.length },
    });
  };

  const left = useCountdown(config.seconds, phase === 'running', finish);

  // Gallons lost tick up while leaks run (reported ones are shut off).
  useEffect(() => {
    if (phase !== 'running') return undefined;
    const id = setInterval(() => setLost((g) => g + (LEAKS.length - stateRef.current.reported.length) * GALLONS_PER_SEC), 1000);
    return () => clearInterval(id);
  }, [phase]);

  const listen = (c, r) => {
    if (phase !== 'running') return;
    let best = Infinity;
    let idx = -1;
    LEAKS.forEach(([lc, lr], i) => {
      if (found.includes(i)) return;
      const d = Math.abs(lc - c) + Math.abs(lr - r);
      if (d < best) {
        best = d;
        idx = i;
      }
    });
    setTaps((t) => ({ ...t, [`${c},${r}`]: best }));
    if (best === 0) setFound((f) => [...f, idx]);
  };

  return (
    <div className="prim">
      <div className="timer" aria-live="polite">
        <span className="label">{phase === 'ready' ? `${config.seconds} seconds · listening tool ready` : 'Time left'}</span>
        <span className="leak__lost">
          <Icon name="drop" size={16} /> {lost} gallons lost
        </span>
        <span className={`timer__num ${left <= 10 ? 'is-low' : ''}`}>{left}s</span>
      </div>
      <div className={`leakmap ${phase === 'ready' ? 'is-waiting' : ''}`} style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
        {Array.from({ length: ROWS }, (_, r) =>
          Array.from({ length: COLS }, (_, c) => {
            const key = `${c},${r}`;
            const d = taps[key];
            const leakIdx = LEAKS.findIndex(([lc, lr]) => lc === c && lr === r);
            const isFound = leakIdx >= 0 && found.includes(leakIdx);
            const isReported = isFound && reported.includes(leakIdx);
            return (
              <div key={key} className={`leakcell ${r % 2 === 1 || c % 3 === 0 ? 'has-pipe' : ''}`}>
                {isFound ? (
                  <button
                    type="button"
                    className={`leak__pin ${isReported ? 'is-reported' : ''}`}
                    disabled={isReported || phase !== 'running'}
                    onClick={() => setReported((x) => [...x, leakIdx])}
                  >
                    {isReported ? 'Sent' : 'Report'}
                  </button>
                ) : (
                  <button
                    type="button"
                    className={`leakcell__tap ${d !== undefined ? `is-d${Math.min(d, 5)}` : ''}`}
                    disabled={phase !== 'running'}
                    aria-label={`Listen at column ${c + 1}, row ${r + 1}${d !== undefined ? `: ${strengthWord(d)}` : ''}`}
                    onClick={() => listen(c, r)}
                  >
                    {d !== undefined && <span className="leakcell__ripple" />}
                  </button>
                )}
              </div>
            );
          }),
        )}
      </div>
      <p className="caption">
        Found {found.length} of {LEAKS.length} · reported {reported.length}. Tap to listen; the ripple grows stronger near a leak.
      </p>
      {phase === 'ready' ? (
        <PixelButton className="pbtn--block" onClick={() => setPhase('running')}>
          Start listening
        </PixelButton>
      ) : (
        <button type="button" className="pbtn pbtn--ghost pbtn--block" onClick={finish}>
          Done searching
        </button>
      )}
    </div>
  );
}
