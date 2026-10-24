import { useState } from 'react';
import { formatPoints } from '../data/scoring.js';
import { PixelButton } from '../components/ui.jsx';
import { Icon } from '../components/Icons.jsx';
import { Dialog } from '../components/Dialog.jsx';
import { PointChips } from '../components/PointChips.jsx';

export default function KnowledgeCard({ scenario, done, totals, outcome, playerName, onCollect, onBack }) {
  const { card, hotspots } = scenario;
  const letter = card.letter?.(done, playerName);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(letter);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Dialog labelledBy="kcard-title">
      <div className="kcard__eyebrow">
        <span className="label">Knowledge card unlocked</span>
        <span className="kcard__xp">+120 XP</span>
      </div>
      <h2 id="kcard-title" className="kcard__title">
        {card.title[outcome]}
      </h2>

      <p className="label">In your run</p>
      <p className="kcard__run">
        Across {hotspots.length} stops you moved the island: {formatPoints(totals)}.
      </p>
      <PointChips points={totals} />

      <div className="real-version">
        <p className="label">The real version</p>
        <p>{card.fact}</p>
        <p className="real-version__src">— {card.source}</p>
      </div>

      <p className="label">Take action — near you</p>
      <p className="kcard__action">{card.actionLabel}</p>
      <ul className="kcard__links">
        {card.actions.map((l) => (
          <li key={l.href}>
            <a href={l.href} target="_blank" rel="noopener noreferrer">
              {l.label}
              <Icon name="external" size={14} />
            </a>
          </li>
        ))}
      </ul>

      {letter && (
        <div className="letter">
          <div className="kcard__eyebrow">
            <span className="label">Your comment, ready to send</span>
            <button type="button" className="hdialog__close" onClick={copy}>
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="letter__text">{letter}</pre>
        </div>
      )}

      <div className="kcard__actions">
        <PixelButton onClick={onCollect}>Collect card</PixelButton>
        <button type="button" className="pbtn pbtn--ghost" onClick={onBack}>
          Back to map
        </button>
      </div>
    </Dialog>
  );
}
