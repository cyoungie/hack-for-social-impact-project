import { useState } from 'react';
import { Mark } from './stageKit.jsx';
import WaterScene from './scenes/WaterScene.jsx';
import { LensGauge } from './water/LensKeeper.jsx';
import { NOTES, WATER_GUIDELINE } from './water/notes.js';
import { budgetColor, budgetOf } from './water/budget.js';
import { WaterNote } from '../components/WaterNote.jsx';

// Scenario #4 (Help a Civilian): Fresh Water & Conservation. Six stations, each a mini-game; one retry each, best score counts.
// The draft's bars fold into the four: Water Supply / Clean Water Access -> WATER;
// Preparedness, Health & Safety, Infrastructure & Costs, Community Voice -> PEOPLE.
// All points are proposed and not yet playtested.

function Hud({ done }) {
  const v = budgetOf(done);
  const color = budgetColor(v);
  return (
    <div className="water-hud">
      <div className="budget" role="meter" aria-label="Water Budget" aria-valuemin={0} aria-valuemax={100} aria-valuenow={v}>
        <span className="label">Water Budget</span>
        <span className="budget__track">
          <span className={`budget__fill is-${color}`} style={{ width: `${v}%` }} />
        </span>
        <span className="budget__word">{color}</span>
      </div>
      {done.well && <LensGauge month={done.well.state.last} />}
    </div>
  );
}

function Notebook({ done }) {
  const [openId, setOpenId] = useState(null);
  const ids = Object.keys(NOTES).filter((id) => done[id]);
  return (
    <div className="pcard notebook">
      <p className="label">Water Notebook · {ids.length} / 6</p>
      {ids.length === 0 && <p className="caption">Each station adds a Water Note with the real fact and its source.</p>}
      <ul className="notebook__list">
        {ids.map((id) => (
          <li key={id}>
            <button type="button" className="notebook__item" aria-expanded={openId === id} onClick={() => setOpenId(openId === id ? null : id)}>
              {NOTES[id].title}
            </button>
            {openId === id && <WaterNote note={NOTES[id]} />}
          </li>
        ))}
      </ul>
    </div>
  );
}

const W = (water, people = 0) => ({ water, people });

