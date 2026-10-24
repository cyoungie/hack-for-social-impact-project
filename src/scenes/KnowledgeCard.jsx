import { useEffect, useRef } from 'react';
import { useGame } from '../state/GameState.jsx';
import { ACTION_LINKS, KNOWLEDGE_TITLES, SAFE_YIELD, VOTE_PHRASES, forecast } from '../data/game.js';
import { PixelButton } from '../components/ui.jsx';
import { Icon } from '../components/Icons.jsx';

export default function KnowledgeCard({ onClose }) {
  const { state, goTo, solve } = useGame();
  const { pumpRate, voteChoice } = state.decisions;
  const bars = forecast(pumpRate, voteChoice);
  const water = bars.find((b) => b.key === 'water');
  const people = bars.find((b) => b.key === 'people');
  const dialogRef = useRef(null);

  const pumpPhrase =
    pumpRate > SAFE_YIELD ? `${pumpRate - SAFE_YIELD}% past safe yield` : `at ${pumpRate}, inside safe yield`;

  useEffect(() => {
    dialogRef.current?.querySelector('button')?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        // Keep focus inside the dialog.
        const focusables = dialogRef.current.querySelectorAll('a, button');
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const collect = () => {
    solve('lens');
    goTo('map');
  };

  return (
    <div className="overlay">
      <div className="kcard" role="dialog" aria-modal="true" aria-labelledby="kcard-title" ref={dialogRef}>
        <div className="kcard__eyebrow">
          <span className="label">Knowledge card unlocked</span>
          <span className="kcard__xp">+120 XP</span>
        </div>
        <h2 id="kcard-title" className="kcard__title">
          {KNOWLEDGE_TITLES[voteChoice]}
        </h2>

        <p className="label">In your run</p>
        <p className="kcard__run">
          You pumped {pumpPhrase} and {VOTE_PHRASES[voteChoice]}. Over ten years, Dededo's water went {water.start} →{' '}
          {water.end} and its people went {people.start} → {people.end}.
        </p>

        <div className="real-version">
          <p className="label">The real version</p>
          <p>
            Northern Guam's limestone recharges the lens aquifer that supplies most of the island's drinking water.
            Build and septic over it, pump it harder, and USGS projects saltwater creeping into the wells. Where housing
            goes is a water decision.
          </p>
          <p className="real-version__src">— USGS SIR 2019-5095 · Guam Watershed Plan</p>
        </div>

        <p className="label">Take action — near you</p>
        <ul className="kcard__links">
          {ACTION_LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} target="_blank" rel="noopener noreferrer">
                {l.label}
                <Icon name="external" size={14} />
              </a>
            </li>
          ))}
        </ul>

        <div className="kcard__actions">
          <PixelButton onClick={collect}>Collect card</PixelButton>
          <button type="button" className="pbtn pbtn--ghost" onClick={() => goTo('map')}>
            Back to map
          </button>
        </div>
      </div>
    </div>
  );
}
