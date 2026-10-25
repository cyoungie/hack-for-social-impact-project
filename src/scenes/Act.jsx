import { useGame } from '../state/GameState.jsx';
import { PROBLEMS } from '../data/game.js';
import { INITIATIVES } from '../content/initiatives.js';
import { Nav } from '../components/ui.jsx';
import { Icon } from '../components/Icons.jsx';

export default function Act() {
  const { state } = useGame();
  const solved = state.solvedProblems;

  return (
    <div className="app-shell">
      <Nav plate="TAKE ACTION · GUAM" active="ACT" />
      <main className="act">
        <header className="act__head">
          <h1 tabIndex={-1}>Act — for real.</h1>
          <p className="lede">
            Every place on the map is a real problem on Guam right now. These are real programs you can join, use, or
            contact this month.
          </p>
        </header>

        {PROBLEMS.map((p) => (
          <section key={p.id} className="act__group" style={{ '--group': p.color }} aria-labelledby={`act-${p.id}`}>
            <div className="act__group-head">
              <span className="row__chip" style={{ background: p.color }}>
                {p.n}
              </span>
              <h2 id={`act-${p.id}`} className="act__title">
                {p.title}
              </h2>
              {solved.includes(p.id) && <span className="act__played">You played this</span>}
            </div>
            <div className="act__grid">
              {INITIATIVES[p.id].map((item) => (
                <a key={item.href} className="act-card" href={item.href} target="_blank" rel="noopener noreferrer">
                  <span className="act-card__org">{item.org}</span>
                  <span className="act-card__title">{item.title}</span>
                  <span className="act-card__body">{item.body}</span>
                  <span className="act-card__go">
                    Open site <Icon name="external" size={14} />
                  </span>
                </a>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
