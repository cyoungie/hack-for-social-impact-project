import { useState } from 'react';
import { useGame } from '../state/GameState.jsx';
import { BIOMES } from '../data/game.js';
import { matchBiome } from '../data/biomeMatch.js';
import { PixelButton, StepSquares } from '../components/ui.jsx';
import { Icon } from '../components/Icons.jsx';
import { useComingSoon } from '../components/useComingSoon.jsx';

export default function Biome() {
  const { goTo } = useGame();
  const comingSoon = useComingSoon();
  const [hometown, setHometown] = useState('Dededo, Guam');
  const matchedId = matchBiome(hometown);
  const matched = BIOMES.find((b) => b.id === matchedId);

  let lede = 'Type your city, state, or country and we will match it to a biome.';
  if (matched) lede = `We matched your hometown to ${matched.title} — your campaign starts on land that works like home.`;
  else if (hometown.trim()) lede = "We couldn't place that yet — try a nearby city, a state, or a country.";

  let footNote = 'Other biomes unlock after your first decade.';
  if (matched && !matched.open) footNote = `${matched.title} unlocks after your first decade. Your first campaign is Guam.`;

  return (
    <main className="biome">
      <StepSquares step={2} label="Your ground" />
      <div className="biome__head">
        <h1 tabIndex={-1}>Where are you from?</h1>
        <div className="input-icon">
          <label className="sr-only" htmlFor="hometown">
            Hometown
          </label>
          <input
            id="hometown"
            className="input"
            value={hometown}
            placeholder="City, state, or country"
            autoComplete="off"
            onChange={(e) => setHometown(e.target.value)}
          />
          <Icon name="pin" size={18} />
        </div>
      </div>
      <p className="lede" aria-live="polite">
        {lede}
      </p>

      <div className="biome__grid">
        {BIOMES.map((b) => {
          const isYours = b.id === matchedId;
          return (
            <button
              key={b.id}
              type="button"
              className={`biome-card ${isYours ? 'is-selected' : 'is-muted'}`}
              aria-current={isYours ? 'true' : undefined}
              onClick={() => (b.open ? goTo('postcard') : comingSoon(b.title))}
            >
              {isYours && <span className="biome-card__tag">Yours</span>}
              <Icon name={b.icon} size={26} />
              <span className="biome-card__title">{b.title}</span>
              <span className="biome-card__body">{b.body}</span>
              {!b.open && <span className="biome-card__soon">Coming soon</span>}
            </button>
          );
        })}
      </div>

      <div className="biome__foot">
        <p className="caption">{footNote}</p>
        <PixelButton onClick={() => goTo('postcard')}>
          {matched?.open ? 'Enter tropical island' : 'Start on tropical island'}
        </PixelButton>
      </div>
    </main>
  );
}
