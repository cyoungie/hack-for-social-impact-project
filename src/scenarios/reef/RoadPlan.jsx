import { useMemo, useRef, useState } from 'react';
import { PixelButton } from '../../components/ui.jsx';
import { Icon } from '../../components/Icons.jsx';
import { usePick } from '../../components/usePick.js';
import { compareWith } from '../../data/scoring.js';
import YearStrip from '../typhoon/YearStrip.jsx';
import ReefMap, { CUT_BOX, ROUTE_LINES } from './ReefMap.jsx';
import { CONTROLS, ROUTES, runReef } from './rule.js';

const WORST = runReef({ route: 'straight', controls: new Set() });

// Points for the plan you keep: its year-5 bars against the cheapest road with no controls.
function planPoints(result) {
  const y5 = result.frames[4];
  const w5 = WORST.frames[4];
  return { veg: Math.round((y5.leaf - w5.leaf) / 5), people: Math.round((y5.people - w5.people) / 5) };
}

const planName = (plan) => {
  const r = ROUTES.find((x) => x.id === plan.route).label;
  const c = CONTROLS.filter((x) => plan.controls.has(x.id)).map((x) => x.label.toLowerCase());
  return c.length ? `${r} + ${c.join(' + ')}` : `${r}, no controls`;
};

// Which route a dragged line follows: the one whose points sit closest to the trail.
function nearestRoute(trail) {
  let best = null;
  for (const [id, line] of Object.entries(ROUTE_LINES)) {
    const samples = [];
    for (let i = 1; i < line.length; i += 1) {
      for (let k = 0; k <= 10; k += 1) {
        const t = k / 10;
        samples.push([line[i - 1][0] + (line[i][0] - line[i - 1][0]) * t, line[i - 1][1] + (line[i][1] - line[i - 1][1]) * t]);
      }
    }
    const d = trail.reduce((sum, p) => sum + Math.min(...samples.map((s) => Math.hypot(s[0] - p[0], s[1] - p[1]))), 0) / trail.length;
    if (!best || d < best.d) best = { id, d };
  }
  return best.id;
}

function Effects({ item }) {
  return (
    <span className="approach__icons">
      <span title="Leaf — mud and reef">
        <Icon name="grass" size={14} /> {item.leaf}
      </span>
      <span title="People — jobs, road access">
        <Icon name="people" size={14} /> {item.people}
      </span>
      <span title="Coin — cost and schedule">
        <Icon name="coin" size={14} /> {item.coin}
      </span>
    </span>
  );
}

