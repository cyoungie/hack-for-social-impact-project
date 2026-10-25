import { useEffect, useMemo, useRef, useState } from 'react';
import { PixelButton } from '../../components/ui.jsx';
import YearStrip from '../typhoon/YearStrip.jsx';
import { BRACKISH, CONSERVE, DEMAND, DRY, MONTHS, SAFE, planName, runLensYears, simulate, tierOf } from './lensRule.js';

const STEP_MS = 300;
const reducedMotion = () => Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

function Cutaway({ month, secondWell }) {
  const lens = month?.lens ?? 60;
  const chloride = month?.chloride ?? 30;
  const lensTop = 120;
  const lensBottom = lensTop + 40 + lens * 1.1;
  const cone = Math.max(0, chloride - 30) * 1.6;
  const wells = secondWell ? [150, 230] : [230];
  return (
    <svg className="lens-cut" viewBox="0 0 400 260" role="img" aria-label={`Cutaway: lens ${Math.round(lens)} thick, chloride ${Math.round(chloride)}`}>
      <rect x="0" y="0" width="400" height="60" className="lc-sky" />
      <rect x="0" y="60" width="400" height="200" className="lc-limestone" />
      {[90, 150, 230, 300, 350].map((x) => (
        <rect key={x} x={x} y={80 + (x % 40)} width="6" height="6" className="lc-pore" />
      ))}
      <rect x="0" y="40" width="400" height="22" className="lc-plateau" />
      <path d={`M0 ${lensTop} Q 200 ${lensTop - 14} 400 ${lensTop} L400 ${lensBottom} Q 200 ${lensBottom + 26} 0 ${lensBottom} Z`} className="lc-lens" />
      <rect x="0" y={lensBottom} width="400" height={260 - lensBottom} className="lc-sea" />
      <text x="10" y={lensTop + 18} className="lc-txt">FRESHWATER LENS</text>
      <text x="10" y="252" className="lc-txt lc-txt--light">SEAWATER</text>
      {wells.map((x) => (
        <g key={x}>
          <rect x={x - 12} y="22" width="24" height="20" className="lc-house" />
          <rect x={x - 3} y="42" width="6" height={lensTop + 30 - 42} className="lc-pipe" />
          <path d={`M${x - 30} ${lensBottom} L${x} ${Math.max(lensTop + 34, lensBottom - cone / wells.length)} L${x + 30} ${lensBottom} Z`} className="lc-cone" />
        </g>
      ))}
      <text x="214" y="18" className="lc-txt">VILLAGE WELL{secondWell ? 'S' : ''}</text>
    </svg>
  );
}

export function LensGauge({ month }) {
  const chloride = month?.chloride ?? 30;
  const lens = month?.lens ?? 60;
  return (
    <div className="lens-gauge">
      <span className="label">Aquifer lens</span>
      <div className="lens-gauge__row">
        <span className="caption">Thickness</span>
        <span className="ybar__track">
          <span className="ybar__fill" style={{ width: `${lens}%`, background: 'var(--water)' }} />
        </span>
      </div>
      <div className="lens-gauge__row">
        <span className="caption">Chloride</span>
        <span className="ybar__track lens-gauge__salt">
          <span className="lens-gauge__safe" style={{ width: `${SAFE}%` }} />
          <span className="ybar__fill" style={{ width: `${chloride}%`, background: chloride >= BRACKISH ? 'var(--danger)' : chloride >= SAFE ? 'var(--warning)' : 'var(--veg)' }} />
        </span>
      </div>
    </div>
  );
}

function MonthStrip({ months, shown }) {
  return (
    <div className="lenskeeper__months" aria-live="polite">
      {MONTHS.map((name, i) => {
        const m = months && i <= shown ? months[i] : null;
        return (
          <span
            key={name}
            className={`lk-month ${DRY.has(i) ? 'is-dry' : 'is-wet'} ${m ? (m.chloride >= BRACKISH ? 'is-bad' : m.chloride >= SAFE ? 'is-warn' : 'is-ok') : ''} ${i === shown ? 'is-now' : ''}`}
          >
            {name}
          </span>
        );
      })}
    </div>
  );
}

