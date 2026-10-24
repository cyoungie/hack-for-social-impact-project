import { useGame } from '../state/GameState.jsx';
import { CONTENT } from '../content/index.js';
import { SCENARIOS } from '../scenarios/index.js';
import { PixelButton } from '../components/ui.jsx';
import { SceneBackdrop } from '../components/SceneArt.jsx';
import ScenarioRunner from './ScenarioRunner.jsx';

// The shell interaction primitives mount into. Built scenarios run their gameplay here;
// the rest show the in-progress stub until their interactions land.
export default function GameScene() {
  const { state, goTo } = useGame();
  const id = state.gameId;
  const content = CONTENT[id];
  const scenario = SCENARIOS[id];

  if (scenario && state.run?.id === id) return <ScenarioRunner scenario={scenario} content={content} />;

  return (
    <main className="intro game-stub">
      <SceneBackdrop src={content.background} tint={content.persona.tint} className="intro__bg">
        <div className="intro__vignette" />
      </SceneBackdrop>
      <p className="intro__plate">
        {content.title} · {content.location}
      </p>
      <section className="stub-panel">
        <h1 tabIndex={-1}>Interactions in progress — {content.title}</h1>
        <p>
          {content.persona.name}'s scenario is still being built. Nothing here counts toward your island yet.
        </p>
        <PixelButton onClick={() => goTo('map')}>Return to island</PixelButton>
      </section>
    </main>
  );
}
