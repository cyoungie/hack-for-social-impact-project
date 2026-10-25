import { Mark } from './stageKit.jsx';
import WaterScene from './scenes/WaterScene.jsx';
import { NOTES, WATER_GUIDELINE } from './water/notes.js';
import { LayerMap, COVER, COVER_NOTE } from '../components/LayerMap.jsx';

// Notes -> source cards (each fact checked against its linked source).
const card = (n) => ({ title: n.title, text: n.text, source: n.source, href: n.href });

// The town well's chloride readings for the last six years. ILLUSTRATIVE placeholder until the team adds
// the readings from the utility's published water quality reports.
const CHLORIDE = [
  { year: '2021', v: 38 },
  { year: '2022', v: 41 },
  { year: '2023', v: 52 },
  { year: '2024', v: 47 },
  { year: '2025', v: 55 },
  { year: '2026', v: 58 },
];

function VillageLensMap({ on }) {
  return (
    <svg className="vmap" viewBox="0 0 400 300" role="img" aria-label="Baseline map of the village over the freshwater lens">
      <rect x="0" y="0" width="400" height="150" fill={on.landcover ? COVER.grass : 'color-mix(in srgb, var(--veg) 35%, var(--panel))'} />
      {on.landcover && <rect x="0" y="0" width="90" height="150" fill={COVER.trees} />}
      {on.landcover && <rect x="300" y="20" width="80" height="60" fill={COVER.bare} />}
      {[120, 160, 200, 240].map((x, i) => (
        <rect key={x} x={x} y={40 + (i % 2) * 40} width="26" height="22" fill={on.landcover ? COVER.built : 'var(--postcard)'} stroke="var(--ink)" />
      ))}
      <text x="6" y="16" className="vm-label vm-label--light">FOREST STRIP</text>
      <text x="304" y="16" className="vm-label">CLEARED LOT</text>
      <rect x="250" y="96" width="22" height="22" fill="var(--postcard)" stroke="var(--ink)" />
      <text x="232" y="132" className="vm-label">TOWN WELL</text>
      {on.sewer && (
        <g>
          <rect x="0" y="140" width="210" height="6" fill="var(--ink)" />
          <text x="6" y="160" className="vm-label">SEWER LINE REACHES HERE →</text>
        </g>
      )}
      <rect x="0" y="150" width="400" height="60" fill="color-mix(in srgb, var(--postcard) 70%, var(--faint))" />
      <text x="290" y="176" className="vm-label">POROUS LIMESTONE</text>
      <path d="M0 210 Q 200 196 400 210 L400 260 L0 260 Z" fill="color-mix(in srgb, var(--water) 60%, var(--bg))" />
      <rect x="0" y="260" width="400" height="40" fill="color-mix(in srgb, var(--water) 60%, #16395c)" />
      <text x="6" y="240" className="vm-label">FRESHWATER LENS</text>
      <text x="6" y="290" className="vm-label vm-label--light">SEAWATER</text>
    </svg>
  );
}

function Baseline() {
  return (
    <div className="prim">
      <LayerMap
        layers={[
          { id: 'landcover', label: 'Land cover', note: `Houses, a forest strip, a cleared lot. ${COVER_NOTE}` },
          { id: 'sewer', label: 'Sewer line', note: 'How far the sewer line reaches today.' },
        ]}
        legend={[
          { color: COVER.built, label: 'Houses' },
          { color: COVER.trees, label: 'Forest strip' },
          { color: COVER.bare, label: 'Cleared lot' },
          { color: COVER.grass, label: 'Grass and yards' },
          { color: COVER.water, label: 'Freshwater lens' },
        ]}
        render={(on) => <VillageLensMap on={on} />}
      />
      <div className="chloride-chart" role="img" aria-label="Town well chloride readings, last six years">
        <p className="label">Town well · salt (chloride) readings, last six years</p>
        <div className="chloride-chart__bars">
          {CHLORIDE.map((c) => (
            <span key={c.year} className="chloride-chart__col">
              <span className="chloride-chart__bar" style={{ height: `${c.v}%` }} />
              <span className="caption">{c.year}</span>
            </span>
          ))}
        </div>
        <p className="caption water-note__pending">Illustrative readings — the team will replace these with the utility’s published reports.</p>
      </div>
    </div>
  );
}

const W = (water, people = 0) => ({ water, people });

