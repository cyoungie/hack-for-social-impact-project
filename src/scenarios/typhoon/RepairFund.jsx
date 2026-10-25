import { useMemo, useState } from 'react';
import { PixelButton } from '../../components/ui.jsx';
import { Icon } from '../../components/Icons.jsx';
import { usePick } from '../../components/usePick.js';
import { compareWith } from '../../data/scoring.js';
import { APPROACHES, COINS, runRule } from './rule.js';
import YearStrip from './YearStrip.jsx';


// Points for the plan you keep: how its year-5 bars compare to doing nothing.
function planPoints(result, flags) {
  const y5 = result.frames[4];
  const b5 = runRule(new Set(), { flags }).frames[4];
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
      setMsg(`${a.label} costs ${a.cost} ${a.cost === 1 ? 'share' : 'shares'} — you have ${left} left.`);
      return;
    }
    setMsg('');
    setFunded((f) => [...f, a.id]);
  };

  return (
    <>
      <div className="fund__tray">
        <span className="label">Recovery budget</span>
        <span className="fund__coins">
          {Array.from({ length: left }, (_, i) => (
            <button
              key={i}
              type="button"
              className={`coin ${picked ? 'is-picked' : ''}`}
              aria-label={`Budget share ${i + 1} of ${left} left`}
              {...itemProps('coin')}
            >
              <Icon name="coin" size={18} />
            </button>
          ))}
          {left === 0 && <span className="caption">All four shares spent.</span>}
        </span>
        <span className="caption">Drag a share onto a project — or click a share, then a project. Hover a project for its tradeoff.</span>
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
                <span className="approach__cost" aria-label={`Costs ${a.cost} ${a.cost === 1 ? 'share' : 'shares'}`}>
                  {Array.from({ length: a.cost }, (_, i) => (
                    <Icon key={i} name="coin" size={14} />
                  ))}
                </span>
                <span className="approach__label">{a.label}</span>
                <span className="approach__term">
                  <span className="label">Tradeoff</span> {a.tradeoff}
                </span>
              </button>
              {on && (
                <button type="button" className="approach__undo" onClick={() => setFunded((f) => f.filter((x) => x !== a.id))}>
                  Take the shares back
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

// The recovery budget (main decision): four shares, six projects, five years; optionally compare a second plan.
export default function RepairFund({ config, onComplete }) {
  const [plans, setPlans] = useState([]); // up to two arrays of approach ids
  const [allocating, setAllocating] = useState(true);
  const [played, setPlayed] = useState(0);
  const results = useMemo(() => plans.map((ids) => runRule(new Set(ids), { flags: config.flags })), [plans, config.flags]);

  const keep = (i) => {
    const r = results[i];
    const other = results[1 - i];
    onComplete({
      points: planPoints(r, config.flags),
      feedback: `${planName(plans[i])}. ${r.summary}`,
      verdict: 'ok',
      state: { plan: plans[i] },
      compare: other ? compareWith(planName(plans[1 - i]), planPoints(other, config.flags), other.summary) : undefined,
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
    // Compare: plan A stays on the left while you spend the shares again on the right.
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
