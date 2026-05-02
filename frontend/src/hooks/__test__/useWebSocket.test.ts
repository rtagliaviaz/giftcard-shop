import { renderHook, act } from '@testing-library/react';
import { test, expect, vi, beforeEach, afterEach } from 'vitest';
import { useWebSocket } from '../useWebSocket';


// mock socket instance
const mockSocket = {
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
  disconnect: vi.fn(),
  connected: true,
};

// mock socket.io-client
vi.mock('socket.io-client', () => {
  const mockIo = vi.fn(() => mockSocket);
  return {
    default: mockIo,
    io: mockIo,
  };
});

import { io } from 'socket.io-client';
const mockIo = io as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.clearAllMocks();
  mockSocket.on.mockClear();
  mockSocket.off.mockClear();
  mockSocket.emit.mockClear();
  mockSocket.disconnect.mockClear();
  (mockIo as any).mockReturnValue(mockSocket);
});

afterEach(() => {
  vi.resetAllMocks();
});

test('creates socket connection', () => {
  renderHook(() => useWebSocket('ORD_123'));
  expect(mockIo).toHaveBeenCalledWith(import.meta.env.VITE_WS_URL);
  expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
});

test('returns initial isPaid = false', () => {
  const { result } = renderHook(() => useWebSocket('ORD_123'));
  expect(result.current.isPaid).toBe(false);
  expect(result.current.socket).toBeDefined();
});


test('sets isPaid = true when order-paid event matches the uid', () => {
  const { result } = renderHook(() => useWebSocket('ORD_123'));
  const paidHandler = mockSocket.on.mock.calls.find(call => call[0] === 'order-paid')?.[1];
  expect(paidHandler).toBeDefined();
  act(() => {
    paidHandler({ uid: 'ORD_123' });
  });
  expect(result.current.isPaid).toBe(true);
});

test('ignores order-paid event for different uid', () => {
  const { result } = renderHook(() => useWebSocket('ORD_123'));
  const paidHandler = mockSocket.on.mock.calls.find(call => call[0] === 'order-paid')?.[1];
  act(() => {
    paidHandler({ uid: 'ORD_456' });
  });
  expect(result.current.isPaid).toBe(false);
});


test('sets order codes when order-codes event matches the uid', () => {
  const { result } = renderHook(() => useWebSocket('ORD_123'));
  const codesHandler = mockSocket.on.mock.calls.find(call => call[0] === 'order-codes')?.[1];
  const mockCodes = [{ code: 'GIFT-123' }, { code: 'GIFT-456' }];
  expect(codesHandler).toBeDefined();
  act(() => {
    codesHandler({ uid: 'ORD_123', codes: mockCodes });
  });
  expect(result.current.orderCodes).toEqual(mockCodes);
});

test('disconnects socket on unmount', () => {
  const { unmount } = renderHook(() => useWebSocket('ORD_123'));
  unmount();
  expect(mockSocket.disconnect).toHaveBeenCalled();
});