import { useState } from 'react';
import { PixelButton } from '../../components/ui.jsx';
import { usePick } from '../../components/usePick.js';
import { useCountdown } from '../../primitives/useCountdown.js';
import TownMap, { STREETS } from './TownMap.jsx';

// Twelve patient cards from the clinic (fictional), each with a street. Most come from the six streets below the hill.
const CARDS = ['a', 'd', 'b', 'e', 'g', 'c', 'f', 'a', 'd', 'h', 'b', 'e'].map((street, i) => ({ id: `p${i}`, n: i + 1, street }));
const streetName = (id) => STREETS.find((s) => s.id === id).name;

// Map the Cases: drag each patient pin to its street in 30 seconds.
export default function MapCases({ config, onComplete }) {
  const [phase, setPhase] = useState('ready');
  const [placed, setPlaced] = useState({}); // cardId -> streetId
  const { picked, itemProps, targetProps } = usePick();

  const finish = (state = placed) => {
    const right = CARDS.filter((c) => state[c.id] === c.street).length;
    const ok = right >= 10;
    onComplete({
      points: ok ? config.points : {},
      feedback: `${right} of 12 cases placed on the right street.${ok ? ' A cluster shows up on the six streets just downslope of the hill.' : ''} ${config.feedback}`,
      verdict: ok ? 'correct' : 'wrong',
      state: { right, cluster: ok },
    });
  };
  const left = useCountdown(config.seconds, phase === 'running', () => finish());

  const place = (streetId) => (cardId) => {
    if (phase !== 'running') return;
    const next = { ...placed, [cardId]: streetId };
    setPlaced(next);
    if (CARDS.every((c) => next[c.id])) {
      setPhase('done');
      finish(next);
    }
  };

  const pins = {};
  CARDS.forEach((c) => {
    const s = placed[c.id];
    if (s) pins[s] = (pins[s] || 0) + 1;
  });

  return (
    <div className="prim">
      <div className="timer" aria-live="polite">
        <span className="label">{phase === 'ready' ? `${config.seconds} seconds on the clock` : 'Time left'}</span>
        <span className={`timer__num ${left <= 5 ? 'is-low' : ''}`}>{left}s</span>
      </div>
      <div className="riskmap">
        <div>
          <TownMap pins={pins} label="Town map with the case pins you placed" />
          <div className="cases__streets">
            {STREETS.map((s) => (
              <button key={s.id} type="button" className={`timechip ${picked ? 'is-target' : ''}`} disabled={phase !== 'running'} {...targetProps(place(s.id))}>
                {s.name} · {pins[s.id] || 0}
              </button>
            ))}
          </div>
        </div>
        <div className="cases__cards">
          {CARDS.filter((c) => !placed[c.id]).map((c) => (
            <button key={c.id} type="button" className={`token ${picked === c.id ? 'is-picked' : ''}`} disabled={phase !== 'running'} {...itemProps(c.id)}>
              Patient {c.n} · {streetName(c.street)}
            </button>
          ))}
          {phase === 'running' && CARDS.every((c) => placed[c.id]) && <span className="caption">All placed.</span>}
        </div>
      </div>
      <p className="caption">Drag each patient card to its street — or click a card, then the street.</p>
      {phase === 'ready' ? (
        <PixelButton className="pbtn--block" onClick={() => setPhase('running')}>
          Start mapping
        </PixelButton>
      ) : (
        <button type="button" className="pbtn pbtn--ghost pbtn--block" onClick={() => finish()}>
          Done
        </button>
      )}
    </div>
  );
}
