import { useState } from 'react';
import { PixelButton, SquareRadio } from '../components/ui.jsx';
import { compareWith } from '../data/scoring.js';

// P1 — pick one option, "Recommend selection", the runner shows that option's feedback.
export default function ChoiceCard({ config, onComplete }) {
  const [choice, setChoice] = useState('');
  const option = config.options.find((o) => o.id === choice);
  // Compare against the best choice — or, if you made it, the most common wrong one.
  const alternative = (o) =>
    o.correct ? config.options.find((x) => !x.correct && !x.ok) : config.options.find((x) => x.correct);

  return (
    <div className="prim">
      <fieldset className="vote">
        <legend className="sr-only">{config.prompt}</legend>
        <div className={`vote__grid ${config.options.length > 3 ? '' : 'vote__grid--stack'}`}>
          {config.options.map((o) => (
            <SquareRadio key={o.id} name="choice" value={o.id} checked={choice === o.id} onChange={setChoice}>
              {o.label}
            </SquareRadio>
          ))}
        </div>
      </fieldset>
      <PixelButton
        className="pbtn--block"
        disabled={!option}
        onClick={() =>
          onComplete({
            points: option.points || {},
            feedback: option.feedback,
            verdict: option.correct ? 'correct' : option.ok ? 'ok' : 'wrong',
            state: option.id,
            setFlags: option.setFlags,
            source: option.source,
            compare: (() => {
              const alt = alternative(option);
              return alt && compareWith(alt.label, alt.points, alt.feedback);
            })(),
          })
        }
      >
        Recommend selection
      </PixelButton>
    </div>
  );
}
