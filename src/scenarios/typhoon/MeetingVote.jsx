import { useState } from 'react';
import { PixelButton, SquareRadio } from '../../components/ui.jsx';
import { usePick } from '../../components/usePick.js';
import VillageMap from './VillageMap.jsx';
import { DAMAGED } from './rule.js';

const ATTEND = [
  { id: 'speak', label: 'Go and give public comment' },
  { id: 'listen', label: 'Go and listen' },
  { id: 'skip', label: 'Skip it' },
];

const SPOTS = [
  { id: 'same', label: 'Rebuild on the same slab', note: '' },
  { id: 'stilts', label: 'Rebuild raised on posts', note: 'Costs more.' },
  { id: 'uphill', label: 'Move to the village lot by the school', note: 'The grant covers it, but the family moves farther from the river and their boats.' },
];

// Build back better: go to the rebuild meeting, then vote where the five damaged houses go.
export default function MeetingVote({ config, onComplete }) {
  const [attend, setAttend] = useState('');
  const [step, setStep] = useState('attend');
  const [vote, setVote] = useState({});
  const { picked, itemProps, targetProps } = usePick();

  const finish = (attendId, v) => {
    const allOut = DAMAGED.every((h) => v[h] && v[h] !== 'same');
    const moved = attendId === 'speak' && allOut;
    const r = attendId === 'skip' ? config.skip : moved ? config.speakOut : config.listen;
    // Without public comment that moves the houses out, most grants go to same-spot rebuilds.
    const sameSlabs = Object.fromEntries(DAMAGED.map((h) => [h, 'same']));
    onComplete({
      points: r.points,
      feedback: r.feedback,
      verdict: moved ? 'correct' : attendId === 'listen' ? 'ok' : 'wrong',
      state: { attend: attendId, vote: moved ? v : sameSlabs },
      setFlags: { bank_planted: moved },
    });
  };

  if (step === 'attend') {
    return (
      <div className="prim">
        <fieldset className="vote">
          <legend className="sr-only">Do you go?</legend>
          <div className="vote__grid vote__grid--stack">
            {ATTEND.map((o) => (
              <SquareRadio key={o.id} name="attend" value={o.id} checked={attend === o.id} onChange={setAttend}>
                {o.label}
              </SquareRadio>
            ))}
          </div>
        </fieldset>
        <PixelButton
          className="pbtn--block"
          disabled={!attend}
          onClick={() => (attend === 'skip' ? finish('skip', {}) : setStep('vote'))}
        >
          Recommend selection
        </PixelButton>
      </div>
    );
  }

  const placed = Object.keys(vote).length;
  return (
    <div className="prim">
      <p className="caption">The map, with the damaged houses marked. Drag a recommendation onto each house.</p>
      <div className="meeting">
        <VillageMap layers={{ flood: true }} vote={vote} label="Village map showing where each damaged house goes" />
        <div className="meeting__side">
          <div className="meeting__houses">
            {DAMAGED.map((h, i) => (
              <button
                key={h}
                type="button"
                className={`token ${picked === h ? 'is-picked' : ''} ${vote[h] ? 'is-placed' : ''}`}
                {...itemProps(h)}
              >
                House {i + 1}
                {vote[h] && <span className="meeting__where"> · {SPOTS.find((s) => s.id === vote[h]).label}</span>}
              </button>
            ))}
          </div>
          <div className="meeting__spots">
            {SPOTS.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`meeting__spot ${picked ? 'is-target' : ''}`}
                {...targetProps((h) => setVote((v) => ({ ...v, [h]: s.id })))}
              >
                <span className="label">{s.label}</span>
                {s.note && <span className="caption">{s.note}</span>}
                <span className="meeting__count">{DAMAGED.filter((h) => vote[h] === s.id).length}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <PixelButton className="pbtn--block" disabled={placed < DAMAGED.length} onClick={() => finish(attend, vote)}>
        Submit comment
      </PixelButton>
    </div>
  );
}
