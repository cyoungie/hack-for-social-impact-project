import { useGame } from '../state/GameState.jsx';
import { avatarColorValue } from '../data/game.js';
import { PixelButton, PixelCard, StepSquares } from '../components/ui.jsx';
import { Avatar } from '../components/Avatar.jsx';
import { PlaceSearch } from '../components/PlaceSearch.jsx';

export default function Account() {
  const { state, update } = useGame();
  const name = state.playerName;
  const canCreate = name.trim().length > 0;

  function submit(e) {
    e.preventDefault();
    if (!canCreate) return;
    update({ playerName: name.trim(), scene: 'biome' });
  }

  return (
    <main className="account">
      <section className="account__form">
        <span className="wordmark">Common Ground</span>
        <StepSquares step={1} label="Your account" />
        <h1 tabIndex={-1}>Start where you stand.</h1>
        <form onSubmit={submit} className="stack">
          <div className="field">
            <label className="label" htmlFor="planner-name">
              Your name
            </label>
            <input
              id="planner-name"
              className="input"
              type="text"
              maxLength={20}
              autoComplete="off"
              placeholder="your name"
              value={name}
              onChange={(e) => update({ playerName: e.target.value })}
            />
          </div>

          <PlaceSearch
            id="explore-place"
            className="field"
            label="Where do you want to explore?"
            placeholder="Search a place"
            value={state.place}
            onChange={(place) => update({ place })}
          />

          <PixelButton type="submit" className="pbtn--block" disabled={!canCreate}>
            Start
          </PixelButton>
        </form>
      </section>

      <section className="account__preview dots" aria-label="Avatar preview">
        <div className="preview">
          <PixelCard hero className="preview__card">
            <Avatar color={avatarColorValue(state.avatarColor)} size={150} />
          </PixelCard>
          <p className="preview__name">{name.trim() || 'your_name'}</p>
          <p className="caption">Blocky on purpose — same pixels as the island.</p>
        </div>
      </section>
    </main>
  );
}
