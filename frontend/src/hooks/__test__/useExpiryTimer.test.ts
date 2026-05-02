import { renderHook, act } from '@testing-library/react';
import { useExpiryTimer } from '../useExpiryTimer';

describe('useExpiryTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns null timeLeft and false expired when no expiresAt', () => {
    const { result } = renderHook(() => useExpiryTimer(undefined, false));
    expect(result.current.timeLeft).toBeNull();
    expect(result.current.expired).toBe(false);
  });

  it('returns correct timeLeft and not expired when future expiry', () => {
    const expiresAt = new Date(Date.now() + 5000).toISOString();
    const { result } = renderHook(() => useExpiryTimer(expiresAt, false));
    expect(result.current.timeLeft).toBeGreaterThan(0);
    expect(result.current.expired).toBe(false);
  });

  it('sets expired to true and timeLeft to 0 when expiry passes', () => {
    const expiresAt = new Date(Date.now() + 3000).toISOString();
    const { result } = renderHook(() => useExpiryTimer(expiresAt, false));
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.expired).toBe(true);
    expect(result.current.timeLeft).toBe(0);
  });

  it('does not start timer if order is already paid', () => {
    const expiresAt = new Date(Date.now() + 5000).toISOString();
    const { result } = renderHook(() => useExpiryTimer(expiresAt, true));
    expect(result.current.timeLeft).toBeNull();
    expect(result.current.expired).toBe(false);
  });
});