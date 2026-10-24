import { useState } from 'react';
import { useGame } from '../state/GameState.jsx';
import { BIOMES } from '../data/game.js';
import { matchBiome, searchPlaces } from '../data/biomeMatch.js';
import { PixelButton, StepSquares } from '../components/ui.jsx';
import { Icon } from '../components/Icons.jsx';
import { useComingSoon } from '../components/useComingSoon.jsx';

export default function Biome() {
  const { goTo } = useGame();
  const comingSoon = useComingSoon();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(-1);
  const matchedId = matchBiome(query);
  const matched = BIOMES.find((b) => b.id === matchedId);
  const suggestions = searchPlaces(query);
  const showList = open && suggestions.length > 0;
  const biomeOf = (id) => BIOMES.find((b) => b.id === id);

  const pick = (s) => {
    setQuery(s.name);
    setOpen(false);
    setCursor(-1);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown' && suggestions.length) {
      e.preventDefault();
      setOpen(true);
      setCursor((c) => (c + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp' && suggestions.length) {
      e.preventDefault();
      setCursor((c) => (c <= 0 ? suggestions.length - 1 : c - 1));
    } else if (e.key === 'Enter' && showList && cursor >= 0) {
      e.preventDefault();
      pick(suggestions[cursor]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  let lede = 'Search any city, state, or country — we will match it to the biome it works like.';
  if (matched) lede = `${query.trim()} works like ${matched.title}.`;
  else if (query.trim() && !suggestions.length) lede = "We couldn't place that yet — try a nearby city, a state, or a country.";

  let footNote = 'Other biomes unlock after your first decade.';
  if (matched && !matched.open) footNote = `${matched.title} unlocks after your first decade. Your first campaign is Guam.`;

  return (
    <main className="biome">
      <StepSquares step={2} label="Your ground" />
      <div className="biome__head">
        <h1 tabIndex={-1}>What would you like to explore?</h1>
        <div className="search">
          <div className="input-icon">
            <label className="sr-only" htmlFor="place-search">
              Search a place
            </label>
            <input
              id="place-search"
              className="input"
              type="search"
              role="combobox"
              aria-expanded={showList}
              aria-controls="place-list"
              aria-autocomplete="list"
              aria-activedescendant={showList && cursor >= 0 ? `place-${cursor}` : undefined}
              value={query}
              placeholder="Search a city, state, or country"
              autoComplete="off"
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
                setCursor(-1);
              }}
              onFocus={() => setOpen(true)}
              onBlur={() => setOpen(false)}
              onKeyDown={onKeyDown}
            />
            <Icon name="search" size={18} />
          </div>
          {showList && (
            <ul className="search__list" id="place-list" role="listbox" aria-label="Places">
              {suggestions.map((s, i) => (
                <li
                  key={`${s.name}-${s.biome}`}
                  id={`place-${i}`}
                  role="option"
                  aria-selected={i === cursor}
                  className={`search__opt ${i === cursor ? 'is-active' : ''}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pick(s);
                  }}
                >
                  <Icon name={biomeOf(s.biome).icon} size={18} />
                  <span className="search__name">{s.name}</span>
                  <span className="search__biome">{biomeOf(s.biome).title}</span>
                </li>
              ))}
            </ul>
          )}
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
