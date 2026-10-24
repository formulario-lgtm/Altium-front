import { describe, expect, it } from 'vitest';
import { createAppQueryClient } from './query-client';

describe('createAppQueryClient', () => {
  it('uses conservative defaults for remote state', () => {
    const client = createAppQueryClient();
    const defaults = client.getDefaultOptions().queries;

    expect(defaults?.staleTime).toBe(30_000);
    expect(defaults?.refetchOnWindowFocus).toBe(false);
  });
});
