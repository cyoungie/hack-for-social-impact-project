// Five-year outlook for Scenario 1. Illustrative, not a forecast: the point is direction and relative size.
// Soil lost each year = storm strength × (tillage × row direction × ground cover + runoff from the ridge).
// Big storms in years 2 and 4. A planted strip at the top of the field catches what the burned ridge sends down;
// a concrete channel protects the field but sends the water and soil straight to the stream.

export const STORM_YEARS = [2, 4];
const TILL = { none: 0.4, shallow: 0.6, deep: 1.2 };
const PATH = { contour: 0.5, downhill: 1.5 };
const COVER = { mulch: 0.6, cover: 0.6, bare: 1.2 };
const RIDGE = { planted: 0.15, channel: 0.05, nothing: 0.6 };
const TO_STREAM = { planted: 0, channel: 0.6, nothing: 0 };

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export const PLAN_LABELS = {
  depth: { none: 'No-till', shallow: 'Shallow', deep: 'Deep' },
  path: { contour: 'along the contour', downhill: 'up and down the slope' },
  strip: { planted: 'a planted strip', channel: 'a concrete channel', nothing: 'nothing on the strip' },
};

export const planName = (p) => `${PLAN_LABELS.depth[p.depth]}, ${PLAN_LABELS.path[p.path]}, ${PLAN_LABELS.strip[p.strip]}`;

// plan: { depth, path, strip, cover }
export function runSoil(plan) {
  const frames = [];
  let gully = 1; // last wet season's gully = 1
  let topsoil = 0.7;
  for (const t of [1, 2, 3, 4, 5]) {
    const storm = STORM_YEARS.includes(t) ? 3 : 1;
    const field = TILL[plan.depth] * PATH[plan.path] * COVER[plan.cover || 'mulch'] * 0.5;
    const loss = storm * (field + RIDGE[plan.strip]);
    const streamMud = storm * (field * 0.6 + TO_STREAM[plan.strip]);
    gully = clamp(gully + (loss > 0.6 ? loss * 0.25 : -0.15), 0.2, 3);
    topsoil = clamp(topsoil - loss * 0.06 + (loss < 0.4 ? 0.04 : 0), 0, 1);
    frames.push({
      year: t,
      storm: STORM_YEARS.includes(t),
      event: STORM_YEARS.includes(t) ? 'Big storm' : '',
      gully,
      topsoil,
      streamMud,
      leaf: Math.round(clamp(100 * topsoil - 10 * streamMud, 0, 100)),
      people: Math.round(clamp(40 + 50 * topsoil - (gully > 1.5 ? 15 : 0), 0, 100)),
      coin: Math.round(clamp(40 + 45 * topsoil - (plan.path === 'contour' && t === 1 ? 6 : 0) - (plan.strip === 'channel' && t === 1 ? 8 : 0), 0, 100)),
      line: yearLine(t, storm, loss, gully, streamMud, plan),
    });
  }
  return { frames, summary: summarize(frames, plan) };
}

function yearLine(t, storm, loss, gully, streamMud, plan) {
  const why = [];
  why.push(plan.path === 'contour' ? 'contour rows hold the water' : 'downhill rows channel it');
  if (plan.depth === 'deep') why.push('deep tilling left loose soil');
  why.push({ planted: 'the strip catches the ridge runoff', channel: 'the channel sends ridge water to the stream', nothing: 'ridge runoff pours onto the field' }[plan.strip]);
  const what = loss > 1.5 ? 'A lot of topsoil washes off' : loss > 0.6 ? 'Some topsoil washes off' : 'The soil mostly stays put';
  const g = gully > 1.5 ? 'the gully widens' : gully < 0.8 ? 'the gully grasses over' : 'the gully holds';
  return `${storm > 1 ? 'Big storm. ' : 'Rainy season. '}${what}; ${g}${streamMud > 1 ? '; the stream runs brown' : ''} — ${why.join(', ')}.`;
}

function summarize(frames, plan) {
  const end = frames[4];
  if (plan.path === 'contour' && plan.depth !== 'deep' && plan.strip === 'planted') {
    return 'Contour rows and a planted strip: the gully is a grassed channel and the lower field is back in production.';
  }
  if (plan.path === 'downhill' && plan.depth === 'deep' && plan.strip === 'nothing') {
    return 'Deep downhill rows, nothing on the strip: the gully is twice as wide and the upper field is grass.';
  }
  const parts = [];
  parts.push(end.gully > 1.5 ? 'The gully is wider than it started.' : end.gully < 0.8 ? 'The gully has grassed over.' : 'The gully is about the same.');
  parts.push(end.topsoil > 0.6 ? 'Most of the topsoil is still on the field.' : 'The field has lost much of its topsoil.');
  if (plan.strip === 'channel') parts.push('The channel kept the field drier, but the stream below runs brown after every storm.');
  return parts.join(' ');
}
