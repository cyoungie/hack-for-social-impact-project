// Pre-written questions and replies for Scenario 5. Replies that state a fact use only checked sources:
//   US EPA, Andersen AFB Superfund profile · UOG Hydrologic Survey (PFAS) · US EPA, certified PFAS filters ·
//   GWA's yearly water quality report under the Safe Drinking Water Act.
// Everything else is in-character opinion or a promise, not a factual claim.

export const PEOPLE = [
  { id: 'friend', label: 'My best friend' },
  { id: 'mayor', label: 'The town mayor' },
  { id: 'teacher', label: 'My teacher' },
  { id: 'factory', label: 'The local factory manager' },
  { id: 'military', label: 'A U.S. military representative' },
  { id: 'nonprofit', label: 'A local nonprofit organizer' },
];

export const QA = {
  mayor: [
    {
      q: 'What is the town doing to test our water?',
      a: "Our water utility tests the water and publishes a yearly water quality report under the Safe Drinking Water Act. If your tap water looks or smells wrong, report it with the date and a photo — and I'll ask Guam EPA to sample our street.",
    },
    {
      q: 'Can we get a public meeting with the companies and the base?',
      a: "Yes. I'll put it on the agenda and invite them. Bring your photos and dates — specific reports get specific answers.",
    },
  ],
  factory: [
    {
      q: 'What happens to the fuel and oil at your plant?',
      a: "It's stored in tanks, and spills have to be reported. I'll bring our last inspection report to the next meeting so you can read it yourselves.",
    },
    {
      q: 'Will your company pay to test our water?',
      a: "I can't promise that tonight. I'll take it to our owners and answer you at the next meeting.",
    },
  ],
  military: [
    {
      q: 'Has fuel from the base reached our groundwater?',
      a: "At Andersen Air Force Base, US EPA lists fuels and solvents in the groundwater under its Superfund cleanup program, and says no drinking water wells sit in the contaminated areas. Firefighting-foam chemicals called PFAS have also been found in some Guam wells, and cleanup and treatment are ongoing. I'll bring the cleanup reports for this area next time.",
    },
    {
      q: 'Why does the base still need this land?',
      a: "That's decided above this office. What I can do is tell you when the public comment period opens on projects near town, and how to send a comment that gets a response.",
    },
  ],
  nonprofit: [
    {
      q: 'Do home water filters actually work?',
      a: 'Some do. US EPA says certified activated carbon, ion-exchange and reverse-osmosis filters can greatly reduce PFAS — look for NSF/ANSI 53 or 58 certification, and keep up the maintenance, because a filter only works if you change it.',
    },
    {
      q: 'How can neighbors help each other?',
      a: "Start a log: every household writes down the date, a photo, and what the water looked like. One complaint is easy to ignore. A street's worth of dated reports isn't.",
    },
  ],
  teacher: [
    {
      q: 'How can our class help?',
      a: 'Your class could map where people report problems and present it at the next meeting. Data from a whole neighborhood is hard to ignore.',
    },
  ],
  friend: [
    {
      q: 'Are you worried too?',
      a: "Yeah. But I'd rather stay and fix it than move away. Let's keep coming to these together.",
    },
  ],
  custom: [
    {
      q: 'What can you do to help us?',
      a: "Let me look into it, and I'll come back to the next meeting with something concrete.",
    },
  ],
};

// "Questions others have written" — shown at the town hall, answered by the mayor.
export const COMMUNITY_QUESTIONS = [
  {
    q: 'Who do I tell if my water turns black again?',
    a: 'Report it right away to the water utility and to Guam EPA, with the date and a photo, so it is on the record.',
  },
  {
    q: 'Will anyone check the stream behind the factories?',
    a: "I'll ask Guam EPA to look at it, and I'll read their answer out at the next meeting.",
  },
];

// Community filtration system: pick the parts of the plan.
export const FILTER_PARTS = [
  { id: 'carbon', label: 'Activated carbon filter', good: true },
  { id: 'ro', label: 'Reverse osmosis or ion exchange stage', good: true },
  { id: 'certified', label: 'Use filters certified to NSF/ANSI 53 or 58', good: true },
  { id: 'maintain', label: 'A schedule for changing filters', good: true },
  { id: 'nocert', label: 'Any filter, as long as it is cheap', good: false },
  { id: 'never', label: 'Install it once and leave it', good: false },
];
