import { useEffect, useRef, useState } from 'react';
import { PixelButton } from '../../components/ui.jsx';
import { Icon } from '../../components/Icons.jsx';
import { usePick } from '../../components/usePick.js';
import { addPoints } from '../../data/scoring.js';
import { useCountdown } from '../../primitives/useCountdown.js';

// Typhoon Water Kit: pack before the storm clock runs out, then live through a 7-day outage.
const FAMILY = 4;
const OUTAGE_DAYS = 7;
const JUG_GALLONS = 5;
const BARREL_DAYS = 3; // what the screened rain barrel can cover, refilled once by the storm (illustrative)
const SUPPLIES = [
  ...Array.from({ length: 6 }, (_, i) => ({ id: `jug${i}`, kind: 'jug', label: `Water jug (${JUG_GALLONS} gal)`, icon: 'drop' })),
  { id: 'barrel', kind: 'barrel', label: 'Rain barrel with a screen', icon: 'barrel' },
  { id: 'kit', kind: 'kit', label: 'Purification kit (boiling or tablets)', icon: 'flask' },
  { id: 'cooler', kind: 'cooler', label: 'Cooler', icon: 'tank' },
];
const STEP_MS = 450;
const reducedMotion = () => Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

export function outage(packed, perPersonPerDay) {
  const jugs = packed.filter((id) => id.startsWith('jug')).length;
  const barrel = packed.includes('barrel');
  const kit = packed.includes('kit');
  const stored = (jugs * JUG_GALLONS) / (FAMILY * perPersonPerDay);
  const barrelDays = barrel ? BARREL_DAYS : 0;
  const days = Math.min(OUTAGE_DAYS, Math.floor(stored + barrelDays));
  const drankUntreated = barrel && !kit && stored < OUTAGE_DAYS;
  return { jugs, stored, days, drankUntreated, barrel, kit };
}

export default function WaterKit({ config, onComplete }) {
  const [phase, setPhase] = useState('ready'); // ready | packing | outage
  const [packed, setPacked] = useState([]);
  const [day, setDay] = useState(0);
  const { picked, itemProps, targetProps } = usePick();
  const resultRef = useRef(null);
  const doneRef = useRef(onComplete);
  doneRef.current = onComplete;

  const startOutage = () => {
    resultRef.current = outage(packed, config.perPersonPerDay);
    setPhase('outage');
    setDay(reducedMotion() ? OUTAGE_DAYS : 1);
  };
  const left = useCountdown(config.seconds, phase === 'packing', startOutage);

  useEffect(() => {
    if (phase !== 'outage') return undefined;
    if (day >= OUTAGE_DAYS) {
      const o = resultRef.current;
      const tier = o.days >= OUTAGE_DAYS && (!o.barrel || o.kit) ? config.tiers.full : o.days >= 3 ? config.tiers.part : config.tiers.short;
      const points = o.drankUntreated ? addPoints(tier.points, config.untreated.points) : tier.points;
      const t = setTimeout(
        () =>
          doneRef.current({
            ...tier,
            points,
            feedback: `Your supply lasted ${o.days} of ${OUTAGE_DAYS} days. ${tier.feedback}${o.drankUntreated ? ` ${config.untreated.feedback}` : ''}`,
            verdict: tier === config.tiers.full && !o.drankUntreated ? 'correct' : tier === config.tiers.short ? 'wrong' : 'ok',
            state: { days: o.days, packed },
          }),
        reducedMotion() ? 0 : 600,
      );
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setDay((d) => d + 1), STEP_MS);
    return () => clearTimeout(t);
  }, [phase, day, config, packed]);

  const loose = SUPPLIES.filter((s) => !packed.includes(s.id));
  const o = phase === 'outage' ? resultRef.current : null;

  return (
    <div className="prim">
      <div className="timer" aria-live="polite">
        <span className="label">
          {phase === 'outage' ? 'Typhoon hit · wells without power · boil-water notice' : phase === 'ready' ? `Storm clock: ${config.seconds} seconds` : 'Storm clock'}
        </span>
        {phase !== 'outage' && <span className={`timer__num ${left <= 10 ? 'is-low' : ''}`}>{left}s</span>}
      </div>
      <p className="caption">
        Ana's family is {FAMILY} people. {config.guideline}
      </p>

      {phase !== 'outage' ? (
        <div className="kit">
          <div className="kit__tray">
            {loose.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`token ${picked === s.id ? 'is-picked' : ''}`}
                disabled={phase !== 'packing'}
                {...itemProps(s.id)}
              >
                <Icon name={s.icon} size={18} /> {s.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className={`kit__shelf ${picked ? 'is-target' : ''}`}
            disabled={phase !== 'packing'}
            aria-label={`Ana's shelf and yard, ${packed.length} items packed. Drop the picked supply here.`}
            {...targetProps((id) => setPacked((p) => (p.includes(id) ? p : [...p, id])))}
          >
            <span className="label">Ana's shelf and yard</span>
            <span className="kit__packed">
              {packed.map((id) => {
                const s = SUPPLIES.find((x) => x.id === id);
                return (
                  <span key={id} className="kit__item">
                    <Icon name={s.icon} size={16} />
                  </span>
                );
              })}
            </span>
          </button>
        </div>
      ) : (
        <ol className="outage" aria-live="polite">
          {Array.from({ length: OUTAGE_DAYS }, (_, i) => {
            const d = i + 1;
            const covered = d <= o.days;
            const fromBarrel = covered && d > Math.floor(o.stored);
            return (
              <li key={d} className={`outage__day ${d <= day ? 'is-shown' : ''} ${covered ? 'is-ok' : 'is-dry'}`}>
                <span className="label">Day {d}</span>
                <span className="caption">{!covered ? 'Out of water' : fromBarrel ? (o.kit ? 'Barrel water, treated' : 'Barrel water, untreated') : 'Stored water'}</span>
              </li>
            );
          })}
        </ol>
      )}

      {phase === 'ready' && (
        <PixelButton className="pbtn--block" onClick={() => setPhase('packing')}>
          Start the storm clock
        </PixelButton>
      )}
      {phase === 'packing' && (
        <button type="button" className="pbtn pbtn--ghost pbtn--block" onClick={startOutage}>
          Done packing
        </button>
      )}
    </div>
  );
}
