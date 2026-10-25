import { useState } from 'react';
import { PixelButton } from '../components/ui.jsx';
import { Icon } from '../components/Icons.jsx';
import { usePick } from '../components/usePick.js';
import { compareWith } from '../data/scoring.js';

// P4 — drag an icon onto a day of the 7-day forecast, then pick a time (or skip the week).
export default function ForecastStrip({ config, onComplete }) {
  const { picked, itemProps, targetProps } = usePick();
  const [day, setDay] = useState(null);
  const [time, setTime] = useState(null);
  const [skip, setSkip] = useState(false);
  const ready = skip || (day && time);

  const place = (dayId) => {
    setDay(dayId);
    setSkip(false);
  };

  const submit = () => {
    const d = config.days.find((x) => x.id === day);
    const good = skip || (d && !d.rain && time === config.goodTime);
    onComplete({
      points: good ? config.points : {},
      feedback: good ? config.feedbackGood : config.feedbackBad({ day: d, time, skip }),
      verdict: good ? 'correct' : 'wrong',
      state: skip ? 'skip' : `${day}-${time}`,
      compare: good
        ? compareWith('Watering at noon, as before', {}, 'Noon watering mostly evaporates before it reaches the roots.')
        : compareWith('Early morning on a dry day — or skipping the week', config.points, config.feedbackGood),
    });
  };

  return (
    <div className="prim">
      <div className="fstrip__tray">
        {!day && !skip ? (
          <button type="button" className={`token ${picked === 'can' ? 'is-picked' : ''}`} {...itemProps('can')}>
            <Icon name="can" size={22} />
            {config.token}
          </button>
        ) : (
          <span className="caption">
            {skip ? 'Skipping this week.' : 'Watering can placed. Pick a time below.'}
          </span>
        )}
        <span className="caption">Drag it onto a day — or click it, then click a day.</span>
      </div>

      <div className="fstrip" role="group" aria-label="Seven-day forecast">
        {config.days.map((d) => (
          <button
            key={d.id}
            type="button"
            className={`fday ${d.rain ? 'is-rain' : ''} ${day === d.id ? 'is-set' : ''} ${picked ? 'is-target' : ''}`}
            aria-label={`${d.label}, ${d.rain ? 'light rain' : 'dry'}${day === d.id ? ', watering here' : ''}`}
            {...targetProps(() => place(d.id))}
          >
            <span className="label">{d.label}</span>
            <Icon name={d.rain ? 'rain' : 'sunny'} size={22} />
            <span className="fday__wx">{d.rain ? 'Light rain' : 'Dry'}</span>
            {day === d.id && (
              <span className="fday__can">
                <Icon name="can" size={18} />
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="fstrip__times">
        {config.times.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`timechip ${time === t.id ? 'is-on' : ''}`}
            disabled={!day}
            aria-pressed={time === t.id}
            onClick={() => setTime(t.id)}
          >
            {t.label}
          </button>
        ))}
        <button
          type="button"
          className={`timechip ${skip ? 'is-on' : ''}`}
          aria-pressed={skip}
          onClick={() => {
            setSkip((s) => !s);
            setDay(null);
            setTime(null);
          }}
        >
          Skip this week
        </button>
      </div>

      <PixelButton className="pbtn--block" disabled={!ready} onClick={submit}>
        Set schedule
      </PixelButton>
    </div>
  );
}
