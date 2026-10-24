import { Mark, Trace } from './stageKit.jsx';

// Scenario #3 (Help a Fisherman): Coral & Sea Life
export default {
  id: 'coast',
  plate: 'CORAL & SEA LIFE · COAST · 3 OF 5',
  persona: { name: 'Tatan Ben', age: 58, role: 'Fisherman, Tumon' },
  closing:
    "The reef fed my father and it feeds me. Whether it feeds anybody after that — that part happens up on the land, where you're headed next.",

  blocks: [
    { tone: 'land', x: 0, y: 0, w: 100, h: 40, label: 'Tumon — from the dock' },
    { tone: 'hill', x: 0, y: 0, w: 30, h: 18, label: 'Upstream: fields + burned hills' },
    { tone: 'stream', x: 14, y: 18, w: 6, h: 24 },
    { tone: 'sea', x: 0, y: 40, w: 100, h: 60 },
    { tone: 'plume', x: 10, y: 40, w: 18, h: 14, label: 'Brown water' },
    { tone: 'dock', x: 32, y: 32, w: 30, h: 10, label: 'Dock' },
    { tone: 'boat', x: 70, y: 42, w: 14, h: 7, label: "Ben's boat" },
    { id: 'reefLive', tone: 'reef-live', x: 46, y: 74, w: 24, h: 16, label: 'Live reef' },
    { id: 'reefGrey', tone: 'reef-grey', x: 70, y: 74, w: 24, h: 16, label: 'Bleached' },
  ],

  hotspots: [
    {
      id: 'reef',
      label: 'Grey reef patch',
      icon: 'coral',
      x: 82,
      y: 70,
      kind: 'choice',
      prompt: "Half this reef bleached. What's doing it?",
      config: {
        options: [
          {
            id: 'heat',
            label: 'Only ocean heat — nothing to do locally',
            feedback:
              "The heat is real, but it's only half the story. A reef buried in sediment and algae can't bounce back after a heatwave. NOAA lists land-based pollution as a top local threat — and local is what we can change.",
          },
          {
            id: 'runoff',
            correct: true,
            label: 'Heat PLUS the mud and nutrients washing off the land',
            points: { veg: 5, water: 3 },
            feedback:
              "Right. Heatwaves bleach coral everywhere, but a reef smothered in sediment and fed excess nutrients can't recover between heatwaves. NOAA's Coral Reef Conservation Program calls land-based pollution one of the top local threats — and the local part is the part an island can fix.",
          },
          {
            id: 'fish',
            label: 'The fish ate it',
            feedback:
              "Fish don't bleach coral — the grazers actually help it by eating algae. Heatwaves bleach, and sediment and nutrients from the land stop the reef recovering between them. NOAA lists land-based pollution as a top local threat.",
          },
        ],
      },
    },
    {
      id: 'outlet',
      label: 'Stream outlet',
      icon: 'stream',
      x: 19,
      y: 47,
      kind: 'choice',
      prompt: 'That brown water comes down every time it rains hard. Where is it from?',
      afterFrame: 'oneSystem',
      config: {
        options: [
          {
            id: 'hills',
            correct: true,
            label: 'The burned hills and bare fields upstream',
            points: { soil: 3, veg: 5 },
            feedback:
              "You've seen this before — it's the same soil from the farm and the fire hills, finishing its trip. Sediment that leaves the land ends up on the reef. UOG Sea Grant plants trees along rivers like the Ugum for exactly this reason: hold the soil up there, save the coral down here.",
          },
          {
            id: 'ocean',
            label: 'The ocean stirring itself up',
            feedback:
              "Waves stir sand, but this water is brown before it ever reaches the bay — it's soil off the burned hills and bare fields upstream. Sediment that leaves the land ends up on the reef. Hold the soil up there, save the coral down here.",
          },
          {
            id: 'boats',
            label: 'Boats',
            feedback:
              "Boats churn a little, but this plume runs down the stream every hard rain — it's soil from the burned hills and bare fields upstream. Sediment that leaves the land ends up on the reef.",
          },
        ],
      },
    },
    {
      id: 'bucket',
      label: 'Catch bucket',
      icon: 'bucket',
      x: 46,
      y: 27,
      kind: 'sort',
      prompt: "Sort the morning's catch: keepers in the cooler, the rest back over the side.",
      config: {
        seconds: 30,
        perCorrect: 3,
        protectPenalty: 3,
        hint: 'Minimum keeper size is 20 cm.',
        bins: [
          { id: 'keep', label: 'Cooler — keep' },
          { id: 'release', label: 'Over the side — release' },
        ],
        items: [
          { id: 'f1', label: 'Snapper', detail: '34 cm · adult', answer: 'keep' },
          { id: 'f2', label: 'Juvenile jack', detail: '9 cm', answer: 'release', protect: true },
          { id: 'f3', label: 'Rabbitfish', detail: '26 cm · adult', answer: 'keep' },
          { id: 'f4', label: 'Parrotfish', detail: 'Reef grazer', answer: 'release', protect: true },
          { id: 'f5', label: 'Goatfish', detail: '24 cm · adult', answer: 'keep' },
          { id: 'f6', label: 'Grouper', detail: 'Carrying eggs', answer: 'release' },
          { id: 'f7', label: 'Juvenile snapper', detail: '11 cm', answer: 'release', protect: true },
          { id: 'f8', label: 'Emperor', detail: '31 cm · adult', answer: 'keep' },
        ],
        feedback:
          "Juveniles are next year's catch, and grazers keep the algae from smothering recovering coral — the parrotfish is the lawnmower of the reef. Size limits aren't paperwork — they're the reef paying interest.",
      },
    },
    {
      id: 'mooring',
      label: 'Mooring line',
      icon: 'anchor',
      x: 86,
      y: 46,
      kind: 'choice',
      prompt: "Ben's cousin anchors wherever the fish are. Ben uses the mooring buoy. Who's right?",
      config: {
        options: [
          {
            id: 'cousin',
            label: 'Cousin — anchors are fine, coral is rock',
            feedback:
              "Coral is alive, and slow. A dropped anchor and dragged chain can crush coral that took decades to grow. Mooring buoys exist so boats never have to touch the reef — Guam's marine preserves rely on them.",
          },
          {
            id: 'ben',
            correct: true,
            label: 'Ben — one anchor drop can crush decades of coral; use moorings or sand patches',
            points: { veg: 4 },
            feedback:
              "A dropped anchor and dragged chain can crush coral that took decades to grow. Mooring buoys exist so boats never have to touch the reef — Guam's marine preserves rely on them.",
          },
        ],
      },
    },
  ],

  overlays(done) {
    return (
      <>
        {done.outlet && <Trace from={[24, 6]} to={[18, 46]} tone="ghost" />}
        {done.reef && <Trace from={[20, 50]} to={[80, 80]} tone="soil" />}
        {done.reef && (
          <Mark x={50} y={58} icon="stream" tone="soil">
            Runoff reaches the reef
          </Mark>
        )}
        {done.bucket && (
          <Mark x={50} y={92} icon="fish" tone="veg">
            {done.bucket.state.released} released to the live reef
          </Mark>
        )}
        {done.mooring?.state === 'ben' && (
          <Mark x={72} y={56} icon="anchor" tone="veg">
            Mooring buoy · reef untouched
          </Mark>
        )}
        {done.mooring?.state === 'cousin' && (
          <Mark x={72} y={66} icon="anchor" tone="danger">
            Anchor scar
          </Mark>
        )}
      </>
    );
  },

  outcome: (points) => ((points.veg || 0) >= 9 ? 'good' : 'bad'),
  consequence: {
    good: {
      headline: 'The grey patch is taking color again.',
      swap: { reefGrey: 'reef-recovering' },
      marks: [
        { x: 74, y: 70, icon: 'coral', tone: 'veg', text: 'New color flecks' },
        { x: 56, y: 62, icon: 'fish', tone: 'veg', text: 'Fish shadows return' },
        { x: 40, y: 22, icon: 'bucket', tone: 'veg', text: 'Cooler respectably full' },
      ],
    },
    bad: {
      headline: 'The grey keeps spreading.',
      swap: { reefLive: 'reef-grey' },
      marks: [
        { x: 50, y: 70, icon: 'coral', tone: 'danger', text: 'Grey spreading' },
        { x: 40, y: 22, icon: 'bucket', tone: 'danger', text: 'Bucket near-empty' },
        { x: 70, y: 38, icon: 'boat', tone: 'danger', text: 'For sale' },
      ],
    },
  },

  card: {
    title: { good: 'You traced the reef back to the land', bad: 'The grey kept spreading' },
    fact: "Heatwaves bleach coral everywhere — but a reef smothered in sediment and fed extra nutrients can't recover between them. NOAA lists land-based pollution among the top local threats to coral, and on Guam the soil that leaves farms and burned hills ends up on the reef. UOG Sea Grant plants trees along rivers like the Ugum to hold it in place.",
    source: 'NOAA Coral Reef Conservation Program · UOG Sea Grant watershed plantings',
    actionLabel: 'Join a reef-flat cleanup or watershed planting day',
    actions: [
      { label: 'UOG Sea Grant — watershed plantings', href: 'https://seagrant.uog.edu/' },
      { label: 'NOAA Coral Reef Conservation Program', href: 'https://coralreef.noaa.gov/' },
    ],
  },
};