export default {
  id: 'lens',
  plate: 'FRESH WATER · NORTH VILLAGE · 4 OF 5',
  persona: { name: 'Ana', role: 'Lives over the aquifer, north village' },
  closing: 'Now I know where our water comes from, and what we put on the ground comes back to us. Thank you.',
  sequential: true,
  retries: 1,

  Scene: WaterScene,
  sceneState(done, outcome) {
    return {
      chloride: done.well ? done.well.state.last.chloride : null,
      leaksFixed: Boolean(done.pipe && done.pipe.state.reported >= 4),
      septic: done.septic?.state.treatment || null,
      stocked: Boolean(done.pantry),
      wastersFixed: Boolean(done.house && done.house.state.fixed >= 3),
      council: done.hall ? done.hall.state.passed.filter((id) => ['sewer', 'leaks', 'prove', 'wells', 'barrels'].includes(id)).length : null,
      outcome,
    };
  },
  Hud,
  Rail: Notebook,

  hotspots: [
    {
      id: 'well',
      label: '4.1 · Well house',
      icon: 'pump',
      x: 21,
      y: 37,
      box: { x: 16.7, y: 30, w: 9, h: 13.5 },
      labelBelow: true,
      kind: 'lenskeeper',
      prompt: 'Lens Keeper: run a 12-month year. Set each season’s pumping rate, and use Conserve to lower household demand. The village must get enough water every month.',
      note: NOTES.well,
      say: {
        correct: 'So if we share the load and use less in the dry months, the well stays sweet.',
        ok: 'It got salty in the dry months, but it came back.',
        wrong: 'The well turned brackish. That’s the taste my brother warned me about.',
      },
      config: {
        tiers: {
          safe: { points: W(15, 5), budget: 15, feedback: 'Demand met every month, and chloride stayed in the safe band all year.' },
          recovers: { points: W(5), budget: 5, feedback: 'Chloride rose in the dry season but recovered.' },
          brackish: { points: W(-10, -5), budget: -15, feedback: 'The well turned brackish.' },
        },
      },
    },
    {
      id: 'pipe',
      label: '4.2 · Leaking pipe',
      icon: 'drop',
      x: 67,
      y: 49,
      box: { x: 57, y: 46, w: 21, h: 7 },
      labelBelow: true,
      kind: 'leakhunt',
      prompt: 'Leak Hunt: five leaks are hidden in the village’s old pipes. Tap to listen, then report each leak you find to GWA.',
      note: NOTES.pipe,
      say: {
        correct: 'You found them and told GWA. That’s water back in the pipes.',
        ok: 'Some are still running under the road.',
        wrong: 'Listen — you can still hear it dripping somewhere.',
      },
      config: {
        seconds: 60,
        tiers: {
          most: { points: W(10, 5), budget: 10, feedback: '' },
          some: { points: W(5), budget: 5, feedback: '' },
          few: { points: W(0), budget: -5, feedback: '' },
        },
        voice: { people: 5 },
      },
    },
    {
      id: 'septic',
      label: '4.3 · Septic tank',
      icon: 'lid',
      x: 39,
      y: 53,
      box: { x: 35, y: 45.4, w: 7.6, h: 15.8 },
      labelBelow: true,
      kind: 'followdrop',
      prompt: 'Follow the Drop: pick a treatment for Ana’s septic tank, press Flush, and watch how fast waste water reaches the lens.',
      note: NOTES.septic,
      say: {
        correct: 'So with the sewer, it never goes down toward our water at all.',
        ok: 'Slower is better than straight down. It costs us, though.',
        wrong: 'It went straight down to the water we drink.',
      },
      config: {
        results: {
          sewer: { points: W(10, 0), budget: 10, feedback: 'The drop leaves through the sewer line instead of soaking down toward the lens.' },
          upgrade: { points: W(5, -5), budget: 5, feedback: 'The drop takes longer to reach the lens.' },
          pump: { points: W(5, -5), budget: 5, feedback: 'The drop takes longer to reach the lens.' },
          leave: { points: W(-10, -5), budget: -10, feedback: 'The drop reaches the lens fast.' },
        },
        reportPoints: { people: 5 },
        reportFeedback: 'You reported the overflow to GWA.',
      },
    },
    {
      id: 'pantry',
      label: '4.4 · Pantry',
      icon: 'tank',
      x: 51,
      y: 37,
      box: { x: 48.2, y: 31.3, w: 6.4, h: 12.1 },
      kind: 'waterkit',
      prompt: 'Typhoon Water Kit: a storm is coming. Pack Ana’s shelf and yard before the clock runs out.',
      note: NOTES.pantry,
      say: {
        correct: 'We made it through the whole week. And we boiled the barrel water.',
        ok: 'We ran short before the power came back.',
        wrong: 'We ran out in the first days.',
      },
      configFor: () => ({
        seconds: 40,
        perPersonPerDay: WATER_GUIDELINE.perPersonPerDay,
        guideline: WATER_GUIDELINE.text,
        tiers: {
          full: { points: W(0, 20), budget: 10, feedback: "Water that wasn't stored was treated." },
          part: { points: W(0, 5), budget: 0, feedback: '' },
          short: { points: W(0, -10), budget: -10, feedback: '' },
        },
        untreated: { points: { people: -10 }, feedback: 'The family drank rain barrel water without treating it.' },
      }),
    },
    {
      id: 'house',
      label: '4.5 · The house',
      icon: 'home',
      x: 40,
      y: 33,
      box: { x: 31.7, y: 23, w: 16.4, h: 20 },
      kind: 'detective',
      prompt: 'Water Detective: in 60 seconds, tap the water wasters in Ana’s home and yard, and drag the right fix onto each.',
      note: NOTES.house,
      say: {
        correct: 'Our bill’s going to drop. So is the pumping.',
        ok: 'Better. There’s still a hose running somewhere.',
        wrong: 'We’re still pouring water away.',
      },
      configFor: (done) => ({
        seconds: 60,
        budgetNow: budgetOf(done),
        tiers: {
          green: { points: W(10, 5), feedback: '' },
          yellow: { points: W(5), feedback: '' },
          red: { points: W(-5), feedback: '' },
        },
      }),
    },
    {
      id: 'hall',
      label: '4.6 · Village hall',
      icon: 'board',
      x: 85,
      y: 32,
      box: { x: 73.9, y: 22.4, w: 21.7, h: 21 },
      kind: 'council',
      prompt: 'Village Council: you hold eight talking cards. Pick three to present. Each card needs 3 of 5 votes to pass.',
      note: NOTES.hall,
      say: {
        correct: 'All three passed. I didn’t know we could do that.',
        ok: 'Some of it passed. That still counts.',
        wrong: 'That one hurts our water. We have to come back next month.',
      },
      config: {
        tiers: {
          three: { points: W(0, 20), budget: 15, feedback: '' },
          two: { points: W(0, 10), budget: 10, feedback: '' },
          one: { points: W(0, 5), budget: 5, feedback: '' },
          none: { points: W(0), budget: 0, feedback: '' },
        },
        harmful: { points: { water: -10, people: -5 }, budget: -10, feedback: 'Each harmful card that passes costs the village clean water.' },
      },
    },
  ],

  overlays(done) {
    return (
      <>
        {done.well && (
          <Mark x={2} y={46} icon="pump" tone={{ safe: 'veg', recovers: 'warning', brackish: 'danger' }[done.well.state.tier]}>
            {{ safe: 'Lens safe all year', recovers: 'Salty in the dry season, recovered', brackish: 'Well turned brackish' }[done.well.state.tier]}
          </Mark>
        )}
      </>
    );
  },

  outcome: (points, done) => (budgetColor(budgetOf(done)) === 'green' ? 'good' : 'bad'),
  consequence: {
    good: { headline: 'Enough clean water, in good weather and after storms.', swap: {}, marks: [] },
    bad: { headline: 'The Water Budget ends short.', swap: {}, marks: [] },
  },

  card: {
    title: { good: 'You kept the lens safe and the taps running', bad: 'The lens is still at risk' },
    fact: "Most of Guam's drinking water is groundwater. In the north it comes from a freshwater lens floating on seawater inside porous limestone: pump it too hard and it turns salty, what's spilled on the ground reaches it fast, and when a typhoon cuts the power, the wells stop. Some wells in central Guam (the Hagåtña–Sinajana area) were also taken offline because of PFOS, a 'forever chemical' — the next scenario picks that up.",
    source: 'USGS · UOG WERI · UOG Hydrologic Survey · Guam EPA · Guam Homeland Security · UN Water',
    actionLabel: 'Report leaks or outages to GWA at 646-4211 — and get storm-ready',
    actions: [
      { label: 'Guam EPA — Water Resources Management Program', href: 'https://epa.guam.gov/wrmp/' },
      { label: 'Guam Homeland Security — build a kit', href: 'https://ghs.guam.gov/outreach/citizens-preparedness/build-kit' },
      { label: 'UOG Hydrologic Survey — PFAS in Guam wells', href: 'https://guamhydrologicsurvey.uog.edu/2025/07/29/pfas/' },
      { label: 'UN — Water', href: 'https://www.un.org/en/global-issues/water' },
    ],
  },
};
