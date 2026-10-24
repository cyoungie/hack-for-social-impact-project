import { useMemo, useRef, useState } from 'react';
import { useGame } from '../state/GameState.jsx';
import { SCENARIOS } from '../scenarios/index.js';
import { Scenery, Mark } from '../scenarios/stageKit.jsx';
import { sumPoints } from '../data/scoring.js';
import { avatarColorValue } from '../data/game.js';
import { Nav, PixelButton, PixelCard } from '../components/ui.jsx';
import { Avatar } from '../components/Avatar.jsx';
import { Icon } from '../components/Icons.jsx';
import { Dialog } from '../components/Dialog.jsx';
import { PointChips } from '../components/PointChips.jsx';
import ChoiceCard from '../primitives/ChoiceCard.jsx';
import PumpDial from '../primitives/PumpDial.jsx';
import ForecastStrip from '../primitives/ForecastStrip.jsx';
import TimedGrab from '../primitives/TimedGrab.jsx';
import DragSort from '../primitives/DragSort.jsx';
import ComposeStatement from '../primitives/ComposeStatement.jsx';
import KnowledgeCard from './KnowledgeCard.jsx';

const PRIMITIVES = {
  choice: ChoiceCard,
  pump: PumpDial,
  forecast: ForecastStrip,
  grab: TimedGrab,
  sort: DragSort,
  compose: ComposeStatement,
};

const VERDICT = { correct: 'Good call', ok: 'Partly there', wrong: 'Not quite' };

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function DialogueBox({ persona, text, cta, onNext }) {
  return (
    <div className="dialogue">
      <span className="dialogue__avatar">
        <Avatar color={persona.color} size={64} />
      </span>
      <div className="dialogue__body">
        <p className="dialogue__name">
          {persona.name} · {persona.age}
        </p>
        <p>{text}</p>
      </div>
      <PixelButton onClick={onNext}>{cta}</PixelButton>
    </div>
  );
}

function OneSystemFrame({ onClose }) {
  const nodes = [
    { icon: 'grass', title: 'The Field', sub: 'Scenario 1' },
    { icon: 'mountain', title: 'The Ridge', sub: 'Scenario 2' },
    { icon: 'stream', title: 'The Stream', sub: 'Every hard rain' },
    { icon: 'coral', title: 'The Reef', sub: 'You are here' },
  ];
  return (
    <Dialog labelledBy="frame-title" className="frame">
      <p className="label frame__eyebrow">The island is one system</p>
      <h2 id="frame-title" className="frame__title">
        Same soil. One trip.
      </h2>
      <ol className="frame__chain">
        {nodes.map((n) => (
          <li key={n.title} className="frame__node">
            <span className="frame__icon">
              <Icon name={n.icon} size={34} />
            </span>
            <span className="frame__name">{n.title}</span>
            <span className="frame__sub">{n.sub}</span>
          </li>
        ))}
      </ol>
      <p className="frame__body">
        The field that gets plowed bare, the hills that burn, the stream that floods brown, the reef that goes grey — it
        is the same soil, finishing its trip. Hold it up there and you save the coral down here.
      </p>
      <PixelButton onClick={onClose}>Continue</PixelButton>
    </Dialog>
  );
}

