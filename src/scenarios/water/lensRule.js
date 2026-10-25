// Lens Keeper model. Illustrative, not a forecast: rain refills the lens in the wet season and it thins in the
// dry season; pumping too hard pulls salt water up toward the well. Spreading the pumping across a second well
// lowers the pull on each one.

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const DRY = new Set([0, 1, 2, 3, 4, 5]); // dry season Jan–Jun, wet season Jul–Dec
export const DEMAND = { dry: 60, wet: 55 };
export const CONSERVE = 0.8; // asking households to conserve lowers demand by a fifth
const RECHARGE = { dry: 3, wet: 12 };
const DRAW = 0.15; // lens lost per unit pumped
export const SAFE = 60; // chloride gauge: safe band below this
export const BRACKISH = 85;

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// One 12-month year. recharge scales the rain (drought < 1); outageMonths skip pumping (typhoon power cut).
export function simulate(plan, { startLens = 60, recharge = 1, outageMonths = [] } = {}) {
  let lens = startLens;
  const months = [];
  for (let m = 0; m < 12; m += 1) {
    const season = DRY.has(m) ? 'dry' : 'wet';
    const demand = DEMAND[season] * (plan.conserve ? CONSERVE : 1);
    const pump = outageMonths.includes(m) ? 0 : season === 'dry' ? plan.dry : plan.wet;
    lens = clamp(lens + RECHARGE[season] * recharge - pump * DRAW, 5, 100);
    const pull = pump / (plan.secondWell ? 2 : 1);
    const chloride = clamp(30 + Math.max(0, pull - 40) * 1.2 + Math.max(0, 60 - lens), 0, 100);
    months.push({ m, season, demand, pump, met: pump >= demand || outageMonths.includes(m), lens, chloride });
  }
  return months;
}

export function tierOf(months) {
  if (months.some((x) => x.chloride >= BRACKISH)) return 'brackish';
  if (months.every((x) => x.chloride < SAFE && x.met)) return 'safe';
  return 'recovers';
}

export const planName = (p) =>
  `Dry ${p.dry} · wet ${p.wet}${p.conserve ? ' · conserve' : ''}${p.secondWell ? ' · two wells' : ''}`;

// Five-year outlook from the chosen plan: a drought in year 3, a typhoon (a month without power to the wells) in year 4.
export function runLensYears(plan) {
  const frames = [];
  let lens = 60;
  let shut = false;
  for (const t of [1, 2, 3, 4, 5]) {
    const drought = t === 3;
    const typhoon = t === 4;
    const months = simulate(plan, { startLens: lens, recharge: drought ? 0.4 : typhoon ? 1.3 : 1, outageMonths: typhoon ? [7] : [] });
    const peak = Math.max(...months.map((x) => x.chloride));
    lens = months[11].lens;
    if (peak >= BRACKISH) shut = true;
    const energy = (plan.dry + plan.wet) / 2;
    frames.push({
      year: t,
      storm: typhoon,
      drought,
      event: drought ? 'Drought' : typhoon ? 'Typhoon' : '',
      lens,
      peak,
      shut,
      leaf: Math.round(clamp(lens - (peak >= SAFE ? 15 : 0), 0, 100)),
      people: Math.round(clamp(shut ? 35 : peak >= SAFE ? 60 : 80, 0, 100) - (typhoon ? 10 : 0)),
      coin: Math.round(clamp(90 - energy * 0.5 - (shut ? 20 : 0), 0, 100)),
      line: `${drought ? 'Drought: the rain barely refills the lens. ' : typhoon ? 'Typhoon: the wells lose power for a month, then the rain refills the lens. ' : 'A normal year. '}Chloride peaks ${peak >= BRACKISH ? 'over the limit — the well is shut' : peak >= SAFE ? 'above the safe band' : 'inside the safe band'}.`,
    });
  }
  const end = frames[4];
  const summary = end.shut
    ? 'The well turned brackish and was shut. Once that happens, it takes a long time to recover.'
    : frames.some((f) => f.peak >= SAFE)
      ? 'The well came through, but the drought pushed the salt reading above the safe band.'
      : 'The lens held through the drought and the typhoon, and the salt reading stayed in the safe band.';
  return { frames, summary };
}
