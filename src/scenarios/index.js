import field from './field.jsx';
import coast from './coast.jsx';
import lens from './lens.jsx';
import industry from './industry.jsx';
import { PROBLEMS } from '../data/game.js';

// Built scenarios by map slot id. Slot 2 (ridge) arrives with the team's scenario draft.
export const SCENARIOS = { field, coast, lens, industry };

export const isBuilt = (id) => Boolean(SCENARIOS[id]);

// Unlock order follows the map 1 -> 5; slots still in production don't block the ones after them.
export function lockedBy(id, solved) {
  for (const p of PROBLEMS) {
    if (p.id === id) return null;
    if (isBuilt(p.id) && !solved.includes(p.id)) return p;
  }
  return null;
}
