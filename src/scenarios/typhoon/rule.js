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
  {
    id: 'concrete',
    label: 'Concrete the riverbank',
    cost: 2,
    term: 'Channel hardening up; bank vegetation to zero',
    leaf: '− (bank trees gone, water faster to the bay)',
    people: '+ at these houses, − at the ones downstream',
    coin: '− (upkeep every few years)',
  },
  {
    id: 'dredge',
    label: 'Dredge the river mouth, spoil onto the reef flat',
    cost: 1,
    term: 'Flood depth down this year; reef buffer down from next year',
    leaf: '−− (reef smothered)',
    people: '+ now, − by year 3',
    coin: '+ (quick work for the crew)',
  },
  {
    id: 'bridge',
    label: 'Raise the bridge',
    cost: 2,
    term: 'Days without road down',
    leaf: '0',
    people: '+ every storm',
    coin: '+ (market trucks keep coming)',
  },
  {
    id: 'plant',
    label: 'Plant the riverbank and the burned ridge',
    cost: 1,
    term: 'Bank vegetation up from year 2; bare ground down from year 2',
    leaf: '++ (slow)',
    people: '+ from year 3',
    coin: '0 now, + later (fewer repairs)',
  },
  {
    id: 'clear',
    label: 'Clear trees and brush around every house',
    cost: 1,
    term: 'Bare ground up',
    leaf: '− (more runoff, more mud)',
    people: '+ (no fallen trees)',
    coin: '0',
  },
  {
    id: 'rebuild',
    label: 'Rebuild the five houses on their slabs, fast',
    cost: 1,
    term: 'Nothing in the rule',
    leaf: '0',
    people: '+ this month, − next storm',
    coin: '+ (cheapest now)',
  },
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

// plan: Set of approach ids. extras: { debris: 'burn'|'dump'|'chip'|null, vote: { houseId: 'same'|'stilts'|'uphill' } | null }
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

    let bare = BASE.bare - (has('plant') ? PLANT_BARE[t] : 0) + (has('clear') ? 0.2 : 0);
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
      line: yearLine({ t, storm, street, down, daysNoRoad, reef, mud, moved, has }),
    });

    // Feedback into next year's reef: mud smothers it, calm years let it recover, dredge spoil buries it.
    let next = reef - COEF.mudToReef * mud + (storm ? 0 : COEF.reefRecovery);
    if (has('dredge') && t === 1) next -= 0.3;
    if (has('dredge') && t === 2) next -= 0.15;
    reef = clamp(next, 0.1, 1);
  }

  return { frames, summary: summarize(frames, plan, extras) };
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

// The year-5 line, assembled from the frames.
function summarize(frames, plan, extras = {}) {
  const y2 = frames[1];
  const y4 = frames[3];
  const parts = [];
  parts.push(
    y2.street < 0.3
      ? 'Year 2 was dry on this street.'
      : `Year 2 flooded this street again${y2.daysNoRoad <= 1 ? ', with the road open' : ''}.`,
  );
  if (y4.reef < 0.5) parts.push('By year 4 the reef flat is half buried and the surge comes in higher.');
  else if (plan.has('plant')) parts.push('By year 4 the bank held and the ridge sent down less mud.');
  if (plan.has('concrete')) parts.push(`The houses downstream took what this street didn't${y2.down > 0.3 && y4.down > 0.3 ? ', in both storms' : ''}.`);
  const brownSince = frames.find((f) => f.reef < 0.5);
  if (plan.has('concrete') && !plan.has('dredge')) parts.push('The bay is browner each year because the bank trees are gone.');
  else if (brownSince) parts.push(`The bay has been brown since year ${brownSince.year}.`);
  else if (frames[4].reef > frames[2].reef) parts.push('By year 5 the reef was clearer than after the first storm.');
  if (plan.has('bridge')) parts.push('The road opened within a day after both storms.');
  if (extras.debris === 'chip') parts.push('The chipped debris kept bare ground down above the village through the first wet season.');
  if (extras.debris === 'burn') parts.push('The burned riverbank stayed bare for a year, and its ash reached the bay with the first rain.');
  const vote = extras.vote;
  if (vote) {
    const moved = DAMAGED.filter((h) => vote[h] === 'uphill').length;
    const raised = DAMAGED.filter((h) => vote[h] === 'stilts').length;
    const deepest = Math.max(...frames.map((f) => Math.max(f.street, f.down)));
    if (moved + raised === DAMAGED.length && (raised === 0 || deepest < 2)) {
      parts.push(`The five houses that were raised or moved stayed out of the water${moved ? `, and ${moved === 1 ? 'one old slab is' : `${moved} old slabs are`} riverbank now` : ''}.`);
    } else if (moved + raised === 0) parts.push('The five houses went back on the same slabs.');
  }
  return parts.join(' ');
}