function Planner({ onRun }) {
  const [route, setRoute] = useState(null);
  const [controls, setControls] = useState(new Set());
  const [trail, setTrail] = useState([]);
  const drawing = useRef(false);
  const mapRef = useRef(null);
  const { picked, itemProps, targetProps } = usePick();

  const toMap = (e) => {
    const r = mapRef.current.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * 400, ((e.clientY - r.top) / r.height) * 300];
  };
  const onDown = (e) => {
    if (picked) return;
    drawing.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    setTrail([toMap(e)]);
  };
  const onMove = (e) => {
    if (drawing.current) setTrail((t) => [...t, toMap(e)]);
  };
  const onUp = () => {
    if (!drawing.current) return;
    drawing.current = false;
    if (trail.length > 4) setRoute(nearestRoute(trail));
    setTrail([]);
  };

  const add = (id) => setControls((c) => new Set([...c, id]));
  const remove = (id) =>
    setControls((c) => {
      const n = new Set(c);
      n.delete(id);
      return n;
    });

  const chosen = ROUTES.find((r) => r.id === route);

  return (
    <>
      <div className="roadplan">
        <div className="roadplan__map" ref={mapRef} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
          <ReefMap route={route} controls={controls} showRoutes label="Hill map with three possible road routes" />
          {trail.length > 1 && (
            <svg className="roadplan__trail" viewBox="0 0 400 300" aria-hidden="true">
              <polyline points={trail.map((p) => p.join(',')).join(' ')} />
            </svg>
          )}
          {route && (
            <button
              type="button"
              className={`roadplan__cut ${picked ? 'is-target' : ''}`}
              style={{ left: `${(CUT_BOX.x / 400) * 100}%`, top: `${(CUT_BOX.y / 300) * 100}%`, width: `${(CUT_BOX.w / 400) * 100}%`, height: `${(CUT_BOX.h / 300) * 100}%` }}
              aria-label="The cut — drop a control here"
              {...targetProps(add)}
            />
          )}
        </div>

        <div className="roadplan__side">
          <p className="label">1 · Route — drag the road line up the hill, or pick</p>
          <div className="roadplan__routes">
            {ROUTES.map((r) => (
              <button key={r.id} type="button" className={`approach__main ${route === r.id ? 'is-picked-route' : ''}`} aria-pressed={route === r.id} onClick={() => setRoute(r.id)}>
                <span className="approach__label">{r.label}</span>
                <span className="caption">{r.note}</span>
                {route === r.id && <Effects item={r} />}
              </button>
            ))}
          </div>

          <p className="label">2 · Controls — drag onto the cut, or click one then the cut</p>
          <div className="roadplan__controls">
            {CONTROLS.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`token ${picked === c.id ? 'is-picked' : ''} ${controls.has(c.id) ? 'is-placed' : ''}`}
                disabled={!route || controls.has(c.id)}
                {...itemProps(c.id)}
              >
                {c.label}
              </button>
            ))}
            <button type="button" className={`timechip ${route && controls.size === 0 ? 'is-on' : ''}`} disabled={!route} onClick={() => setControls(new Set())}>
              Leave it as it is
            </button>
          </div>
          {controls.size > 0 && (
            <ul className="roadplan__chosen">
              {CONTROLS.filter((c) => controls.has(c.id)).map((c) => (
                <li key={c.id}>
                  <span className="approach__label">{c.label}</span>
                  <Effects item={c} />
                  <button type="button" className="approach__undo" onClick={() => remove(c.id)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
          {chosen && <p className="caption">Route: {chosen.label}.</p>}
        </div>
      </div>

      <PixelButton className="pbtn--block" disabled={!route} onClick={() => onRun({ route, controls })}>
        Recommend plan
      </PixelButton>
    </>
  );
}

// The one meaningful choice: route and controls, five years, and a second plan to compare.
export default function RoadPlan({ config, onComplete }) {
  const [plans, setPlans] = useState([]);
  const [planning, setPlanning] = useState(true);
  const [played, setPlayed] = useState(0);
  const results = useMemo(() => plans.map((p) => runReef(p, config.extras)), [plans, config.extras]);

  const keep = (i) => {
    const r = results[i];
    const other = results[1 - i];
    onComplete({
      points: planPoints(r),
      feedback: `${planName(plans[i])}. ${r.summary}`,
      verdict: r.finalReef >= 0.5 ? 'correct' : r.finalReef >= 0.2 ? 'ok' : 'wrong',
      state: { route: plans[i].route, controls: [...plans[i].controls], finalReef: r.finalReef },
      compare: other ? compareWith(planName(plans[1 - i]), planPoints(other), other.summary) : undefined,
    });
  };

  const strip = (i, instant) => (
    <YearStrip
      key={i}
      title={`Plan ${i ? 'B' : 'A'} · ${planName(plans[i])}`}
      result={results[i]}
      instant={instant}
      onDone={() => setPlayed((n) => Math.max(n, i + 1))}
      renderMap={(f) => <ReefMap route={plans[i].route} controls={plans[i].controls} frame={f} drain={config.extras?.drain} label={`Year ${f.year} map`} />}
    />
  );

  const planner = (
    <Planner
      onRun={(p) => {
        setPlans((ps) => [...ps, p]);
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
            <p className="label">Plan B · same storms, same reef</p>
            {planner}
          </div>
        </div>
      </div>
    );
  }
  if (planning) return <div className="prim">{planner}</div>;

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
