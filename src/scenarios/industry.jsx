import TownScene from './scenes/TownScene.jsx';
import TownMap from './town/TownMap.jsx';
import { LayerMap, COVER, COVER_NOTE } from '../components/LayerMap.jsx';

// The town, the plant and the base are fictional ("the plant", "the base"). Real reference points
// (PFOS in Guam wells, the 2021 Red Hill fuel leak in Hawai'i) appear only on source and knowledge cards.
const WHO = 'https://www.who.int/publications/i/item/9789240045064';

// The utility's well-test record and the clinic's case counts for this fictional town.
const TESTS = [
  { label: '2024 · Q1', over: false },
  { label: '2024 · Q3', over: false },
  { label: '2025 · Q1', over: false },
  { label: '2025 · Q3', over: true },
  { label: '2026 · Q1', over: false },
  { label: '2026 · Q3', over: true },
];
const CASES = [2, 3, 2, 4, 6, 9];

function Baseline({ flags }) {
  return (
    <div className="prim">
      <LayerMap
        layers={[{ id: 'landcover', label: 'Land cover', note: `Forest on the hill, the plant and the base, the six streets, the harbor. ${COVER_NOTE}` }]}
        legend={[
          { color: COVER.trees, label: 'Forest on the hill' },
          { color: COVER.built, label: 'The plant, the base, houses' },
          { color: COVER.grass, label: 'Yards and lots' },
          { color: COVER.water, label: 'Aquifer and harbor' },
        ]}
        render={(on) => <TownMap on={on} label="Baseline map of the six streets and the hill" />}
      />
      <div className="divelog">
        <p className="label">The utility’s well tests, last three years</p>
        <ul className="tests">
          {TESTS.map((t) => (
            <li key={t.label} className={t.over ? 'is-over' : ''}>
              {t.label} · {t.over ? 'over the limit' : 'within the limit'}
            </li>
          ))}
        </ul>
        <p className="label">Clinic · stomach-ache cases from the six streets, last six months</p>
        <p>{CASES.join(' · ')}</p>
        {flags.sewer_connected && <p className="caption">The sewer now reaches more homes, so fewer septic tanks sit near the well: the hill is the most likely source.</p>}
      </div>
    </div>
  );
}

