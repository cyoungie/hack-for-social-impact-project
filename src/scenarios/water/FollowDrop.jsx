import { useEffect, useRef, useState } from 'react';
import { PixelButton, SquareRadio } from '../../components/ui.jsx';
import { addPoints } from '../../data/scoring.js';

// Follow the Drop: pick a treatment, flush, and watch how fast wastewater reaches the lens.
export const TREATMENTS = [
  { id: 'leave', label: 'Leave the old septic tank', speed: 'fast', path: 'down' },
  { id: 'pump', label: 'Pump and inspect it', speed: 'slower', path: 'down' },
  { id: 'upgrade', label: 'Upgrade it', speed: 'slowest', path: 'down' },
  { id: 'sewer', label: 'Connect to the sewer when offered', speed: 'none', path: 'sewer' },
];
const DURATION = { fast: 1400, slower: 2600, slowest: 3600, none: 2200 };
const reducedMotion = () => Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

function HomeCutaway({ treatment, flushing }) {
  const t = TREATMENTS.find((x) => x.id === treatment);
  const toSewer = t?.path === 'sewer';
  const dur = `${DURATION[t?.speed || 'fast'] / 1000}s`;
  return (
    <svg className="drop-cut" viewBox="0 0 400 280" role="img" aria-label={t ? `${t.label}: wastewater ${toSewer ? 'goes to the sewer' : `reaches the lens ${t.speed === 'fast' ? 'quickly' : 'more slowly'}`}` : 'Cutaway of the home'}>
      <rect x="0" y="0" width="400" height="70" className="lc-sky" />
      <rect x="40" y="10" width="120" height="70" className="lc-house" />
      <rect x="70" y="50" width="22" height="30" className="dc-toilet" />
      <text x="60" y="26" className="lc-txt">ANA'S HOME</text>
      <rect x="0" y="80" width="400" height="30" className="dc-soil" />
      <text x="300" y="98" className="lc-txt">THIN SOIL</text>
      <rect x="0" y="110" width="400" height="110" className="lc-limestone" />
      {[60, 140, 210, 280, 350].map((x) => (
        <rect key={x} x={x} y={130 + (x % 50)} width="6" height="6" className="lc-pore" />
      ))}
      <text x="270" y="150" className="lc-txt">POROUS LIMESTONE</text>
      <path d="M0 220 Q 200 206 400 220 L400 280 L0 280 Z" className="lc-lens" />
      <text x="10" y="266" className="lc-txt">FRESHWATER LENS</text>
      <rect x="150" y="84" width="60" height="28" className={`dc-tank ${treatment === 'upgrade' ? 'is-new' : ''}`} />
      <text x="156" y="102" className="lc-txt lc-txt--light">SEPTIC</text>
      <rect x="92" y="74" width="60" height="6" className="lc-pipe" />
      {toSewer && <rect x="210" y="74" width="190" height="8" className="dc-sewer" />}
      {toSewer && <text x="300" y="70" className="lc-txt">SEWER LINE</text>}
      {flushing && t && (
        <circle r="7" className={`dc-drop dc-drop--${t.speed}`} style={{ animationDuration: dur }}>
          <animateMotion
            dur={dur}
            fill="freeze"
            path={toSewer ? 'M80 70 L180 76 L400 78' : 'M80 70 L180 98 L176 160 L190 222'}
          />
        </circle>
      )}
    </svg>
  );
}

export default function FollowDrop({ config, onComplete }) {
  const [choice, setChoice] = useState('');
  const [step, setStep] = useState('pick'); // pick | flushing | bonus
  const [reported, setReported] = useState(false);
  const resultRef = useRef(null);

  const flush = () => {
    resultRef.current = config.results[choice];
    setStep('flushing');
  };

  useEffect(() => {
    if (step !== 'flushing') return undefined;
    const t = TREATMENTS.find((x) => x.id === choice);
    const timer = setTimeout(() => setStep('bonus'), reducedMotion() ? 0 : DURATION[t.speed] + 400);
    return () => clearTimeout(timer);
  }, [step, choice]);

  const finish = () => {
    const r = resultRef.current;
    onComplete({
      ...r,
      points: reported ? addPoints(r.points, config.reportPoints) : r.points,
      feedback: `${r.feedback}${reported ? ` ${config.reportFeedback}` : ''}`,
      verdict: choice === 'sewer' ? 'correct' : choice === 'leave' ? 'wrong' : 'ok',
      state: { treatment: choice, reported },
    });
  };

  const t = TREATMENTS.find((x) => x.id === choice);
  return (
    <div className="prim">
      <div className="lenskeeper">
        <div>
          <HomeCutaway treatment={choice} flushing={step !== 'pick'} />
          {step !== 'pick' && t && (
            <p className={`fert__status ${t.speed === 'fast' ? 'is-bad' : t.speed === 'none' ? 'is-good' : 'is-wait'}`} aria-live="polite">
              {t.speed === 'none'
                ? 'The drop goes into the sewer line, away from the lens.'
                : t.speed === 'fast'
                  ? 'The drop reaches the lens fast.'
                  : 'The drop takes longer to reach the lens.'}
            </p>
          )}
        </div>
        <div className="lenskeeper__side">
          <fieldset className="vote">
            <legend className="label">Treatment tray</legend>
            <div className="vote__grid vote__grid--stack">
              {TREATMENTS.map((o) => (
                <SquareRadio key={o.id} name="treatment" value={o.id} checked={choice === o.id} onChange={step === 'pick' ? setChoice : () => {}}>
                  {o.label}
                </SquareRadio>
              ))}
            </div>
          </fieldset>
          {step === 'bonus' && (
            <div className="drop-bonus">
              <p className="label">Bonus · a sewage smell on the map</p>
              <p className="caption">Someone down the street smells sewage near a manhole.</p>
              <button type="button" className={`timechip ${reported ? 'is-on' : ''}`} disabled={reported} onClick={() => setReported(true)}>
                {reported ? 'Reported to GWA' : 'Report to GWA'}
              </button>
            </div>
          )}
        </div>
      </div>
      {step === 'pick' && (
        <PixelButton className="pbtn--block" disabled={!choice} onClick={flush}>
          Flush
        </PixelButton>
      )}
      {step === 'bonus' && (
        <PixelButton className="pbtn--block" onClick={finish}>
          Done
        </PixelButton>
      )}
    </div>
  );
}
