import { useState } from 'react';
import { PixelButton, SquareRadio } from '../components/ui.jsx';

// P1 — pick one option, "Recommend selection", the runner shows that option's feedback.
export default function ChoiceCard({ config, onComplete }) {
  const [choice, setChoice] = useState('');
  const option = config.options.find((o) => o.id === choice);

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
          })
        }
      >
        Recommend selection
      </PixelButton>
    </div>
  );
}
