import { describe, expect, it } from 'vitest';
import { createSharingConfig } from '../../scripts/sharing-config';

describe('temporary sharing', () => {
  it('isolates the shared build and serves API requests on the same origin', () => {
    const config = createSharingConfig('share');

    expect(config.define?.['import.meta.env.VITE_API_BASE_URL']).toBe('"/"');
    expect(config.build).toMatchObject({ outDir: 'dist-share', sourcemap: false });
    expect(config.preview).toMatchObject({
      host: '127.0.0.1',
      port: 4174,
      strictPort: true,
      proxy: {
        '/api/': { target: 'http://127.0.0.1:3000', changeOrigin: true },
        '^/health(?:\\?.*)?$': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      },
    });
  });

  it('preserves the normal development and production configuration', () => {
    for (const mode of ['development', 'production']) {
      const config = createSharingConfig(mode);
      expect(config.define).toBeUndefined();
      expect(config.build).toMatchObject({ outDir: 'dist', sourcemap: true });
      expect(config.preview?.port).toBe(4173);
      expect(config.preview?.proxy).toBeUndefined();
    }
  });
});
