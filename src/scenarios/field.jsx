import { Mark, Trace } from './stageKit.jsx';

const NRCS_COVER =
  'The USDA Natural Resources Conservation Service (NRCS) recommends keeping soil covered between crops for exactly this reason.';

const TILL = {
  right:
    'Nice work. Tilling less disturbs less soil, so more of its structure, organic matter, and soil life stays intact. Following the contour lines means each furrow catches water instead of channeling it downhill. NRCS promotes both reduced tillage and contour farming to cut erosion on sloped land.',
  badDepth:
    'Not quite. The path is good, but deep tilling breaks up soil structure and leaves loose soil that heavy rain can easily carry away. NRCS recommends tilling as little as possible, or skipping tillage entirely where the crop allows.',
  badPath:
    'Not quite. The depth is good, but furrows running downhill act like gutters, speeding up runoff toward the stream. NRCS recommends tilling along the contour so each row slows the water down.',
  both:
    'Not quite. Deep tilling breaks up soil structure and leaves loose soil that heavy rain can easily carry away — and furrows running downhill act like gutters, speeding up runoff toward the stream. NRCS recommends tilling as little as possible, and along the contour so each row slows the water down.',
};

// Scenario #1 (Help a Business Owner): Heavy Soil Erosion
export default {
  id: 'field',
  plate: 'HEAVY SOIL EROSION · COUNTRYSIDE · 1 OF 5',
  persona: { name: 'Tun Jack', role: 'Sweet potato farmer, countryside' },
  closing:
    "Cover between plantings, till light and across the hill, and watch the sky before the fertilizer goes down. My father would have called that common sense. I'm calling it the plan.",

  blocks: [
    { tone: 'sky', x: 0, y: 0, w: 100, h: 26 },
    { tone: 'land', x: 0, y: 26, w: 100, h: 74 },
    { tone: 'house', x: 3, y: 32, w: 15, h: 22, label: 'Farm shed' },
    { id: 'field', tone: 'field-tilled', x: 22, y: 32, w: 46, h: 50, label: 'Sweet potato field' },
    { id: 'stream', tone: 'stream', x: 72, y: 26, w: 6, h: 58, label: 'Stream' },
    { tone: 'sea', x: 70, y: 84, w: 30, h: 16, label: 'Bay' },
    { id: 'reef', tone: 'reef-live', x: 84, y: 88, w: 13, h: 9 },
  ],

  // The field (and stream/reef) change as soon as each choice is made.
  liveSwap(done) {
    const swap = {};
    const cover = done.cover?.state;
    if (cover) swap.field = { mulch: 'field-mulch', cover: 'field-seedlings', bare: 'field-bare' }[cover];
    const till = done.tractor?.state;
    if (till) {
      const ok = till.path === 'contour' && till.depth !== 'deep';
      swap.field = ok ? 'field-contour' : 'field-furrows';
      if (!ok) swap.stream = 'stream-muddy';
    }
    if (done.clouds && !done.clouds.state.fertGood) swap.reef = 'reef-grey';
    return swap;
  },

  hotspots: [
    {
      id: 'cover',
      label: 'The field',
      icon: 'grass',
      x: 45,
      y: 57,
      kind: 'choice',
      prompt:
        'Many tropical islands time their crop rotations around the wet and dry seasons. Help Tun Jack choose how to manage the field between plantings:',
      config: {
        options: [
          {
            id: 'mulch',
            correct: true,
            label: 'Cover the field with mulch',
            points: { soil: 5, water: 2 },
            feedback: `Good call. Mulch acts like a shield, taking the impact of heavy rain so it doesn't break up and carry off the topsoil. ${NRCS_COVER}`,
          },
          {
            id: 'bare',
            label: 'Leave the field bare',
            points: { soil: -3 },
            feedback:
              'Bare soil is the riskiest option here. In a tropical downpour, unprotected topsoil can wash away in a single storm, taking nutrients with it. The USDA Natural Resources Conservation Service (NRCS) recommends covering fields with mulch or cover crops between plantings.',
          },
          {
            id: 'cover',
            correct: true,
            label: 'Seed the field with cover crops',
            points: { soil: 5, veg: 3 },
            feedback: `Good call. Cover crops protect the surface, and their roots hold soil in place. Some, like legumes, even add nitrogen for the next crop. ${NRCS_COVER}`,
          },
        ],
      },
    },
    {
      id: 'tractor',
      label: 'Tractor',
      icon: 'tractor',
      x: 11,
      y: 70,
      kind: 'till',
      prompt: "Tun Jack needs to prepare the field for the next planting. Set the tiller's depth, then drive the tractor across the field to till it.",
      config: {
        startDepth: 2,
        depths: [
          { id: 'none', label: 'No-till', sub: '0 in', reach: 0, ok: true, note: 'Tines up. The old crop residue stays as cover.' },
          { id: 'shallow', label: 'Shallow', sub: '2–4 in', reach: 22, ok: true, note: 'Tines skim the top of the topsoil.' },
          { id: 'deep', label: 'Deep', sub: '8–12 in', reach: 92, ok: false, note: 'How it was set last season: tines tear down into the subsoil.' },
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
      label: 'The clouds',
      icon: 'rain',
      x: 46,
      y: 12,
      kind: 'fertilizer',
      prompt:
        'The rainy season is starting, and Tun Jack needs to fertilize the young crops this week. Check the forecast and pick the best day to apply fertilizer.',
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
  ],

  overlays(done) {
    const cover = done.cover?.state;
    const till = done.tractor?.state;
    const tillOk = till && till.path === 'contour' && till.depth !== 'deep';
    return (
      <>
        {cover && !till && (
          <Mark x={24} y={84} icon="grass" tone={cover === 'bare' ? 'danger' : 'veg'}>
            {{ mulch: 'Straw mulch layer', cover: 'Cover crop seedlings', bare: 'Bare soil — runoff' }[cover]}
          </Mark>
        )}
        {till && (
          <Mark x={24} y={84} icon="tractor" tone={tillOk ? 'veg' : 'danger'}>
            {tillOk ? 'Contour rows, surface intact' : 'Deep furrows — muddy runoff'}
          </Mark>
        )}
        {till && !tillOk && <Trace from={[56, 80]} to={[74, 70]} tone="soil" />}
        {done.clouds &&
          (done.clouds.state.fertGood ? (
            <Mark x={40} y={28} icon="grass" tone="veg">
              Crops green — nutrients in the soil
            </Mark>
          ) : (
            <>
              <Trace from={[60, 70]} to={[90, 92]} tone="plume" />
              <Mark x={56} y={92} icon="coral" tone="danger">
                Nutrient plume over the reef
              </Mark>
            </>
          ))}
      </>
    );
  },

  outcome: (points) => ((points.soil || 0) >= 7 ? 'good' : 'bad'),
  consequence: {
    good: {
      headline: 'The topsoil stayed on the hill.',
      swap: { stream: 'stream' },
      marks: [
        { x: 30, y: 36, icon: 'grass', tone: 'veg', text: 'Sweet potatoes taking root' },
        { x: 62, y: 20, icon: 'stream', tone: 'veg', text: 'Stream running clear' },
        { x: 72, y: 78, icon: 'coral', tone: 'veg', text: 'Reef water clear' },
      ],
    },
    bad: {
      headline: 'Another storm, another layer gone.',
      swap: { field: 'field-furrows', stream: 'stream-muddy' },
      marks: [
        { x: 30, y: 36, icon: 'grass', tone: 'danger', text: 'Gullies down the rows' },
        { x: 62, y: 20, icon: 'stream', tone: 'danger', text: 'Stream running brown' },
        { x: 70, y: 78, icon: 'coral', tone: 'danger', text: 'Mud and nutrients on the reef' },
      ],
    },
  },

  card: {
    title: { good: 'You kept the topsoil on the hill', bad: 'The best soil is still in the stream' },
    fact: 'Topsoil takes centuries to form and one storm to lose. Keeping fields covered between crops, tilling less and along the contour, and timing fertilizer around heavy rain are core USDA NRCS conservation practices — and on an island, the soil and nutrients that leave a farm end up on the reef.',
    source: 'USDA NRCS conservation practices: cover crops, mulching, reduced tillage, contour farming, nutrient management',
    actionLabel: 'Talk to the island’s farm advisors — free help for growers',
    actions: [
      { label: 'UOG Cooperative Extension', href: 'https://www.uog.edu/extension/' },
      { label: 'Guam Department of Agriculture', href: 'https://doag.guam.gov/' },
      { label: 'USDA NRCS', href: 'https://www.nrcs.usda.gov/' },
    ],
  },
};
