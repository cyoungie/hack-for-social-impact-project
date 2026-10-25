import { Mark } from './stageKit.jsx';
import FarmScene from './scenes/FarmScene.jsx';
import FarmMap from './farm/FarmMap.jsx';
import FarmOutlook from './farm/FarmOutlook.jsx';
import { LayerMap, COVER, COVER_NOTE } from '../components/LayerMap.jsx';

// NRCS practice standards are published in the Field Office Technical Guide (nrcs.usda.gov itself would not load when checked).
const NRCS_FOTG = 'https://efotg.sc.egov.usda.gov/';

const TILL = {
  right:
    'Nice work. Tilling less disturbs less soil, so more of its structure, organic matter and soil life stays intact. Following the contour lines means each furrow catches water instead of channelling it downhill. NRCS promotes both reduced tillage and contour farming to cut erosion on sloped land.',
  badDepth:
    'Not quite. The path is good, but deep tilling breaks up soil structure and leaves loose soil that heavy rain can easily carry away. NRCS recommends tilling as little as possible, or skipping tillage entirely where the crop allows.',
  badPath:
    'Not quite. The depth is good, but furrows running downhill act like gutters, speeding up runoff toward the stream. NRCS recommends tilling along the contour so each row slows the water down.',
  // Both wrong: both points in one message.
  both:
    'Not quite. Deep tilling breaks up soil structure and leaves loose soil that heavy rain can easily carry away, and furrows running downhill act like gutters, speeding up runoff toward the stream. NRCS recommends tilling as little as possible, or skipping tillage entirely where the crop allows, and tilling along the contour so each row slows the water down.',
};

function Baseline() {
  return (
    <LayerMap
      layers={[
        { id: 'landcover', label: 'Land cover', note: `Cropland, savanna, burned ground on the ridge, riverbank trees. ${COVER_NOTE}` },
        { id: 'slope', label: 'Slope', note: 'The field is moderate; the ridge above it is steep.' },
        { id: 'gully', label: 'Last wet season', note: 'The gully the storms cut across the field.' },
      ]}
      legend={[
        { color: COVER.crop, label: 'Cropland' },
        { color: COVER.grass, label: 'Savanna' },
        { color: COVER.bare, label: 'Burned ground' },
        { color: COVER.trees, label: 'Riverbank trees' },
        { color: COVER.water, label: 'Stream' },
      ]}
      render={(on) => <FarmMap layers={on} label="Baseline map of Rosa's farm" />}
    />
  );
}

