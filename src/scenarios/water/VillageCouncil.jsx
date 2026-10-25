import { useEffect, useState } from 'react';
import { PixelButton } from '../../components/ui.jsx';
import { addPoints } from '../../data/scoring.js';

// Village Council: pick three of eight cards; five members vote on each; 3 of 5 passes it.
const MEMBERS = [
  { id: 'health', label: 'Health' },
  { id: 'cost', label: 'Cost' },
  { id: 'development', label: 'Development' },
  { id: 'environment', label: 'Environment' },
  { id: 'tourism', label: 'Tourism' },
];
// Which members vote yes on each card (game design, not a claim about any real council).
export const CARDS = [
  { id: 'sewer', helpful: true, text: 'Connect homes over the aquifer to the sewer first', yes: ['health', 'environment', 'tourism'] },
  { id: 'leaks', helpful: true, text: 'Fund leak repairs', yes: ['health', 'cost', 'development', 'environment'] },
  { id: 'prove', helpful: true, text: 'Require new developments to prove their water supply and sewer connection', yes: ['health', 'environment', 'tourism'] },
  { id: 'wells', helpful: true, text: 'Protect the land around wells', yes: ['health', 'environment'] },
  { id: 'barrels', helpful: true, text: 'Offer rain barrels and conservation kits', yes: ['environment', 'tourism'] },
  { id: 'housing', helpful: false, text: 'Approve new housing without a sewer connection', yes: ['cost', 'development', 'tourism'] },
  { id: 'testing', helpful: false, text: 'Pause well testing to save money', yes: ['cost', 'development'] },
  { id: 'bigusers', helpful: false, text: 'Cut conservation rules for big water users', yes: ['cost', 'development', 'tourism'] },
];
const ORDER = ['housing', 'sewer', 'barrels', 'leaks', 'testing', 'prove', 'bigusers', 'wells'];
const STEP_MS = 900;
const reducedMotion = () => Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

export default function VillageCouncil({ config, onComplete }) {
  const [hand, setHand] = useState([]);
  const [revealed, setRevealed] = useState(-1);
  const byId = (id) => CARDS.find((c) => c.id === id);
  const presenting = revealed >= 0;

  const toggle = (id) => setHand((h) => (h.includes(id) ? h.filter((x) => x !== id) : h.length < 3 ? [...h, id] : h));

  useEffect(() => {
    if (!presenting) return undefined;
    if (revealed >= hand.length) {
      const passed = hand.map(byId).filter((c) => c.yes.length >= 3);
      const good = passed.filter((c) => c.helpful).length;
      const bad = passed.filter((c) => !c.helpful).length;
      const tier = good >= 3 ? config.tiers.three : good === 2 ? config.tiers.two : good === 1 ? config.tiers.one : config.tiers.none;
      let points = tier.points;
      for (let i = 0; i < bad; i += 1) points = addPoints(points, config.harmful.points);
      const t = setTimeout(
        () =>
          onComplete({
            ...tier,
            points,
            budget: (tier.budget || 0) + bad * config.harmful.budget,
            feedback: `${good} helpful ${good === 1 ? 'card' : 'cards'} passed${bad ? `, and ${bad} harmful ${bad === 1 ? 'card' : 'cards'} passed too. ${config.harmful.feedback}` : '.'} ${tier.feedback}`,
            verdict: good >= 3 && !bad ? 'correct' : good >= 1 && !bad ? 'ok' : 'wrong',
            state: { passed: passed.map((c) => c.id) },
          }),
        reducedMotion() ? 0 : 700,
      );
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setRevealed((n) => n + 1), reducedMotion() ? 0 : STEP_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed, presenting]);

  if (presenting) {
    return (
      <div className="prim">
        <ol className="council">
          {hand.map((id, i) => {
            const c = byId(id);
            const shown = i < revealed;
            const pass = c.yes.length >= 3;
            return (
              <li key={id} className={`council__card ${shown ? (pass ? 'is-pass' : 'is-fail') : ''}`}>
                <p className="council__text">{c.text}</p>
                <div className="council__votes">
                  {MEMBERS.map((m) => (
                    <span key={m.id} className={`council__vote ${shown ? (c.yes.includes(m.id) ? 'is-yes' : 'is-no') : ''}`}>
                      <span className="label">{m.label}</span>
                      {shown ? (c.yes.includes(m.id) ? 'Yes' : 'No') : '…'}
                    </span>
                  ))}
                </div>
                {shown && <span className="council__stamp">{pass ? `Passed ${c.yes.length}–${5 - c.yes.length}` : `Failed ${c.yes.length}–${5 - c.yes.length}`}</span>}
              </li>
            );
          })}
        </ol>
      </div>
    );
  }

  return (
    <div className="prim">
      <p className="caption">
        Five council members each care about something different: {MEMBERS.map((m) => m.label.toLowerCase()).join(', ')}. A card needs 3 of 5 votes to pass. Pick three to present.
      </p>
      <div className="council__hand">
        {ORDER.map((id) => {
          const c = byId(id);
          const on = hand.includes(id);
          return (
            <button key={id} type="button" className={`council__pick ${on ? 'is-on' : ''}`} aria-pressed={on} disabled={!on && hand.length >= 3} onClick={() => toggle(id)}>
              {c.text}
            </button>
          );
        })}
      </div>
      <PixelButton className="pbtn--block" disabled={hand.length < 3} onClick={() => setRevealed(0)}>
        Present {hand.length} / 3 cards
      </PixelButton>
    </div>
  );
}
