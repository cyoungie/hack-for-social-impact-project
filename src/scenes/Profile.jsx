import { useState } from 'react';
import { useGame, dayKey } from '../state/GameState.jsx';
import { PROBLEMS, avatarColorValue } from '../data/game.js';
import { SCENARIOS, isBuilt, lockedBy } from '../scenarios/index.js';
import { Nav, PixelButton, PixelCard } from '../components/ui.jsx';
import { Avatar } from '../components/Avatar.jsx';
import { Icon } from '../components/Icons.jsx';
import { PointChips } from '../components/PointChips.jsx';

const XP_PER_CARD = 120;

// Consecutive days played, ending today (or yesterday, so a streak isn't lost before you play today).
function dayStreak(days) {
  const set = new Set(days);
  const d = new Date();
  if (!set.has(dayKey(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (set.has(dayKey(d))) {
    n += 1;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

function pathStatus(p, state) {
  if (state.solvedProblems.includes(p.id)) return { id: 'done', label: 'Done' };
  if (state.run?.id === p.id && isBuilt(p.id)) {
    const stops = SCENARIOS[p.id].hotspots.length;
    return { id: 'progress', label: `In progress · ${Object.keys(state.run.done).length}/${stops} stops` };
  }
  if (lockedBy(p.id, state.solvedProblems)) return { id: 'locked', label: 'Locked' };
  if (!isBuilt(p.id)) return { id: 'soon', label: 'Intro only — gameplay in production' };
  return { id: 'open', label: 'Ready to play' };
}

export default function Profile() {
  const { state, openIntro, resetProgress } = useGame();
  const [confirmReset, setConfirmReset] = useState(false);
  const solved = state.solvedProblems;
  const cards = solved.filter((id) => SCENARIOS[id]);
  const streak = dayStreak(state.playDays);
  const nextUp = PROBLEMS.find((p) => isBuilt(p.id) && !solved.includes(p.id) && !lockedBy(p.id, solved));

  return (
    <div className="app-shell">
      <Nav plate="YOUR PROFILE" active="PROFILE" />
      <main className="profile">
        <PixelCard hero className="profile__hero">
          <span className="profile__avatar">
            <Avatar color={avatarColorValue(state.avatarColor)} size={96} />
          </span>
          <div>
            <h1 tabIndex={-1}>{state.playerName}</h1>
            <p className="caption">
              Planner-in-training · Tropical Island{state.place.trim() ? ` · exploring from ${state.place.trim()}` : ''}
            </p>
          </div>
          {nextUp && (
            <PixelButton className="profile__continue" onClick={() => openIntro(nextUp.id)}>
              {state.run?.id === nextUp.id ? 'Continue' : 'Play next'}
            </PixelButton>
          )}
        </PixelCard>

        <div className="profile__stats">
          <PixelCard className="stat">
            <span className="stat__num">{cards.length * XP_PER_CARD}</span>
            <span className="label">Total XP</span>
          </PixelCard>
          <PixelCard className="stat">
            <span className="stat__num">
              {cards.length}
              <span className="stat__of"> / 5</span>
            </span>
            <span className="label">Knowledge cards</span>
          </PixelCard>
          <PixelCard className="stat">
            <span className="stat__num">{streak}</span>
            <span className="label">Day streak</span>
          </PixelCard>
        </div>

        <section className="profile__section" aria-labelledby="path-title">
          <h2 id="path-title" className="profile__h2">
            Your path · Tropical Island
          </h2>
          <ol className="path">
            {PROBLEMS.map((p) => {
              const status = pathStatus(p, state);
              const canOpen = status.id !== 'locked';
              const Tag = canOpen ? 'button' : 'div';
              return (
                <li key={p.id} className={`path__step is-${status.id}`}>
                  <Tag
                    {...(canOpen ? { type: 'button', onClick: () => openIntro(p.id) } : {})}
                    className="path__node"
                    style={{ '--node': p.color }}
                    aria-label={`${p.n}. ${p.title} — ${status.label}`}
                  >
                    {status.id === 'done' ? (
                      <Icon name="check" size={26} strokeWidth={3} />
                    ) : status.id === 'locked' ? (
                      <Icon name="lock" size={22} />
                    ) : (
                      p.n
                    )}
                  </Tag>
                  <div className="path__text">
                    <span className="path__title">{p.title}</span>
                    <span className="path__status">{status.label}</span>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="profile__section" aria-labelledby="cards-title">
          <h2 id="cards-title" className="profile__h2">
            Knowledge cards
          </h2>
          {cards.length === 0 ? (
            <p className="caption">Finish a scenario to collect its card. Each one explains the real version and links a real action.</p>
          ) : (
            <div className="kc-grid">
              {cards.map((id) => {
                const { card } = SCENARIOS[id];
                const result = state.results[id] || { outcome: 'good' };
                const p = PROBLEMS.find((x) => x.id === id);
                return (
                  <article key={id} className="kc" style={{ '--node': p.color }}>
                    <span className="label">{p.title}</span>
                    <h3 className="kc__title">{card.title[result.outcome]}</h3>
                    {result.points && <PointChips points={result.points} />}
                    <p className="kc__fact">{card.fact}</p>
                    <p className="real-version__src">— {card.source}</p>
                    <a href={card.actions[0].href} target="_blank" rel="noopener noreferrer" className="kc__link">
                      {card.actions[0].label} <Icon name="external" size={14} />
                    </a>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="profile__reset">
          {confirmReset ? (
            <>
              <span className="caption">This clears every card, streak, and scenario in progress. Your name stays.</span>
              <button type="button" className="pbtn pbtn--ghost" onClick={resetProgress}>
                Yes, start over
              </button>
              <button type="button" className="profile__link" onClick={() => setConfirmReset(false)}>
                Cancel
              </button>
            </>
          ) : (
            <button type="button" className="profile__link" onClick={() => setConfirmReset(true)}>
              Start over
            </button>
          )}
        </section>
      </main>
    </div>
  );
}
