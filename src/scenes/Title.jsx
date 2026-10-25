import { useGame } from '../state/GameState.jsx';
import { PixelButton } from '../components/ui.jsx';

// Stepped pixel cloud: three stacked bars.
function Cloud({ className }) {
  return (
    <svg className={`cloud ${className}`} viewBox="0 0 50 16" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="12" y="0" width="15" height="5" />
      <rect x="6" y="5" width="28" height="6" />
      <rect x="0" y="11" width="50" height="5" />
    </svg>
  );
}

export default function Title() {
  const { state, goTo } = useGame();
  const returning = Boolean(state.playerName);

  return (
    <main className="title-screen">
      <Cloud className="cloud--a" />
      <Cloud className="cloud--b" />
      <Cloud className="cloud--c" />
      <div className="title-screen__ripples" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <div className="title-screen__center">
        <h1 className="title-logo" tabIndex={-1}>
          <span className="title-logo__a">Common</span>
          <span className="title-logo__b">Ground</span>
        </h1>
        <p className="title-screen__tagline">Real land. Real choices. Your call.</p>
        <PixelButton className="title-screen__play" onClick={() => goTo(state.resumeScene || 'account')} data-autofocus>
          Play
        </PixelButton>
        {returning && <p className="title-screen__note">Welcome back, {state.playerName}.</p>}
      </div>

      <footer className="title-screen__foot">
        <span>Hack for Social Impact · UNCCD Challenge</span>
      </footer>
    </main>
  );
}