// Scenario 4 (Help a Homeowner): Fresh Water. Score types fold into the four bars (water supply -> WATER;
// preparedness and health -> PEOPLE). Points are proposed and not yet playtested.
export default {
  id: 'lens',
  plate: 'WATER TOWER · FRESH WATER',
  persona: { name: 'Ana', role: 'Homeowner on the limestone plateau' },
  closing: 'I know where our water comes from now, and that what goes into the ground ends up back in our tap. Thank you.',

  Baseline,
  baselineTitle: 'The village over the freshwater lens',

  Scene: WaterScene,
  sceneState(done, outcome) {
    return {
      chloride: done.well ? done.well.state.last.chloride : null,
      leaksFixed: Boolean(done.pipe && done.pipe.state.reported >= 4),
      septic: done.septic?.state.treatment || null,
      stocked: Boolean(done.pantry),
      outcome,
    };
  },

  hotspots: [
    {
      id: 'well',
      label: '4.1 · The well',
      icon: 'pump',
      x: 21,
      y: 37,
      box: { x: 16.7, y: 30, w: 9, h: 13.5 },
      labelBelow: true,
      kind: 'lenskeeper',
      prompt: 'Lens Keeper: run a 12-month year. Set the pumping rate each season and choose whether the utility asks households to conserve. The village has to get enough water every month.',
      source: card(NOTES.well),
      say: {
        correct: 'So it’s the dry months we have to watch.',
        ok: 'One more dry year and we’d have been in trouble.',
        wrong: 'My brother said once it goes salty it’s hard to come back.',
      },
      config: {
        tiers: {
          safe: { points: W(15, 5), feedback: 'The lens held through the dry season. Spreading the pumping out and asking people to cut back kept the salt water down.' },
          recovers: { points: W(5), feedback: 'It got close. The wet season refilled the lens, but a longer dry spell would have pushed the well over the limit.' },
          brackish: { points: W(-10, -5), feedback: 'The well is drawing salt water now and has to be shut. Once that happens, it can take a long time to recover.' },
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
      prompt: 'Leak Hunt: five leaks are hidden in the village’s old water mains. Tap to listen; the ripple gets stronger near a leak. Report each one you find to the utility.',
      source: card(NOTES.pipe),
      say: {
        correct: 'I’ll tell my brother to look out for the crew.',
        ok: 'At least some of it’s fixed.',
        wrong: 'You can still hear it running under the road.',
      },
      config: {
        seconds: 60,
        tiers: {
          most: { points: W(10, 5), feedback: 'The utility has the locations and a crew scheduled. That’s water that was being pumped, treated and lost before it reached anyone.' },
          some: { points: W(5), feedback: 'Some fixed. The rest are still running.' },
          unreported: { points: W(0), feedback: 'You know where they are, but the utility doesn’t.' },
          few: { points: W(0), feedback: 'The leaks are still running.' },
        },
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
      prompt: 'Follow the Drop: pick an option for Ana’s old septic tank and press Flush. Watch how fast, and how dirty, the water reaches the lens.',
      source: card(NOTES.septic),
      say: {
        correct: 'The hookup fee hurts, but I’d rather pay it once.',
        ok: 'Better than nothing. We’re still sitting on top of it, though.',
        wrong: 'Days. That’s all it takes?',
      },
      flags: (r) => ({ sewer_connected: r.state.treatment === 'sewer' }),
      config: {
        results: {
          sewer: { points: W(10, 0), feedback: 'It costs a hookup fee, but nothing from the house reaches the lens now.' },
          upgrade: { points: W(5, -5), feedback: 'Better. An old tank that’s maintained leaks far less, though it’s still sitting over the aquifer.' },
          pump: { points: W(5, -5), feedback: 'Better. An old tank that’s maintained leaks far less, though it’s still sitting over the aquifer.' },
          leave: { points: W(-10, -5), feedback: 'The drop reaches the lens in days. Through limestone, there’s very little to filter it on the way.' },
        },
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
      prompt: 'Typhoon Water Kit: a storm is coming. Drag supplies onto Ana’s shelf and yard before the clock runs out.',
      source: card(NOTES.pantry),
      say: {
        correct: 'No water-truck line for us this time.',
        ok: 'Next time I’m buying two more jugs.',
        wrong: 'I should have boiled the barrel water.',
      },
      flags: (r) => ({ water_kit: r.verdict === 'correct' }),
      configFor: () => ({
        seconds: 40,
        perPersonPerDay: WATER_GUIDELINE.perPersonPerDay,
        guideline: WATER_GUIDELINE.text,
        tiers: {
          full: { points: W(0, 20), feedback: 'The family made it through the outage without waiting in line at the water truck.' },
          part: { points: W(0, 5), feedback: 'They ran short on day four and spent the afternoon in line for the water truck.' },
          short: { points: W(0, -10), feedback: 'By day two they were out, and drinking untreated rainwater made two of them sick.' },
        },
        untreated: { points: { people: -10 }, feedback: '' },
      }),
    },
  ],

  overlays(done) {
    return (
      <>
        {done.well && (
          <Mark x={2} y={46} icon="pump" tone={{ safe: 'veg', recovers: 'warning', brackish: 'danger' }[done.well.state.tier]}>
            {{ safe: 'Lens held all year', recovers: 'Salty in the dry season, recovered', brackish: 'Well shut — brackish' }[done.well.state.tier]}
          </Mark>
        )}
      </>
    );
  },

  outcome: (points, done) => ((points.water || 0) >= 10 && done.well?.state.tier !== 'brackish' ? 'good' : 'bad'),
  consequence: {
    good: { headline: 'Enough clean water, in good weather and after storms.', swap: {}, marks: [] },
    bad: { headline: 'The tap is still at risk.', swap: {}, marks: [] },
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
