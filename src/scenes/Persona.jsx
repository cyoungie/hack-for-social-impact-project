import { useState } from 'react';
import { useGame } from '../state/GameState.jsx';
import { NINA_LINES } from '../data/game.js';
import { Nav, PixelButton, PixelCard, Plate } from '../components/ui.jsx';
import { Avatar } from '../components/Avatar.jsx';

export default function Persona() {
  const { goTo } = useGame();
  const [shown, setShown] = useState(1);
  const done = shown >= NINA_LINES.length;
  const advance = () => setShown((n) => Math.min(n + 1, NINA_LINES.length));

  return (
    <div className="app-shell">
      <Nav plate="THE LENS · DEDEDO · 1 OF 5" />
      <main className="persona" onClick={done ? undefined : advance}>
        <PixelCard hero className="persona__card">
          <div className="persona__avatar">
            <Avatar color="var(--water)" size={140} />
          </div>
          <h1 tabIndex={-1}>Nina · 17</h1>
          <p className="persona__meta">
            Student, Dededo
            <br />
            Family on village water
          </p>
          <div className="persona__tags">
            <Plate tone="water">Water</Plate>
            <Plate tone="plain">Problem 1 of 5</Plate>
          </div>
          <div className="real-version">
            <p className="label">The real version</p>
            <p>
              Northern Guam wells already show rising chloride as pumping, drought, and sea level stack up. — USGS SIR
              2019-5095
            </p>
          </div>
        </PixelCard>

        <section className="chat" aria-live="polite">
          {NINA_LINES.slice(0, shown).map((line, i) =>
            i === NINA_LINES.length - 1 ? (
              <div key={i} className="bubble bubble--ask">
                <p className="label">Nina needs your help</p>
                <p>{line}</p>
              </div>
            ) : (
              <div key={i} className="bubble">
                <p>{line}</p>
              </div>
            ),
          )}

          <div className="chat__progress">
            <span className="chat__squares" aria-hidden="true">
              {NINA_LINES.map((_, i) => (
                <span key={i} className={`chat__sq ${i < shown ? 'is-filled' : ''}`} />
              ))}
            </span>
            {!done && (
              <button
                type="button"
                className="chat__next label"
                onClick={(e) => {
                  e.stopPropagation();
                  advance();
                }}
              >
                Click anywhere to continue
              </button>
            )}
          </div>

          {done && (
            <PixelButton className="pbtn--block chat__help" onClick={() => goTo('decisions')} autoFocus>
              Help Nina
            </PixelButton>
          )}
        </section>
      </main>
    </div>
  );
}
