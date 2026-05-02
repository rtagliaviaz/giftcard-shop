import { renderHook, act } from '@testing-library/react';
import { useCheckout } from '../useCheckOut';
import { createOrder } from '../../services/api';
import { useNavigate } from 'react-router-dom';

vi.mock('../../services/api');
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

const mockCreateOrder = createOrder as jest.Mock;
const mockNavigate = vi.fn();

describe('useCheckout', () => {
  const defaultProps = {
    cartItems: [{ id: 1, name: 'Steam', amount: 10, quantity: 2, image: '' }],
    email: 'test@example.com',
    selectedCurrency: 'USDT' as const,
    clearCart: vi.fn(),
  };

  beforeEach(() => {
    mockNavigate.mockClear();
    mockCreateOrder.mockClear();
    defaultProps.clearCart.mockClear(); //  clear cart mock before each test
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  it('shows alert if email is empty', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const { result } = renderHook(() => useCheckout({ ...defaultProps, email: '' }));
    await act(async () => {
      await result.current.handleCheckout();
    });
    expect(alertSpy).toHaveBeenCalledWith('Please enter your email to receive gift card codes.');
    expect(mockCreateOrder).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('shows alert if cart is empty', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const { result } = renderHook(() => useCheckout({ ...defaultProps, cartItems: [] }));
    await act(async () => {
      await result.current.handleCheckout();
    });
    expect(alertSpy).toHaveBeenCalledWith('Your cart is empty.');
    expect(mockCreateOrder).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('calls createOrder and navigates on success', async () => {
    const mockResponse = { data: { uid: 'ORD_123', address: '0x...', expiresAt: '...' } };
    mockCreateOrder.mockResolvedValueOnce(mockResponse);
    const { result } = renderHook(() => useCheckout(defaultProps));
    await act(async () => {
      await result.current.handleCheckout();
    });
    expect(mockCreateOrder).toHaveBeenCalledWith(expect.objectContaining({
      email: 'test@example.com',
      currency: 'USDT',
      totalAmountRaw: 20_000_000,
      network: 'sepolia',
    }));
    expect(defaultProps.clearCart).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/order/ORD_123');
  });

  it('handles API error and shows alert', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    mockCreateOrder.mockRejectedValueOnce(new Error('Network error'));
    const { result } = renderHook(() => useCheckout(defaultProps));
    
    await act(async () => {
      await result.current.handleCheckout();
    });
    
    expect(alertSpy).toHaveBeenCalledWith('Failed to create order. Please try again.');
    expect(defaultProps.clearCart).not.toHaveBeenCalled();
    
    alertSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });
});