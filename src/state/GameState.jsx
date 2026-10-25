import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'cg_save';
const VERSION = 2;

export const SCENE_ORDER = ['account', 'biome', 'postcard', 'map', 'intro', 'game', 'act'];

const INITIAL = {
  version: VERSION,
  playerName: '',
  avatarColor: 'green',
  scene: 'account',
  solvedProblems: [],
  // Intro being shown (never saved — a refresh during an intro lands back on the map).
  introId: null,
  // Map slot whose GameScene is open.
  gameId: null,
  // Active scenario: { id, phase: 'explore'|'consequence'|'card', done: { hotspotId: { points, state } } }
  run: null,
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL;
    const saved = JSON.parse(raw);
    if (saved.version !== VERSION) {
      // Older save (pre-scenario system): keep the player, reset progress.
      const scene = saved.playerName && SCENE_ORDER.includes(saved.scene) ? saved.scene : saved.playerName ? 'map' : 'account';
      return { ...INITIAL, playerName: saved.playerName || '', avatarColor: saved.avatarColor || 'green', scene };
    }
    // Stat bars are feedback on choices, never a managed resource — older saves' totals are dropped.
    const { bars, lastGain, ...kept } = saved;
    const state = { ...INITIAL, ...kept };
    if (!Array.isArray(state.solvedProblems)) state.solvedProblems = [];
    // Saves from before the intro/game split.
    if (state.scene === 'scenario') Object.assign(state, { scene: state.run ? 'game' : 'map', gameId: state.run?.id ?? null });
    if (state.run?.phase === 'intro') state.run = { ...state.run, phase: 'explore' };
    if (!SCENE_ORDER.includes(state.scene) || !state.playerName) state.scene = 'account';
    if (state.scene === 'intro' || (state.scene === 'game' && !state.gameId)) state.scene = 'map';
    return state;
  } catch {
    return INITIAL;
  }
}

function save(state) {
  const { introId, ...rest } = state;
  const toSave = state.scene === 'intro' ? { ...rest, scene: 'map' } : rest;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // Storage blocked (private mode, quota) — the game still runs, it just won't survive refresh.
  }
}

const GameContext = createContext(null);

export function GameStateProvider({ children }) {
  const [state, setState] = useState(load);

  useEffect(() => save(state), [state]);

  const update = useCallback((patch) => setState((s) => ({ ...s, ...patch })), []);
  const goTo = useCallback((scene) => setState((s) => ({ ...s, scene })), []);

  // Map pick -> intro -> BEGIN! -> GameScene. A half-played run of the same scenario resumes.
  const openIntro = useCallback((id) => setState((s) => ({ ...s, scene: 'intro', introId: id })), []);

  const beginScenario = useCallback(
    (id) =>
      setState((s) => ({
        ...s,
        scene: 'game',
        introId: null,
        gameId: id,
        run: s.run?.id === id ? s.run : { id, phase: 'explore', done: {} },
      })),
    [],
  );

  const setPhase = useCallback((phase) => setState((s) => ({ ...s, run: { ...s.run, phase } })), []);

  const completeHotspot = useCallback(
    (hotspotId, result) =>
      setState((s) => ({ ...s, run: { ...s.run, done: { ...s.run.done, [hotspotId]: result } } })),
    [],
  );

  const collect = useCallback(
    (id) =>
      setState((s) => ({
        ...s,
        scene: 'map',
        run: null,
        gameId: null,
        solvedProblems: s.solvedProblems.includes(id) ? s.solvedProblems : [...s.solvedProblems, id],
      })),
    [],
  );

  // 'intro' consumes every key (see ScenarioIntro); everything else is normal play.
  const inputMode = state.scene === 'intro' ? 'intro' : 'play';

  const value = useMemo(
    () => ({ state, inputMode, update, goTo, openIntro, beginScenario, setPhase, completeHotspot, collect }),
    [state, inputMode, update, goTo, openIntro, beginScenario, setPhase, completeHotspot, collect],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameStateProvider');
  return ctx;
}
