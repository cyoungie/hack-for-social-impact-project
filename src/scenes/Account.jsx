import { useGame } from '../state/GameState.jsx';
import { AVATAR_COLORS, avatarColorValue } from '../data/game.js';
import { PixelButton, PixelCard, StepSquares } from '../components/ui.jsx';
import { Avatar } from '../components/Avatar.jsx';

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
        <h1 tabIndex={-1}>Make your planner.</h1>
        <p className="lede">
          Your name goes on every proposal you send into the real world. Choose it like it'll be read out loud at a
          village meeting.
        </p>

        <form onSubmit={submit} className="stack">
          <div className="field">
            <label className="label" htmlFor="planner-name">
              Planner name
            </label>
            <input
              id="planner-name"
              className="input"
              type="text"
              maxLength={20}
              autoComplete="off"
              placeholder="your_name"
              value={name}
              onChange={(e) => update({ playerName: e.target.value })}
            />
          </div>

          <fieldset className="field">
            <legend className="label">Avatar color</legend>
            <div className="swatches">
              {AVATAR_COLORS.map((c) => (
                <label key={c.id} className={`swatch ${state.avatarColor === c.id ? 'is-selected' : ''}`}>
                  <input
                    className="sr-only"
                    type="radio"
                    name="avatar-color"
                    value={c.id}
                    checked={state.avatarColor === c.id}
                    onChange={() => update({ avatarColor: c.id })}
                  />
                  <span className="swatch__fill" style={{ background: c.value }} />
                  <span className="sr-only">{c.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <PixelButton type="submit" className="pbtn--block" disabled={!canCreate}>
            Create account
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
