import { useGame } from '../state/GameState.jsx';
import { PixelButton } from '../components/ui.jsx';
import { Icon } from '../components/Icons.jsx';

export default function Postcard() {
  const { state, goTo } = useGame();

  return (
    <main className="postcard-scene dots">
      <p className="label">Step 3 of 3 · Mail call</p>
      <h1 tabIndex={-1}>Something arrived for you.</h1>

      <div className="postcard-wrap">
        <div className="postcard-trail" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <article className="postcard" aria-label="Postcard from Guam">
          <header className="postcard__top">
            <div>
              <p className="label">Greetings from</p>
              <p className="postcard__place">Guam</p>
              <p className="postcard__coords">Tropical Island Biome · 13.4°N 144.8°E</p>
            </div>
            <div className="postcard__stamp">
              <span className="postcard__stamp-art">
                <Icon name="palm" size={30} />
              </span>
              <span className="postcard__stamp-label">Hagåtña · 2026</span>
            </div>
          </header>
          <div className="postcard__body">
            <div className="postcard__facts">
              <p>154,000 people on 212 square miles.</p>
              <p>One aquifer under the north serves most of the taps.</p>
              <p>Dry season January–May. Typhoon alley all year.</p>
              <p>The reef feeds, shields, and pays this island.</p>
            </div>
            <div className="postcard__to">
              <p className="label">To</p>
              <p className="postcard__name">{state.playerName}</p>
              <p>Planner-in-training</p>
              <p>Dededo village</p>
              <p className="postcard__call">Your island needs a decade of good calls.</p>
            </div>
          </div>
        </article>
      </div>

      <p className="postcard-scene__hint">Five places on this island are already in trouble.</p>
      <div className="postcard-scene__foot">
        <PixelButton onClick={() => goTo('map')}>Open the island</PixelButton>
        <span className="caption">Card saved to your collection</span>
      </div>
    </main>
  );
}
