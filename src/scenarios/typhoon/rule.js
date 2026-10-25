// The documented rule for Scenario 2. Illustrative, not a forecast: the point is direction and relative size.
//
//   Flood depth at the low houses = storm surge − reef buffer − bank vegetation + channel hardening
//   Mud reaching the bay          = bare ground above the village × slope × storm strength
//   Days without power and road   = set by the bridge and the lines (unaffected by the lines above)
//
// More mud means a weaker reef next year, which feeds back into the first line.
// The coefficients below are illustrative weights; the sources back the direction of each term.

export const COEF = {
  surge: 3, // storm years (2 and 4)
  reefBuffer: 1.2, // × reef health (0–1). Reefs cut most incoming wave energy — Ferrario et al. 2014 report 97% on average.
  bankVeg: 1.0, // × bank vegetation (0–1). A planted bank slows and spreads the water.
  hardeningHere: 2.2, // concrete bank: water moves past this street faster…
  hardeningDownstream: 1.2, // …and pushes the flood onto the houses downstream.
  dredgeOnce: 1.0, // dredged mouth: flood depth down in the first storm only
  mudToReef: 0.12, // reef health lost per unit of mud reaching the bay
  reefRecovery: 0.08, // reef health regained per calm year
  clearRecovery: 0.15, // ...and per calm year with little mud
  slope: 1.0,
};

export const STORM_YEARS = [2, 4];
export const YEARS = [1, 2, 3, 4, 5];

export const BASE = { reef: 0.8, bankVeg: 0.4, bare: 0.5 };

// Five houses damaged two nights ago: three downstream of the bridge, two on Nina's street.
export const DAMAGED = ['h1', 'h2', 'h5', 'h6', 'h7'];
export const DOWNSTREAM = ['h1', 'h2', 'h6'];
export const STREET = ['h3', 'h4', 'h5', 'h7'];

export const APPROACHES = [
  { id: 'concrete', label: 'Concrete the riverbank', cost: 2, tradeoff: 'Keeps water off these houses but removes the bank trees, so water reaches the bay and the downstream houses faster. Needs repair every few years.' },
  { id: 'dredge', label: 'Dredge the river mouth, dump spoil on the reef flat', cost: 1, tradeoff: 'Less flooding this year; the buried reef stops breaking waves, so surge is higher from year 3.' },
  { id: 'bridge', label: 'Raise the bridge', cost: 2, tradeoff: 'The road stays open in storms, so trucks, ambulances and supplies get through.' },
  { id: 'plant', label: 'Replant the riverbank and the burned ridge', cost: 1, tradeoff: 'Slow: little effect until year 2 or 3, then less flooding and less mud in the bay.' },
  { id: 'clear', label: 'Clear trees and brush around every house', cost: 1, tradeoff: 'No falling trees on roofs, but more bare ground and more mud.' },
  { id: 'rebuild', label: 'Rebuild the five houses on their old slabs, fast', cost: 1, tradeoff: 'Families are home this month; the houses are in the same flood zone for the next storm.' },
];

export const COINS = 4;

const PLANT_BANK = { 1: 0, 2: 0, 3: 0.3, 4: 0.45, 5: 0.55 };
const PLANT_BARE = { 1: 0, 2: 0, 3: 0.25, 4: 0.35, 5: 0.4 };
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export function depthWord(d) {
  if (d < 0.3) return 'dry';
  if (d < 1) return 'ankle-deep';
  if (d < 1.8) return 'knee-deep';
  return 'waist-deep';
}

