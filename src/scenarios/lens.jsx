import { Mark, Trace } from './stageKit.jsx';
import { chlorideZone } from '../primitives/PumpDial.jsx';

const DAYS = [
  { id: 'mon', label: 'Mon' },
  { id: 'tue', label: 'Tue' },
  { id: 'wed', label: 'Wed', rain: true },
  { id: 'thu', label: 'Thu', rain: true },
  { id: 'fri', label: 'Fri' },
  { id: 'sat', label: 'Sat' },
  { id: 'sun', label: 'Sun' },
];

const SEPTIC_WHY =
  "This house sits on the limestone that refills the drinking-water lens. A failing septic system doesn't leak 'away' — down here, away is the aquifer. Where hookup exists, Guam Waterworks and Guam EPA push it for exactly this reason.";

// Scenario #4 (Help a Civilian): Fresh Water & Conservation
export default {
  id: 'lens',
  plate: 'FRESH WATER · NORTH VILLAGE · 4 OF 5',
  persona: { name: 'Auntie Rose', age: 46, role: "Nina's neighbor, Dededo" },
  closing:
    "So it's the dial, the drips, and what we bury in the yard. We can do all three. Tell Nina the water tastes like water again.",

  blocks: [
    { tone: 'land', x: 0, y: 0, w: 100, h: 88 },
    { tone: 'house', x: 6, y: 8, w: 36, h: 50, label: "Rose's house" },
    { tone: 'window', x: 16, y: 22, w: 16, h: 14, label: 'Kitchen' },
    { tone: 'line', x: 48, y: 16, w: 20, h: 2, label: 'Laundry line' },
    { tone: 'shed', x: 74, y: 10, w: 20, h: 30, label: 'Pump shed' },
    { id: 'lawn', tone: 'lawn-brown', x: 46, y: 54, w: 34, h: 30, label: 'Lawn' },
    { tone: 'lid', x: 12, y: 68, w: 18, h: 12, label: 'Septic lid' },
    { tone: 'aquifer', x: 0, y: 88, w: 100, h: 12, label: 'The lens — fresh water floating on seawater' },
  ],

  hotspots: [
    {
      id: 'faucet',
      label: 'Kitchen faucet',
      icon: 'faucet',
      x: 24,
      y: 32,
      kind: 'grab',
      prompt: 'Something in this house is bleeding water. Find the leaks — tap everything that is wasting.',
      config: {
        seconds: 20,
        perLeak: { water: 4 },
        bonus: { water: 2 },
        items: [
          { id: 'faucet', label: 'Kitchen faucet', icon: 'faucet', kind: 'leak', note: 'Dripping.' },
          { id: 'washer', label: 'Washing machine', icon: 'washer', kind: 'fine', note: 'Mid-cycle. Fine.' },
          { id: 'toilet', label: 'Toilet', icon: 'toilet', kind: 'leak', note: 'The silent one — it can waste more than everything else combined.' },
          { id: 'kettle', label: 'Full kettle', icon: 'kettle', kind: 'fine', note: 'Fine.' },
          { id: 'hose', label: 'Hose by the lawn', icon: 'hose', kind: 'leak', note: 'Left trickling.' },
          { id: 'tank', label: 'Aquarium', icon: 'tank', kind: 'fine', note: 'Fine.' },
          { id: 'barrel', label: 'Rain barrel', icon: 'barrel', kind: 'bonus', note: '+ Collecting free water.' },
        ],
        feedback:
          'EPA WaterSense estimates household leaks waste nearly 10,000 gallons a year per home — a running toilet is usually the biggest. On an island with one aquifer, a leak is everyone’s water.',
      },
    },
    {
      id: 'pump',
      label: 'Well pump',
      icon: 'pump',
      x: 84,
      y: 30,
      kind: 'pump',
      prompt: 'The village co-op sets the pump rate for the dry season. Rose has the dial today.',
      config: {
        start: 60,
        under: {
          points: { water: 8 },
          feedback:
            'Under the north of Guam, fresh water floats on seawater in the limestone. Pump past the safe yield and the sea rises into the wells — USGS projects exactly this as recharge drops 19%. The dial you just set is the whole problem in one hand.',
        },
        over: {
          points: { water: -6 },
          feedback: 'That salty taste last month? This dial. Comfortable pressure now, chloride later.',
        },
      },
    },
    {
      id: 'yard',
      label: 'The yard',
      icon: 'lawn',
      x: 63,
      y: 70,
      kind: 'forecast',
      prompt: 'Rose waters the lawn at noon because that’s when she’s home. Fix the schedule.',
      config: {
        token: 'Watering can',
        days: DAYS,
        times: [
          { id: 'early', label: 'Early morning' },
          { id: 'noon', label: 'Noon' },
          { id: 'evening', label: 'Evening' },
        ],
        goodTime: 'early',
        points: { water: 5 },
        feedbackGood:
          'Noon watering mostly evaporates before it reaches roots. Early morning — or just letting the rain do it — keeps the same lawn on half the water. In the dry season, a brown lawn is a badge, not a failure.',
        feedbackBad: ({ day, time }) =>
          (day?.rain
            ? `Rain is already coming ${day.label} — that watering is wasted. `
            : time === 'noon'
              ? 'Noon is the schedule we were fixing — most of it evaporates before reaching roots. '
              : 'Evening is better than noon, but early morning loses the least. ') +
          'Early morning — or just letting the rain do it — keeps the same lawn on half the water.',
      },
    },
    {
      id: 'septic',
      label: 'Septic tank lid',
      icon: 'lid',
      x: 21,
      y: 74,
      kind: 'choice',
      prompt:
        'The co-op letter says sewer hookup is finally available on this street, for a connection fee. Rose asks what you’d do.',
      config: {
        options: [
          {
            id: 'hookup',
            correct: true,
            label: 'Hook up to the sewer',
            points: { water: 8, people: 2 },
            feedback: `Best call. ${SEPTIC_WHY}`,
          },
          {
            id: 'keep',
            label: 'Keep the septic, it still works',
            points: { water: -5 },
            feedback: `"Still works" is how it fails quietly. ${SEPTIC_WHY}`,
          },
          {
            id: 'maintain',
            ok: true,
            label: 'Keep septic but pump/inspect it on schedule',
            points: { water: 3 },
            feedback: `Acceptable — a maintained tank leaks less. But hookup is on the street now. ${SEPTIC_WHY}`,
          },
        ],
      },
    },
  ],

  overlays(done) {
    const zone = done.pump && chlorideZone(done.pump.state);
    return (
      <>
        {done.faucet && (
          <Mark x={8} y={46} icon="faucet" tone={done.faucet.state ? 'veg' : 'danger'}>
            {done.faucet.state ? 'Drips stopped · meter slowed' : 'Still dripping'}
          </Mark>
        )}
        {zone && (
          <Mark x={74} y={42} icon="pump" tone={zone.id === 'low' ? 'veg' : zone.id === 'mid' ? 'warning' : 'danger'}>
            Chloride: {zone.label}
          </Mark>
        )}
        {done.yard && (
          <Mark x={48} y={46} icon="lawn" tone={done.yard.verdict === 'correct' ? 'veg' : 'warning'}>
            {done.yard.verdict === 'correct' ? "Brown is the island's summer color" : 'Watering at the wrong time'}
          </Mark>
        )}
        {done.septic?.state === 'hookup' && <Trace from={[21, 80]} to={[21, 100]} tone="ink" />}
        {done.septic && (
          <Mark x={33} y={76} icon="lid" tone={{ hookup: 'veg', maintain: 'warning', keep: 'danger' }[done.septic.state]}>
            {{ hookup: 'Sewer hookup trenched', maintain: 'Pump-out scheduled', keep: 'Still on septic' }[done.septic.state]}
          </Mark>
        )}
      </>
    );
  },

  outcome: (points) => ((points.water || 0) >= 18 ? 'good' : 'bad'),
  consequence: {
    good: {
      headline: 'The meter sits green.',
      swap: {},
      marks: [
        { x: 74, y: 42, icon: 'pump', tone: 'veg', text: 'Chloride: green' },
        { x: 30, y: 4, icon: 'faucet', tone: 'veg', text: 'Pressure: full' },
        { x: 50, y: 30, icon: 'tank', tone: 'veg', text: 'Village water tower: normal' },
      ],
    },
    bad: {
      headline: 'The meter climbs into the red.',
      swap: {},
      marks: [
        { x: 74, y: 42, icon: 'pump', tone: 'danger', text: 'Chloride: amber-red' },
        { x: 8, y: 46, icon: 'board', tone: 'danger', text: 'Conservation notice on the door' },
      ],
    },
  },

  card: {
    title: { good: 'The water tastes like water again', bad: 'The lens is still turning salty' },
    fact: "Under northern Guam, fresh water floats on seawater inside the limestone. Pump past the safe yield, let leaks run, or let septic seep into the recharge zone, and USGS projects saltwater and contamination reaching the wells as recharge drops. EPA WaterSense estimates household leaks waste nearly 10,000 gallons a year per home.",
    source: 'USGS SIR 2019-5095 · EPA WaterSense · Guam Waterworks Authority',
    actionLabel: 'Household leak check this week · ask about hookup at your next co-op meeting',
    actions: [
      { label: 'EPA WaterSense — Fix a Leak', href: 'https://www.epa.gov/watersense/fix-leak-week' },
      { label: 'Guam Waterworks Authority', href: 'https://guamwaterworks.org/' },
      {
        label: 'USGS Guam water study',
        href: 'https://www.usgs.gov/index.php/publications/water-resources-guam-potential-impacts-and-adaptive-response-climate-change',
      },
    ],
  },
};
