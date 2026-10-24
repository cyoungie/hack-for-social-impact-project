import { useEffect, useRef } from 'react';
import { useGame } from './state/GameState.jsx';
import Account from './scenes/Account.jsx';
import Biome from './scenes/Biome.jsx';
import Postcard from './scenes/Postcard.jsx';
import ProblemMap from './scenes/ProblemMap.jsx';
import ScenarioIntro from './scenes/ScenarioIntro.jsx';
import GameScene from './scenes/GameScene.jsx';

const SCENES = {
  account: Account,
  biome: Biome,
  postcard: Postcard,
  map: ProblemMap,
  intro: ScenarioIntro,
  game: GameScene,
};

export default function App() {
  const { state } = useGame();
  const Scene = SCENES[state.scene] || Account;
  const first = useRef(true);

  // On scene change, move to the top and put focus on the new heading for keyboard/screen-reader users.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    window.scrollTo(0, 0);
    document.querySelector('h1')?.focus();
  }, [state.scene]);

  return <Scene key={`${state.scene}:${state.introId ?? state.gameId ?? ''}`} />;
}
