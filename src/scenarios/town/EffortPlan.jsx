import { useMemo, useState } from 'react';
import { PixelButton } from '../../components/ui.jsx';
import { Icon } from '../../components/Icons.jsx';
import { usePick } from '../../components/usePick.js';
import { compareWith } from '../../data/scoring.js';
import YearStrip from '../typhoon/YearStrip.jsx';
import TownMap from './TownMap.jsx';
import { EFFORTS, TOKENS, planName, runTown } from './townRule.js';

function planPoints(result, start) {
  const y5 = result.frames[4];
  const none = runTown(new Set(), start).frames[4];
  return { water: Math.round((y5.leaf - none.leaf) / 5), people: Math.round((y5.people - none.people) / 5) };
}

function Tray({ onRun }) {
  const [chosen, setChosen] = useState([]);
  const [msg, setMsg] = useState('');
  const { picked, itemProps, targetProps } = usePick();
  const left = TOKENS - chosen.reduce((n, id) => n + EFFORTS.find((e) => e.id === id).cost, 0);

  const add = (e) => () => {
    if (chosen.includes(e.id)) return;
    if (e.cost > left) {
      setMsg(`${e.label.split(' (')[0]} takes ${e.cost} tokens — you have ${left} left.`);
      return;
    }
    setMsg('');
    setChosen((c) => [...c, e.id]);
  };

  return (
    <>
      <div className="fund__tray">
        <span className="label">Effort tokens</span>
        <span className="fund__coins">
          {Array.from({ length: left }, (_, i) => (
            <button key={i} type="button" className={`coin ${picked ? 'is-picked' : ''}`} aria-label={`Effort token ${i + 1} of ${left} left`} {...itemProps('token')}>
              <Icon name="people" size={16} />
            </button>
          ))}
          {left === 0 && <span className="caption">All three tokens placed.</span>}
        </span>
        <span className="caption">Drag a token onto an approach — or click a token, then an approach. Hover an approach for its tradeoff.</span>
      </div>
      {msg && (
        <p className="fund__msg" role="status">
          {msg}
        </p>
      )}
      <ul className="fund__list">
        {EFFORTS.map((e) => {
          const on = chosen.includes(e.id);
          return (
            <li key={e.id} className={`approach ${on ? 'is-on' : ''}`}>
              <button type="button" className={`approach__main ${picked && !on ? 'is-target' : ''}`} disabled={on} {...targetProps(add(e))}>
                <span className="approach__cost" aria-label={`Takes ${e.cost} ${e.cost === 1 ? 'token' : 'tokens'}`}>
                  {Array.from({ length: e.cost }, (_, i) => (
                    <Icon key={i} name="people" size={14} />
                  ))}
                </span>
                <span className="approach__label">{e.label}</span>
                <span className="approach__term">
                  <span className="label">Tradeoff</span> {e.tradeoff}
                </span>
              </button>
              {on && (
                <button type="button" className="approach__undo" onClick={() => setChosen((c) => c.filter((x) => x !== e.id))}>
                  Take the tokens back
                </button>
              )}
            </li>
          );
        })}
      </ul>
      <PixelButton className="pbtn--block" disabled={!chosen.length} onClick={() => onRun(chosen)}>
        Recommend plan
      </PixelButton>
    </>
  );
}

// Where to put the effort (main decision): three tokens, five years, optionally a second plan beside the first.
export default function EffortPlan({ config, onComplete }) {
  const [plans, setPlans] = useState([]);
  const [planning, setPlanning] = useState(true);
  const [played, setPlayed] = useState(0);
  const results = useMemo(() => plans.map((ids) => runTown(new Set(ids), config.start)), [plans, config.start]);

  const keep = (i) => {
    const r = results[i];
    const other = results[1 - i];
    onComplete({
      points: planPoints(r, config.start),
      feedback: `${planName(plans[i])}. ${r.summary}`,
      verdict: r.frames[4].wellOpen ? 'correct' : 'ok',
      state: { plan: plans[i], wellOpen: r.frames[4].wellOpen },
      compare: other ? compareWith(planName(plans[1 - i]), planPoints(other, config.start), other.summary) : undefined,
    });
  };

  const strip = (i, instant) => (
    <YearStrip
      key={i}
      title={`Plan ${i ? 'B' : 'A'} · ${planName(plans[i])}`}
      result={results[i]}
      instant={instant}
      onDone={() => setPlayed((n) => Math.max(n, i + 1))}
      renderMap={(f) => <TownMap frame={f} label={`Year ${f.year}`} />}
    />
  );
  const tray = (
    <Tray
      onRun={(ids) => {
        setPlans((p) => [...p, ids]);
        setPlanning(false);
      }}
    />
  );

  if (planning && plans.length === 1) {
    return (
      <div className="prim">
        <div className="fund__strips is-compare">
          {strip(0, true)}
          <div className="prim">
            <p className="label">Plan B · same events</p>
            {tray}
          </div>
        </div>
      </div>
    );
  }
  if (planning) return <div className="prim">{tray}</div>;

  const done = played >= results.length;
  return (
    <div className="prim">
      <div className={`fund__strips ${results.length === 2 ? 'is-compare' : ''}`}>{results.map((_, i) => strip(i, results.length === 2 && i === 0))}</div>
      {done && (
        <div className="fund__actions">
          {results.length === 1 ? (
            <>
              <PixelButton onClick={() => keep(0)}>Keep this plan</PixelButton>
              <button type="button" className="pbtn pbtn--ghost" onClick={() => setPlanning(true)}>
                Try another plan
              </button>
            </>
          ) : (
            <>
              <PixelButton onClick={() => keep(0)}>Keep plan A</PixelButton>
              <PixelButton onClick={() => keep(1)}>Keep plan B</PixelButton>
            </>
          )}
        </div>
      )}
    </div>
  );
}
