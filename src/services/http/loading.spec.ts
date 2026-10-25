import { afterEach, describe, expect, it } from 'vitest';
import {
  beginGlobalLoading,
  endGlobalLoading,
  isSilentLoadingUrl,
  resetGlobalLoading,
  useGlobalLoadingState,
} from './loading';

describe('global loading tracker', () => {
  afterEach(() => {
    resetGlobalLoading();
  });

  it('marks silent notification poll and health URLs', () => {
    expect(isSilentLoadingUrl('http://api.test/api/v1/notifications/unread-count')).toBe(true);
    expect(isSilentLoadingUrl('http://api.test/health')).toBe(true);
    expect(isSilentLoadingUrl('http://api.test/api/v1/sales')).toBe(false);
  });

  it('tracks nested begin/end pairs', () => {
    const { isLoading, pendingCount } = useGlobalLoadingState();
    expect(isLoading.value).toBe(false);

    beginGlobalLoading();
    beginGlobalLoading();
    expect(pendingCount.value).toBe(2);
    expect(isLoading.value).toBe(true);

    endGlobalLoading();
    expect(pendingCount.value).toBe(1);
    endGlobalLoading();
    expect(isLoading.value).toBe(false);
  });

  it('does not go below zero on extra end', () => {
    endGlobalLoading();
    expect(useGlobalLoadingState().pendingCount.value).toBe(0);
  });
});
