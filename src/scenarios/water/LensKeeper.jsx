import { useEffect, useRef, useState } from 'react';
import { PixelButton } from '../../components/ui.jsx';

// Lens Keeper: run a 12-month year over the freshwater lens. Illustrative model, not a forecast.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DRY = new Set([0, 1, 2, 3, 4, 5]); // dry season Jan–Jun, wet season Jul–Dec
const DEMAND = { dry: 60, wet: 55 };
const CONSERVE = 0.8; // Conserve lowers household demand by a fifth
const RECHARGE = { dry: 3, wet: 12 };
const DRAW = 0.15; // lens lost per unit pumped
export const SAFE = 60; // chloride gauge: safe band below this
export const BRACKISH = 85;
const STEP_MS = 350;

const reducedMotion = () => Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export function simulate({ dry, wet, conserve, secondWell }) {
  let lens = 60;
  const months = [];
  for (let m = 0; m < 12; m += 1) {
    const season = DRY.has(m) ? 'dry' : 'wet';
    const demand = DEMAND[season] * (conserve ? CONSERVE : 1);
    const pump = season === 'dry' ? dry : wet;
    lens = clamp(lens + RECHARGE[season] - pump * DRAW, 5, 100);
    const pull = pump / (secondWell ? 2 : 1); // spreading across a second well lowers the pull on each
    const chloride = clamp(30 + Math.max(0, pull - 40) * 1.2 + Math.max(0, 60 - lens), 0, 100);
    months.push({ m, season, demand, pump, met: pump >= demand, lens, chloride });
  }
  return months;
}

export function tierOf(months) {
  const brackish = months.some((x) => x.chloride >= BRACKISH);
  const safeAllYear = months.every((x) => x.chloride < SAFE && x.met);
  if (brackish) return 'brackish';
  if (safeAllYear) return 'safe';
  return 'recovers';
}

function Cutaway({ month, secondWell }) {
  const lens = month?.lens ?? 60;
  const chloride = month?.chloride ?? 30;
  const lensTop = 120;
  const lensBottom = lensTop + 40 + lens * 1.1;
  const cone = Math.max(0, chloride - 30) * 1.6;
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
      {[secondWell ? [150, true] : null, [230, false]].filter(Boolean).map(([x]) => (
        <g key={x}>
          <rect x={x - 12} y="22" width="24" height="20" className="lc-house" />
          <rect x={x - 3} y="42" width="6" height={lensTop + 30 - 42} className="lc-pipe" />
          <path d={`M${x - 30} ${lensBottom} L${x} ${Math.max(lensTop + 34, lensBottom - cone / (secondWell ? 2 : 1))} L${x + 30} ${lensBottom} Z`} className="lc-cone" />
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
          <span
            className="ybar__fill"
            style={{ width: `${chloride}%`, background: chloride >= BRACKISH ? 'var(--danger)' : chloride >= SAFE ? 'var(--warning)' : 'var(--veg)' }}
          />
        </span>
      </div>
    </div>
  );
}

export default function LensKeeper({ config, onComplete }) {
  const [dry, setDry] = useState(DEMAND.dry);
  const [wet, setWet] = useState(DEMAND.wet);
  const [conserve, setConserve] = useState(false);
  const [secondWell, setSecondWell] = useState(false);
  const [shown, setShown] = useState(-1);
  const runRef = useRef(null);
  const doneRef = useRef(onComplete);
  doneRef.current = onComplete;

  const dryMin = Math.ceil(DEMAND.dry * (conserve ? CONSERVE : 1));
  const wetMin = Math.ceil(DEMAND.wet * (conserve ? CONSERVE : 1));
  // The village must get enough water every month: pumping can't drop below demand.
  useEffect(() => {
    setDry((v) => Math.max(v, dryMin));
    setWet((v) => Math.max(v, wetMin));
  }, [dryMin, wetMin]);

  const run = () => {
    const months = simulate({ dry, wet, conserve, secondWell });
    runRef.current = months;
    if (reducedMotion()) setShown(11);
    else setShown(0);
  };

  useEffect(() => {
    if (shown < 0) return undefined;
    if (shown >= 11) {
      const months = runRef.current;
      const tier = config.tiers[tierOf(months)];
      const t = setTimeout(
        () =>
          doneRef.current({
            ...tier,
            verdict: tier === config.tiers.safe ? 'correct' : tier === config.tiers.recovers ? 'ok' : 'wrong',
            state: { tier: tierOf(months), last: months[11], peak: Math.max(...months.map((x) => x.chloride)) },
          }),
        reducedMotion() ? 0 : 700,
      );
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setShown((n) => n + 1), STEP_MS);
    return () => clearTimeout(t);
  }, [shown, config.tiers]);

  const month = shown >= 0 ? runRef.current[shown] : null;
  const running = shown >= 0;

  return (
    <div className="prim">
      <div className="lenskeeper">
        <div>
          <Cutaway month={month} secondWell={secondWell} />
          <div className="lenskeeper__months" aria-live="polite">
            {MONTHS.map((name, i) => {
              const m = running && i <= shown ? runRef.current[i] : null;
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
              Conserve
            </button>
            <button type="button" className={`timechip ${secondWell ? 'is-on' : ''}`} aria-pressed={secondWell} disabled={running} onClick={() => setSecondWell((c) => !c)}>
              Spread across a second well
            </button>
          </div>
          {month && (
            <p className="caption">
              {MONTHS[month.m]} · {month.season} season · rain {month.season === 'wet' ? 'refills' : 'barely refills'} the lens
            </p>
          )}
        </div>
      </div>
      <PixelButton className="pbtn--block" disabled={running} onClick={run}>
        {running ? 'Running the year…' : 'Run the year'}
      </PixelButton>
    </div>
  );
}
