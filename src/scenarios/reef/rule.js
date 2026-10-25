// The documented rule for Scenario 3. Illustrative, not a forecast.
//
//   Mud reaching the reef each storm = bare ground on the hill × slope × storm strength − what barriers catch
//   Reef health next year = this year's health + recovery if the water stays clear − mud − heat stress
//   Fish, divers and wave protection follow reef health.
//
// A heat wave on a muddy reef kills what a heat wave on a clear reef would only bleach.
// Coefficients are illustrative weights; the sources back the direction of each term.

export const COEF = {
  storm: 1, // a normal rainy season
  bigStorm: 2.5, // year 4
  fences: 0.5, // share of mud silt fences catch
  pond: 0.6, // share of the remaining mud a settling pond catches
  pause: 0.5, // year-1 mud with no earthwork in the two wettest months
  basin: 0.85, // street runoff through a planted basin
  mudHarm: 0.15, // reef health lost per unit of mud
  recovery: 0.12, // reef health regained in a clear-water year
  clearWater: 0.3, // mud below this counts as clear water
  heatKill: 0.35, // heat wave on a muddy reef
  heatBleach: 0.1, // heat wave on a clear reef
  muddyHeat: 0.5, // mud above this makes the heat wave kill
};

export const HEAT_YEAR = 2;
export const STORM_YEAR = 4;
export const YEARS = [1, 2, 3, 4, 5];
export const START_REEF = 0.6;

export const ROUTES = [
  {
    id: 'straight',
    label: 'Straight up the steep face',
    note: 'Shortest and cheapest, but the most bare, steep ground.',
    bare: 1.0,
    slope: 1.0,
    cost: 0,
    leaf: '−− most bare steep ground',
    people: '+ shortest road',
    coin: '+ cheapest',
  },
  {
    id: 'switch',
    label: 'Switchbacks across the slope',
    note: 'Longer, at a moderate grade.',
    bare: 0.8,
    slope: 0.55,
    cost: 8,
    leaf: '− moderate slope',
    people: '+ road access',
    coin: '− a longer road',
  },
  {
    id: 'ridge',
    label: 'Around the ridge through the forest',
    note: 'Longest and flattest, but clears forest.',
    bare: 1.3,
    slope: 0.3,
    cost: 14,
    leaf: '− clears forest',
    people: '− the longest road',
    coin: '−− the longest road',
  },
];

// Each control adds cost or time, which the foreman points out.
export const CONTROLS = [
  { id: 'fences', label: 'Silt fences', foreman: 'That’s more material and a day to set up each section.' },
  { id: 'pond', label: 'A settling pond below the cut', foreman: 'We’d have to dig the pond before we cut. That’s on the bill.' },
  { id: 'pause', label: 'No earthwork during the two wettest months', foreman: 'My crew loses about six weeks of work.' },
  { id: 'replant', label: 'Replant cut slopes as each section is finished', foreman: 'Planting every finished section adds cost.' },
];

const REPLANT_BARE = { 1: 0.6, 2: 0.3, 3: 0.1, 4: 0.1, 5: 0.1 };
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export function mudWord(m) {
  if (m < 0.15) return 'barely any';
  if (m < 0.3) return 'a little';
  if (m < 0.6) return 'brown water';
  return 'a brown bay';
}

export function reefWord(r) {
  if (r >= 0.6) return 'healthy';
  if (r >= 0.4) return 'bleached but alive';
  if (r >= 0.2) return 'struggling';
  return 'dead at the point';
}

