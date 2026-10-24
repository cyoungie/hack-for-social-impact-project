import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useGame } from '../state/GameState.jsx';
import { PROBLEMS } from '../data/game.js';
import { STATS } from '../data/scoring.js';
import { isBuilt, lockedBy } from '../scenarios/index.js';
import { Nav, Plate, SegmentBar } from '../components/ui.jsx';
import { Icon } from '../components/Icons.jsx';
import { PointChips } from '../components/PointChips.jsx';

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

// Zoom/pan survives leaving for an intro or a scenario (session only, not saved).
let savedView = { z: 1, x: 0, y: 0 };

const PLACEMENTS = {
  right: (p) => ({ top: `${p.y}%`, left: `calc(${p.x}% + 42px * var(--inv))`, transformOrigin: 'left top' }),
  left: (p) => ({ top: `${p.y}%`, right: `calc(${100 - p.x}% + 42px * var(--inv))`, transformOrigin: 'right top' }),
  below: (p) => ({ top: `calc(${p.y}% + 40px * var(--inv))`, left: `${p.x}%`, translate: '-50% 0', transformOrigin: 'center top' }),
};

// Sits beside the badge; flips left, then drops below, if it would spill out of the ocean viewport.
function CueCard({ problem, solved, boundsRef }) {
  const ref = useRef(null);
  const [placement, setPlacement] = useState(problem.x > 55 ? 'left' : 'right');
  const style = PLACEMENTS[placement](problem);
  const blocker = lockedBy(problem.id, solved);

  useLayoutEffect(() => {
    const card = ref.current?.getBoundingClientRect();
    const bounds = boundsRef.current?.getBoundingClientRect();
    if (!card || !bounds || placement === 'below') return;
    const overflows = card.left < bounds.left || card.right > bounds.right;
    if (overflows) setPlacement(placement === 'right' ? 'left' : 'below');
  }, [placement, boundsRef]);

  let status = null;
  if (blocker) status = `LOCKED — solve ${blocker.title.split(' · ')[0]} first`;

  return (
    <div
      className={`cue cue--${placement} ${status ? 'is-locked' : ''}`}
      style={style}
      ref={ref}
      role="tooltip"
      id={`cue-${problem.id}`}
    >
      <div className="cue__head">
        <span className="cue__title">{problem.title}</span>
        <Plate tone={status ? 'plain' : 'water'} style={status ? undefined : { background: problem.color }}>
          {problem.tag}
        </Plate>
      </div>
      {status ? (
        <>
          <p className="cue__body">{problem.line}</p>
          <p className="cue__locked">
          <Icon name="lock" size={16} />
          {status}
          </p>
        </>
      ) : (
        <>
          <p className="cue__body">{problem.body ?? problem.line}</p>
          <div className="cue__foot">
            <span className="cue__difficulty">
              <span className="label">Difficulty</span>
              {[0, 1, 2].map((i) => (
                <span key={i} className={`cue__dot ${i < problem.difficulty ? 'is-filled' : ''}`} />
              ))}
            </span>
            <span className="cue__cta">
              {solved.includes(problem.id) ? 'Solved · play again' : `Click to meet ${problem.persona.name}`}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

// Wheel zooms toward the cursor, drag pans, buttons for keyboard. Pan is clamped so the island stays in view.
function usePanZoom(viewRef) {
  const [view, setView] = useState(savedView);
  const drag = useRef(null);

  useEffect(() => {
    savedView = view;
  }, [view]);

  const clamp = (v) => {
    const r = viewRef.current?.getBoundingClientRect();
    if (!r) return v;
    const mx = ((v.z - 1) * r.width) / 2;
    const my = ((v.z - 1) * r.height) / 2;
    return { z: v.z, x: Math.max(-mx, Math.min(mx, v.x)), y: Math.max(-my, Math.min(my, v.y)) };
  };

  // Zoom keeping the point (px, py) — relative to the viewport center — fixed on screen.
  const zoomAt = (factor, px = 0, py = 0) =>
    setView((v) => {
      const z = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, v.z * factor));
      const k = z / v.z;
      return clamp({ z, x: px - (px - v.x) * k, y: py - (py - v.y) * k });
    });

  useEffect(() => {
    const el = viewRef.current;
    if (!el) return undefined;
    const onWheel = (e) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      zoomAt(Math.exp(-e.deltaY * 0.0018), e.clientX - r.left - r.width / 2, e.clientY - r.top - r.height / 2);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pointerHandlers = {
    onPointerDown: (e) => {
      if (e.button !== 0 || e.target.closest('button, .cue')) return;
      drag.current = { sx: e.clientX, sy: e.clientY, ox: view.x, oy: view.y };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    onPointerMove: (e) => {
      const d = drag.current;
      if (!d) return;
      setView((v) => clamp({ z: v.z, x: d.ox + e.clientX - d.sx, y: d.oy + e.clientY - d.sy }));
    },
    onPointerUp: () => {
      drag.current = null;
    },
  };

  return {
    view,
    pointerHandlers,
    zoomIn: () => zoomAt(1.5),
    zoomOut: () => zoomAt(1 / 1.5),
    reset: () => setView({ z: 1, x: 0, y: 0 }),
  };
}

export default function ProblemMap() {
  const { state, update, openIntro } = useGame();
  const [active, setActive] = useState(null);
  const [imgOk, setImgOk] = useState(true);
  const oceanRef = useRef(null);
  const viewRef = useRef(null);
  const { view, pointerHandlers, zoomIn, zoomOut, reset } = usePanZoom(viewRef);
  const solved = state.solvedProblems;
  const activeProblem = PROBLEMS.find((p) => p.id === active);
  const builtCount = PROBLEMS.filter((p) => isBuilt(p.id)).length;

  const playable = (p) => !lockedBy(p.id, solved);
  const enter = (p) => {
    if (playable(p)) openIntro(p.id);
  };

  // Float the last card's points up once, then clear them.
  useEffect(() => {
    if (!state.lastGain) return undefined;
    const t = setTimeout(() => update({ lastGain: null }), 2600);
    return () => clearTimeout(t);
  }, [state.lastGain, update]);

  return (
    <div className="app-shell">
      <Nav plate="GUAM · TROPICAL ISLAND" active="ISLAND" />
      <main className="map">
        <section className="ocean" aria-label="Map of Guam" ref={oceanRef}>
          <div className="ocean__ripples" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>

          <div className={`mapview ${view.z > 1 ? 'is-zoomed' : ''}`} ref={viewRef} {...pointerHandlers}>
            <div
              className="mapview__layer"
              style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.z})`, '--inv': 1 / view.z }}
            >
              <div className={`island ${active ? 'has-active' : ''}`}>
                {imgOk ? (
                  <img
                    className="island__img"
                    src="/guam-pixel.png"
                    alt="Satellite view of Guam"
                    draggable={false}
                    onError={() => setImgOk(false)}
                  />
                ) : (
                  <div className="island__placeholder" role="img" aria-label="Guam island image placeholder">
                    guam-pixel.png
                  </div>
                )}

                {PROBLEMS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`badge ${active === p.id ? 'is-active' : ''} ${playable(p) ? '' : 'is-locked'}`}
                    style={{ left: `${p.x}%`, top: `${p.y}%`, '--badge-color': p.color }}
                    aria-label={`${p.n}. ${p.title}${playable(p) ? '' : ' (locked)'}`}
                    aria-describedby={active === p.id ? `cue-${p.id}` : undefined}
                    aria-disabled={!playable(p) || undefined}
                    onMouseEnter={() => setActive(p.id)}
                    onMouseLeave={() => setActive(null)}
                    onFocus={() => setActive(p.id)}
                    onBlur={() => setActive(null)}
                    onClick={() => enter(p)}
                  >
                    {p.n}
                    {solved.includes(p.id) && (
                      <span className="badge__check">
                        <Icon name="check" size={14} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                ))}

                {activeProblem && (
                  <CueCard key={activeProblem.id} problem={activeProblem} solved={solved} boundsRef={oceanRef} />
                )}
              </div>
            </div>
          </div>

          <span className="wood-plate">Guam</span>

          <div className="zoom" role="group" aria-label="Map zoom">
            <button type="button" className="zoom__btn" onClick={zoomIn} disabled={view.z >= MAX_ZOOM} aria-label="Zoom in">
              +
            </button>
            <button type="button" className="zoom__btn" onClick={zoomOut} disabled={view.z <= MIN_ZOOM} aria-label="Zoom out">
              −
            </button>
            <button type="button" className="zoom__btn zoom__btn--wide" onClick={reset} disabled={view.z === 1}>
              Fit
            </button>
          </div>

          <div className="ocean__strip">
            <span>{view.z > 1 ? `${view.z.toFixed(1)}× · drag to pan` : 'North sits on the aquifer recharge zone'}</span>
            <span>Sentinel-2 · 2026</span>
          </div>
        </section>

        <aside className="sidebar">
          <h1 tabIndex={-1}>Five places need you.</h1>
          <p className="caption">Hover a block to preview. Click to meet who lives there.</p>
          <p className="solved-count">{solved.length} / 5 Solved</p>

          <ul className={`rows ${active ? 'has-active' : ''}`}>
            {PROBLEMS.map((p) => {
              const content = (
                <>
                  <span className="row__chip" style={{ background: p.color }}>
                    {p.n}
                    {solved.includes(p.id) && (
                      <span className="row__check">
                        <Icon name="check" size={14} strokeWidth={3} />
                      </span>
                    )}
                  </span>
                  <span className="row__text">
                    <span className="row__title">{p.title}</span>
                    <span className="row__line">{p.line}</span>
                  </span>
                  <Icon name={playable(p) ? 'chevron' : 'lock'} size={18} className="row__chev" />
                </>
              );
              const cls = `row ${active === p.id ? 'is-active' : ''} ${playable(p) ? '' : 'is-locked'}`;
              return (
                <li key={p.id} onMouseEnter={() => setActive(p.id)} onMouseLeave={() => setActive(null)}>
                  {playable(p) ? (
                    <button type="button" className={cls} onClick={() => enter(p)}>
                      {content}
                    </button>
                  ) : (
                    <div className={cls}>{content}</div>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="health">
            <div className="health__head">
              <span className="label">Island health</span>
              {state.lastGain && <PointChips points={state.lastGain} float />}
            </div>
            {STATS.map((s) => (
              <div key={s.key} className="health__row">
                <span className="health__label" style={{ color: s.color }}>
                  {s.label}
                </span>
                <SegmentBar value={state.bars[s.key]} color={s.color} label={`${s.label} ${state.bars[s.key]}`} />
                <span className="health__num">{state.bars[s.key]}</span>
              </div>
            ))}
          </div>

          <p className="sidebar__foot">
            {builtCount} of 5 places are fully playable so far. Solve all five to unlock your island proposal — a real one-pager
            you can bring to a real meeting.
          </p>
        </aside>
      </main>
    </div>
  );
}
