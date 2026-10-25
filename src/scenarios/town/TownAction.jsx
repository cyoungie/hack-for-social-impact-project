import { useState } from 'react';
import { PixelButton, SquareRadio } from '../../components/ui.jsx';
import { addPoints } from '../../data/scoring.js';
import { COMMUNITY_QUESTIONS, FILTER_PARTS, PEOPLE, QA } from './qa.js';

const PATHS = [
  {
    id: 'townhall',
    label: 'Organize a water filtration and pollution town hall',
    note: 'Helps both the people and the environment.',
  },
  {
    id: 'discuss',
    label: 'Have a discussion with the military and the industrial businesspeople, and ask why they continue needing these particular regions of land',
    note: '',
  },
  {
    id: 'filter',
    label: 'Work with the community to develop a water filtration system',
    note: '',
  },
];

const nameOf = (id, custom) => (id === 'custom' ? custom || 'Your guest' : PEOPLE.find((p) => p.id === id)?.label.replace(/^(My|The|A|A local) /, '') || 'The mayor');

function Reply({ who, a }) {
  return (
    <div className="reply" aria-live="polite">
      <p className="label">{who} answers</p>
      <p>“{a}”</p>
    </div>
  );
}

function Reflection({ value, onChange }) {
  return (
    <label className="field reflect">
      <span className="label">How would you describe what this answer taught you?</span>
      <textarea className="input" rows={3} value={value} onChange={(e) => onChange(e.target.value)} placeholder="In your own words" />
    </label>
  );
}

// Which of the community's options do you take, and then: who you invite, what you ask, what you learned.
export default function TownAction({ config, onComplete }) {
  const [path, setPath] = useState('');
  const [step, setStep] = useState('choose');
  const [invited, setInvited] = useState([]);
  const [custom, setCustom] = useState('');
  const [asker, setAsker] = useState('mayor');
  const [picked, setPicked] = useState(null); // { who, q, a }
  const [reflection, setReflection] = useState('');
  const [parts, setParts] = useState([]);

  const finish = (extra = {}) => {
    const r = config.results[path];
    let points = r.points;
    if (path === 'townhall' && invited.some((id) => ['mayor', 'factory', 'military'].includes(id))) points = addPoints(points, config.decisionMakerBonus);
    onComplete({
      ...r,
      points,
      feedback: r.feedback + (extra.feedback ? ` ${extra.feedback}` : ''),
      verdict: extra.verdict || 'correct',
      state: { path, invited, custom, question: picked?.q, reflection, parts },
    });
  };

  if (step === 'choose') {
    return (
      <div className="prim">
        <fieldset className="vote">
          <legend className="sr-only">Which of the following are ways the community could intervene here?</legend>
          <div className="vote__grid vote__grid--stack">
            {PATHS.map((p) => (
              <SquareRadio key={p.id} name="path" value={p.id} checked={path === p.id} onChange={setPath}>
                {p.label}
                {p.note && <span className="caption"> — {p.note}</span>}
              </SquareRadio>
            ))}
          </div>
        </fieldset>
        <PixelButton className="pbtn--block" disabled={!path} onClick={() => setStep(path === 'townhall' ? 'invite' : path === 'discuss' ? 'ask' : 'build')}>
          Recommend selection
        </PixelButton>
      </div>
    );
  }

  // ---- Town hall ----
  if (step === 'invite') {
    const toggle = (id) => setInvited((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
    return (
      <div className="prim">
        <p className="townhall__q">“Let’s go to a town hall! Who are you hoping to see and talk to there?”</p>
        <div className="invite">
          {PEOPLE.map((p) => (
            <button key={p.id} type="button" className={`council__pick ${invited.includes(p.id) ? 'is-on' : ''}`} aria-pressed={invited.includes(p.id)} onClick={() => toggle(p.id)}>
              {p.label}
            </button>
          ))}
        </div>
        <label className="field">
          <span className="label">Put ’em in coach! Who else would you like to see?</span>
          <input className="input" value={custom} maxLength={60} onChange={(e) => setCustom(e.target.value)} placeholder="Describe who — e.g. the lady who runs the corner store" />
        </label>
        <PixelButton className="pbtn--block" disabled={!invited.length && !custom.trim()} onClick={() => setStep('ask')}>
          Go to the town hall
        </PixelButton>
      </div>
    );
  }

  if (step === 'ask') {
    const people = path === 'discuss' ? ['military', 'factory'] : ['mayor', ...invited.filter((id) => id !== 'mayor'), ...(custom.trim() ? ['custom'] : [])];
    const who = people.includes(asker) ? asker : people[0];
    return (
      <div className="prim">
        <p className="townhall__q">
          {path === 'discuss'
            ? 'You sit down with a U.S. military representative and the local factory manager. What do you ask, and whom?'
            : '“The mayor addresses the attendees and asks for questions from the audience.” What question are you asking, and to whom?'}
        </p>
        <div className="riskmap__toggles">
          {people.map((id) => (
            <button key={id} type="button" className={`timechip ${who === id ? 'is-on' : ''}`} aria-pressed={who === id} onClick={() => { setAsker(id); setPicked(null); }}>
              {id === 'custom' ? custom : PEOPLE.find((p) => p.id === id).label}
            </button>
          ))}
        </div>
        <div className="questions">
          {QA[who].map((x) => (
            <button key={x.q} type="button" className={`question ${picked?.q === x.q ? 'is-on' : ''}`} onClick={() => setPicked({ who, ...x })}>
              {x.q}
            </button>
          ))}
        </div>
        {path === 'townhall' && (
          <>
            <p className="label">Questions others have written</p>
            <div className="questions">
              {COMMUNITY_QUESTIONS.map((x) => (
                <button key={x.q} type="button" className={`question question--others ${picked?.q === x.q ? 'is-on' : ''}`} onClick={() => setPicked({ who: 'mayor', ...x })}>
                  {x.q}
                </button>
              ))}
            </div>
          </>
        )}
        {picked && <Reply who={nameOf(picked.who, custom)} a={picked.a} />}
        {picked && <Reflection value={reflection} onChange={setReflection} />}
        <PixelButton className="pbtn--block" disabled={!picked || reflection.trim().length < 3} onClick={() => finish()}>
          Save what you learned
        </PixelButton>
      </div>
    );
  }

  // ---- Filtration system ----
  const toggle = (id) => setParts((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const good = FILTER_PARTS.filter((p) => p.good).map((p) => p.id);
  const right = parts.filter((id) => good.includes(id)).length;
  const wrong = parts.length - right;
  return (
    <div className="prim">
      <p className="townhall__q">Pick the parts of the community’s filtration plan.</p>
      <div className="council__hand">
        {FILTER_PARTS.map((p) => (
          <button key={p.id} type="button" className={`council__pick ${parts.includes(p.id) ? 'is-on' : ''}`} aria-pressed={parts.includes(p.id)} onClick={() => toggle(p.id)}>
            {p.label}
          </button>
        ))}
      </div>
      <PixelButton
        className="pbtn--block"
        disabled={!parts.length}
        onClick={() =>
          finish({
            verdict: right === good.length && !wrong ? 'correct' : right >= 2 ? 'ok' : 'wrong',
            feedback: `${right} of ${good.length} key parts in your plan${wrong ? `, plus ${wrong} that won't hold up` : ''}.`,
          })
        }
      >
        Recommend plan
      </PixelButton>
    </div>
  );
}
