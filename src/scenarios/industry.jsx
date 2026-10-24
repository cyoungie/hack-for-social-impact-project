import { Mark } from './stageKit.jsx';

// Scenario #5 (Help a Townsperson): Military & Industrial Land Development.
// Tone: the buildup isn't a villain to defeat — it's a force the town can't veto but CAN shape.
export default {
  id: 'industry',
  plate: 'LAND DEVELOPMENT · 5 OF 5',
  persona: { name: 'Marcus', age: 24, role: 'Works at the corner store', color: 'var(--people)' },
  intro:
    "Hey — you're the planner, right? Is your water tasting and looking funny too? Ours has been off for two weeks, right since they started clearing that parcel uphill. My uncle says there's nothing a town can do when the project's this big. I think he's wrong, but I don't actually know what the moves are. Do you?",
  introCta: "Let's find out",
  closing:
    "So the town can't say no — but it can make them measure, and make them build it right, on the record. That's not nothing. That might be everything.",

  blocks: [
    { tone: 'land', x: 0, y: 0, w: 100, h: 60 },
    { tone: 'redsoil', x: 56, y: 0, w: 44, h: 38, label: 'Cleared parcel · crane' },
    { tone: 'fencebar', x: 56, y: 38, w: 44, h: 3, label: 'Fence line' },
    { tone: 'house', x: 4, y: 10, w: 26, h: 40, label: 'Corner store' },
    { tone: 'kiosk', x: 34, y: 20, w: 16, h: 30, label: 'Water testing' },
    { id: 'drain', tone: 'drainbar', x: 58, y: 58, w: 10, h: 4 },
    { tone: 'road', x: 0, y: 62, w: 100, h: 22, label: 'Ysengsong Road' },
    { tone: 'land', x: 0, y: 84, w: 100, h: 16 },
  ],

  hotspots: [
    {
      id: 'kiosk',
      label: 'Tap / water kiosk',
      icon: 'flask',
      x: 42,
      y: 36,
      kind: 'choice',
      prompt: 'First move when the water turns funny?',
      config: {
        options: [
          {
            id: 'test',
            correct: true,
            label: 'Get it tested and report it to Guam EPA, and tell the neighbors to do the same',
            points: { water: 5, people: 5 },
            feedback:
              "One weird tap is an anecdote. Twenty tested, dated reports from one street is data an agency has to answer. Guam EPA's drinking-water program exists to receive exactly this.",
          },
          {
            id: 'post',
            label: 'Post about it and wait',
            feedback:
              "A post gets sympathy, not a response. One weird tap is an anecdote; twenty tested, dated reports from one street is data an agency has to answer. Guam EPA's drinking-water program exists to receive exactly this.",
          },
          {
            id: 'bottled',
            label: 'Switch to bottled water and move on',
            feedback:
              "That protects one kitchen and leaves no record. Tested, dated reports from the whole street are data an agency has to answer — Guam EPA's drinking-water program exists to receive them.",
          },
        ],
      },
    },
    {
      id: 'drain',
      label: 'Storm drain',
      icon: 'drain',
      x: 63,
      y: 54,
      kind: 'choice',
      prompt: "The drain's been running cloudy since the clearing started. What's worth doing besides being mad?",
      config: {
        options: [
          {
            id: 'photo',
            correct: true,
            label: 'Photograph it — dated, with the street sign in frame — every day it runs',
            points: { soil: 4, people: 4 },
            feedback:
              "Construction projects operate under stormwater permits with sediment-control rules. A dated photo record of violations is enforceable; anger isn't. Same move that got Nina's typhoon claim paid — documentation is a civic weapon.",
          },
          {
            id: 'board',
            label: 'Throw a board over it',
            feedback:
              "Hiding the drain hides the evidence. Construction sites run under stormwater permits with sediment-control rules — a dated photo record of violations is enforceable; anger isn't.",
          },
          {
            id: 'nothing',
            label: "Nothing, it's on their side of the fence",
            feedback:
              "The runoff is on your side of the fence — that's the point. Stormwater permits carry sediment-control rules, and a dated photo record of violations is enforceable.",
          },
        ],
      },
    },
    {
      id: 'fence',
      label: 'Fence line',
      icon: 'fence',
      x: 78,
      y: 34,
      kind: 'choice',
      prompt: 'The project will happen. If the town could attach conditions, which matter most for the water?',
      config: {
        options: [
          {
            id: 'wells',
            label: 'Monitoring wells between the site and town, with public results',
            feedback:
              "Half of it. Monitoring wells make contamination visible early — but without protections written into the permit, nobody is required to act on what they show. Ask for both.",
          },
          {
            id: 'nicer',
            label: 'A nicer fence',
            feedback:
              'A fence changes the view, not the water. Monitoring wells make contamination visible early, and permit conditions make protections enforceable.',
          },
          {
            id: 'permit',
            label: 'Groundwater and runoff protections written into the permit — buffers, sediment basins, sewer not septic',
            feedback:
              "Half of it. Written protections are enforceable — but without monitoring wells, nobody sees a problem until it's in the tap. Ask for both.",
          },
          {
            id: 'both',
            correct: true,
            label: 'Both the monitoring wells AND the written protections',
            points: { water: 8 },
            feedback:
              "Mitigation beats protest-only when you can't stop the project: monitoring wells make contamination visible early, and permit conditions make protections enforceable. Guam's own leaders have pushed DoD on exactly these terms for the wells near Camp Blaz.",
          },
        ],
      },
    },
    {
      id: 'board',
      label: 'Notice board',
      icon: 'board',
      x: 16,
      y: 54,
      kind: 'compose',
      prompt:
        "The Environmental Impact Statement comment window closes Friday. Build the town's comment — pick the THREE lines that belong in it.",
      config: {
        need: 3,
        perGood: 5,
        boxLabel: "The town's comment",
        lines: [
          {
            id: 'l4',
            text: 'This project is an insult and everyone involved should be ashamed.',
            note: "Venting isn't a substantive comment — the agency doesn't have to respond to it.",
          },
          {
            id: 'l1',
            good: true,
            text: 'Attached are 23 dated water-quality reports from Ysengsong Road since clearing began.',
          },
          {
            id: 'l5',
            text: 'Everyone knows the water is poison now.',
            note: 'A claim without data. The attached reports already make this point — provably.',
          },
          {
            id: 'l2',
            good: true,
            text: 'We request monitoring wells between the parcel and the village wells, with quarterly public results.',
          },
          {
            id: 'l6',
            text: 'We oppose everything until further notice.',
            note: 'A blanket objection asks for nothing that can be written into a permit.',
          },
          {
            id: 'l3',
            good: true,
            text: 'We request the permit require sewer connection, sediment basins, and a vegetated buffer on the downhill edge.',
          },
        ],
        feedback:
          'Agencies must respond to substantive comments — specific, evidence-backed, actionable. That’s the entire trick: say what you can prove and ask for what can be written into a permit. Three sentences from a 24-year-old can end up as a condition on a federal project. That is what participation means.',
      },
    },
  ],

  overlays(done) {
    return (
      <>
        {done.kiosk && (
          <Mark x={30} y={70} icon="pin" tone={done.kiosk.state === 'test' ? 'veg' : 'plain'}>
            {done.kiosk.state === 'test' ? '23 reports on this street' : '1 report'}
          </Mark>
        )}
        {done.drain?.state === 'photo' && (
          <Mark x={44} y={90} icon="camera" tone="veg">
            Photo log · day 1 · 2 · 3 · 4 · 5
          </Mark>
        )}
        {done.fence && (
          <Mark x={62} y={44} icon="fence" tone={done.fence.state === 'both' ? 'veg' : 'warning'}>
            {done.fence.state === 'both' ? 'Monitoring wells + permit protections' : 'Conditions incomplete'}
          </Mark>
        )}
        {done.board && (
          <Mark x={4} y={4} icon="board" tone="veg">
            Received · Conditions: monitoring wells; sewer connection required
          </Mark>
        )}
      </>
    );
  },

  outcome: (points) => ((points.water || 0) + (points.soil || 0) + (points.people || 0) >= 28 ? 'good' : 'bad'),
  consequence: {
    good: {
      headline: 'The permit came back with conditions.',
      swap: { drain: 'drainbar-clear' },
      marks: [
        { x: 60, y: 44, icon: 'fence', tone: 'veg', text: 'Monitoring wells along the fence' },
        { x: 56, y: 66, icon: 'drain', tone: 'veg', text: 'Drain running clear' },
        { x: 32, y: 52, icon: 'flask', tone: 'veg', text: 'Kiosk results: non-detect' },
      ],
    },
    bad: {
      headline: 'The comment window closed on a quiet town.',
      swap: {},
      marks: [
        { x: 56, y: 66, icon: 'drain', tone: 'danger', text: 'Drain still cloudy' },
        { x: 6, y: 52, icon: 'tank', tone: 'danger', text: 'Bottled-water pallet at the store' },
        { x: 4, y: 4, icon: 'board', tone: 'danger', text: 'Comment window: closed' },
      ],
    },
  },

  card: {
    title: { good: 'The town got it in writing', bad: 'The window closed on a quiet town' },
    fact: 'Large federal projects go through an Environmental Impact Statement under NEPA, and agencies must respond to substantive public comments — specific, evidence-backed, and actionable. Dated water tests reported to Guam EPA and photo logs of stormwater violations turn a town’s worry into a record an agency has to answer.',
    source: 'Guam EPA · NEPA public-comment process · Pacific Island Times reporting on DoD projects and Guam’s drinking water',
    actionLabel: 'Find the comment windows open on Guam projects right now',
    actions: [
      { label: 'Regulations.gov — open comment windows', href: 'https://www.regulations.gov/' },
      { label: 'Guam EPA', href: 'https://epa.guam.gov/' },
      { label: 'Pacific Island Times', href: 'https://www.pacificislandtimes.com/' },
    ],
    // The player's own comment from the notice board, offered as a template letter.
    letter: (done, playerName) =>
      done.board
        ? `To the agency reviewing this Environmental Impact Statement:\n\n${done.board.state.lines.join('\n\n')}\n\n— ${playerName}, for the residents of Ysengsong Road`
        : null,
  },
};
