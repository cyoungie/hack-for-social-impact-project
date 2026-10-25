import { useMemo, useState } from 'react';
import { PixelButton } from '../../components/ui.jsx';
import { Icon } from '../../components/Icons.jsx';
import { usePick } from '../../components/usePick.js';
import { compareWith } from '../../data/scoring.js';
import { APPROACHES, COINS, runRule } from './rule.js';
import YearStrip from './YearStrip.jsx';

const BASELINE = runRule(new Set());

// Points for the plan you keep: how its year-5 bars compare to doing nothing.
function planPoints(result) {
  const y5 = result.frames[4];
  const b5 = BASELINE.frames[4];
  return { veg: Math.round((y5.leaf - b5.leaf) / 4), people: Math.round((y5.people - b5.people) / 4) };
}

const planName = (ids) => ids.map((id) => APPROACHES.find((a) => a.id === id).label).join(' + ') || 'Nothing funded';

function Allocator({ onRun }) {
  const [funded, setFunded] = useState([]);
  const [msg, setMsg] = useState('');
  const { picked, itemProps, targetProps } = usePick();
  const spent = funded.reduce((n, id) => n + APPROACHES.find((a) => a.id === id).cost, 0);
  const left = COINS - spent;

  const fund = (a) => () => {
    if (funded.includes(a.id)) return;
    if (a.cost > left) {
      setMsg(`${a.label} costs ${a.cost} coins — you have ${left} left.`);
      return;
    }
    setMsg('');
    setFunded((f) => [...f, a.id]);
  };

  return (
    <>
      <div className="fund__tray">
        <span className="label">Repair fund</span>
        <span className="fund__coins">
          {Array.from({ length: left }, (_, i) => (
            <button
              key={i}
              type="button"
              className={`coin ${picked ? 'is-picked' : ''}`}
              aria-label={`Coin ${i + 1} of ${left} left`}
              {...itemProps('coin')}
            >
              <Icon name="coin" size={18} />
            </button>
          ))}
          {left === 0 && <span className="caption">All four coins spent.</span>}
        </span>
        <span className="caption">Drag a coin onto an approach — or click a coin, then an approach.</span>
      </div>
      {msg && (
        <p className="fund__msg" role="status">
          {msg}
        </p>
      )}

      <ul className="fund__list">
        {APPROACHES.map((a) => {
          const on = funded.includes(a.id);
          return (
            <li key={a.id} className={`approach ${on ? 'is-on' : ''}`}>
              <button type="button" className={`approach__main ${picked && !on ? 'is-target' : ''}`} disabled={on} {...targetProps(fund(a))}>
                <span className="approach__cost" aria-label={`Costs ${a.cost} ${a.cost === 1 ? 'coin' : 'coins'}`}>
                  {Array.from({ length: a.cost }, (_, i) => (
                    <Icon key={i} name="coin" size={14} />
                  ))}
                </span>
                <span className="approach__label">{a.label}</span>
                <span className="approach__term">
                  <span className="label">In the rule</span> {a.term}
                </span>
                <span className="approach__icons">
                  <span title="Leaf — soil, water, vegetation">
                    <Icon name="grass" size={14} /> {a.leaf}
                  </span>
                  <span title="People — safety and wellbeing">
                    <Icon name="people" size={14} /> {a.people}
                  </span>
                  <span title="Coin — jobs and money">
                    <Icon name="coin" size={14} /> {a.coin}
                  </span>
                </span>
              </button>
              {on && (
                <button type="button" className="approach__undo" onClick={() => setFunded((f) => f.filter((x) => x !== a.id))}>
                  Take coins back
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <PixelButton className="pbtn--block" disabled={funded.length === 0} onClick={() => onRun(funded)}>
        Recommend plan
      </PixelButton>
    </>
  );
}

// Invest in reducing the risk: spend four coins, watch five years, optionally compare a second plan.
export default function RepairFund({ onComplete }) {
  const [plans, setPlans] = useState([]); // up to two arrays of approach ids
  const [allocating, setAllocating] = useState(true);
  const [played, setPlayed] = useState(0);
  const results = useMemo(() => plans.map((ids) => runRule(new Set(ids))), [plans]);

  const keep = (i) => {
    const r = results[i];
    const other = results[1 - i];
    onComplete({
      points: planPoints(r),
      feedback: `${planName(plans[i])}. ${r.summary}`,
      verdict: 'ok',
      state: { plan: plans[i] },
      compare: other ? compareWith(planName(plans[1 - i]), planPoints(other), other.summary) : undefined,
    });
  };

  const allocator = (
    <Allocator
      onRun={(ids) => {
        setPlans((p) => [...p, ids]);
        setAllocating(false);
      }}
    />
  );

  if (allocating && plans.length === 1) {
    // Compare: plan A stays on the left while you spend the coins again on the right.
    return (
      <div className="prim">
        <div className="fund__strips is-compare">
          <YearStrip title={`Plan A · ${planName(plans[0])}`} result={results[0]} plan={new Set(plans[0])} instant />
          <div className="prim">
            <p className="label">Plan B · same map, same storms</p>
            {allocator}
          </div>
        </div>
      </div>
    );
  }

  if (allocating) return <div className="prim">{allocator}</div>;

  const done = played >= results.length;
  return (
    <div className="prim">
      <div className={`fund__strips ${results.length === 2 ? 'is-compare' : ''}`}>
        {results.map((r, i) => (
          <YearStrip
            key={i}
            title={`Plan ${i ? 'B' : 'A'} · ${planName(plans[i])}`}
            result={r}
            plan={new Set(plans[i])}
            instant={results.length === 2 && i === 0}
            onDone={() => setPlayed((n) => Math.max(n, i + 1))}
          />
        ))}
      </div>
      {done && (
        <div className="fund__actions">
          {results.length === 1 ? (
            <>
              <PixelButton onClick={() => keep(0)}>Keep this plan</PixelButton>
              <button type="button" className="pbtn pbtn--ghost" onClick={() => setAllocating(true)}>
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
