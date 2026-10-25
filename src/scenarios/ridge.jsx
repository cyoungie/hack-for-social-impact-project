import { Mark } from './stageKit.jsx';
import RiverScene from './scenes/RiverScene.jsx';
import YearStrip from './typhoon/YearStrip.jsx';
import VillageMap from './typhoon/VillageMap.jsx';
import { runRule } from './typhoon/rule.js';
import { LayerMap, COVER, COVER_NOTE } from '../components/LayerMap.jsx';

// The four stops follow the four priorities of UNDRR's Sendai Framework; they appear on source cards, not in dialogue.
// Sendai has four priorities: (1) understanding disaster risk; (2) strengthening disaster risk governance;
// (3) investing in disaster risk reduction for resilience; (4) enhancing preparedness for effective response
// and to "Build Back Better" in recovery. Score types fold into the four bars (Readiness, Community -> PEOPLE; Ecological -> VEG).
const UNDRR = 'https://www.undrr.org/';
// Used by the knowledge card (unchanged).
const FLOOD_LINKS = [
  { label: 'FEMA Flood Map Service Center', href: 'https://msc.fema.gov/portal/home' },
  { label: 'ESA WorldCover land-cover viewer', href: 'https://viewer.esa-worldcover.org/worldcover/' },
  { label: 'UN Office for Disaster Risk Reduction (UNDRR)', href: 'https://www.undrr.org/' },
];
const sendai = (text) => ({ source: 'UNDRR, Sendai Framework', text, href: UNDRR });

const planOf = (done) => new Set(done.fund?.state.plan || []);
const extrasOf = (done, flags) => ({ debris: done.debris?.state || null, vote: done.board?.state.vote || null, flags });

function Finale({ done, flags }) {
  const plan = planOf(done);
  const extras = extrasOf(done, flags);
  return <YearStrip title="The whole recovery · your budget, the debris, and the rebuild" result={runRule(plan, extras)} plan={plan} vote={extras.vote} />;
}

function Baseline() {
  return (
    <LayerMap
      layers={[
        { id: 'landcover', label: 'Land cover', note: `Ridge forest and savanna, a strip of riverbank trees, houses and road, the reef flat. ${COVER_NOTE}` },
        { id: 'slope', label: 'Slope', note: 'Flat by the river, moderate along the road, steep on the ridge.' },
        { id: 'flood', label: 'Last storm', note: 'The water line from Tuesday night.' },
      ]}
      legend={[
        { color: COVER.trees, label: 'Ridge forest, riverbank trees' },
        { color: COVER.grass, label: 'Savanna' },
        { color: COVER.built, label: 'Houses and road' },
        { color: COVER.water, label: 'River and bay' },
        { color: 'color-mix(in srgb, var(--people) 55%, var(--danger))', label: 'Reef flat' },
      ]}
      render={(on) => <VillageMap layers={on} label="Baseline map of the village" />}
    />
  );
}

