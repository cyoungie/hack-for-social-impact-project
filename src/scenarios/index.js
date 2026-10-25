import field from './field.jsx';
import ridge from './ridge.jsx';
import coast from './coast.jsx';
import lens from './lens.jsx';
import industry from './industry.jsx';

// Built scenarios by map slot id.
export const SCENARIOS = { field, ridge, coast, lens, industry };

export const isBuilt = (id) => Boolean(SCENARIOS[id]);
