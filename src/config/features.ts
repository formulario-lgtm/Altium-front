/** Temporary product pause; re-enable together with the API feature switch. */
export const MONTHLY_GOALS_ENABLED: boolean = false;
export function isFeatureRouteEnabled(name: unknown): boolean {
  return MONTHLY_GOALS_ENABLED || name !== 'supervision-goals';
}
export function isGoalMetric(code: string): boolean {
  return ['COMPLIANCE', 'BEHIND_PACE', 'NO_GOAL', 'TEAMS_WITHOUT_GOAL'].includes(code);
}
