import { describe, expect, it, vi } from 'vitest';
import { createTimedFetch } from './timed-fetch';

describe('createTimedFetch', () => {
  it('aborts with TimeoutError when the request exceeds timeoutMs', async () => {
    const baseFetch = vi.fn(
      (_input: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(init.signal?.reason ?? new DOMException('Aborted', 'AbortError'));
          });
        }),
    );

    const timedFetch = createTimedFetch(15, baseFetch as unknown as typeof fetch);

    await expect(timedFetch('http://api.test/health')).rejects.toSatisfy((error: unknown) => {
      expect(error).toBeInstanceOf(DOMException);
      expect((error as DOMException).name).toBe('TimeoutError');
      return true;
    });
  });

  it('propagates caller cancellation via AbortSignal', async () => {
    const controller = new AbortController();
    const baseFetch = vi.fn(
      (_input: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener(
            'abort',
            () => {
              reject(new DOMException('Aborted', 'AbortError'));
            },
            { once: true },
          );
        }),
    );

    const timedFetch = createTimedFetch(5_000, baseFetch as unknown as typeof fetch);
    const pending = timedFetch('http://api.test/health', { signal: controller.signal });
    await Promise.resolve();
    controller.abort();

    await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
  });
});