export default function Scenario() {
  const { state, setPhase, completeHotspot, collect, goTo } = useGame();
  const { run } = state;
  const sc = SCENARIOS[run.id];
  const [openId, setOpenId] = useState(null);
  const [result, setResult] = useState(null);
  const [frame, setFrame] = useState(null);
  const [recent, setRecent] = useState(null);
  const [pos, setPos] = useState({ x: 50, y: 92 });
  const timer = useRef(null);

  const done = run.done;
  const totals = useMemo(() => sumPoints(Object.values(done).map((d) => d.points)), [done]);
  const allDone = sc.hotspots.every((h) => done[h.id]);
  const open = sc.hotspots.find((h) => h.id === openId);
  const outcome = sc.outcome(totals);
  const showOutcome = run.phase === 'consequence' || run.phase === 'card';
  const Primitive = open && PRIMITIVES[open.kind];

  const visit = (h) => {
    setPos({ x: h.x, y: Math.min(h.y + 12, 94) });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpenId(h.id), reducedMotion() ? 0 : 380);
  };

  const finishHotspot = (r) => {
    completeHotspot(open.id, r);
    setResult(r);
  };

  const closeHotspot = () => {
    if (result) {
      setRecent({ points: result.points, key: Date.now() });
      if (open.afterFrame) setFrame(open.afterFrame);
    }
    setOpenId(null);
    setResult(null);
  };

  return (
    <div className="app-shell">
      <Nav plate={sc.plate} />
      <main className="scenario">
        <div className="scenario__main">
          <section className={`stage ${run.phase === 'intro' ? 'is-intro' : ''}`} aria-label="Scene">
            <Scenery id={sc.id} blocks={sc.blocks} swap={showOutcome ? sc.consequence[outcome].swap : {}} />
            <div className="stage__overlays">{sc.overlays(done)}</div>

            {!showOutcome &&
              sc.hotspots.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  className={`hotspot ${done[h.id] ? 'is-done' : ''}`}
                  style={{ left: `${h.x}%`, top: `${h.y}%` }}
                  disabled={run.phase !== 'explore' || Boolean(done[h.id])}
                  onClick={() => visit(h)}
                >
                  <span className="hotspot__icon">
                    <Icon name={h.icon} size={26} />
                    {done[h.id] && (
                      <span className="hotspot__check">
                        <Icon name="check" size={12} strokeWidth={3} />
                      </span>
                    )}
                  </span>
                  <span className="hotspot__label">{h.label}</span>
                </button>
              ))}

            {run.phase === 'explore' && (
              <span className="walker" style={{ left: `${pos.x}%`, top: `${pos.y}%` }} aria-hidden="true">
                <Avatar color={avatarColorValue(state.avatarColor)} size={34} />
              </span>
            )}

            {showOutcome && (
              <>
                <div className="stage__overlays">
                  {sc.consequence[outcome].marks.map((m) => (
                    <Mark key={m.text} x={m.x} y={m.y} icon={m.icon} tone={m.tone}>
                      {m.text}
                    </Mark>
                  ))}
                </div>
                <p className={`stage__headline is-${outcome}`}>{sc.consequence[outcome].headline}</p>
              </>
            )}

          </section>

          {run.phase === 'intro' && (
            <DialogueBox persona={sc.persona} text={sc.intro} cta={sc.introCta} onNext={() => setPhase('explore')} />
          )}
          {run.phase === 'consequence' && (
            <DialogueBox persona={sc.persona} text={sc.closing} cta="Open knowledge card" onNext={() => setPhase('card')} />
          )}
        </div>

        <aside className="scenario__rail">
          <PixelCard className="mini-nina" style={{ '--persona': sc.persona.color }}>
            <span className="mini-nina__avatar">
              <Avatar color={sc.persona.color} size={40} />
            </span>
            <span>
              <span className="mini-nina__name">
                {sc.persona.name} · {sc.persona.age}
              </span>
              <span className="mini-nina__quote">{sc.persona.role}</span>
            </span>
          </PixelCard>

          <PixelCard className="stops">
            <h1 className="stops__title" tabIndex={-1}>
              {run.phase === 'explore' ? 'Click a spot on the scene' : 'Stops'}
            </h1>
            <ol className="stops__list">
              {sc.hotspots.map((h) => (
                <li key={h.id} className={`stop ${done[h.id] ? 'is-done' : ''}`}>
                  <span className="stop__box" aria-hidden="true">
                    {done[h.id] && <Icon name="check" size={12} strokeWidth={3} />}
                  </span>
                  <span className="stop__name">{h.label}</span>
                  {done[h.id] && <PointChips points={done[h.id].points} />}
                </li>
              ))}
            </ol>
            <div className="stops__total">
              <span className="label">This run</span>
              <span className="stops__chips">
                <PointChips points={totals} emptyText="No points yet." />
                {recent && <PointChips key={recent.key} points={recent.points} float />}
              </span>
            </div>
          </PixelCard>

          {run.phase === 'explore' && allDone && (
            <PixelButton className="pbtn--block" onClick={() => setPhase('consequence')}>
              See how it turns out
            </PixelButton>
          )}
          {run.phase === 'explore' && !allDone && (
            <p className="caption">
              {Object.keys(done).length} of {sc.hotspots.length} stops done. Points land on the island's four bars when
              you collect the knowledge card.
            </p>
          )}
        </aside>
      </main>

      {open && (
        <Dialog labelledBy="hotspot-title" onClose={result ? closeHotspot : () => setOpenId(null)} className="hdialog">
          <div className="kcard__eyebrow">
            <span className="label">
              {sc.persona.name} · {open.label}
            </span>
            {!result && (
              <button type="button" className="hdialog__close" onClick={() => setOpenId(null)}>
                Close
              </button>
            )}
          </div>
          <h2 id="hotspot-title" className="hdialog__prompt">
            {open.prompt}
          </h2>
          {result ? (
            <div className={`feedback is-${result.verdict}`}>
              <p className="label">{VERDICT[result.verdict]}</p>
              <p>{result.feedback}</p>
              <PointChips points={result.points} emptyText="No change to the bars." />
              <PixelButton onClick={closeHotspot}>Continue</PixelButton>
            </div>
          ) : (
            <Primitive config={open.config} onComplete={finishHotspot} />
          )}
        </Dialog>
      )}

      {frame === 'oneSystem' && <OneSystemFrame onClose={() => setFrame(null)} />}

      {run.phase === 'card' && (
        <KnowledgeCard
          scenario={sc}
          done={done}
          totals={totals}
          outcome={outcome}
          playerName={state.playerName}
          onCollect={() => collect(sc.id, totals)}
          onBack={() => goTo('map')}
        />
      )}
    </div>
  );
}