// Scenario 5 (Help a Shop Owner): Military and Industrial Land Development
export default {
  id: 'industry',
  plate: 'INDUSTRY & MILITARY · LAND DEVELOPMENT',
  persona: { name: 'Marco', role: 'Runs the corner shop' },
  closing:
    'The water’s being tested, my kids are drinking from the clinic’s station, and for the first time the whole town was in the same room as the people on the hill. Maybe we don’t have to move after all.',

  Baseline,
  baselineTitle: 'The six streets and the hill above them',

  Scene: TownScene,
  sceneState(done, outcome) {
    return {
      station: done.tap?.state === 'station',
      cluster: Boolean(done.clinic?.state.cluster),
      plan: done.effort?.state.plan || [],
      townhall: Boolean(done.townhall),
      posted: done.update?.state === 'ask',
      outcome,
    };
  },

  hotspots: [
    {
      id: 'tap',
      label: '5.1 · The tap',
      icon: 'faucet',
      x: 12,
      y: 56,
      box: { x: 4, y: 47, w: 16.4, h: 19 },
      labelBelow: true,
      kind: 'choice',
      prompt: 'Marco’s family lives on one of the six streets. What do you tell them to do with the tap water today?',
      say: { correct: 'Two jugs on the way home. Fine.', wrong: 'So we’ve been doing it wrong.' },
      source: {
        source: 'WHO Guidelines for Drinking-water Quality · CDC',
        text: 'When water may be contaminated, find out what is in it, tell people clearly and quickly, and provide safe water — such as bottled or trucked water — until it is fixed. Boiling does not make water containing fuel or other chemicals safe.',
        links: [
          { label: 'WHO drinking-water guidelines', href: WHO },
          { label: 'CDC — water emergencies', href: 'https://www.cdc.gov/water-emergency/about/index.html' },
        ],
      },
      config: {
        options: [
          {
            id: 'station',
            correct: true,
            label: 'Don’t drink it; use the clinic’s water station until the test results are posted',
            points: { people: 5 },
            feedback: 'Marco fills two jugs at the clinic on his way home. It’s a hassle, but nobody in the house is drinking from the tap until there’s a result.',
          },
          {
            id: 'boil',
            label: 'Boil it first',
            points: { people: -3 },
            // Script: "It can actually concentrate them" — checked sources confirm this for PFAS, not fuel.
            feedback: 'Boiling kills germs, but it doesn’t remove fuel or PFAS. It can actually concentrate PFAS as the water evaporates.',
          },
          {
            id: 'fine',
            label: 'The smell’s faded, it’s probably fine',
            points: { people: -5 },
            feedback: 'A fading smell doesn’t mean the water is clean. Many contaminants have no smell or taste at all.',
          },
        ],
      },
    },
    {
      id: 'clinic',
      label: '5.2 · The clinic',
      icon: 'flask',
      x: 41,
      y: 56,
      box: { x: 34, y: 49, w: 15, h: 17 },
      labelBelow: true,
      kind: 'cases',
      prompt: 'Map the Cases: drag each patient card to their street on the town map, in 30 seconds.',
      say: { correct: 'That’s the six streets. Right under the hill.', wrong: 'Hard to see a pattern like that.' },
      config: {
        seconds: 30,
        points: { people: 5 },
        feedback: 'Mapping cases by where and when they happen is how a water problem gets proven, and how families get taken seriously.',
      },
    },
    {
      id: 'effort',
      label: '5.3 · Where to put the effort',
      icon: 'people',
      x: 40,
      y: 76,
      box: { x: 4, y: 68, w: 66, h: 13 },
      labelBelow: true,
      kind: 'effort',
      prompt: 'Marco wants to know what the neighbourhood can actually do. Help him decide where to put their time and money this month.',
      say: { correct: 'Okay. That I can take to the neighbours.', ok: 'Okay. That I can take to the neighbours.', wrong: 'Okay. That I can take to the neighbours.' },
      source: {
        source: 'US EPA',
        text: 'Certified activated carbon, ion-exchange and reverse-osmosis filters can greatly reduce PFAS — look for NSF/ANSI 53 or 58 — but only if they are maintained.',
        href: 'https://www.epa.gov/water-research/identifying-drinking-water-filters-certified-reduce-pfas',
      },
      configFor: (done, flags) => ({ start: { hillSource: Boolean(flags.sewer_connected) } }),
    },
    {
      id: 'townhall',
      label: '5.4 · The town hall',
      icon: 'board',
      x: 70,
      y: 56,
      box: { x: 62, y: 47, w: 16.4, h: 19 },
      kind: 'townhall',
      // Only if the town hall was chosen in 5.3.
      when: (done) => Boolean(done.effort?.state.plan.includes('townhall')),
      prompt: 'Who do you want in the room?',
      say: { correct: 'Monthly results. In writing.', wrong: 'Well, at least people showed up.' },
      config: {
        results: {
          room: {
            points: { people: 15, water: 5 },
            feedback: 'The data was on the table and the people who could act on it were in the room. The meeting ends with a written agreement to post test results monthly.',
          },
          friends: { points: { people: 3 }, feedback: 'A full room, but nobody there could answer the questions. Next time, invite the people who hold the data.' },
          again: { points: { people: 3 }, feedback: 'The meeting ended with a plan to meet again.' },
        },
      },
    },
    {
      id: 'update',
      label: '5.5 · Community update',
      icon: 'board',
      x: 84,
      y: 58,
      box: { x: 79.5, y: 52, w: 8, h: 14 },
      labelBelow: true,
      kind: 'choice',
      prompt: 'The base has posted a ‘community update’ for next Thursday. Marco’s neighbours say nothing ever changes at these. Should he go?',
      say: { correct: 'I’ll pin it up myself.', ok: 'I heard it. I just don’t have it.', wrong: 'Maybe next time.' },
      source: {
        source: 'Hawaiʻi Department of Health · US EPA · UN SDG 6',
        text: 'After the 2021 Red Hill fuel leak in Hawaiʻi, the state health department required an independent assessment of the fuel facility and rejected one the Navy picked as not independent enough; US EPA now runs its own water sampling and posts results publicly. UN Goal 6 includes protecting aquifers and giving local communities a say in managing their water.',
        links: [
          { label: 'US EPA — Red Hill', href: 'https://www.epa.gov/red-hill' },
          { label: 'UN Sustainable Development Goal 6', href: 'https://sdgs.un.org/goals/goal6' },
        ],
      },
      config: {
        options: [
          { id: 'ask', correct: true, label: 'Go, and ask for the monitoring results in writing', points: { people: 10 }, feedback: 'He gets a copy, and by Monday it’s pinned to the notice board for the whole street to read.' },
          { id: 'listen', ok: true, label: 'Go and listen', points: { people: 3 }, feedback: 'He hears the presentation, but leaves without anything in writing.' },
          { id: 'skip', label: 'Skip it', points: { people: -5 }, feedback: 'The update goes ahead with a handful of people, and nobody from the six streets is there.' },
        ],
      },
    },
  ],

  overlays: () => null,

  outcome: (points) => ((points.people || 0) >= 15 ? 'good' : 'bad'),
  consequence: {
    good: { headline: 'The water’s being tested, and the town is in the room.', swap: {}, marks: [] },
    bad: { headline: 'The tap is still a question mark.', swap: {}, marks: [] },
  },

  card: {
    title: { good: 'A town that asks, records, and acts', bad: 'A town that asks, records, and acts' },
    fact: "Fuels, solvents and firefighting-foam chemicals (PFAS) from current and former military sites have been found in Guam groundwater. At Andersen Air Force Base, US EPA's Superfund cleanup lists fuels and solvents in the groundwater, and some wells in central Guam were taken offline because of PFOS. Cleanup and well treatment are ongoing.",
    source: 'US EPA, Andersen AFB Superfund profile · UOG Hydrologic Survey · US EPA, certified PFAS filters',
    actionLabel: 'Read the cleanup records, and know which filters work',
    actions: [
      { label: 'US EPA — Andersen Air Force Base cleanup', href: 'https://cumulis.epa.gov/supercpad/SiteProfiles/index.cfm?fuseaction=second.cleanup&id=0902825' },
      { label: 'UOG Hydrologic Survey — PFAS in Guam wells', href: 'https://guamhydrologicsurvey.uog.edu/2025/07/29/pfas/' },
      { label: 'US EPA — filters certified to reduce PFAS', href: 'https://www.epa.gov/water-research/identifying-drinking-water-filters-certified-reduce-pfas' },
      { label: 'Guam EPA', href: 'https://epa.guam.gov/' },
    ],
  },
};
