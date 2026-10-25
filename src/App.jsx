import { useEffect, useRef } from 'react';
import { useGame } from './state/GameState.jsx';
import Title from './scenes/Title.jsx';
import Account from './scenes/Account.jsx';
import Biome from './scenes/Biome.jsx';
import Postcard from './scenes/Postcard.jsx';
import ProblemMap from './scenes/ProblemMap.jsx';
import ScenarioIntro from './scenes/ScenarioIntro.jsx';
import GameScene from './scenes/GameScene.jsx';
import Act from './scenes/Act.jsx';
import Profile from './scenes/Profile.jsx';

const SCENES = {
  title: Title,
  account: Account,
  biome: Biome,
  postcard: Postcard,
  map: ProblemMap,
  intro: ScenarioIntro,
  game: GameScene,
  act: Act,
  profile: Profile,
};

export default function App() {
  const { state } = useGame();
  const Scene = SCENES[state.scene] || Title;
  const shownScene = useRef(null);

  // On scene change, move to the top and focus the scene's [data-autofocus] control, else its heading,
  // for keyboard/screen-reader users. Runs once per real change (StrictMode re-runs effects in dev).
  useEffect(() => {
    if (shownScene.current === state.scene) return;
    const initial = shownScene.current === null;
    shownScene.current = state.scene;
    if (!initial) window.scrollTo(0, 0);
    const target = document.querySelector('[data-autofocus]') || (!initial && document.querySelector('h1'));
    target?.focus();
  }, [state.scene]);

  return <Scene key={`${state.scene}:${state.introId ?? state.gameId ?? ''}`} />;
}
