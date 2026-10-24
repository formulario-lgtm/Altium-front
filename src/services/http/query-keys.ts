/**
 * Hierarchical query keys.
 * Example: queryKeys.system.health() → ['system', 'health']
 */
export const queryKeys = {
  system: {
    all: ['system'] as const,
    health: () => [...queryKeys.system.all, 'health'] as const,
  },
} as const;
