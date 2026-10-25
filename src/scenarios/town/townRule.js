// Five-year outlook for Scenario 5 (fictional town; illustrative, not a forecast).
// A dry season in year 2 (the well is the only supply), a monitoring result in year 3, a storm in year 4.

export const EFFORTS = [
  { id: 'townhall', label: 'Organize a town hall on water and pollution', cost: 1, tradeoff: 'Gets residents, officials and the operators in one room. Unlocks the town hall.' },
  { id: 'monitoring', label: 'Ask for independent monitoring wells between the hill and town, with public results', cost: 1, tradeoff: 'The source gets found much faster. Takes months to install, and the operator usually pays.' },
  { id: 'filtration', label: 'Build a community filtration point with the utility (carbon filters for fuel, a certified PFAS filter)', cost: 2, tradeoff: 'Safe water for the six streets right away. Expensive to run and does nothing about the source.' },
  { id: 'meeting', label: 'Meet the plant and the base to ask what sits over the aquifer and why', cost: 1, tradeoff: 'If they come, the town gets answers and possibly a timeline to move fuel storage. They may not come.' },
  { id: 'bottled', label: 'Buy bottled water for the six streets', cost: 1, tradeoff: 'Safe water for a month. Has to be paid for again every month.' },
];
export const TOKENS = 3;

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export const planName = (ids) => ids.map((id) => EFFORTS.find((e) => e.id === id).label.split(' (')[0]).join(' + ') || 'Nothing';

// ids: Set of efforts; start: { hillSource } — true when the sewer already reaches the town (sewer_connected),
// so fewer septic tanks sit near the well and the hill is the most likely source.
export function runTown(ids, start = {}) {
  const has = (id) => ids.has(id);
  // The operators come to a meeting only with the town behind it.
  const theyCome = has('meeting') && has('townhall');
  let found = null;
  if (has('monitoring')) found = theyCome || has('townhall') ? 2 : 3;
  else if (theyCome) found = start.hillSource ? 3 : 4;
  const emptied = found && (theyCome || has('townhall')) ? found + 2 : found ? found + 3 : null;
  const reopened = emptied && emptied < 5 ? emptied + 1 : null;

  const frames = [];
  for (const t of [1, 2, 3, 4, 5]) {
    const wellOpen = reopened !== null && t >= reopened;
    const safe = has('filtration') || wellOpen || (has('bottled') && t === 1);
    const event = t === 2 ? 'Dry season' : t === 3 ? 'Monitoring result' : t === 4 ? 'Storm' : '';
    const fixed = emptied !== null && t >= emptied;
    let line;
    if (t === 2) line = `Dry season: the well is the only supply. ${safe ? 'The six streets still drink safe water.' : 'Families on the six streets line up for the water truck.'}`;
    else if (t === 3) line = found !== null && found <= 3 ? `The monitoring result is in: the source ${found < 3 ? 'was traced last year to a leaking tank on the hill' : 'is traced to a leaking tank on the hill'}.` : 'No monitoring result: nobody knows where it’s coming from.';
    else if (t === 4) line = `Storm. ${fixed ? 'The tanks over the aquifer are empty, so nothing new washes down.' : 'Rain carries more from the hill toward the well.'}`;
    else line = t === 1 ? `${safe ? 'Safe water for the six streets.' : 'The tap is still the only water most families have.'}` : `${wellOpen ? 'The well is open again.' : 'The well is still closed.'}`;
    if (found === t) line += ' The source is found.';
    if (emptied === t) line += ' The tanks over the aquifer are emptied.';
    if (reopened === t) line += ' The well reopens.';
    frames.push({
      year: t,
      event,
      storm: t === 4,
      wellOpen,
      safe,
      found: found !== null && t >= found,
      leaf: Math.round(clamp(40 + (fixed ? 40 : 0) + (found !== null && t >= found ? 10 : 0) - (t === 4 && !fixed ? 15 : 0), 0, 100)),
      people: Math.round(clamp((safe ? 75 : 35) + (wellOpen ? 15 : 0), 0, 100)),
      coin: Math.round(clamp(70 - (has('filtration') ? 20 : 0) - (has('bottled') && t === 1 ? 10 : 0) + (wellOpen ? 15 : 0), 0, 100)),
      line,
    });
  }
  return { frames, summary: summarize({ found, emptied, reopened, has }) };
}

function summarize({ found, emptied, reopened, has }) {
  if (found !== null) {
    const parts = [`The source was traced to a leaking tank in year ${found}.`];
    if (emptied !== null && emptied <= 5) parts.push(`The tanks over the aquifer were emptied in year ${emptied}${reopened ? `, and the well reopened in year ${reopened}` : ', but the well was still closed at the end of year 5'}.`);
    else parts.push('The tanks were still over the aquifer at the end of year 5, and the well stayed closed.');
    return parts.join(' ');
  }
  if (has('filtration')) return 'The six streets drank clean water for five years, but the well never reopened, because nobody found the source.';
  if (has('bottled')) return 'One month of bottled water, then back to the truck. The well never reopened, because nobody found the source.';
  return 'Nobody found the source, and the well never reopened.';
}
