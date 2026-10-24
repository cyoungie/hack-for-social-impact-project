import { useState } from 'react';
import { useGame } from '../state/GameState.jsx';
import { SAFE_YIELD, VOTE_OPTIONS, consequenceChips, forecast } from '../data/game.js';
import { Nav, PixelButton, PixelCard, SegmentBar, SquareRadio } from '../components/ui.jsx';
import { Avatar } from '../components/Avatar.jsx';
import KnowledgeCard from './KnowledgeCard.jsx';

const RISK_LABEL = { low: 'Saltwater risk low', rising: 'Saltwater risk rising', severe: 'Saltwater risk severe' };

export default function Decisions() {
  const { state, setDecisions } = useGame();
  const { pumpRate, voteChoice } = state.decisions;
  const [cardOpen, setCardOpen] = useState(false);
  const chips = consequenceChips(pumpRate);
  const bars = forecast(pumpRate, voteChoice);

  return (
    <div className="app-shell">
      <Nav plate="HELPING NINA · DECISIONS 1–2 OF 2" />
      <main className="decisions">
        <div className="decisions__main">
          <PixelCard hero>
            <p className="label">Decision 1 · Slider</p>
            <h1 className="decision__title" tabIndex={-1}>
              Dry season forecast: 94 days. Set the village pumping rate.
            </h1>

            <div className="slider" style={{ '--v': pumpRate }}>
              <span className="slider__tick" style={{ '--tick': SAFE_YIELD }} aria-hidden="true">
                <span className="slider__tick-label">Safe yield</span>
              </span>
              <input
                type="range"
                min={0}
                max={100}
                value={pumpRate}
                aria-label="Village pumping rate"
                aria-valuetext={`${pumpRate} percent, safe yield is ${SAFE_YIELD}`}
                onChange={(e) => setDecisions({ pumpRate: Number(e.target.value) })}
              />
              <div className="slider__ends" aria-hidden="true">
                <span>Low</span>
                <span>Max</span>
              </div>
            </div>

            <div className="chips" aria-live="polite">
              <span className="chip chip--water">Water {chips.water} / mo</span>
              <span className="chip chip--people">People +{chips.people}</span>
              <span className={`chip chip--risk-${chips.risk}`}>{RISK_LABEL[chips.risk]}</span>
            </div>
            <p className="caption decision__caption">
              {pumpRate > SAFE_YIELD
                ? `You're ${pumpRate - SAFE_YIELD}% past safe yield. Comfortable now — the wells pay for it in year 6.`
                : 'Inside safe yield. The lens refills as fast as the village drinks.'}
            </p>
          </PixelCard>

          <PixelCard hero>
            <fieldset className="vote">
              <legend>
                <span className="label">Decision 2 · The vote</span>
                <span className="decision__title">
                  The 200-home proposal goes to the village Thursday. Your position?
                </span>
              </legend>
              <div className="vote__grid">
                {VOTE_OPTIONS.map((o) => (
                  <SquareRadio
                    key={o.id}
                    name="vote"
                    value={o.id}
                    checked={voteChoice === o.id}
                    onChange={(v) => setDecisions({ voteChoice: v })}
                  >
                    {o.label}
                  </SquareRadio>
                ))}
              </div>
            </fieldset>
          </PixelCard>

          <PixelButton className="pbtn--block" disabled={!voteChoice} onClick={() => setCardOpen(true)}>
            Lock in decisions
          </PixelButton>
        </div>

        <aside className="decisions__rail">
          <PixelCard className="mini-nina">
            <span className="mini-nina__avatar">
              <Avatar color="var(--water)" size={40} />
            </span>
            <span>
              <span className="mini-nina__name">Nina · 17 · Dededo</span>
              <span className="mini-nina__quote">"Thursday's meeting is in 3 days."</span>
            </span>
          </PixelCard>

          <PixelCard className="forecast">
            <p className="label">Live forecast · 10 years</p>
            {bars.map((b) => {
              const tone = b.end < 40 ? 'is-bad' : b.end > b.start ? 'is-good' : '';
              return (
                <div key={b.key} className="forecast__row">
                  <div className="forecast__head">
                    <span className="forecast__label" style={{ color: b.color }}>
                      {b.label}
                    </span>
                    <span className="forecast__nums">
                      {b.start} → <span className={tone}>{b.end}</span>
                    </span>
                  </div>
                  <SegmentBar value={b.end} color={b.color} label={`${b.label} in 10 years`} />
                </div>
              );
            })}
            <p className="caption">Updates live as you move the slider and pick options.</p>
          </PixelCard>

          <p className="caption">
            Lock in to see your knowledge card — what each choice does in the real Dededo, and what you can do about it
            this month.
          </p>
        </aside>
      </main>

      {cardOpen && <KnowledgeCard onClose={() => setCardOpen(false)} />}
    </div>
  );
}