// plan: Set of approach ids. extras: { debris: 'burn'|'dump'|'chip'|null, vote: { houseId: 'same'|'stilts'|'uphill' } | null,
//   flags: { ridge_strip, water_kit } } — carry-overs from scenarios played earlier.
export function runRule(plan, extras = {}) {
  const has = (id) => plan.has(id);
  const vote = extras.vote || {};
  const uphill = DAMAGED.filter((h) => vote[h] === 'uphill').length;
  const exposure = (houses, depth) =>
    houses.filter((h) => {
      const v = vote[h];
      if (v === 'uphill') return false;
      if (v === 'stilts') return depth >= 2;
      return true;
    }).length / houses.length;

  const frames = [];
  let reef = BASE.reef;

  for (const t of YEARS) {
    const storm = STORM_YEARS.includes(t);
    const moved = {};

    let bankVeg = has('concrete') ? 0 : BASE.bankVeg + (has('plant') ? PLANT_BANK[t] : 0) + (t >= 2 ? uphill * 0.04 : 0);
    bankVeg = clamp(bankVeg, 0, 1);
    if (has('concrete')) moved.bank = 'bank vegetation to zero (concrete bank)';
    else if (has('plant') && t >= 3) moved.bank = 'bank vegetation up (planted bank)';
    if (uphill && t >= 2 && !has('concrete')) moved.slabs = 'old slabs now riverbank';

    const ridgeStrip = extras.flags?.ridge_strip ? 0.15 : 0; // Rosa's planted strip: less mud off the ridge
    let bare = BASE.bare - ridgeStrip - (has('plant') ? PLANT_BARE[t] : 0) + (has('clear') ? 0.2 : 0);
    if (extras.debris === 'burn' && t <= 2) {
      bare += 0.15;
      moved.debris = 'bare ground up (burned riverbank)';
    }
    if (extras.debris === 'chip' && t <= 2) {
      bare -= 0.1;
      moved.debris = 'bare ground down (wood-chip mulch on the farms)';
    }
    bare = clamp(bare, 0, 1);
    if (has('plant') && t >= 3) moved.bare = 'bare ground down (planted ridge)';
    if (has('clear')) moved.clear = 'bare ground up (cleared yards)';

    const surge = storm ? COEF.surge : 0;
    const dredgeNow = has('dredge') && t === 2 ? COEF.dredgeOnce : 0;
    const base = surge - COEF.reefBuffer * reef - COEF.bankVeg * bankVeg - dredgeNow;
    const street = storm ? Math.max(0, base - (has('concrete') ? COEF.hardeningHere : 0)) : 0;
    const down = storm ? Math.max(0, base + (has('concrete') ? COEF.hardeningDownstream : 0)) : 0;
    const daysNoRoad = storm ? (has('bridge') ? 1 : 7) : 0;
    const mud = bare * COEF.slope * (storm ? 3 : 1);

    // Bars: leaf (soil, water, vegetation), people (safety and wellbeing), coin (jobs and money).
    const streetHit = street * exposure(STREET, street);
    const downHit = down * exposure(DOWNSTREAM, down);
    let leaf = 20 + 45 * reef + 35 * bankVeg - 20 * bare;
    let people = 70 - 8 * streetHit - 8 * downHit - 1.5 * daysNoRoad;
    let coin = 50 - 3 * streetHit - 3 * downHit - 2 * daysNoRoad;
    if (has('rebuild')) {
      if (t === 1) {
        people += 8;
        coin += 6;
      } else if (storm && streetHit + downHit > 0.5) {
        people -= 6;
        coin -= 6;
      }
    }
    if (has('dredge') && t === 1) coin += 8;
    if (has('bridge')) coin += 4;
    if (has('concrete') && storm) coin -= 6;
    if (has('plant') && t >= 3) {
      people += 4;
      coin += 3;
    }
    if (has('clear')) people += 2;
    if (t === 1) {
      people -= uphill * 2;
      coin -= DAMAGED.filter((h) => vote[h] === 'stilts').length * 3;
      if (extras.debris === 'dump') coin -= 4;
      if (extras.debris === 'chip') coin -= 3;
    }

    frames.push({
      year: t,
      storm,
      reef,
      bankVeg,
      bare,
      mud,
      street,
      down,
      daysNoRoad,
      leaf: Math.round(clamp(leaf, 0, 100)),
      people: Math.round(clamp(people, 0, 100)),
      coin: Math.round(clamp(coin, 0, 100)),
      line: yearLine({ t, storm, street, down, daysNoRoad, reef, mud, moved, has }) + (storm && extras.flags?.water_kit ? ' Nina’s family has stored water.' : ''),
    });

    // Feedback into next year's reef: mud smothers it, calm years let it recover, dredge spoil buries it.
    // Calm years let the reef recover, faster when little mud reaches it.
    let next = reef - COEF.mudToReef * mud + (storm ? 0 : mud < 0.3 ? COEF.clearRecovery : COEF.reefRecovery);
    if (has('dredge') && t === 1) next -= 0.3;
    if (has('dredge') && t === 2) next -= 0.15;
    reef = clamp(next, 0.1, 1);
  }

  return { frames, summary: summarize(frames, plan, extras, reef) };
}

