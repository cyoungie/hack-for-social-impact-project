import { useState } from 'react';
import { PixelButton } from '../components/ui.jsx';
import { Icon } from '../components/Icons.jsx';
import { usePick } from '../components/usePick.js';
import { useCountdown } from './useCountdown.js';

// P6 — sort items into two bins against the clock.
export default function DragSort({ config, onComplete }) {
  const [phase, setPhase] = useState('ready');
  const [placed, setPlaced] = useState({}); // itemId -> binId
  const { picked, itemProps, targetProps } = usePick();

  const finish = (state = placed) => {
    let people = 0;
    let veg = 0;
    for (const item of config.items) {
      const bin = state[item.id];
      if (!bin) continue;
      if (bin === item.answer) people += config.perCorrect;
      if (bin === 'keep' && item.protect) veg -= config.protectPenalty;
    }
    const released = config.items.filter((i) => state[i.id] === 'release').length;
    const right = config.items.filter((i) => state[i.id] === i.answer).length;
    onComplete({
      points: { people, veg },
      feedback: `${right} of ${config.items.length} sorted right. ${config.feedback}`,
      verdict: right === config.items.length ? 'correct' : right >= config.items.length / 2 ? 'ok' : 'wrong',
      state: { released },
    });
  };

  const left = useCountdown(config.seconds, phase === 'running', () => finish());

  const place = (binId) => (itemId) => {
    if (phase !== 'running' || placed[itemId]) return;
    const next = { ...placed, [itemId]: binId };
    setPlaced(next);
    if (config.items.every((i) => next[i.id])) {
      setPhase('done');
      finish(next);
    }
  };

  const loose = config.items.filter((i) => !placed[i.id]);

  return (
    <div className="prim">
      <div className="timer" aria-live="polite">
        <span className="label">{phase === 'ready' ? `${config.seconds} seconds on the clock` : 'Time left'}</span>
        <span className={`timer__num ${left <= 5 ? 'is-low' : ''}`}>{left}s</span>
      </div>
      <p className="caption">{config.hint}</p>

      <div className={`sort__tray ${phase === 'ready' ? 'is-waiting' : ''}`}>
        {loose.map((item, i) => (
          <button
            key={item.id}
            type="button"
            className={`sort__item ${picked === item.id ? 'is-picked' : ''}`}
            style={{ animationDelay: `${i * -0.7}s` }}
            disabled={phase !== 'running'}
            {...itemProps(item.id)}
          >
            <Icon name="fish" size={26} />
            <span className="sort__name">{item.label}</span>
            <span className="sort__detail">{item.detail}</span>
          </button>
        ))}
        {!loose.length && <span className="caption">All sorted.</span>}
      </div>

      <div className="sort__bins">
        {config.bins.map((bin) => (
          <button
            key={bin.id}
            type="button"
            className={`sort__bin ${picked ? 'is-target' : ''}`}
            disabled={phase !== 'running'}
            {...targetProps(place(bin.id))}
          >
            <span className="label">{bin.label}</span>
            <span className="sort__count">{config.items.filter((i) => placed[i.id] === bin.id).length}</span>
          </button>
        ))}
      </div>

      {phase === 'ready' ? (
        <PixelButton className="pbtn--block" onClick={() => setPhase('running')}>
          Start sorting
        </PixelButton>
      ) : (
        <button type="button" className="pbtn pbtn--ghost pbtn--block" onClick={() => finish()}>
          Done sorting
        </button>
      )}
    </div>
  );
}
