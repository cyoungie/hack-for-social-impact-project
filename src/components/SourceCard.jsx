import { Icon } from './Icons.jsx';

// The fact behind a choice and the organisation that backs it.
// card: { title?, text, source, href?, links?: [{ label, href }], pending? }
export function SourceCard({ card }) {
  return (
    <div className="water-note source-card">
      <p className="label">Source · {card.source}</p>
      {card.title && <p className="source-card__title">{card.title}</p>}
      <p>{card.text}</p>
      {card.href && (
        <a href={card.href} target="_blank" rel="noopener noreferrer" className="kc__link">
          Read the source <Icon name="external" size={14} />
        </a>
      )}
      {card.links?.map((l) => (
        <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="kc__link">
          {l.label} <Icon name="external" size={14} />
        </a>
      ))}
      {card.pending && <p className="caption water-note__pending">{card.pending}</p>}
    </div>
  );
}
