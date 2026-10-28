import type { UserConfig } from 'vite';

/** Keep the temporary demo build separate from normal development/production. */
export function createSharingConfig(mode: string): UserConfig {
  const sharing = mode === 'share';
  return {
    ...(sharing ? { define: { 'import.meta.env.VITE_API_BASE_URL': JSON.stringify('/') } } : {}),
    preview: {
      port: sharing ? 4174 : 4173,
      host: sharing ? '127.0.0.1' : true,
      ...(sharing
        ? {
            strictPort: true,
            proxy: {
              '/api/': { target: 'http://127.0.0.1:3000', changeOrigin: true },
              '^/health(?:\\?.*)?$': { target: 'http://127.0.0.1:3000', changeOrigin: true },
            },
          }
        : {}),
    },
    build: {
      target: 'es2022',
      sourcemap: !sharing,
      outDir: sharing ? 'dist-share' : 'dist',
    },
  };
}
