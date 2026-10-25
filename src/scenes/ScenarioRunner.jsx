import { useMemo, useRef, useState } from 'react';
import { useGame } from '../state/GameState.jsx';
import { Scenery, Mark } from '../scenarios/stageKit.jsx';
import { sumPoints } from '../data/scoring.js';
import { avatarColorValue } from '../data/game.js';
import { Nav, PixelButton, PixelCard } from '../components/ui.jsx';
import { Avatar } from '../components/Avatar.jsx';
import { Icon } from '../components/Icons.jsx';
import { Dialog } from '../components/Dialog.jsx';
import { PointChips } from '../components/PointChips.jsx';
import { SourceCard } from '../components/SourceCard.jsx';
import ChoiceCard from '../primitives/ChoiceCard.jsx';
import StripChoice from '../primitives/StripChoice.jsx';
import TillerPlan from '../primitives/TillerPlan.jsx';
import FertilizerPlan from '../primitives/FertilizerPlan.jsx';
import RiskMap from '../scenarios/typhoon/RiskMap.jsx';
import RepairFund from '../scenarios/typhoon/RepairFund.jsx';
import MeetingVote from '../scenarios/typhoon/MeetingVote.jsx';
import CoralCount from '../scenarios/reef/CoralCount.jsx';
import RoadPlan from '../scenarios/reef/RoadPlan.jsx';
import LensKeeper from '../scenarios/water/LensKeeper.jsx';
import LeakHunt from '../scenarios/water/LeakHunt.jsx';
import FollowDrop from '../scenarios/water/FollowDrop.jsx';
import WaterKit from '../scenarios/water/WaterKit.jsx';
import MapCases from '../scenarios/town/MapCases.jsx';
import EffortPlan from '../scenarios/town/EffortPlan.jsx';
import TownHall from '../scenarios/town/TownHall.jsx';
import KnowledgeCard from './KnowledgeCard.jsx';

const PRIMITIVES = {
  choice: ChoiceCard,
  strip: StripChoice,
  till: TillerPlan,
  fertilizer: FertilizerPlan,
  riskmap: RiskMap,
  fund: RepairFund,
  meeting: MeetingVote,
  coralcount: CoralCount,
  roadplan: RoadPlan,
  lenskeeper: LensKeeper,
  leakhunt: LeakHunt,
  followdrop: FollowDrop,
  waterkit: WaterKit,
  cases: MapCases,
  effort: EffortPlan,
  townhall: TownHall,
};

// Good choices open with what happened; poor ones with what went wrong. No praise.
const VERDICT = { correct: 'What happened', ok: 'What happened', wrong: 'What went wrong' };

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function DialogueBox({ persona, text, cta, onNext }) {
  return (
    <div className="dialogue">
      <span className="dialogue__avatar">
        <Avatar color={persona.color} size={64} />
      </span>
      <div className="dialogue__body">
        <p className="dialogue__name">
          {persona.name}
          {persona.age ? ` · ${persona.age}` : ''}
        </p>
        <p>{text}</p>
      </div>
      <PixelButton onClick={onNext}>{cta}</PixelButton>
    </div>
  );
}

