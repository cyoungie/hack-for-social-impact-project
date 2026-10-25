import { useState } from 'react';
import { BIOMES } from '../data/game.js';
import { searchPlaces } from '../data/biomeMatch.js';
import { Icon } from './Icons.jsx';

const biomeOf = (id) => BIOMES.find((b) => b.id === id);

// Place search combobox: suggestions (with their biome) as you type; arrows + Enter or click to pick.
export function PlaceSearch({ id, value, onChange, placeholder = 'Search a place', label, className = '' }) {
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(-1);
  const suggestions = searchPlaces(value);
  const showList = open && suggestions.length > 0;
  const listId = `${id}-list`;

  const pick = (s) => {
    onChange(s.name);
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

  return (
    <div className={`search ${className}`}>
      <label className={label ? 'label' : 'sr-only'} htmlFor={id}>
        {label || placeholder}
      </label>
      <div className="input-icon">
        <input
          id={id}
          className="input"
          type="search"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList && cursor >= 0 ? `${id}-opt-${cursor}` : undefined}
          value={value}
          placeholder={placeholder}
          autoComplete="off"
          onChange={(e) => {
            onChange(e.target.value);
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
        <ul className="search__list" id={listId} role="listbox" aria-label="Places">
          {suggestions.map((s, i) => (
            <li
              key={`${s.name}-${s.biome}`}
              id={`${id}-opt-${i}`}
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
  );
}
