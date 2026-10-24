import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { addPoints, clampBars } from '../data/scoring.js';

const STORAGE_KEY = 'cg_save';
const VERSION = 2;

export const SCENE_ORDER = ['account', 'biome', 'postcard', 'map', 'scenario'];

export const START_BARS = { water: 52, soil: 58, veg: 60, people: 55 };

const INITIAL = {
  version: VERSION,
  playerName: '',
  avatarColor: 'green',
  scene: 'account',
  solvedProblems: [],
  bars: START_BARS,
  // Active scenario: { id, phase: 'intro'|'explore'|'consequence'|'card', done: { hotspotId: { points, state } } }
  run: null,
  // Points from the last collected card, floated up on the map hub once.
  lastGain: null,
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
    const state = { ...INITIAL, ...saved, bars: { ...START_BARS, ...(saved.bars || {}) } };
    if (!Array.isArray(state.solvedProblems)) state.solvedProblems = [];
    if (!SCENE_ORDER.includes(state.scene) || !state.playerName) state.scene = 'account';
    if (state.scene === 'scenario' && !state.run) state.scene = 'map';
    return state;
  } catch {
    return INITIAL;
  }
}

function save(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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

  const startScenario = useCallback(
    (id) =>
      setState((s) => ({
        ...s,
        scene: 'scenario',
        run: s.run?.id === id ? s.run : { id, phase: 'intro', done: {} },
      })),
    [],
  );

  const setPhase = useCallback((phase) => setState((s) => ({ ...s, run: { ...s.run, phase } })), []);

  const completeHotspot = useCallback(
    (hotspotId, result) =>
      setState((s) => ({ ...s, run: { ...s.run, done: { ...s.run.done, [hotspotId]: result } } })),
    [],
  );

  // Replaying a solved scenario is allowed, but only the first run moves the bars.
  const collect = useCallback(
    (id, points) =>
      setState((s) => ({
        ...s,
        scene: 'map',
        run: null,
        bars: s.solvedProblems.includes(id) ? s.bars : clampBars(addPoints(s.bars, points)),
        lastGain: s.solvedProblems.includes(id) ? null : points,
        solvedProblems: s.solvedProblems.includes(id) ? s.solvedProblems : [...s.solvedProblems, id],
      })),
    [],
  );

  const value = useMemo(
    () => ({ state, update, goTo, startScenario, setPhase, completeHotspot, collect }),
    [state, update, goTo, startScenario, setPhase, completeHotspot, collect],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameStateProvider');
  return ctx;
}
