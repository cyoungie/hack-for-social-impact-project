// Water Note cards, one per station. Each fact was checked against the linked source (Oct 2026).
// GWA's own pages are cited by name, not linked: its site currently carries injected spam links.
export const NOTES = {
  well: {
    title: 'The lens floats',
    text: "In northern Guam, drinking water is pumped from a freshwater lens that floats on seawater inside porous limestone. If a well is pumped too hard or drilled too deep, seawater from below mixes in and the water gets saltier. About 70% of Guam's production wells have seen chloride rise since the 1970s.",
    source: 'USGS Water-Resources Investigations Report 03-4126 · University of Guam, 2026',
    href: 'https://pubs.usgs.gov/wri/wri034126/htdocs/wrir03-4126.html',
  },
  pipe: {
    title: 'Water lost before it reaches you',
    text: 'Old pipes leak and break, wasting water and causing outages. GWA replaces old, leaky pipes to cut water loss, and residents can report leaks or outages to GWA on its website or by calling 646-4211.',
    source: 'Guam Daily Post · Guam Waterworks Authority',
    href: 'https://www.postguam.com/news/local/gwa-to-enter-phase-v-of-waterline-replacement-project/article_8a0a6bd6-1961-11e9-b801-ff826f88e7c7.html',
  },
  septic: {
    title: 'Where the drop goes',
    text: "In northern Guam, rain soaks quickly through the limestone, so what's spilled on the ground can reach the aquifer fast — and thousands of septic tanks sit above it. Guam EPA rules require existing buildings to connect to a public sewer once one is available, and GWA offers loans to help homeowners hook up.",
    source: 'UOG Water and Environmental Research Institute · Guam Daily Post',
    href: 'https://weri.uog.edu/2019/08/07/other-sponsored-research-noaa/',
  },
  pantry: {
    title: 'The wells run on power',
    text: "A week after Typhoon Mawar in 2023, only about half of GWA's working wells were back online. People were told to boil their water, and the Governor declared a water emergency limiting uses like washing cars. In July 2026, during Super Typhoon Bavi recovery, GWA asked everyone to save water, and inspectors visited homes and businesses to check emergency water rules were being followed.",
    source: 'Pacific Island Times · Isla Public Media',
    href: 'https://www.pacificislandtimes.com/post/guam-water-restoration-near-50',
  },
  house: {
    title: 'Saving water saves energy',
    text: 'Electricity on Guam costs more than the US average — about 1.4 times as much for homes in 2025 — so pumping and treating water is expensive. During water emergencies, people can be told to stop non-essential uses like washing cars and pressure washing.',
    source: 'US Department of Energy · Guam Homeland Security',
    href: 'https://www.energy.gov/oe/guam',
  },
  hall: {
    title: 'Who protects the aquifer',
    text: "Guam EPA's Water Resources Management Program permits and inspects wells to protect the northern aquifer from pollution and overpumping. GWA tests its water and publishes a yearly water quality report under the federal Safe Drinking Water Act.",
    source: 'Guam EPA · Guam Waterworks Authority',
    href: 'https://epa.guam.gov/wrmp/',
  },
};

// Household emergency water guideline shown in the Typhoon Water Kit (Guam Homeland Security / OCD).
export const WATER_GUIDELINE = {
  perPersonPerDay: 1,
  text: 'Guam Homeland Security says to store at least 1 gallon of water per person per day, for at least 3 days. This outage lasts 7.',
};
