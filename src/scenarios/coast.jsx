import { Mark } from './stageKit.jsx';
import CoastScene from './scenes/CoastScene.jsx';
import { COEF } from './reef/rule.js';

const DRAIN_FEEDBACK =
  'More than 80 per cent of ocean pollution starts on land. The dirt can stay on the hill while the road gets built (UNEP). A planted basin slows the water and catches what it carries.';

// Reef at the end of the plan you kept (with the drain choice).
const finalReef = (done) => done.road?.state.finalReef;

// Scenario #3 (Help a Fisherman): Coral & Sea Life. Score types fold in: Ecological -> VEG, Community/Readiness -> PEOPLE.
export default {
  id: 'coast',
  plate: 'CORAL & SEA LIFE · COAST · 3 OF 5',
  persona: { name: 'Tom', role: 'Fisherman' },
  // One closing line in the script; the bad ending keeps only its first half, since the reef didn't recover.
  closing: {
    good: 'This road sure will help us get around easier and I’m glad the sea life is recovering. Thanks.',
    bad: 'This road sure will help us get around easier.',
  },

  Scene: CoastScene,
  sceneState(done, outcome) {
    const reef = finalReef(done);
    return {
      route: done.road?.state.route || null,
      controls: new Set(done.road?.state.controls || []),
      drain: done.drain?.state || null,
      counted: done.coral ? done.coral.state.counted : null,
      bay: outcome ? (reef >= 0.5 ? 'clear' : reef >= 0.2 ? 'murky' : 'brown') : 'brown',
      shopClosed: outcome === 'bad',
    };
  },

  hotspots: [
    {
      id: 'coral',
      label: 'The coral',
      icon: 'coral',
      x: 87,
      y: 87,
      box: { x: 78.5, y: 82, w: 17.5, h: 11 },
      kind: 'coralcount',
      prompt: 'Coral count: tap only the healthy corals in 20 seconds.',
      config: {
        seconds: 20,
        feedback:
          "Bleached coral that's still alive can recover if the water stays clean. Coral stressed by mud and pollution dies more in a heat wave and recovers slower (UNEP).",
      },
    },
    {
      id: 'drain',
      label: 'Storm drain',
      icon: 'drain',
      x: 63,
      y: 64,
      box: { x: 59.8, y: 59, w: 7, h: 12 },
      labelBelow: true,
      kind: 'choice',
      prompt: 'When the village floods, this drain carries the street into the bay. What should it do instead?',
      config: {
        options: [
          { id: 'basin', correct: true, label: 'Run it through a planted basin first', points: { veg: 10 }, feedback: DRAIN_FEEDBACK },
          { id: 'pipe', ok: true, label: 'Pipe it further out to sea', points: {}, feedback: DRAIN_FEEDBACK },
          { id: 'block', label: 'Block it', points: { people: -5 }, feedback: `The street floods. ${DRAIN_FEEDBACK}` },
        ],
      },
    },
    {
      id: 'road',
      label: 'The road cut',
      icon: 'tractor',
      x: 45,
      y: 35,
      box: { x: 27.8, y: 17, w: 34.7, h: 28 },
      kind: 'roadplan',
      prompt: 'The road is going in either way. Help Tom and the contractor decide how.',
      // The drain choice changes how much street runoff reaches the reef.
      configFor: (done) => ({ extras: { drain: done.drain?.state || null } }),
    },
  ],

  overlays(done) {
    return (
      <>
        {done.coral && (
          <Mark x={62} y={92} icon="coral" tone={done.coral.state.counted === done.coral.state.healthy ? 'veg' : 'warning'}>
            Healthy coral counted: {done.coral.state.counted} of {done.coral.state.healthy}
          </Mark>
        )}
        {done.drain && (
          <Mark x={40} y={64} icon="drain" tone={{ basin: 'veg', pipe: 'plain', block: 'danger' }[done.drain.state]}>
            {{ basin: 'Green basin before the beach', pipe: 'Piped further out to sea', block: 'Drain blocked — the street floods' }[done.drain.state]}
          </Mark>
        )}
        {done.road && (
          <Mark x={2} y={6} icon="tractor" tone={done.road.state.finalReef >= 0.5 ? 'veg' : 'danger'}>
            Road plan kept
          </Mark>
        )}
      </>
    );
  },

  outcome: (points, done) => ((finalReef(done) ?? 0) >= 0.5 ? 'good' : 'bad'),
  consequence: {
    good: {
      headline: 'The rainy season hits: clear water after the storm.',
      swap: {},
      marks: [{ x: 70, y: 76, icon: 'coral', tone: 'veg', text: 'Clear water over the point' }],
    },
    bad: {
      headline: 'The rainy season hits: a brown bay.',
      swap: {},
      marks: [
        { x: 70, y: 76, icon: 'coral', tone: 'danger', text: 'A brown bay' },
        { x: 70, y: 48, icon: 'home', tone: 'danger', text: 'The dive shop has closed' },
      ],
    },
  },

  ruleCard: {
    title: 'The rule',
    intro: 'Illustrative, not a forecast.',
    lines: [
      'Mud reaching the reef each storm = bare ground on the hill × slope × storm strength − what barriers catch. A raw cut on a steep slope is the worst case; a cut with silt fences and a settling pond catches most of it; a cut replanted as it goes stops being bare (NRCS, erosion from bare sloped land; US EPA names construction sediment a primary reef stressor).',
      "Reef health next year = this year's health + recovery if the water stays clear − mud − heat stress. Recovery only happens when mud is low; a heat wave on a muddy reef kills what a heat wave on a clear reef would only bleach (UNEP, 2017 brief on wastewater and reefs).",
      'Fish, divers and wave protection follow reef health. More than 80 per cent of ocean pollution starts on land (UNEP).',
    ],
    coefficients: [
      ['Storm strength: normal / big storm (year 4)', `${COEF.storm} / ${COEF.bigStorm}`, 'illustrative'],
      ['Share of mud silt fences catch', COEF.fences, 'direction: NRCS'],
      ['Share of the rest a settling pond catches', COEF.pond, 'direction: NRCS'],
      ['Year-1 mud with a wet-season pause', `×${COEF.pause}`, 'illustrative'],
      ['Street runoff through a planted basin', `×${COEF.basin}`, 'direction: UNEP'],
      ['Reef lost per unit of mud', COEF.mudHarm, 'direction: US EPA'],
      ['Reef regained in a clear-water year', COEF.recovery, 'direction: UNEP'],
      ['Heat wave on muddy / clear water', `−${COEF.heatKill} / −${COEF.heatBleach}`, 'direction: UNEP'],
    ],
    sources: [{ label: 'US EPA — Threats to Coral Reefs', href: 'https://www.epa.gov/coral-reefs/threats-coral-reefs' }],
  },

  card: {
    title: { good: 'The road went in and the reef came back', bad: 'The road went in and the bay went brown' },
    fact: 'More than 80 per cent of ocean pollution starts on land (UNEP). A raw cut on a steep slope is the worst case; a cut with silt fences and a settling pond catches most of it; a cut replanted as it goes stops being bare. Coral stressed by mud and pollution dies more in a heat wave and recovers slower (UNEP).',
    source: 'UNEP · USDA NRCS · US EPA, Threats to Coral Reefs',
    actionLabel: 'Learn what reaches the reef — and help keep it on the land',
    actions: [
      { label: 'US EPA — Threats to Coral Reefs', href: 'https://www.epa.gov/coral-reefs/threats-coral-reefs' },
      { label: 'UOG Sea Grant — watershed plantings', href: 'https://seagrant.uog.edu/' },
      { label: 'NOAA Coral Reef Conservation Program', href: 'https://coralreef.noaa.gov/' },
    ],
  },
};