// plan: { route, controls: Set }
// start: { reef — set by the coral count and farm_runoff; riverMud — lower when bank_planted }
export function runReef(plan, start = {}) {
  const route = ROUTES.find((r) => r.id === plan.route);
  const c = plan.controls;
  let catchShare = 0;
  if (c.has('fences')) catchShare = COEF.fences;
  if (c.has('pond')) catchShare += (1 - catchShare) * COEF.pond;

  const frames = [];
  let reef = start.reef ?? START_REEF;
  const startReef = reef;
  let heatKilled = false;
  for (const t of YEARS) {
    const strength = t === STORM_YEAR ? COEF.bigStorm : COEF.storm;
    const bare = route.bare * (c.has('replant') ? REPLANT_BARE[t] : 1);
    let mud = bare * route.slope * strength * (1 - catchShare);
    if (c.has('pause') && t === 1) mud *= COEF.pause;
    mud *= start.riverMud ?? 1;

    const heat = t === HEAT_YEAR;
    const clear = mud < COEF.clearWater;
    const heatLoss = heat ? (mud > COEF.muddyHeat ? COEF.heatKill : COEF.heatBleach) : 0;
    if (heat && mud > COEF.muddyHeat) heatKilled = true;

    // Bars: leaf (mud and reef), people (jobs, road access), coin (cost and schedule).
    const late = c.has('pause') && t === 1;
    let people = 60 + (late ? 5 : 10) + (reef >= 0.5 ? 10 : reef < 0.15 ? -15 : 0);
    if (late) people -= 10;
    let coin = 60 + (reef >= 0.5 ? 8 : reef < 0.15 ? -10 : 0);
    if (t === 1) {
      coin -= route.cost + ['fences', 'pond', 'replant'].filter((id) => c.has(id)).length * 4 + (c.has('pause') ? 6 : 0);
    }
    const leaf = 100 * reef - 10 * mud;

    frames.push({
      year: t,
      heat,
      storm: t === STORM_YEAR,
      mud,
      reef,
      bare,
      leaf: Math.round(clamp(leaf, 0, 100)),
      people: Math.round(clamp(people, 0, 100)),
      coin: Math.round(clamp(coin, 0, 100)),
      line: yearLine({ t, mud, reef, heat, heatLoss, clear, route, c }),
    });

    // No recovery in the heat-wave year itself.
    reef = clamp(reef + (clear && !heat ? COEF.recovery : 0) - COEF.mudHarm * mud - heatLoss, 0.05, 1);
  }
  return { frames, summary: summarize(frames, route, c, heatKilled, startReef), finalReef: reef };
}

function yearLine({ t, mud, reef, heat, clear, route, c }) {
  const terms = [];
  terms.push(route.id === 'straight' ? 'raw cut on a steep slope' : route.id === 'switch' ? 'switchbacks, moderate slope' : 'forest cleared, flat route');
  if (c.has('fences') || c.has('pond')) terms.push(c.has('fences') && c.has('pond') ? 'fences and pond catch most of it' : 'barriers catch some');
  if (c.has('replant')) terms.push(t >= 3 ? 'replanted cut is green' : 'replanting as it goes');
  if (c.has('pause') && t === 1) terms.push('no earthwork in the wettest months');
  const mudPart = `Mud to the bay: ${mudWord(mud)} (${terms.join('; ')}).`;
  if (t === 1) return `The road goes in${c.has('pause') ? ', three months late' : ''}. ${mudPart}`;
  if (heat) return `Heat wave. ${mud > COEF.muddyHeat ? 'On muddy water, the stressed coral at the point dies.' : 'On clear water, the coral bleaches but survives.'} ${mudPart}`;
  if (t === STORM_YEAR) return `Big storm. ${mudPart}`;
  return `Rainy season. ${clear ? 'Clear water — the reef recovers.' : 'Mud keeps the reef from recovering.'} ${mudPart} Reef: ${reefWord(reef)}.`;
}

// The year-5 line, assembled from the frames (wording from the master script's samples).
function summarize(frames, route, c, heatKilled, startReef) {
  const parts = [];
  const paid = ['fences', 'pond', 'replant'].some((id) => c.has(id));
  if (c.has('pause')) parts.push('Six weeks without work for the crew and a road three months late.');
  else if (route.id === 'ridge') parts.push('Least mud per metre, but 300 m of forest cleared and the longest drive.');
  else if (route.id === 'straight' && !paid) parts.push('Cheapest road, finished on time.');
  else parts.push('The road cost more and finished the same season.');

  const end = frames[4].reef;
  if (heatKilled) {
    const brownEvery = frames.every((f) => f.mud >= 0.5);
    parts.push(brownEvery ? 'The bay went brown every storm, and the year-2 heat wave killed most of the stressed coral at the point.' : 'The year-2 heat wave killed most of the stressed coral at the point.');
  } else if (c.has('replant')) {
    parts.push(`The cut was green before the first big storm${end > startReef ? ', and the reef at the point is healthier in year 5 than at the start' : ''}.`);
  } else if (route.id === 'ridge') {
    parts.push('The reef did better than the steep route and worse than switchbacks with controls, and more water now runs off the ridge.');
  } else {
    const back = frames.find((f) => f.year >= 3 && f.reef >= startReef);
    parts.push(`Most of the mud stayed on the hill, the coral bleached in the heat wave but survived${back ? `, and it recovered by year ${back.year}` : ''}.`);
  }
  if (end < 0.1) parts.push('By year 5 the dive shop has closed and Tom fishes farther out.');
  return parts.join(' ');
}
