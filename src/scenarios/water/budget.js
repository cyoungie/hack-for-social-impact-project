// Water Budget meter: starts in the yellow; each station's result moves it toward green or red.
export const BUDGET_START = 50;

export function budgetOf(done) {
  const sum = Object.values(done).reduce((n, r) => n + (r.budget || 0), 0);
  return Math.max(0, Math.min(100, BUDGET_START + sum));
}

export function budgetColor(v) {
  if (v >= 65) return 'green';
  if (v >= 35) return 'yellow';
  return 'red';
}
