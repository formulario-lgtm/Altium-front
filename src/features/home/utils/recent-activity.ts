/** Keep home activity panels compact, with the latest five records first. */
export function recentHomeActivity<T>(items: readonly T[], timestamp: (item: T) => string): T[] {
  return [...items].sort((a, b) => Date.parse(timestamp(b)) - Date.parse(timestamp(a))).slice(0, 5);
}
