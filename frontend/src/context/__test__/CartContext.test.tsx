import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { test, expect, vi, beforeEach, describe } from 'vitest';
import { CartProvider, useCart } from '../CartContext';

// component to test the context
const TestComponent = () => {
  const { cartItems, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, cartItemCount } = useCart();
  return (
    <div>
      <div data-testid="count">{cartItemCount}</div>
      <div data-testid="total">{getCartTotal()}</div>
      <button onClick={() => addToCart({ giftCardId: 1, name: 'Steam', image: '/steam.jpg', amount: 10 })}>
        Add Steam $10
      </button>
      <button onClick={() => addToCart({ giftCardId: 2, name: 'Amazon', image: '/amazon.jpg', amount: 25 })}>
        Add Amazon $25
      </button>
      <button onClick={() => removeFromCart(1, 10)}>Remove Steam $10</button>
      <button onClick={() => updateQuantity(1, 10, 3)}>Set Steam quantity to 3</button>
      <button onClick={clearCart}>Clear Cart</button>
      {cartItems.map(item => (
        <div key={`${item.id}-${item.amount}`} data-testid={`cart-item-${item.id}`}>
          {item.name} - ${item.amount} x{item.quantity} = ${item.amount * item.quantity}
        </div>
      ))}
    </div>
  );
};

describe('CartContext', () => {
  // mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = value; },
      clear: () => { store = {}; },
    };
  })();

  beforeEach(() => {
    // clear localStorage and all mocks before each test
    localStorageMock.clear();
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    vi.clearAllMocks();
  });

  test('initial cart is empty', () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    expect(screen.getByTestId('count')).toHaveTextContent('0');
    expect(screen.getByTestId('total')).toHaveTextContent('0');
  });

  test('addToCart adds new item', async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    await user.click(screen.getByText('Add Steam $10'));
    expect(screen.getByTestId('count')).toHaveTextContent('1');
    expect(screen.getByTestId('total')).toHaveTextContent('10');
    expect(screen.getByTestId('cart-item-1')).toHaveTextContent('Steam - $10 x1 = $10');
  });

  test('addToCart increases quantity if same item and amount', async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    await user.click(screen.getByText('Add Steam $10'));
    await user.click(screen.getByText('Add Steam $10'));
    expect(screen.getByTestId('count')).toHaveTextContent('2');
    expect(screen.getByTestId('total')).toHaveTextContent('20');
    expect(screen.getByTestId('cart-item-1')).toHaveTextContent('Steam - $10 x2 = $20');
  });

  test('addToCart creates separate item for different amount', async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    await user.click(screen.getByText('Add Steam $10'));
    await user.click(screen.getByText('Add Amazon $25'));
    expect(screen.getByTestId('count')).toHaveTextContent('2');
    expect(screen.getByTestId('total')).toHaveTextContent('35');
    expect(screen.getByTestId('cart-item-1')).toHaveTextContent('Steam - $10 x1 = $10');
    expect(screen.getByTestId('cart-item-2')).toHaveTextContent('Amazon - $25 x1 = $25');
  });

  test('removeFromCart removes item', async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    await user.click(screen.getByText('Add Steam $10'));
    await user.click(screen.getByText('Remove Steam $10'));
    expect(screen.queryByTestId('cart-item-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('count')).toHaveTextContent('0');
    expect(screen.getByTestId('total')).toHaveTextContent('0');
  });

  test('updateQuantity changes quantity and total', async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    await user.click(screen.getByText('Add Steam $10'));
    await user.click(screen.getByText('Set Steam quantity to 3'));
    expect(screen.getByTestId('cart-item-1')).toHaveTextContent('Steam - $10 x3 = $30');
    expect(screen.getByTestId('count')).toHaveTextContent('3');
    expect(screen.getByTestId('total')).toHaveTextContent('30');
  });

  test('clearCart removes all items', async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    await user.click(screen.getByText('Add Steam $10'));
    await user.click(screen.getByText('Add Amazon $25'));
    await user.click(screen.getByText('Clear Cart'));
    expect(screen.queryByTestId(/cart-item/)).not.toBeInTheDocument();
    expect(screen.getByTestId('count')).toHaveTextContent('0');
    expect(screen.getByTestId('total')).toHaveTextContent('0');
  });

  test('cart persists to localStorage', async () => {
    const user = userEvent.setup();
    const { unmount } = render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    await user.click(screen.getByText('Add Steam $10'));
    const stored = localStorage.getItem('giftcard_cart');
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0]).toMatchObject({ id: 1, name: 'Steam', amount: 10, quantity: 1 });

    unmount();
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
    expect(screen.getByTestId('count')).toHaveTextContent('1');
    expect(screen.getByTestId('cart-item-1')).toBeInTheDocument();
  });
});