function reefWord(r) {
  if (r >= 0.75) return 'healthy';
  if (r >= 0.55) return 'thinning';
  if (r >= 0.4) return 'half buried';
  return 'brown and buried';
}

// One line per year: what happened, and which term of the rule moved it.
function yearLine({ t, storm, street, down, daysNoRoad, reef, mud, moved, has }) {
  if (storm) {
    const why = [];
    if (has('concrete')) why.push('channel hardening');
    if (has('dredge') && t === 2) why.push('dredged mouth');
    if (has('plant') && t >= 3) why.push('planted bank');
    why.push(`reef ${reefWord(reef)}`);
    const road = daysNoRoad <= 1 ? 'road open in a day (raised bridge)' : `road cut for ${daysNoRoad} days (low bridge)`;
    return `Storm. This street ${depthWord(street)}, the three houses downstream ${depthWord(down)} — ${why.join(', ')}. ${road[0].toUpperCase()}${road.slice(1)}.`;
  }
  const terms = Object.values(moved);
  const mudWord = mud < 0.35 ? 'little' : mud < 0.6 ? 'some' : 'a lot of';
  return `Rainy season. ${mudWord[0].toUpperCase()}${mudWord.slice(1)} mud to the bay; reef ${reefWord(reef)}.${terms.length ? ` Moved by: ${terms.join('; ')}.` : ''}`;
}

// The year-5 line, assembled from the frames (wording from the master script's samples).
function summarize(frames, plan, extras = {}, finalReef = frames[4].reef) {
  const y2 = frames[1];
  const y4 = frames[3];
  const parts = [];
  const bothDry = y2.street < 0.3 && y4.street < 0.3;
  if (plan.has('bridge') && plan.has('concrete') && bothDry && !plan.has('dredge')) {
    parts.push('Dry street and open road in both storms. The three houses downstream flooded both times, and the bay gets browner each year without the bank trees.');
  } else {
    parts.push(y2.street < 0.3 ? 'Year 2 was dry on this street.' : `Year 2 flooded this street again${y2.daysNoRoad <= 1 ? ', but the road stayed open' : ''}.`);
  }
  if (y4.reef < 0.5) {
    parts.push(`By year 4 the reef flat is half buried, the surge comes in higher${plan.has('concrete') ? ", and the houses downstream took the water this street didn't" : ''}.`);
  } else if (plan.has('plant')) {
    parts.push(`By year 4 the bank held, the ridge sent down half the mud${finalReef > frames[1].reef ? ', and the reef was clearer than before the first storm' : ''}.`);
  }
  const brownSince = frames.find((f) => f.reef < 0.5);
  if (!(plan.has('bridge') && plan.has('concrete') && bothDry && !plan.has('dredge')) && brownSince) parts.push(`The bay has been brown since year ${brownSince.year}.`);
  if (extras.debris === 'chip') parts.push('The chipped debris kept bare ground down above the village through the first wet season.');
  if (extras.debris === 'burn') parts.push('The burned riverbank stayed bare, and its ash reached the bay with the first rain.');
  const vote = extras.vote;
  if (vote) {
    const moved = DAMAGED.filter((h) => vote[h] === 'uphill').length;
    const raised = DAMAGED.filter((h) => vote[h] === 'stilts').length;
    if (moved + raised === DAMAGED.length) parts.push('The five families who rebuilt raised or on the school lot stayed out of the water.');
    else if (moved + raised === 0) parts.push('The five houses went back on the same slabs.');
  }
  return parts.join(' ');
}
