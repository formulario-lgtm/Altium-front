import { appEnv } from './env';

/** Central API runtime settings derived from env (never hard-code hosts in features). */
export const apiConfig = {
  baseURL: appEnv.apiBaseUrl,
  timeoutMs: appEnv.apiTimeoutMs,
  withCredentials: appEnv.apiWithCredentials,
  enableHealthCheck: appEnv.enableHealthCheck,
} as const;