// Scenario 1 (Help a Business Owner): Heavy Soil Erosion
export default {
  id: 'field',
  plate: 'COUNTRYSIDE · HEAVY SOIL EROSION',
  persona: { name: 'Rosa', role: 'Runs a small farm outside the main town' },
  closing: 'If the soil stays, so do I. Thanks for the help.',

  Baseline,
  baselineTitle: 'The farm and the hill above it',
  Finale: FarmOutlook,
  finaleTitle: 'Rosa’s farm, the next five years',

  // Illustrated scene. The field, ridge strip, stream and reef change as soon as each choice is made.
  Scene: FarmScene,
  sceneState(done, outcome) {
    const cover = done.cover?.state;
    const till = done.tractor?.state;
    const tillOk = till && till.path === 'contour' && till.depth !== 'deep';
    const fert = done.clouds?.state;
    let field = 'plowed';
    if (cover) field = { mulch: 'mulch', cover: 'seedlings', bare: 'bare' }[cover];
    if (till) field = tillOk ? 'contour' : 'furrows';
    let crops = fert ? (fert.fertGood ? 'healthy' : 'poor') : null;
    if (outcome) crops = outcome === 'good' ? 'healthy' : 'poor';
    if (outcome === 'bad') field = 'furrows';
    return {
      field,
      crops,
      strip: done.ridge?.state || null,
      muddy: outcome ? outcome === 'bad' : Boolean(till && !tillOk) || done.ridge?.state === 'channel',
      reefGrey: outcome ? outcome === 'bad' : Boolean(fert && !fert.fertGood),
      plume: Boolean(fert && !fert.fertGood) || outcome === 'bad',
    };
  },

  hotspots: [
    {
      id: 'cover',
      label: '1.1 · The field',
      icon: 'grass',
      x: 45,
      y: 57,
      box: { x: 22.2, y: 39.5, w: 47.2, h: 46 },
      kind: 'choice',
      prompt: 'Many tropical islands time their crop rotations around the wet and dry seasons. Help Rosa choose how to manage the field between plantings.',
      say: { correct: 'I can get that down before the rains start.', wrong: 'That’s how the field looked before the last storm.' },
      source: { source: 'USDA NRCS', text: 'NRCS recommends keeping soil covered between crops, with mulch or cover crops.', href: NRCS_FOTG },
      config: {
        options: [
          {
            id: 'mulch',
            correct: true,
            label: 'Cover the field with mulch',
            points: { soil: 5, water: 2 },
            feedback:
              'Good call. Mulch acts like a shield, taking the impact of heavy rain so it doesn’t break up and carry off the topsoil. The USDA Natural Resources Conservation Service (NRCS) recommends keeping soil covered between crops for exactly this reason.',
          },
          {
            id: 'bare',
            label: 'Leave the field bare',
            points: { soil: -3 },
            feedback:
              'Bare soil is the riskiest option here. In a tropical downpour, unprotected topsoil can wash away in a single storm, taking nutrients with it. NRCS recommends covering fields with mulch or cover crops between plantings.',
          },
          {
            id: 'cover',
            correct: true,
            label: 'Seed the field with cover crops',
            points: { soil: 5, veg: 3 },
            feedback:
              'Good call. Cover crops protect the surface, and their roots hold soil in place. Some, like legumes, even add nitrogen for the next crop. NRCS recommends keeping soil covered between crops for exactly this reason.',
          },
        ],
      },
    },
    {
      id: 'tractor',
      label: '1.2 · Tractor',
      icon: 'tractor',
      x: 11,
      y: 70,
      box: { x: 6.4, y: 58, w: 14.4, h: 23 },
      labelBelow: true,
      kind: 'till',
      prompt: 'Rosa needs to prepare the field for the next planting. Set the tiller’s depth, then drive the tractor across the field to till it.',
      say: {
        correct: 'Contour rows take me longer to drive. If they keep the soil, it’s worth it.',
        ok: 'Half of that I can fix next time.',
        wrong: 'That’s how I plowed it last year.',
      },
      source: { source: 'USDA NRCS', text: 'NRCS promotes reduced tillage and contour farming to cut erosion on sloped land.', href: NRCS_FOTG },
      config: {
        startDepth: 2,
        depths: [
          { id: 'none', label: 'No-till', sub: '0 in', reach: 0, ok: true },
          { id: 'shallow', label: 'Shallow', sub: '2–4 in', reach: 22, ok: true },
          { id: 'deep', label: 'Deep', sub: '8–12 in', reach: 92, ok: false },
        ],
        results: {
          right: { points: { soil: 6, water: 2 }, feedback: TILL.right },
          badDepth: { points: { soil: 2 }, feedback: TILL.badDepth },
          badPath: { points: { soil: 2 }, feedback: TILL.badPath },
          both: { points: { soil: -4, water: -2 }, feedback: TILL.both },
        },
      },
    },
    {
      id: 'clouds',
      label: '1.3 · The clouds',
      icon: 'rain',
      x: 50,
      y: 12,
      box: { x: 38.6, y: 3.6, w: 22.2, h: 18 },
      kind: 'fertilizer',
      prompt:
        'The rainy season is starting, and Rosa needs to fertilize the young crops this week. Check the forecast and pick the best day to apply fertilizer.',
      say: { correct: 'I’ll wait for the dry day, then.', ok: 'The fertilizer part I got right, at least.', wrong: 'So that’s where my fertilizer went last year.' },
      source: { source: 'USDA NRCS', text: 'NRCS nutrient management guidance: check the forecast and avoid applying fertilizer before heavy rain.', href: NRCS_FOTG },
      // Fertilizing on the storm day or the day before sends runoff toward the reef.
      flags: (r) => ({ farm_runoff: !r.state.fertGood }),
      config: {
        days: [
          { id: 'mon', label: 'Mon', icon: 'sunny', wx: 'Sunny', rain: 0, rainLabel: '0 in' },
          { id: 'tue', label: 'Tue', icon: 'storm', wx: 'Heavy storm', rain: 2, rainLabel: '2+ in', storm: true },
          { id: 'wed', label: 'Wed', icon: 'cloud', wx: 'Partly cloudy', rain: 0.1, rainLabel: '0.1 in' },
          { id: 'thu', label: 'Thu', icon: 'sunny', wx: 'Sunny', rain: 0, rainLabel: '0 in' },
          { id: 'fri', label: 'Fri', icon: 'rain', wx: 'Light showers', rain: 0.3, rainLabel: '0.3 in' },
          { id: 'sat', label: 'Sat', icon: 'cloud', wx: 'Partly cloudy', rain: 0.1, rainLabel: '0.1 in' },
          { id: 'sun', label: 'Sun', icon: 'sunny', wx: 'Sunny', rain: 0, rainLabel: '0 in' },
        ],
        good: {
          points: { veg: 4, water: 3 },
          feedback:
            'Well timed. A light rain after fertilizing helps work nutrients into the soil, but a heavy storm would wash them off the field. NRCS nutrient management guidance recommends checking the forecast and avoiding application before heavy rain.',
        },
        bad: {
          points: { water: -4, veg: -2 },
          feedback:
            'Not quite. With a storm right behind it, much of that fertilizer would run off the field instead of feeding the crop, and on an island that runoff often ends up on nearby coral reefs. NRCS nutrient management guidance recommends holding off until heavy rain has passed.',
        },
        irrigationPenalty: { water: -2 },
        irrigationNote:
          'The storm will water the field for free. Watering on top of heavy rain just adds runoff. Save the irrigation for the drier days.',
      },
    },
    {
      id: 'ridge',
      label: '1.4 · The ridge',
      icon: 'mountain',
      x: 45,
      y: 28,
      box: { x: 20.8, y: 23, w: 49, h: 15 },
      kind: 'strip',
      prompt:
        'The hill above Rosa’s farm is burned every dry season to clear brush for hunting. Rosa can’t control that land. Help her decide what to put at the top of her own field to catch what comes down.',
      say: { correct: 'I can plant that this weekend with my cousins.', wrong: 'Then I’m at the mercy of whoever burns that hill.' },
      config: {
        target: 'The strip above the field',
        options: [
          {
            id: 'planted',
            correct: true,
            label: 'Row of native grass and trees',
            points: { soil: 5, veg: 3 },
            setFlags: { ridge_strip: true },
            feedback:
              'Good call. A planted strip slows runoff and traps soil before it reaches the crop, and its roots hold the edge of the field together. NRCS calls these vegetative barriers or filter strips.',
            source: { source: 'USDA NRCS', text: 'NRCS documents vegetative barriers and filter strips for slowing runoff and trapping soil.', href: NRCS_FOTG },
          },
          {
            id: 'channel',
            label: 'Concrete channel',
            points: { soil: -1, water: -3 },
            setFlags: { ridge_strip: false },
            feedback: 'That moves the water faster, straight to the stream, and the soil goes with it. It protects this field by sending the problem downhill.',
            source: { source: 'USDA NRCS', text: 'NRCS documents vegetative barriers and filter strips for slowing runoff and trapping soil.', href: NRCS_FOTG },
          },
          {
            id: 'nothing',
            label: 'Nothing',
            points: { soil: -3 },
            setFlags: { ridge_strip: false },
            feedback:
              'Then the ridge decides what happens to the field. On islands like this, repeat burning leaves bare ground that sends water and soil straight down (US National Park Service).',
            source: {
              source: 'US National Park Service',
              text: 'On Guam, land becomes bare when wildfires are set for hunting, and clearing and burning vegetation lets more sediment wash into the ocean and onto coral reefs.',
              href: 'https://www.nps.gov/wapa/learn/nature/coral-threats.htm',
            },
          },
        ],
      },
    },
  ],

  overlays(done) {
    const cover = done.cover?.state;
    const till = done.tractor?.state;
    const tillOk = till && till.path === 'contour' && till.depth !== 'deep';
    return (
      <>
        {cover && !till && (
          <Mark x={24} y={88} icon="grass" tone={cover === 'bare' ? 'danger' : 'veg'}>
            {{ mulch: 'Straw mulch layer', cover: 'Cover crop seedlings', bare: 'Bare soil — runoff' }[cover]}
          </Mark>
        )}
        {till && (
          <Mark x={24} y={88} icon="tractor" tone={tillOk ? 'veg' : 'danger'}>
            {tillOk ? 'Contour rows, surface intact' : 'Deep furrows — muddy runoff'}
          </Mark>
        )}
        {done.clouds &&
          (done.clouds.state.fertGood ? (
            <Mark x={70} y={44} icon="grass" tone="veg">
              Crops green — nutrients in the soil
            </Mark>
          ) : (
            <Mark x={52} y={92} icon="coral" tone="danger">
              Nutrient plume over the reef
            </Mark>
          ))}
      </>
    );
  },

  outcome: (points) => ((points.soil || 0) >= 7 ? 'good' : 'bad'),
  consequence: {
    good: {
      headline: 'The topsoil stayed on the hill.',
      swap: {},
      marks: [
        { x: 30, y: 36, icon: 'grass', tone: 'veg', text: 'Sweet potatoes taking root' },
        { x: 62, y: 20, icon: 'stream', tone: 'veg', text: 'Stream running clear' },
        { x: 72, y: 78, icon: 'coral', tone: 'veg', text: 'Reef water clear' },
      ],
    },
    bad: {
      headline: 'Another storm, another layer gone.',
      swap: {},
      marks: [
        { x: 30, y: 36, icon: 'grass', tone: 'danger', text: 'Gullies down the rows' },
        { x: 62, y: 20, icon: 'stream', tone: 'danger', text: 'Stream running brown' },
        { x: 70, y: 78, icon: 'coral', tone: 'danger', text: 'Mud and nutrients on the reef' },
      ],
    },
  },

  card: {
    title: { good: 'You kept the topsoil on the hill', bad: 'The best soil is still in the stream' },
    // Only lines from the scenario script.
    fact: "Mulch acts like a shield, taking the impact of heavy rain so it doesn't break up and carry off the topsoil. Tilling less disturbs less soil, so more of its structure, organic matter, and soil life stays intact. Following the contour lines means each furrow catches water instead of channeling it downhill. A light rain after fertilizing helps work nutrients into the soil, but a heavy storm would wash them off the field.",
    source: 'USDA Natural Resources Conservation Service (NRCS)',
    actionLabel: 'Soil conservation resources',
    actions: [
      { label: 'UOG Cooperative Extension', href: 'https://www.uog.edu/extension/' },
      { label: 'Guam Department of Agriculture', href: 'https://doag.guam.gov/' },
      { label: 'USDA NRCS', href: 'https://www.nrcs.usda.gov/' },
    ],
  },
};