// One year's settings, run month by month.
function YearRunner({ onDone, label }) {
  const [dry, setDry] = useState(DEMAND.dry);
  const [wet, setWet] = useState(DEMAND.wet);
  const [conserve, setConserve] = useState(false);
  const [secondWell, setSecondWell] = useState(false);
  const [shown, setShown] = useState(-1);
  const runRef = useRef(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  const dryMin = Math.ceil(DEMAND.dry * (conserve ? CONSERVE : 1));
  const wetMin = Math.ceil(DEMAND.wet * (conserve ? CONSERVE : 1));
  // The village must get enough water every month: pumping can't drop below demand.
  useEffect(() => {
    setDry((v) => Math.max(v, dryMin));
    setWet((v) => Math.max(v, wetMin));
  }, [dryMin, wetMin]);

  useEffect(() => {
    if (shown < 0 || shown >= 11) {
      if (shown >= 11) doneRef.current({ plan: runRef.current.plan, months: runRef.current.months });
      return undefined;
    }
    const t = setTimeout(() => setShown((n) => n + 1), STEP_MS);
    return () => clearTimeout(t);
  }, [shown]);

  const run = () => {
    const plan = { dry, wet, conserve, secondWell };
    runRef.current = { plan, months: simulate(plan) };
    setShown(reducedMotion() ? 11 : 0);
  };
  const running = shown >= 0;
  const month = running ? runRef.current.months[shown] : null;

  return (
    <div className="lenskeeper">
      <div>
        {label && <p className="label">{label}</p>}
        <Cutaway month={month} secondWell={secondWell} />
        <MonthStrip months={running ? runRef.current.months : null} shown={shown} />
      </div>
      <div className="lenskeeper__side">
        <LensGauge month={month} />
        <label className="lk-slider">
          <span className="label">Dry season pumping (Jan–Jun) · {dry}</span>
          <input type="range" min={dryMin} max={100} value={dry} disabled={running} onChange={(e) => setDry(Number(e.target.value))} />
          <span className="caption">Village needs {dryMin} a month.</span>
        </label>
        <label className="lk-slider">
          <span className="label">Wet season pumping (Jul–Dec) · {wet}</span>
          <input type="range" min={wetMin} max={100} value={wet} disabled={running} onChange={(e) => setWet(Number(e.target.value))} />
          <span className="caption">Village needs {wetMin} a month.</span>
        </label>
        <div className="riskmap__toggles">
          <button type="button" className={`timechip ${conserve ? 'is-on' : ''}`} aria-pressed={conserve} disabled={running} onClick={() => setConserve((c) => !c)}>
            Ask households to conserve
          </button>
          <button type="button" className={`timechip ${secondWell ? 'is-on' : ''}`} aria-pressed={secondWell} disabled={running} onClick={() => setSecondWell((c) => !c)}>
            Spread across a second well
          </button>
        </div>
        {!running && (
          <PixelButton className="pbtn--block" onClick={run}>
            Run the year
          </PixelButton>
        )}
      </div>
    </div>
  );
}

// Lens Keeper (main decision): run a year, optionally try another year beside it, keep one, then see five years.
export default function LensKeeper({ config, onComplete }) {
  const [years, setYears] = useState([]); // [{ plan, months }]
  const [another, setAnother] = useState(false);
  const [kept, setKept] = useState(null);
  const outlook = useMemo(() => (kept !== null ? runLensYears(years[kept].plan) : null), [kept, years]);

  const finish = () => {
    const y = years[kept];
    const tier = tierOf(y.months);
    const t = config.tiers[tier];
    onComplete({
      ...t,
      feedback: `${t.feedback} Five years on: ${outlook.summary}`,
      verdict: tier === 'safe' ? 'correct' : tier === 'recovers' ? 'ok' : 'wrong',
      state: { tier, plan: y.plan, last: y.months[11] },
    });
  };

  if (outlook) {
    return (
      <div className="prim">
        <YearStrip title={`Five years · ${planName(years[kept].plan)} · drought in year 3, typhoon in year 4`} result={outlook} renderMap={(f) => <Cutaway month={{ lens: f.lens, chloride: f.peak }} secondWell={years[kept].plan.secondWell} />} />
        <PixelButton className="pbtn--block" onClick={finish}>
          Done
        </PixelButton>
      </div>
    );
  }

  const results = years.map((y, i) => (
    <div key={i} className="lk-result">
      <p className="label">
        Year {i ? 'B' : 'A'} · {planName(y.plan)}
      </p>
      <MonthStrip months={y.months} shown={11} />
      <p className="caption">{config.tiers[tierOf(y.months)].feedback}</p>
    </div>
  ));

  return (
    <div className="prim">
      {years.length === 0 && <YearRunner onDone={(y) => setYears([y])} />}
      {years.length === 1 && !another && (
        <>
          {results}
          <div className="fund__actions">
            <PixelButton onClick={() => setKept(0)}>Keep this year</PixelButton>
            <button type="button" className="pbtn pbtn--ghost" onClick={() => setAnother(true)}>
              Try another year
            </button>
          </div>
        </>
      )}
      {years.length === 1 && another && (
        <div className="fund__strips is-compare">
          {results}
          <YearRunner label="Year B · same rain" onDone={(y) => setYears((ys) => [...ys, y])} />
        </div>
      )}
      {years.length === 2 && (
        <>
          <div className="fund__strips is-compare">{results}</div>
          <div className="fund__actions">
            <PixelButton onClick={() => setKept(0)}>Keep year A</PixelButton>
            <PixelButton onClick={() => setKept(1)}>Keep year B</PixelButton>
          </div>
        </>
      )}
    </div>
  );
}
