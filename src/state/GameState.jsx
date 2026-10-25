import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'cg_save';
const VERSION = 2;

export const SCENE_ORDER = ['title', 'account', 'biome', 'postcard', 'map', 'intro', 'game', 'act', 'profile'];

const INITIAL = {
  version: VERSION,
  playerName: '',
  avatarColor: 'green',
  // Where the player wants to explore (as typed or picked in the place search).
  place: '',
  // Every launch opens on the title screen; PLAY continues at resumeScene (not saved itself).
  scene: 'title',
  resumeScene: 'account',
  solvedProblems: [],
  // Per collected card: { outcome: 'good'|'bad', points, at: 'YYYY-MM-DD' }.
  results: {},
  // Local dates the player did something (for the day streak), newest last.
  playDays: [],
  // Carry-over flags (farm_runoff, ridge_strip, bank_planted, water_kit, sewer_connected).
  // A scenario reads the flags as they stood when it started, so only earlier scenarios affect it.
  flags: {},
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
    const saved = loadSaved(JSON.parse(raw));
    return { ...saved, scene: 'title', resumeScene: saved.scene };
  } catch {
    return INITIAL;
  }
}

// The saved game, migrated, with `scene` set to where PLAY should resume.
function loadSaved(saved) {
  if (saved.version !== VERSION) {
    // Older save (pre-scenario system): keep the player, reset progress.
    const scene = saved.playerName ? 'map' : 'account';
    return { ...INITIAL, playerName: saved.playerName || '', avatarColor: saved.avatarColor || 'green', scene };
  }
  // Stat bars are feedback on choices, never a managed resource — older saves' totals are dropped.
  const { bars, lastGain, ...kept } = saved;
  const state = { ...INITIAL, ...kept };
  if (!Array.isArray(state.solvedProblems)) state.solvedProblems = [];
  // Saves from before the intro/game split.
  if (state.scene === 'scenario') Object.assign(state, { scene: state.run ? 'game' : 'map', gameId: state.run?.id ?? null });
  if (state.run?.phase === 'intro') state.run = { ...state.run, phase: 'explore' };
  if (!SCENE_ORDER.includes(state.scene) || state.scene === 'title' || !state.playerName) state.scene = 'account';
  if (state.scene === 'intro' || (state.scene === 'game' && !state.gameId)) state.scene = 'map';
  return state;
}

function save(state) {
  const { introId, resumeScene, ...rest } = state;
  let toSave = rest;
  if (state.scene === 'intro') toSave = { ...rest, scene: 'map' };
  if (state.scene === 'title') toSave = { ...rest, scene: resumeScene };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // Storage blocked (private mode, quota) — the game still runs, it just won't survive refresh.
  }
}

// Local calendar day, e.g. '2026-10-24'.
export const dayKey = (d = new Date()) => d.toLocaleDateString('en-CA');

const withToday = (days) => {
  const today = dayKey();
  return days.includes(today) ? days : [...days, today].slice(-60);
};

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
        run: s.run?.id === id ? s.run : { id, phase: 'baseline', done: {}, flags: { ...s.flags } },
      })),
    [],
  );

  const setPhase = useCallback((phase) => setState((s) => ({ ...s, run: { ...s.run, phase } })), []);

  const completeHotspot = useCallback(
    (hotspotId, result) =>
      setState((s) => ({
        ...s,
        playDays: withToday(s.playDays),
        flags: result.setFlags ? { ...s.flags, ...result.setFlags } : s.flags,
        run: { ...s.run, done: { ...s.run.done, [hotspotId]: result } },
      })),
    [],
  );

  const collect = useCallback(
    (id, result) =>
      setState((s) => ({
        ...s,
        scene: 'map',
        run: null,
        gameId: null,
        playDays: withToday(s.playDays),
        results: { ...s.results, [id]: { ...result, at: dayKey() } },
        solvedProblems: s.solvedProblems.includes(id) ? s.solvedProblems : [...s.solvedProblems, id],
      })),
    [],
  );

  // Fresh start for demos: keeps the planner (name, color, place), clears everything they've played.
  const resetProgress = useCallback(
    () =>
      setState((s) => ({ ...INITIAL, playerName: s.playerName, avatarColor: s.avatarColor, place: s.place, scene: 'map' })),
    [],
  );

  // 'intro' consumes every key (see ScenarioIntro); everything else is normal play.
  const inputMode = state.scene === 'intro' ? 'intro' : 'play';

  const value = useMemo(
    () => ({ state, inputMode, update, goTo, openIntro, beginScenario, setPhase, completeHotspot, collect, resetProgress }),
    [state, inputMode, update, goTo, openIntro, beginScenario, setPhase, completeHotspot, collect, resetProgress],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameStateProvider');
  return ctx;
}
