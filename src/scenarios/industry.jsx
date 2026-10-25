import TownScene from './scenes/TownScene.jsx';

// Scenario #5: Military & Industrial Land Development (rough draft from the team, built with pre-written replies).
// Score types fold in: social -> PEOPLE, environmental -> WATER.
export default {
  id: 'industry',
  plate: 'LAND DEVELOPMENT · 5 OF 5',
  persona: { name: 'Marcus', role: 'Neighbor, industrial side of town' },
  closing: "Maybe moving away isn't the only answer after all.",

  Scene: TownScene,
  sceneState(done, outcome) {
    return { path: done.act?.state.path || null, outcome };
  },

  hotspots: [
    {
      id: 'act',
      label: 'Factories + base',
      icon: 'fence',
      x: 50,
      y: 30,
      box: { x: 0, y: 8, w: 92, h: 36 },
      zoom: true,
      kind: 'town',
      prompt: 'Which of the following are ways in which the community could intervene here?',
      config: {
        decisionMakerBonus: { people: 5 },
        results: {
          townhall: {
            points: { people: 10, water: 5 },
            feedback: 'A town hall puts the people who can act in the same room as the people living with the water — and on the record.',
          },
          discuss: {
            points: { people: 10 },
            feedback: 'Asking directly, and writing down the answers, gives the town something to hold people to at the next meeting.',
          },
          filter: {
            points: { water: 10, people: 5 },
            feedback:
              'US EPA says certified activated carbon, ion-exchange and reverse-osmosis filters can greatly reduce PFAS — look for NSF/ANSI 53 or 58 certification — but only if they are maintained. Activated carbon, often with aeration, can remove fuel chemicals like benzene, but some fuel chemicals are harder to remove: the real fix is keeping fuel out of the ground.',
          },
        },
      },
    },
  ],

  overlays: () => null,

  outcome: () => 'good',
  consequence: {
    good: { headline: 'The town is working on it — together.', swap: {}, marks: [] },
    bad: { headline: 'The town is working on it — together.', swap: {}, marks: [] },
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