// Scenario 2 (Help a Parent): After the Typhoon
export default {
  id: 'ridge',
  plate: 'RIVER · AFTER THE TYPHOON',
  persona: { name: 'Nina', role: 'Parent of two, river-mouth village' },
  closing: 'Two storms in five years, and we’re still here. Thanks for sitting with me on this.',
  sequential: true,

  Baseline,
  baselineTitle: 'The village at the river mouth',
  Finale,
  finaleTitle: 'The whole recovery, together',

  Scene: RiverScene,
  sceneState(done, outcome, flags) {
    const plan = done.fund ? planOf(done) : null;
    let bay = 'brown';
    if (outcome) {
      const reef = runRule(planOf(done), extrasOf(done, flags)).frames[4].reef;
      bay = reef >= 0.7 ? 'blue' : reef >= 0.5 ? 'murky' : 'brown';
    }
    return {
      plan,
      debris: done.debris?.state || null,
      vote: done.board?.state.vote || null,
      mapped: done.flood?.state.tags || null,
      bay,
      rebuilt: Boolean(outcome),
    };
  },

  hotspots: [
    {
      id: 'flood',
      label: '2.1 · Who’s at risk',
      icon: 'waves',
      x: 24,
      y: 46,
      box: { x: 18.5, y: 38, w: 16, h: 19 },
      kind: 'riskmap',
      prompt: 'The water came up to here on Tuesday. Help Nina work out which houses are actually at risk.',
      say: { correct: 'So it’s not just our side of the street.', ok: 'Those two houses didn’t flood, so I thought they were fine.', wrong: 'I’d have guessed the same houses.' },
      config: {
        all: {
          points: { people: 15 },
          feedback:
            'That’s the map the village was missing. Knowing where the water goes, and who’s in the way, is the first step in UNDRR’s Sendai Framework: understanding the risk.',
        },
        some: {
          points: { people: 5 },
          feedback: 'Close. Two of those houses stayed dry this time, but they’re inside the band for a stronger storm. Planning for the last storm isn’t enough.',
        },
        most: { points: { people: -5 }, feedback: 'Not quite. Flooding follows the low ground, not which houses look solid.' },
        source: {
          source: 'FEMA Flood Map Service Center · UNDRR, Sendai Framework',
          text: 'Sendai priority 1: understanding disaster risk. Flood maps show where water goes in a bigger storm.',
          links: [
            { label: 'FEMA Flood Map Service Center', href: 'https://msc.fema.gov/portal/home' },
            { label: 'Guam 2024 Hazard Mitigation Plan (flood hazard maps)', href: 'https://ghs.guam.gov/sites/default/files/guam_2024_hmp_20240711_ms_updated_maps.pdf' },
          ],
        },
      },
    },
    {
      id: 'fund',
      label: '2.2 · Recovery budget',
      icon: 'coin',
      x: 55,
      y: 48,
      box: { x: 37, y: 38, w: 37.5, h: 23 },
      kind: 'fund',
      prompt: 'The village has a fixed amount of recovery money. Help Nina decide what she’ll argue for on Saturday.',
      say: { correct: 'Okay. I can say that out loud on Saturday.', ok: 'Okay. I can say that out loud on Saturday.', wrong: 'Okay. I can say that out loud on Saturday.' },
      source: sendai('Sendai priority 3: investing in disaster risk reduction for resilience. A healthy reef breaks most of the wave energy before it reaches shore (Ferrario et al., 2014, Nature Communications).'),
      configFor: (done, flags) => ({ flags }),
    },
    {
      id: 'debris',
      label: '2.3 · Debris pile',
      icon: 'tank',
      x: 73,
      y: 65,
      box: { x: 68.5, y: 60, w: 10.5, h: 10.5 },
      labelBelow: true,
      kind: 'choice',
      prompt: 'Every household has storm debris to get rid of this week. A few neighbours want to burn the pile tonight. What do you suggest?',
      say: { correct: 'The farms up the hill will take it. I’ll ask around.', ok: 'It costs money, but it’s gone.', wrong: 'Gone by morning, sure.' },
      source: sendai('Sendai priority 4: enhancing disaster preparedness for effective response.'),
      config: {
        options: [
          {
            id: 'burn',
            label: 'Burn it on the riverbank',
            points: { veg: -5, people: -5 },
            feedback: 'Gone by morning. But the riverbank is bare where the fire was, and the ash washes into the bay with the next rain.',
          },
          { id: 'dump', ok: true, label: 'Haul it to the landfill', points: {}, feedback: 'A week of trucks and a tipping fee. It works, it just costs money.' },
          {
            id: 'chip',
            correct: true,
            label: 'Chip the wood for mulch and give it to farms',
            points: { veg: 5, people: 5 },
            feedback: 'Two days with a rented chipper. Farms upslope spread it on their fields, which means less bare ground and less mud coming down this wet season.',
          },
        ],
      },
    },
    {
      id: 'board',
      label: '2.4 · The rebuild meeting',
      icon: 'board',
      x: 79,
      y: 50,
      box: { x: 75.5, y: 41, w: 8, h: 16 },
      kind: 'meeting',
      prompt:
        'Saturday’s meeting is run by the village mayor and the island’s disaster recovery office. They’ll explain the rebuilding grants and take public comment. Nina asks whether you think she should go.',
      say: { correct: 'I didn’t think they’d actually change the grants.', ok: 'I wish I’d said something.', wrong: 'So we’re back where the water was.' },
      source: sendai('Sendai priority 4 includes “Build Back Better” in recovery, rehabilitation and reconstruction.'),
      config: {
        speakOut: {
          points: { people: 25, veg: 5 },
          feedback:
            'Enough people said the same thing that the recovery office changed the grant terms: families in the flood band can rebuild raised or on the school lot, and the old slabs by the river get replanted. UNDRR calls this building back better.',
        },
        listen: { points: { people: 10 }, feedback: 'You were there, and the vote was close. Without public comment, most of the grants went to same-spot rebuilds.' },
        skip: { points: { people: -15 }, feedback: 'Most houses were rebuilt on the same slabs, because that’s what the standard grant paid for.' },
      },
    },
  ],

  overlays(done) {
    const right = done.flood?.state.right;
    return (
      <>
        {right !== undefined && (
          <Mark x={2} y={62} icon="waves" tone={right === 8 ? 'veg' : 'warning'}>
            Risk map: {right} of 8 houses right
          </Mark>
        )}
        {done.fund && (
          <Mark x={34} y={3} icon="coin" tone="plain">
            Budget: {done.fund.state.plan.length} {done.fund.state.plan.length === 1 ? 'project' : 'projects'}
          </Mark>
        )}
        {done.debris && (
          <Mark x={62} y={73} icon="tank" tone={{ burn: 'danger', dump: 'plain', chip: 'veg' }[done.debris.state]}>
            {{ burn: 'Burned on the riverbank', dump: 'Hauled to the landfill', chip: 'Chipped for farm mulch' }[done.debris.state]}
          </Mark>
        )}
      </>
    );
  },

  outcome: (points) => ((points.people || 0) >= 25 ? 'good' : 'bad'),
  consequence: {
    good: {
      headline: 'Ready before the next storm.',
      swap: {},
      marks: [
        { x: 2, y: 30, icon: 'home', tone: 'veg', text: 'Rebuilt out of harm’s way' },
        { x: 60, y: 86, icon: 'coral', tone: 'veg', text: 'The bay over five years' },
      ],
    },
    bad: {
      headline: 'Rebuilt on the same slabs.',
      swap: {},
      marks: [
        { x: 2, y: 30, icon: 'home', tone: 'danger', text: 'Back in the water’s path' },
        { x: 60, y: 86, icon: 'coral', tone: 'danger', text: 'The bay over five years' },
      ],
    },
  },

  card: {
    title: { good: 'Ready before the next storm', bad: 'Rebuilt on the same slabs' },
    fact: "The four steps here follow the four priorities of the UN Office for Disaster Risk Reduction's Sendai Framework, in order: understand the risk, invest in reducing it, be ready to respond, and build back better. A living reef cuts wave energy reaching the shore by most of its strength (Ferrario et al., 2014, Nature Communications, report a 97% average reduction); a planted bank slows and spreads the water; concrete banks and a dredged channel move water faster and push the flood downstream.",
    source: 'UNDRR Sendai Framework · Ferrario et al., 2014, Nature Communications · ESA WorldCover 2021 · NRCS · NPS, Fire and Guam',
    actionLabel: 'Explore flood maps and get storm-ready',
    actions: [
      ...FLOOD_LINKS,
      { label: 'Ferrario et al., 2014 — coral reefs and coastal hazards', href: 'https://doi.org/10.1038/ncomms4794' },
      { label: 'Guam Homeland Security · Office of Civil Defense', href: 'https://ghs.guam.gov/' },
    ],
  },
};
