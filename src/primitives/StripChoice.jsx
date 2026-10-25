import { useState } from 'react';
import { PixelButton } from '../components/ui.jsx';
import { usePick } from '../components/usePick.js';

// Drag one option onto a target (e.g. the strip above Rosa's field), then Recommend selection.
export default function StripChoice({ config, onComplete }) {
  const [placed, setPlaced] = useState(null);
  const { picked, itemProps, targetProps } = usePick();
  const option = config.options.find((o) => o.id === placed);

  return (
    <div className="prim">
      <div className="riskmap__toggles">
        {config.options.map((o) => (
          <button key={o.id} type="button" className={`token ${picked === o.id ? 'is-picked' : ''} ${placed === o.id ? 'is-placed' : ''}`} {...itemProps(o.id)}>
            {o.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        className={`strip-target ${picked ? 'is-target' : ''} ${placed ? `is-${placed}` : ''}`}
        aria-label={`${config.target}${option ? `: ${option.label}` : ''}. Drop an option here.`}
        {...targetProps(setPlaced)}
      >
        <span className="label">{config.target}</span>
        <span className="strip-target__what">{option ? option.label : 'Drag an option here — or click one, then here.'}</span>
      </button>
      <PixelButton
        className="pbtn--block"
        disabled={!option}
        onClick={() =>
          onComplete({
            points: option.points || {},
            feedback: option.feedback,
            verdict: option.correct ? 'correct' : 'wrong',
            state: option.id,
            setFlags: option.setFlags,
            source: option.source,
          })
        }
      >
        Recommend selection
      </PixelButton>
    </div>
  );
}
