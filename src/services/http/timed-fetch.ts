/**
 * Wraps `fetch` so every request aborts after `timeoutMs`.
 * Merges with any caller-provided AbortSignal (e.g. TanStack Query cancellation).
 */
export function createTimedFetch(
  timeoutMs: number,
  baseFetch: typeof fetch = globalThis.fetch.bind(globalThis),
): typeof fetch {
  return async (input, init) => {
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => {
      timeoutController.abort(
        new DOMException(`Request timed out after ${timeoutMs}ms`, 'TimeoutError'),
      );
    }, timeoutMs);

    const signals: AbortSignal[] = [timeoutController.signal];
    if (input instanceof Request) {
      signals.push(input.signal);
    }
    if (init?.signal) {
      signals.push(init.signal);
    }

    const signal = signals.length === 1 ? signals[0] : AbortSignal.any(signals);

    try {
      return await baseFetch(input, { ...init, signal });
    } finally {
      clearTimeout(timeoutId);
    }
  };
}
