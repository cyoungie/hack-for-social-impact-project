import { useEffect, useRef, useState } from 'react';
import { PixelButton } from '../components/ui.jsx';
import { Icon } from '../components/Icons.jsx';
import { usePick } from '../components/usePick.js';
import { addPoints, compareWith } from '../data/scoring.js';

const STEP_MS = 450;
const reducedMotion = () => Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

// P4 variant: drag fertilizer (required) and irrigation (optional) onto a 7-day forecast, then watch the week.
export default function FertilizerPlan({ config, onComplete }) {
  const { days } = config;
  const stormIdx = days.findIndex((d) => d.storm);
  const { picked, itemProps, targetProps } = usePick();
  const [fert, setFert] = useState(null);
  const [irr, setIrr] = useState(null);
  const [skipIrr, setSkipIrr] = useState(false);
  const [playDay, setPlayDay] = useState(-1);
  const resultRef = useRef(null);
  const doneRef = useRef(onComplete);
  doneRef.current = onComplete;

  const risky = (i) => i === stormIdx || i === stormIdx - 1;

  const place = (dayIdx) => (token) => {
    if (playDay >= 0) return;
    if (token === 'fert') setFert(dayIdx);
    if (token === 'irr') {
      setIrr(dayIdx);
      setSkipIrr(false);
    }
  };

  const buildResult = () => {
    const fertGood = !risky(fert);
    const irrBad = irr !== null && risky(irr);
    let points = fertGood ? config.good.points : config.bad.points;
    let feedback = fertGood ? config.good.feedback : config.bad.feedback;
    if (irrBad) {
      points = addPoints(points, config.irrigationPenalty);
      feedback += ` ${config.irrigationNote}`;
    }
    return {
      points,
      feedback,
      verdict: fertGood && !irrBad ? 'correct' : fertGood ? 'ok' : 'wrong',
      state: { fertGood, irrBad, fert, irr },
      compare: fertGood
        ? compareWith(`Fertilizing on ${days[stormIdx - 1].label}, the day before the storm`, config.bad.points, config.bad.feedback)
        : compareWith('A dry day with no storm behind it', config.good.points, config.good.feedback),
    };
  };

  const submit = () => {
    resultRef.current = buildResult();
    if (reducedMotion()) onComplete(resultRef.current);
    else setPlayDay(0);
  };

  // Play the week out one day at a time, then report.
  useEffect(() => {
    if (playDay < 0) return undefined;
    const t = setTimeout(() => {
      if (playDay < days.length - 1) setPlayDay(playDay + 1);
      else doneRef.current(resultRef.current);
    }, playDay < days.length - 1 ? STEP_MS : STEP_MS * 2);
    return () => clearTimeout(t);
  }, [playDay, days.length]);

  // What the field looks like on the day being played.
  let status = null;
  if (playDay >= 0) {
    const washed = risky(fert) && playDay >= stormIdx;
    if (washed) status = { tone: 'bad', text: 'Storm hit — fertilizer washing off toward the reef' };
    else if (playDay >= fert) status = { tone: 'good', text: 'Nutrients soaking into the soil' };
    else status = { tone: 'wait', text: 'Waiting to fertilize' };
  }

  return (
    <div className="prim">
      <div className="fstrip__tray">
        <span className="fert__tokens">
          {fert === null && (
            <button type="button" className={`token ${picked === 'fert' ? 'is-picked' : ''}`} {...itemProps('fert')}>
              <Icon name="bag" size={22} /> Fertilizer
            </button>
          )}
          {irr === null && !skipIrr && (
            <button type="button" className={`token token--alt ${picked === 'irr' ? 'is-picked' : ''}`} {...itemProps('irr')}>
              <Icon name="drop" size={20} /> Irrigation
            </button>
          )}
        </span>
        <span className="caption">Drag onto a day — or click it, then click a day.</span>
      </div>

      <div className="fstrip" role="group" aria-label="Seven-day forecast">
        {days.map((d, i) => (
          <button
            key={d.id}
            type="button"
            className={`fday ${d.rain >= 0.3 ? 'is-rain' : ''} ${d.storm ? 'is-storm' : ''} ${picked ? 'is-target' : ''} ${playDay === i ? 'is-playing' : ''} ${playDay > i ? 'is-past' : ''}`}
            aria-label={`${d.label}, ${d.wx}, ${d.rainLabel} of rain${fert === i ? ', fertilizer here' : ''}${irr === i ? ', irrigation here' : ''}`}
            {...targetProps(place(i))}
          >
            <span className="label">{d.label}</span>
            <Icon name={d.icon} size={22} />
            <span className="fday__wx">{d.wx}</span>
            <span className="fday__rain">{d.rainLabel}</span>
            <span className="fday__drops">
              {fert === i && (
                <span className="fday__chip">
                  <Icon name="bag" size={14} />
                </span>
              )}
              {irr === i && (
                <span className="fday__chip fday__chip--alt">
                  <Icon name="drop" size={14} />
                </span>
              )}
            </span>
          </button>
        ))}
      </div>

      <div className="fstrip__times">
        <button
          type="button"
          className={`timechip ${skipIrr ? 'is-on' : ''}`}
          aria-pressed={skipIrr}
          disabled={playDay >= 0}
          onClick={() => {
            setSkipIrr((s) => !s);
            setIrr(null);
          }}
        >
          Skip irrigation this week
        </button>
        <button
          type="button"
          className="timechip"
          disabled={playDay >= 0 || (fert === null && irr === null)}
          onClick={() => {
            setFert(null);
            setIrr(null);
            setSkipIrr(false);
          }}
        >
          Reset
        </button>
      </div>

      {status && (
        <p className={`fert__status is-${status.tone}`} aria-live="polite">
          {days[playDay].label}: {status.text}
        </p>
      )}

      <PixelButton className="pbtn--block" disabled={fert === null || playDay >= 0} onClick={submit}>
        {playDay >= 0 ? 'Playing out the week…' : 'Recommend schedule'}
      </PixelButton>
    </div>
  );
}
