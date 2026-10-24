import { useLayoutEffect, useRef, useState } from 'react';
import { useGame } from '../state/GameState.jsx';
import { PROBLEMS } from '../data/game.js';
import { Nav, Plate } from '../components/ui.jsx';
import { Icon } from '../components/Icons.jsx';

const PLACEMENTS = {
  right: (p) => ({ top: `${p.y}%`, left: `calc(${p.x}% + 42px)` }),
  left: (p) => ({ top: `${p.y}%`, right: `calc(${100 - p.x}% + 42px)` }),
  below: (p) => ({ top: `calc(${p.y}% + 74px)`, left: `${p.x}%`, translate: '-50% 0' }),
};

// Sits beside the badge; flips left, then drops below, if it would spill out of the ocean viewport.
function CueCard({ problem, solvedLens, boundsRef }) {
  const ref = useRef(null);
  const [placement, setPlacement] = useState(problem.x > 55 ? 'left' : 'right');
  const style = PLACEMENTS[placement](problem);

  useLayoutEffect(() => {
    const card = ref.current?.getBoundingClientRect();
    const bounds = boundsRef.current?.getBoundingClientRect();
    if (!card || !bounds || placement === 'below') return;
    const overflows = card.left < bounds.left || card.right > bounds.right;
    if (overflows) setPlacement(placement === 'right' ? 'left' : 'below');
  }, [placement, boundsRef]);

  if (!problem.open) {
    return (
      <div className="cue is-locked" style={style} ref={ref} role="tooltip" id={`cue-${problem.id}`}>
        <div className="cue__head">
          <span className="cue__title">{problem.title}</span>
          <Plate tone="plain">{problem.tag}</Plate>
        </div>
        <p className="cue__locked">
          <Icon name="lock" size={16} />
          {solvedLens ? 'LOCKED — opens in a later build' : 'LOCKED — solve The Lens first'}
        </p>
      </div>
    );
  }

  return (
    <div className="cue" style={style} ref={ref} role="tooltip" id={`cue-${problem.id}`}>
      <div className="cue__head">
        <span className="cue__title">{problem.title}</span>
        <Plate tone="water">{problem.tag}</Plate>
      </div>
      <p className="cue__body">{problem.body}</p>
      <div className="cue__foot">
        <span className="cue__difficulty">
          <span className="label">Difficulty</span>
          {[0, 1, 2].map((i) => (
            <span key={i} className={`cue__dot ${i < problem.difficulty ? 'is-filled' : ''}`} />
          ))}
        </span>
        <span className="cue__cta">Click to meet Nina</span>
      </div>
    </div>
  );
}

export default function ProblemMap() {
  const { state, goTo } = useGame();
  const [active, setActive] = useState(null);
  const [imgOk, setImgOk] = useState(true);
  const oceanRef = useRef(null);
  const solved = state.solvedProblems;
  const solvedLens = solved.includes('lens');
  const activeProblem = PROBLEMS.find((p) => p.id === active);

  const enter = (p) => {
    if (p.open) goTo('persona');
  };

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
          <span className="wood-plate">Guam</span>

          <div className={`island ${active ? 'has-active' : ''}`}>
            {imgOk ? (
              <img
                className="island__img"
                src="/guam-pixel.png"
                alt="Pixel-art satellite view of Guam"
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
                className={`badge ${active === p.id ? 'is-active' : ''} ${p.open ? '' : 'is-locked'}`}
                style={{ left: `${p.x}%`, top: `${p.y}%`, '--badge-color': p.color }}
                aria-label={`${p.n}. ${p.title}${p.open ? '' : ' (locked)'}`}
                aria-describedby={active === p.id ? `cue-${p.id}` : undefined}
                aria-disabled={!p.open || undefined}
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
              <CueCard key={activeProblem.id} problem={activeProblem} solvedLens={solvedLens} boundsRef={oceanRef} />
            )}
          </div>

          <div className="ocean__strip">
            <span>North sits on the aquifer recharge zone</span>
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
                    <span className="row__line">
                      {p.stat} · {p.line}
                    </span>
                  </span>
                  <Icon name={p.open ? 'chevron' : 'lock'} size={18} className="row__chev" />
                </>
              );
              const cls = `row ${active === p.id ? 'is-active' : ''} ${p.open ? '' : 'is-locked'}`;
              return (
                <li key={p.id} onMouseEnter={() => setActive(p.id)} onMouseLeave={() => setActive(null)}>
                  {p.open ? (
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

          <p className="sidebar__foot">
            Solve all five to unlock your island proposal — a real one-pager you can bring to a real meeting.
          </p>
        </aside>
      </main>
    </div>
  );
}
