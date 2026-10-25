import { useGame } from '../state/GameState.jsx';
import { BIOMES } from '../data/game.js';
import { matchBiome, searchPlaces } from '../data/biomeMatch.js';
import { PixelButton, StepSquares } from '../components/ui.jsx';
import { Icon } from '../components/Icons.jsx';
import { useComingSoon } from '../components/useComingSoon.jsx';
import { PlaceSearch } from '../components/PlaceSearch.jsx';

export default function Biome() {
  const { state, update, goTo } = useGame();
  const comingSoon = useComingSoon();
  const query = state.place;
  const setQuery = (place) => update({ place });
  const matchedId = matchBiome(query);
  const matched = BIOMES.find((b) => b.id === matchedId);
  const suggestions = searchPlaces(query);

  let lede = 'Search any city, state, or country — we will match it to the biome it works like.';
  if (matched) lede = `${query.trim()} works like ${matched.title}.`;
  else if (query.trim() && !suggestions.length) lede = "We couldn't place that yet — try a nearby city, a state, or a country.";

  let footNote = 'Other biomes unlock after your first decade.';
  if (matched && !matched.open) footNote = `${matched.title} unlocks after your first decade. Your first campaign is Guam.`;

  return (
    <main className="biome">
      <StepSquares step={2} label="Your ground" />
      <div className="biome__head">
        <h1 tabIndex={-1}>{matched ? "Here's your ground." : 'What would you like to explore?'}</h1>
        <PlaceSearch id="place-search" value={query} onChange={setQuery} placeholder="Search a place" />
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
