import { Mark } from './stageKit.jsx';
import RiverScene from './scenes/RiverScene.jsx';
import YearStrip from './typhoon/YearStrip.jsx';
import { COEF, runRule } from './typhoon/rule.js';

// Score types from the scenario script fold into the four bars: Readiness and Community -> PEOPLE, Ecological -> VEG.
const FLOOD_LINKS = [
  { label: 'FEMA Flood Map Service Center', href: 'https://msc.fema.gov/portal/home' },
  { label: 'ESA WorldCover land-cover viewer', href: 'https://viewer.esa-worldcover.org/worldcover/' },
  { label: 'UN Office for Disaster Risk Reduction (UNDRR)', href: 'https://www.undrr.org/' },
];

const planOf = (done) => new Set(done.fund?.state.plan || []);
const extrasOf = (done) => ({ debris: done.debris?.state || null, vote: done.board?.state.vote || null });

function Finale({ done }) {
  const plan = planOf(done);
  const extras = extrasOf(done);
  return <YearStrip title="The whole recovery · your plan, the debris, and the vote" result={runRule(plan, extras)} plan={plan} vote={extras.vote} />;
}

// Scenario #2 (Help a Civilian): Typhoon. The four stops follow the four priorities of UNDRR's Sendai Framework, in order.
export default {
  id: 'ridge',
  plate: 'TYPHOON · RIVER · 2 OF 5',
  persona: { name: 'Nina', role: 'Mother of two, river-mouth village' },
  closing: 'Two storms in five years, but we have only become more resilient. Thank you.',
  sequential: true,

  Scene: RiverScene,
  sceneState(done, outcome) {
    const plan = done.fund ? planOf(done) : null;
    let bay = 'brown';
    if (outcome) {
      const reef = runRule(planOf(done), extrasOf(done)).frames[4].reef;
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
      label: '1 · Flood line',
      icon: 'waves',
      x: 24,
      y: 46,
      box: { x: 18.5, y: 38, w: 16, h: 19 },
      kind: 'riskmap',
      prompt: 'The water came up to here. Help Nina work out which houses are actually at risk.',
      config: {
        all: {
          points: { people: 15 },
          feedback:
            "That's the map the village didn't have. Knowing exactly where the water goes, and who's in its way, is the first priority in UNDRR's Sendai Framework: understanding disaster risk.",
        },
        some: {
          points: { people: 5 },
          feedback:
            "Close. Two of those houses are safe from the last storm but not the next one. UNDRR's first priority is understanding the risk, and that means planning for the bigger storm, not the last one.",
        },
        most: {
          points: { people: -5 },
          feedback:
            "Not quite. The water doesn't care how a house looks; it follows the low ground. UNDRR puts understanding the risk first for a reason.",
        },
        links: FLOOD_LINKS,
      },
    },
    {
      id: 'fund',
      label: '2 · Poles + bridge',
      icon: 'coin',
      x: 55,
      y: 48,
      box: { x: 37, y: 38, w: 37.5, h: 23 },
      kind: 'fund',
      prompt: 'The village has a small repair fund. Help Nina decide what to spend it on before the next storm.',
      config: {},
    },
    {
      id: 'debris',
      label: '3 · Debris pile',
      icon: 'tank',
      x: 73,
      y: 65,
      box: { x: 68.5, y: 60, w: 10.5, h: 10.5 },
      labelBelow: true,
      kind: 'choice',
      prompt:
        'The whole village has storm debris to get rid of this week. Some villagers propose to burn the pile tonight. What do you recommend?',
      config: {
        options: [
          {
            id: 'burn',
            label: 'Burn it on the riverbank',
            points: { veg: -5, people: -5 },
            feedback:
              'Done by morning. The riverbank is bare where the fire was, which raises bare ground in the rule for a year, and the ash goes into the bay with the next rain.',
          },
          {
            id: 'dump',
            ok: true,
            label: 'Haul it to the dump',
            points: {},
            feedback: 'A week of trucks and a tipping fee. Nothing changes in the rule.',
          },
          {
            id: 'chip',
            correct: true,
            label: 'Chip the wood for mulch and give it to the farms',
            points: { veg: 5, people: 5 },
            feedback:
              'Two days with a rented chipper. The farms upslope cover their fields with it, which lowers bare ground above the village for the wet season.',
          },
        ],
      },
    },
    {
      id: 'board',
      label: '4 · Notice board',
      icon: 'board',
      x: 79,
      y: 50,
      box: { x: 75.5, y: 41, w: 8, h: 16 },
      kind: 'meeting',
      prompt: "The rebuild meeting is Saturday morning. Nina's kids say it's boring and the elders decide anyway. Do you go?",
      config: {
        speakOut: {
          points: { people: 25, veg: 5 },
          feedback:
            "That's the vote that changes the street, and the rule: five slabs by the river become bank. Raising or moving what was in harm's way, decided by the people who'll live in it, is what UNDRR calls Build Back Better.",
        },
        listen: { points: { people: 10 }, feedback: 'You were in the room and the vote was close.' },
        skip: {
          points: { people: -15 },
          feedback: "The elders rebuilt on the same slabs, because that's what the loan offered.",
        },
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
            Funded: {done.fund.state.plan.length} {done.fund.state.plan.length === 1 ? 'approach' : 'approaches'}
          </Mark>
        )}
        {done.debris && (
          <Mark x={62} y={73} icon="tank" tone={{ burn: 'danger', dump: 'plain', chip: 'veg' }[done.debris.state]}>
            {{ burn: 'Burned on the riverbank', dump: 'Hauled to the dump', chip: 'Chipped for farm mulch' }[done.debris.state]}
          </Mark>
        )}
      </>
    );
  },

  // Shown once when the consequence frame opens: the five years replayed with the debris choice and the vote.
  Finale,

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

  // The documented rule, openable any time.
  ruleCard: {
    title: 'The rule',
    intro: 'Illustrative, not a forecast; the point is direction and relative size.',
    lines: [
      'Flood depth at the low houses = storm surge − reef buffer − bank vegetation + channel hardening. A living reef cuts wave energy reaching the shore by most of its strength (Ferrario et al., 2014, Nature Communications, report a 97% average reduction); a planted bank slows and spreads the water; concrete banks and a dredged channel move water faster and push the flood downstream, and dredge spoil dumped on the reef flat lowers the reef buffer.',
      'Mud reaching the bay = bare ground above the village × slope × storm strength. Bare ridge (burned or cleared) and cleared yards raise it; forest and planted strips lower it (NRCS, erosion from bare sloped land; NPS, Fire and Guam). More mud means a weaker reef next year, which feeds back into the first line.',
      'Days without power and road = set by the bridge and the lines, and unaffected by the environment lines above.',
      'Each term is one number per map tile; the engine sums them.',
    ],
    coefficients: [
      ['Storm surge (years 2 and 4)', COEF.surge, 'illustrative'],
      ['Reef buffer weight × reef health', COEF.reefBuffer, 'direction: Ferrario et al., 2014'],
      ['Bank vegetation weight', COEF.bankVeg, 'illustrative'],
      ['Channel hardening at this street', `−${COEF.hardeningHere}`, 'illustrative'],
      ['Channel hardening downstream', `+${COEF.hardeningDownstream}`, 'illustrative'],
      ['Dredged mouth, first storm only', `−${COEF.dredgeOnce}`, 'illustrative'],
      ['Reef lost per unit of mud', COEF.mudToReef, 'direction: NRCS; NPS, Fire and Guam'],
      ['Reef regained per calm year', COEF.reefRecovery, 'illustrative'],
    ],
    sources: [{ label: 'Ferrario et al., 2014, Nature Communications', href: 'https://doi.org/10.1038/ncomms4794' }],
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
