import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'cg_save';

export const SCENE_ORDER = ['account', 'biome', 'postcard', 'map', 'persona', 'decisions'];

const INITIAL = {
  playerName: '',
  avatarColor: 'green',
  scene: 'account',
  solvedProblems: [],
  decisions: { pumpRate: 60, voteChoice: '' },
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL;
    const saved = JSON.parse(raw);
    const state = {
      ...INITIAL,
      ...saved,
      solvedProblems: Array.isArray(saved.solvedProblems) ? saved.solvedProblems : [],
      decisions: { ...INITIAL.decisions, ...(saved.decisions || {}) },
    };
    if (!SCENE_ORDER.includes(state.scene) || !state.playerName) state.scene = 'account';
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
  const setDecisions = useCallback(
    (patch) => setState((s) => ({ ...s, decisions: { ...s.decisions, ...patch } })),
    [],
  );
  const solve = useCallback(
    (id) =>
      setState((s) => ({
        ...s,
        solvedProblems: s.solvedProblems.includes(id) ? s.solvedProblems : [...s.solvedProblems, id],
      })),
    [],
  );

  const value = useMemo(
    () => ({ state, update, goTo, setDecisions, solve }),
    [state, update, goTo, setDecisions, solve],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameStateProvider');
  return ctx;
}
