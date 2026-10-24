import { useCallback, useEffect, useRef, useState } from 'react';
import { useGame } from '../state/GameState.jsx';
import { CONTENT } from '../content/index.js';
import { PixelButton } from '../components/ui.jsx';
import { SceneBackdrop, PersonaSprite, PersonaPortrait } from '../components/SceneArt.jsx';

const CHARS_PER_SEC = 30;
const DEBOUNCE_MS = 150;
const ADVANCE_KEYS = [' ', 'Enter', 'e', 'E'];

const reducedMotion = () => Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

// Pixel arrows drawn from squares — no glyphs.
function PixelArrow({ double = false }) {
  const tri = (dx) => (
    <g key={dx} transform={`translate(${dx} 0)`}>
      <rect x="0" y="0" width="2" height="10" />
      <rect x="2" y="2" width="2" height="6" />
      <rect x="4" y="4" width="2" height="2" />
    </g>
  );
  return (
    <svg className="parrow" viewBox={`0 0 ${double ? 14 : 6} 10`} shapeRendering="crispEdges" aria-hidden="true">
      {tri(0)}
      {double && tri(8)}
    </svg>
  );
}

// Typewriter: chars shown grow with time since the bubble started; finish() jumps to the end.
// Setting instantRef before a bubble change makes that bubble appear fully typed.
function useTypewriter(text, instantRef) {
  const [shown, setShown] = useState(() => (reducedMotion() ? text.length : 0));
  const startRef = useRef(0);

  useEffect(() => {
    if (reducedMotion() || instantRef.current) {
      instantRef.current = false;
      setShown(text.length);
      return undefined;
    }
    startRef.current = performance.now();
    setShown(0);
    let raf;
    const tick = (now) => {
      const n = Math.min(text.length, Math.floor(((now - startRef.current) / 1000) * CHARS_PER_SEC));
      setShown(n);
      if (n < text.length) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, instantRef]);

  const finish = useCallback(() => {
    startRef.current = -Infinity;
    setShown(text.length);
  }, [text]);

  return { shown, done: shown >= text.length, finish };
}

export default function ScenarioIntro() {
  const { state, beginScenario, inputMode } = useGame();
  const id = state.introId;
  const content = CONTENT[id];
  const bubbles = content.intro;
  const [idx, setIdx] = useState(0);
  const text = bubbles[idx];
  const instantRef = useRef(false);
  const { shown, done, finish } = useTypewriter(text, instantRef);
  const isLast = idx === bubbles.length - 1;
  const gated = isLast && done; // only BEGIN! moves on from here
  const lastAction = useRef(0);
  const beginRef = useRef(null);
  const skipRef = useRef(null);

  // One step per input: finish typing, else next bubble. Never two at once.
  const advance = useCallback(() => {
    const now = performance.now();
    if (now - lastAction.current < DEBOUNCE_MS) return;
    lastAction.current = now;
    if (!done) finish();
    else if (!isLast) setIdx((i) => i + 1);
  }, [done, finish, isLast]);

  // Jump to the last bubble, fully typed — but never past the BEGIN! gate.
  const skip = useCallback(() => {
    if (isLast) {
      finish();
      return;
    }
    instantRef.current = true;
    setIdx(bubbles.length - 1);
  }, [isLast, finish, bubbles.length]);

  const begin = useCallback(() => beginScenario(id), [beginScenario, id]);

  // inputMode 'intro' consumes all keys. Tab still moves focus between Skip and BEGIN!.
  useEffect(() => {
    if (inputMode !== 'intro') return undefined;
    const onKey = (e) => {
      if (e.key === 'Tab') return;
      e.preventDefault();
      e.stopPropagation();
      if (e.repeat) return;
      const onBegin = document.activeElement === beginRef.current;
      const onSkip = document.activeElement === skipRef.current;
      if (e.key === 'Escape') skip();
      else if ((e.key === 'Enter' || e.key === ' ') && onBegin && gated) begin();
      else if ((e.key === 'Enter' || e.key === ' ') && onSkip) skip();
      else if (ADVANCE_KEYS.includes(e.key) && !gated) advance();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [inputMode, advance, skip, begin, gated]);

  useEffect(() => {
    if (gated) beginRef.current?.focus();
  }, [gated]);

  const completed = idx + (done ? 1 : 0);

  return (
    <main className="intro" onClick={gated ? undefined : advance}>
      <SceneBackdrop src={content.background} tint={content.persona.tint} className="intro__bg">
        <div className="intro__vignette" />
      </SceneBackdrop>

      <h1 className="intro__plate" tabIndex={-1}>
        {content.title} · {content.location}
      </h1>

      <button
        type="button"
        className="intro__skip"
        ref={skipRef}
        onClick={(e) => {
          e.stopPropagation();
          skip();
        }}
      >
        Skip <PixelArrow double />
      </button>

      <div className="intro__stand">
        <PersonaSprite persona={content.persona} className="intro__sprite" />
      </div>

      <div className="intro__dock">
        <div className="intro__progress" aria-label={`Bubble ${idx + 1} of ${bubbles.length}`}>
          {bubbles.map((_, i) => (
            <span key={i} className={`intro__sq ${i < completed ? 'is-filled' : ''}`} />
          ))}
        </div>

        <section className="dbox" aria-label={`${content.persona.name} says`}>
          <div className="dbox__who">
            <PersonaPortrait persona={content.persona} />
            <span className="dbox__name">{content.persona.name}</span>
          </div>
          <div className="dbox__body">
            {/* Full line for screen readers; the typed version is visual only. */}
            <p className="sr-only" aria-live="polite">
              {text}
            </p>
            <p className="dbox__text" aria-hidden="true">
              {text.slice(0, shown)}
              <span className="dbox__ghost">{text.slice(shown)}</span>
            </p>
          </div>

          {gated ? (
            <PixelButton
              ref={beginRef}
              className="dbox__begin"
              onClick={(e) => {
                e.stopPropagation();
                begin();
              }}
            >
              Begin!
            </PixelButton>
          ) : (
            done && (
              <span className="dbox__next">
                <PixelArrow />
              </span>
            )
          )}
        </section>
      </div>
    </main>
  );
}
