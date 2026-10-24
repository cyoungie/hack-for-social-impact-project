import { useState } from 'react';
import { PixelButton } from '../components/ui.jsx';
import { usePick } from '../components/usePick.js';

// P7 — build a statement from N of the offered lines. Weak lines bounce back with a margin note.
export default function ComposeStatement({ config, onComplete }) {
  const [inBox, setInBox] = useState([]);
  const [locked, setLocked] = useState([]); // good lines that survived a submission
  const [returned, setReturned] = useState({}); // id -> margin note
  const [bounces, setBounces] = useState(0);
  const { picked, itemProps, targetProps } = usePick();

  const byId = (id) => config.lines.find((l) => l.id === id);
  const full = inBox.length >= config.need;

  const add = (id) => {
    if (full || inBox.includes(id)) return;
    setInBox((b) => [...b, id]);
  };

  const remove = (id) => {
    if (!locked.includes(id)) setInBox((b) => b.filter((x) => x !== id));
  };

  const submit = () => {
    const bad = inBox.filter((id) => !byId(id).good);
    if (!bad.length) {
      onComplete({
        points: { people: config.perGood * inBox.length },
        feedback:
          (bounces ? `${bounces} line${bounces > 1 ? 's' : ''} came back with notes before your comment was accepted. ` : '') +
          config.feedback,
        verdict: bounces ? 'ok' : 'correct',
        state: { lines: inBox.map((id) => byId(id).text) },
      });
      return;
    }
    setReturned((r) => ({ ...r, ...Object.fromEntries(bad.map((id) => [id, byId(id).note])) }));
    setBounces((n) => n + bad.length);
    setInBox((b) => b.filter((id) => byId(id).good));
    setLocked(inBox.filter((id) => byId(id).good));
  };

  return (
    <div className="prim">
      <div className="compose">
        <div className="compose__lines">
          {config.lines
            .filter((l) => !inBox.includes(l.id))
            .map((l) => (
              <div key={l.id} className="compose__slot">
                <button
                  type="button"
                  className={`compose__line ${picked === l.id ? 'is-picked' : ''} ${returned[l.id] ? 'is-returned' : ''}`}
                  disabled={full}
                  {...itemProps(l.id)}
                >
                  {l.text}
                </button>
                {returned[l.id] && (
                  <p className="compose__note">
                    <span className="label">Returned</span> {returned[l.id]}
                  </p>
                )}
              </div>
            ))}
        </div>

        <button
          type="button"
          className={`compose__box ${picked ? 'is-target' : ''}`}
          aria-label={`Your comment, ${inBox.length} of ${config.need} lines. Click to drop the picked line here.`}
          {...targetProps(add)}
        >
          <span className="label">
            {config.boxLabel} · {inBox.length} / {config.need}
          </span>
          {inBox.length === 0 && <span className="caption">Drag lines here — or click a line, then click here.</span>}
        </button>
        <ol className="compose__chosen">
          {inBox.map((id) => (
            <li key={id}>
              <span>{byId(id).text}</span>
              {!locked.includes(id) && (
                <button type="button" className="compose__remove" onClick={() => remove(id)}>
                  Remove
                </button>
              )}
            </li>
          ))}
        </ol>
      </div>

      <PixelButton className="pbtn--block" disabled={!full} onClick={submit}>
        Submit comment
      </PixelButton>
    </div>
  );
}
