import { Icon } from './Icons.jsx';

// A fact card with its source (Scenario 4's Water Notes).
export function WaterNote({ note }) {
  return (
    <div className="water-note">
      <p className="label">Water Note · {note.title}</p>
      <p>{note.text}</p>
      {note.href ? (
        <a href={note.href} target="_blank" rel="noopener noreferrer" className="kc__link">
          {note.source} <Icon name="external" size={14} />
        </a>
      ) : (
        <p className="real-version__src">— {note.source}</p>
      )}
      {note.pending && <p className="caption water-note__pending">Source check pending.</p>}
    </div>
  );
}
