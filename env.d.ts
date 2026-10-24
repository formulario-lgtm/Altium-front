/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_TIMEOUT_MS: string;
  /** Optional alias for VITE_API_TIMEOUT_MS */
  readonly VITE_API_TIMEOUT?: string;
  readonly VITE_API_WITH_CREDENTIALS: string;
  readonly VITE_ENABLE_HEALTH_CHECK: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, unknown>;
  export default component;
}
