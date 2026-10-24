export type AppEnv = {
  appTitle: string;
  apiBaseUrl: string;
  apiTimeoutMs: number;
  apiWithCredentials: boolean;
  enableHealthCheck: boolean;
  isDev: boolean;
  isProd: boolean;
};

function readBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === '') {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  if (['true', '1', 'yes'].includes(normalized)) {
    return true;
  }
  if (['false', '0', 'no'].includes(normalized)) {
    return false;
  }

  return fallback;
}

function readPositiveInt(value: string | undefined, fallback: number): number {
  if (value === undefined || value === '') {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

export function loadAppEnv(metaEnv: ImportMetaEnv = import.meta.env): AppEnv {
  const apiBaseUrl = metaEnv.VITE_API_BASE_URL?.trim() || 'http://localhost:3000';

  return {
    appTitle: metaEnv.VITE_APP_TITLE?.trim() || 'Altium CRM',
    apiBaseUrl: apiBaseUrl.replace(/\/$/, ''),
    apiTimeoutMs: readPositiveInt(metaEnv.VITE_API_TIMEOUT_MS, 15_000),
    apiWithCredentials: readBoolean(metaEnv.VITE_API_WITH_CREDENTIALS, true),
    enableHealthCheck: readBoolean(metaEnv.VITE_ENABLE_HEALTH_CHECK, false),
    isDev: Boolean(import.meta.env.DEV),
    isProd: Boolean(import.meta.env.PROD),
  };
}

export const appEnv = loadAppEnv();