// Gameplay for a built scenario, mounted inside GameScene.
// Phases: baseline -> explore -> consequence (five-year outlook, closing line) -> card.
export default function ScenarioRunner({ scenario: sc, content }) {
  const { state, setPhase, completeHotspot, collect, goTo } = useGame();
  const { run } = state;
  const persona = { ...sc.persona, color: content.persona.tint };
  const [openId, setOpenId] = useState(null);
  const [result, setResult] = useState(null);
  const [baselineOpen, setBaselineOpen] = useState(false);
  const [finaleSeen, setFinaleSeen] = useState(false);
  const [recent, setRecent] = useState(null);
  const [pos, setPos] = useState({ x: 50, y: 92 });
  const timer = useRef(null);

  const done = run.done;
  // Carry-over flags as they stood when this scenario started.
  const flags = run.flags || {};
  // Some stops only appear after an earlier choice (e.g. the town hall in Scenario 5).
  const hotspots = sc.hotspots.filter((h) => !h.when || h.when(done, flags));
  // Sequential scenarios unlock each stop once the one before it is done.
  const waiting = (h) => {
    if (!sc.sequential) return false;
    const i = hotspots.indexOf(h);
    return i > 0 && !done[hotspots[i - 1].id];
  };
  const totals = useMemo(() => sumPoints(Object.values(done).map((d) => d.points)), [done]);
  const allDone = hotspots.every((h) => done[h.id]);
  const open = hotspots.find((h) => h.id === openId);
  const outcome = sc.outcome(totals, done, flags);
  const showOutcome = run.phase === 'consequence' || run.phase === 'card';
  const Primitive = open && PRIMITIVES[open.kind];

  const visit = (h) => {
    // Walk to just below the object (or below the icon sprite).
    setPos(h.box ? { x: h.box.x + h.box.w / 2, y: Math.min(h.box.y + h.box.h + 6, 94) } : { x: h.x, y: Math.min(h.y + 12, 94) });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpenId(h.id), reducedMotion() ? 0 : 380);
  };

  // Mini-games (not plain choices) can be retried once; the best score is the one kept.
  const scoreOf = (r) => Object.values(r.points || {}).reduce((a, b) => a + b, 0);
  const finishHotspot = (res) => {
    // A stop can set carry-over flags from its result (e.g. fertilizing before the storm -> farm_runoff).
    const r = open.flags ? { ...res, setFlags: { ...res.setFlags, ...open.flags(res) } } : res;
    const prev = done[open.id];
    const attempts = (prev?.attempts || 0) + 1;
    const kept = prev && scoreOf(prev) > scoreOf(r) ? prev : r;
    completeHotspot(open.id, { ...kept, attempts });
    setResult({ ...r, attempts, keptEarlier: kept === prev });
  };
  const canRetry = result && !['choice', 'strip'].includes(open?.kind) && result.attempts <= 1;

  const closeHotspot = () => {
    if (result) {
      setRecent({ points: result.points, key: Date.now() });
    }
    setOpenId(null);
    setResult(null);
  };

  return (
    <div className="app-shell">
      <Nav plate={sc.plate} />
      <main className="scenario">
        <div className="scenario__main">
          <section
            className={`stage ${open?.zoom ? 'is-zoomed' : ''}`}
            aria-label="Scene"
            style={open?.zoom && open.box ? { '--zoom-x': `${open.box.x + open.box.w / 2}%`, '--zoom-y': `${open.box.y + open.box.h / 2}%` } : undefined}
          >
            {sc.Scene ? (
              <div className="scenery" aria-hidden="true">
                <sc.Scene {...sc.sceneState(done, showOutcome ? outcome : null, flags)} />
              </div>
            ) : (
              <Scenery
                src={content.background}
                blocks={sc.blocks}
                swap={{ ...sc.liveSwap?.(done), ...(showOutcome ? sc.consequence[outcome].swap : {}) }}
              />
            )}
            {/* Per-choice labels; the consequence frame shows its own. */}
            {!showOutcome && <div className="stage__overlays">{sc.overlays(done)}</div>}
            {sc.Hud && <sc.Hud done={done} />}

            {!showOutcome &&
              hotspots.map((h) =>
              h.box ? (
                // Illustrated scenes: the drawn object itself is the hotspot.
                <button
                  key={h.id}
                  type="button"
                  className={`hotspot-area ${done[h.id] ? 'is-done' : ''} ${h.labelBelow ? 'is-label-below' : ''}`}
                  style={{ left: `${h.box.x}%`, top: `${h.box.y}%`, width: `${h.box.w}%`, height: `${h.box.h}%` }}
                  disabled={run.phase !== 'explore' || Boolean(done[h.id]) || waiting(h)}
                  onClick={() => visit(h)}
                >
                  <span className="hotspot-area__label">
                    {done[h.id] && <Icon name="check" size={12} strokeWidth={3} />}
                    {h.label}
                  </span>
                </button>
              ) : (
                <button
                  key={h.id}
                  type="button"
                  className={`hotspot ${done[h.id] ? 'is-done' : ''}`}
                  style={{ left: `${h.x}%`, top: `${h.y}%` }}
                  disabled={run.phase !== 'explore' || Boolean(done[h.id]) || waiting(h)}
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
              ),
            )}

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

          {run.phase === 'consequence' && (
            <DialogueBox persona={persona} text={typeof sc.closing === 'string' ? sc.closing : sc.closing[outcome]} cta="Open knowledge card" onNext={() => setPhase('card')} />
          )}
        </div>

        <aside className="scenario__rail">
          <PixelCard className="mini-nina" style={{ '--persona': persona.color }}>
            <span className="mini-nina__avatar">
              <Avatar color={persona.color} size={40} />
            </span>
            <span>
              <span className="mini-nina__name">
                {persona.name}
                {persona.age ? ` · ${persona.age}` : ''}
              </span>
              <span className="mini-nina__quote">{persona.role}</span>
            </span>
          </PixelCard>

          <PixelCard className="stops">
            <h1 className="stops__title" tabIndex={-1}>
              {run.phase === 'explore' ? 'Click a spot on the scene' : 'Stops'}
            </h1>
            <ol className="stops__list">
              {hotspots.map((h) => (
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

          {sc.Rail && <sc.Rail done={done} />}

          {sc.Baseline && (
            <button type="button" className="pbtn pbtn--ghost pbtn--block rule-btn" onClick={() => setBaselineOpen(true)}>
              Baseline map
            </button>
          )}
          {run.phase === 'explore' && allDone && (
            <PixelButton className="pbtn--block" onClick={() => setPhase('consequence')}>
              See how it turns out
            </PixelButton>
          )}
          {run.phase === 'explore' && !allDone && (
            <p className="caption">
              {Object.keys(done).filter((id) => hotspots.some((h) => h.id === id)).length} of {hotspots.length} stops done.
            </p>
          )}
        </aside>
      </main>

      {open && (
        <Dialog labelledBy="hotspot-title" onClose={result ? closeHotspot : () => setOpenId(null)} className="hdialog">
          <div className="kcard__eyebrow">
            <span className="label">
              {persona.name} · {open.label}
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
              {(result.say || open.say?.[result.verdict]) && (
                <p className="feedback__say">
                  <span className="label">{persona.name}</span> “{result.say || open.say[result.verdict]}”
                </p>
              )}
              <p>{result.feedback}</p>
              {(result.source || open.source) && <SourceCard card={result.source || open.source} />}
              <PointChips points={result.points} emptyText="No change to the bars." />
              {result.links && (
                <ul className="kcard__links feedback__links">
                  {result.links.map((l) => (
                    <li key={l.href}>
                      <a href={l.href} target="_blank" rel="noopener noreferrer">
                        {l.label}
                        <Icon name="external" size={14} />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
              {result.compare && (
                <div className="compare">
                  <p className="label">Compare · the other choice</p>
                  <p className="compare__label">{result.compare.label}</p>
                  <PointChips points={result.compare.points} emptyText="No change to the bars." />
                  <p className="compare__note">{result.compare.note}</p>
                </div>
              )}
              {result.keptEarlier && <p className="caption">Your earlier try scored higher, so that one counts.</p>}
              <div className="feedback__actions">
                <PixelButton onClick={closeHotspot}>Continue</PixelButton>
                {canRetry && (
                  <button type="button" className="pbtn pbtn--ghost" onClick={() => setResult(null)}>
                    Try again (once)
                  </button>
                )}
              </div>
            </div>
          ) : (
            <Primitive key={done[open.id]?.attempts || 0} config={open.configFor ? open.configFor(done, flags) : open.config} onComplete={finishHotspot} />
          )}
        </Dialog>
      )}

      {sc.Baseline && (run.phase === 'baseline' || baselineOpen) && (
        <Dialog labelledBy="baseline-title" className="hdialog hdialog--wide" onClose={run.phase === 'baseline' ? undefined : () => setBaselineOpen(false)}>
          <div className="kcard__eyebrow">
            <span className="label">Baseline map · observed</span>
          </div>
          <h2 id="baseline-title" className="hdialog__prompt">
            {sc.baselineTitle}
          </h2>
          <sc.Baseline flags={flags} />
          <p className="caption">The starting condition, not a prediction. About 1 km across.</p>
          <PixelButton
            onClick={() => {
              setBaselineOpen(false);
              if (run.phase === 'baseline') setPhase('explore');
            }}
          >
            {run.phase === 'baseline' ? 'Look around' : 'Back to the scene'}
          </PixelButton>
        </Dialog>
      )}

      {run.phase === 'consequence' && sc.Finale && !finaleSeen && (
        <Dialog labelledBy="finale-title" className="hdialog hdialog--wide">
          <div className="kcard__eyebrow">
            <span className="label">Five-year outlook</span>
          </div>
          <h2 id="finale-title" className="hdialog__prompt">
            {sc.finaleTitle || 'The next five years'}
          </h2>
          <sc.Finale done={done} flags={flags} />
          <PixelButton onClick={() => setFinaleSeen(true)}>Continue</PixelButton>
        </Dialog>
      )}

      {run.phase === 'card' && (
        <KnowledgeCard
          scenario={sc}
          done={done}
          totals={totals}
          outcome={outcome}
          playerName={state.playerName}
          onCollect={() => collect(sc.id, { outcome, points: totals })}
          onBack={() => goTo('map')}
        />
      )}
    </div>
  );
}
