import { useState } from 'react';
import { PixelButton } from '../../components/ui.jsx';
import { usePick } from '../../components/usePick.js';
import { DEFLECT, INVITES, QUESTIONS, REFLECTIONS } from './qa.js';

const labelOf = (id) => INVITES.find((p) => p.id === id).label;

// The town hall: invite three people, ask one question of one person, then note what you learned.
export default function TownHall({ config, onComplete }) {
  const [step, setStep] = useState('invite');
  const [invited, setInvited] = useState([]);
  const [asked, setAsked] = useState(null); // { q, to }
  const [reflection, setReflection] = useState('');
  const { picked, itemProps, targetProps } = usePick();

  const finish = () => {
    const q = QUESTIONS.find((x) => x.id === asked.q);
    const has = (id) => invited.includes(id);
    const sourceOrData = q.topic === 'source' || q.topic === 'data';
    const onlyFriends = invited.every((id) => id === 'friend' || id === 'teacher');
    let key;
    if (has('mayor') && (has('plant') || has('base')) && (has('nonprofit') || has('nurse')) && sourceOrData) key = 'room';
    else if (onlyFriends) key = 'friends';
    else key = 'again';
    const r = config.results[key];
    onComplete({
      ...r,
      verdict: key === 'room' ? 'correct' : 'wrong',
      state: { invited, question: q.id, to: asked.to, reflection },
    });
  };

  if (step === 'invite') {
    const toggle = (id) => setInvited((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length < 3 ? [...s, id] : s));
    return (
      <div className="prim">
        <p className="townhall__q">Who do you want in the room? Pick up to three invitation cards.</p>
        <div className="council__hand">
          {INVITES.map((p) => (
            <button key={p.id} type="button" className={`council__pick ${invited.includes(p.id) ? 'is-on' : ''}`} aria-pressed={invited.includes(p.id)} disabled={!invited.includes(p.id) && invited.length >= 3} onClick={() => toggle(p.id)}>
              <span className="approach__label">{p.label}</span>
              <span className="caption"> {p.brings}</span>
            </button>
          ))}
        </div>
        <PixelButton className="pbtn--block" disabled={!invited.length} onClick={() => setStep('ask')}>
          Send the invitations ({invited.length} / 3)
        </PixelButton>
      </div>
    );
  }

  const q = asked && QUESTIONS.find((x) => x.id === asked.q);
  const answer = q && (q.holders.includes(asked.to) ? q.answer : DEFLECT[asked.to]);
  const room = ['mayor', ...invited.filter((id) => id !== 'mayor')];

  return (
    <div className="prim">
      <p className="townhall__q">“The mayor opens the floor for questions.” What do you ask, and who do you ask?</p>
      {!asked && (
        <>
          <div className="questions">
            {QUESTIONS.map((x) => (
              <button key={x.id} type="button" className={`question ${picked === x.id ? 'is-on' : ''}`} {...itemProps(x.id)}>
                {x.text}
              </button>
            ))}
          </div>
          <p className="label">The room · drag your question to a person, or click a question, then a person</p>
          <div className="riskmap__toggles">
            {room.map((id) => (
              <button key={id} type="button" className={`timechip ${picked ? 'is-target' : ''}`} {...targetProps((qid) => setAsked({ q: qid, to: id }))}>
                {labelOf(id)}
              </button>
            ))}
          </div>
        </>
      )}
      {asked && (
        <>
          <p className="question is-on">{q.text}</p>
          <div className="reply" aria-live="polite">
            <p className="label">{labelOf(asked.to)} answers</p>
            <p>“{answer}”</p>
          </div>
          <p className="label">For your notes</p>
          <div className="riskmap__toggles">
            {REFLECTIONS.map((r) => (
              <button key={r.id} type="button" className={`timechip ${reflection === r.id ? 'is-on' : ''}`} aria-pressed={reflection === r.id} onClick={() => setReflection(r.id)}>
                {r.label}
              </button>
            ))}
          </div>
          <PixelButton className="pbtn--block" disabled={!reflection} onClick={finish}>
            Done
          </PixelButton>
        </>
      )}
    </div>
  );
}
