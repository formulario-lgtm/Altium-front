import axios, { type AxiosInstance } from 'axios';
import { appEnv } from '@/config/env';
import { toApiError } from './errors';

export function createHttpClient(): AxiosInstance {
  const client = axios.create({
    baseURL: appEnv.apiBaseUrl,
    timeout: appEnv.apiTimeoutMs,
    withCredentials: appEnv.apiWithCredentials,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  client.interceptors.response.use(
    (response) => response,
    (error: unknown) => Promise.reject(toApiError(error)),
  );

  return client;
}

export const httpClient = createHttpClient();
