import { describe, expect, it } from 'vitest';
import { loadAppEnv } from './env';

function createMetaEnv(overrides: Partial<ImportMetaEnv> = {}): ImportMetaEnv {
  return {
    VITE_APP_TITLE: 'Altium CRM',
    VITE_API_BASE_URL: 'http://localhost:3000',
    VITE_API_TIMEOUT_MS: '15000',
    VITE_API_WITH_CREDENTIALS: 'true',
    VITE_ENABLE_HEALTH_CHECK: 'false',
    ...overrides,
  } as ImportMetaEnv;
}

describe('loadAppEnv', () => {
  it('normalizes trailing slashes on the API base URL', () => {
    const env = loadAppEnv(
      createMetaEnv({
        VITE_API_BASE_URL: 'http://localhost:3000/',
      }),
    );

    expect(env.apiBaseUrl).toBe('http://localhost:3000');
  });

  it('falls back to safe defaults for invalid timeout values', () => {
    const env = loadAppEnv(
      createMetaEnv({
        VITE_API_TIMEOUT_MS: 'not-a-number',
      }),
    );

    expect(env.apiTimeoutMs).toBe(15_000);
  });
});
