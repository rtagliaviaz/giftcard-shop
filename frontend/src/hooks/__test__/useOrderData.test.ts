import { renderHook, waitFor, act } from '@testing-library/react';
import { useOrderData } from '../useOrderData';
import { getOrderStatus, getOrderCode } from '../../services/api';

vi.mock('../../services/api');

const mockGetOrderStatus = getOrderStatus as jest.Mock;
const mockGetOrderCode = getOrderCode as jest.Mock;

describe('useOrderData', () => {
  const mockOrder = {
    uid: 'ORD_123',
    paid: false,
    address: '0x...',
    expectedAmount: 10,
    expiresAt: '...',
    status: 'pending',
    network: 'sepolia',
    currency: 'USDT',
  };

  const mockPaidOrder = { ...mockOrder, paid: true };
  const mockCodes = [{ code: 'ABC123', giftCardId: 1, giftCardType: 'Steam', denomination: 10, deliveredAt: null }];

  it('fetches order status on mount', async () => {
    mockGetOrderStatus.mockResolvedValueOnce({ data: mockOrder });
    const { result } = renderHook(() => useOrderData('ORD_123'));
    expect(result.current.order).toBeNull();
    await waitFor(() => expect(result.current.order).toEqual(mockOrder));
    expect(mockGetOrderStatus).toHaveBeenCalledWith('ORD_123');
  });

  it('fetches codes when order is paid', async () => {
    mockGetOrderStatus.mockResolvedValueOnce({ data: mockPaidOrder });
    mockGetOrderCode.mockResolvedValueOnce({ data: mockCodes });
    const { result } = renderHook(() => useOrderData('ORD_123'));
    await waitFor(() => expect(mockGetOrderCode).toHaveBeenCalledWith('ORD_123'));
    await waitFor(() => expect(result.current.codes).toEqual(mockCodes));
  });

  it('updateOrder function updates order state', async () => {
    mockGetOrderStatus.mockResolvedValue({ data: mockOrder });
    const { result } = renderHook(() => useOrderData('ORD_123'));
    await waitFor(() => expect(result.current.order).toBeDefined());
    const newOrder = { ...mockOrder, paid: true };
    act(() => {
      result.current.updateOrder(newOrder);
    });
    expect(result.current.order).toEqual(newOrder);
  });

  it('setOrderCodes function updates codes state', async () => {
    mockGetOrderStatus.mockResolvedValue({ data: mockOrder });
    const { result } = renderHook(() => useOrderData('ORD_123'));
    await waitFor(() => result.current.order);
    act(() => {
      result.current.setOrderCodes(mockCodes);
    });
    expect(result.current.codes).toEqual(mockCodes);
  });
});