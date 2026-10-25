import { Mark } from './stageKit.jsx';
import CoastScene from './scenes/CoastScene.jsx';
import ReefMap from './reef/ReefMap.jsx';
import { LayerMap, COVER, COVER_NOTE } from '../components/LayerMap.jsx';

const EPA_REEFS = 'https://www.epa.gov/coral-reefs/threats-coral-reefs';
const NOAA_LAND = 'https://www.noaa.gov/gc-international-section/land-based-sources-of-marine-pollution';

// Reef at the end of the plan Tom kept.
const finalReef = (done) => done.road?.state.finalReef;

// Where the outlook starts: the coral count sets the reef's health; Rosa's fertilizer runoff (farm_runoff)
// leaves it worse; Nina's replanted riverbank (bank_planted) means less river mud reaches the bay.
function startOf(done, flags) {
  const c = done.coral?.state;
  const share = c ? c.counted / c.healthy : 1;
  return { reef: 0.45 + 0.15 * share - (flags.farm_runoff ? 0.1 : 0), riverMud: flags.bank_planted ? 0.85 : 1 };
}

function Baseline({ flags }) {
  const brownDays = flags.bank_planted ? 11 : 14;
  return (
    <div className="prim">
      <LayerMap
        layers={[
          { id: 'landcover', label: 'Land cover', note: `Forest on the upper slope, the village, the reef flat and coral at the point. ${COVER_NOTE}` },
          { id: 'slope', label: 'Slope', note: 'Steep on the upper slope, gentle by the village.' },
        ]}
        legend={[
          { color: COVER.trees, label: 'Forest' },
          { color: COVER.grass, label: 'Grass and scrub' },
          { color: COVER.built, label: 'Village' },
          { color: COVER.bare, label: 'Road cut' },
          { color: COVER.water, label: 'Bay' },
        ]}
        render={(on) => <ReefMap firstCut layers={on} label="Baseline map of the bay and the hill" />}
      />
      <div className="divelog">
        <p className="label">Dive shop log · last wet season</p>
        <p>
          {brownDays} brown-water days{flags.farm_runoff ? ', and one green algae day' : ''}.
        </p>
        {flags.bank_planted && <p className="caption">Less river mud has been reaching the bay since the riverbank upstream was replanted.</p>}
        {flags.farm_runoff && <p className="caption">Fertilizer runoff from the farms upslope left the reef in worse shape.</p>}
      </div>
    </div>
  );
}

// Scenario 3 (Help a Fisherman): The Road and the Reef
export default {
  id: 'coast',
  plate: 'COAST · THE ROAD AND THE REEF',
  persona: { name: 'Tom', role: 'Fishes the bay' },
  // The script has one closing line; on a bad ending Tom doesn't claim the fish are back.
  closing: {
    good: 'The road’s in, and I’m seeing fish at the point again. Thanks for helping me make the case.',
    bad: 'The road’s in. Thanks for helping me make the case.',
  },

  Baseline,
  baselineTitle: 'The bay and the hill',

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
      label: '3.1 · The coral',
      icon: 'coral',
      x: 87,
      y: 87,
      box: { x: 78.5, y: 82, w: 17.5, h: 11 },
      kind: 'coralcount',
      prompt: 'Coral count: tap only the healthy corals in 20 seconds.',
      say: { correct: 'More of it’s alive than I thought.', ok: 'There’s still some colour out there.', wrong: 'Hard to tell what’s alive from up here.' },
      source: { source: 'UNEP', text: 'Coral stressed by mud and pollution is more likely to die in a heat wave and recovers more slowly.', pending: 'Link: team to confirm the UNEP source.' },
      config: {
        seconds: 20,
        feedback:
          'Bleached coral isn’t dead yet. It can recover if the water stays clear. Coral that’s also dealing with mud and pollution is more likely to die in the next heat wave, and recovers more slowly (UNEP).',
      },
    },
    {
      id: 'road',
      label: '3.2 · The road',
      icon: 'tractor',
      x: 45,
      y: 35,
      box: { x: 27.8, y: 17, w: 34.7, h: 28 },
      kind: 'roadplan',
      prompt: 'The road is going in either way. Help Tom work out what to ask the foreman for.',
      say: { correct: 'That I can take to the foreman.', ok: 'It’s better than what they were doing.', wrong: 'That’s the road they were already building.' },
      source: {
        source: 'US EPA · USDA NRCS',
        text: 'EPA names sediment from coastal development and runoff a primary stressor for coral reefs. NRCS documents silt fences, sediment basins and replanting as standard erosion controls.',
        href: EPA_REEFS,
      },
      configFor: (done, flags) => ({ start: startOf(done, flags) }),
    },
    {
      id: 'drain',
      label: '3.3 · Storm drain',
      icon: 'drain',
      x: 63,
      y: 64,
      box: { x: 59.8, y: 59, w: 7, h: 12 },
      labelBelow: true,
      kind: 'choice',
      prompt: 'When it rains hard, this drain carries everything off the street straight onto the reef. What should the village ask the public works department for?',
      say: { correct: 'Public works might actually go for that.', ok: 'Out of sight isn’t gone, I guess.', wrong: 'Same as every other storm, then.' },
      source: { source: 'UN, via NOAA', text: 'The UN estimates that up to about 80% of ocean pollution starts on land.', href: NOAA_LAND },
      config: {
        options: [
          { id: 'basin', correct: true, label: 'Route it through a planted basin first', points: { veg: 10 }, feedback: 'The basin slows the water down and lets the mud and oil settle out before it reaches the beach.' },
          { id: 'pipe', label: 'Extend the pipe farther out to sea', points: {}, feedback: 'The beach looks cleaner, but the same mud and oil now land on the reef a bit farther out.' },
          { id: 'leave', label: 'Leave it as it is', points: { veg: -3 }, feedback: 'Every storm keeps sending the street into the bay.' },
        ],
      },
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
          <Mark x={40} y={64} icon="drain" tone={{ basin: 'veg', pipe: 'plain', leave: 'danger' }[done.drain.state]}>
            {{ basin: 'Green basin before the beach', pipe: 'Pipe extended out to sea', leave: 'Drain as before' }[done.drain.state]}
          </Mark>
        )}
        {done.road && (
          <Mark x={2} y={6} icon="tractor" tone={done.road.state.finalReef >= 0.5 ? 'veg' : 'danger'}>
            Road plan for the foreman
          </Mark>
        )}
      </>
    );
  },

  outcome: (points, done) => ((finalReef(done) ?? 0) >= 0.5 ? 'good' : 'bad'),
  consequence: {
    good: {
      headline: 'Clear water after the storm.',
      swap: {},
      marks: [{ x: 70, y: 76, icon: 'coral', tone: 'veg', text: 'Fish at the point again' }],
    },
    bad: {
      headline: 'A brown bay and a closed dive shop.',
      swap: {},
      marks: [
        { x: 70, y: 76, icon: 'coral', tone: 'danger', text: 'A brown bay' },
        { x: 70, y: 48, icon: 'home', tone: 'danger', text: 'The dive shop has closed' },
      ],
    },
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
