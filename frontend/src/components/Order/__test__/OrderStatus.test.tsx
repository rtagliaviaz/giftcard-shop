import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { test, expect, vi, beforeEach } from 'vitest';
import OrderStatus from '../OrderStatus';
import { getOrderStatus, getOrderCode } from '../../../services/api';
import { useWebSocket } from '../../../hooks/useWebSocket';

// Mock dependencies
vi.mock('../../../services/api');
vi.mock('../../../hooks/useWebSocket');
vi.mock('qrcode.react', () => ({
  QRCodeSVG: () => <div data-testid="qr-mock">QR Code Mock</div>,
}));

const mockGetOrderStatus = getOrderStatus as ReturnType<typeof vi.fn>;
const mockGetOrderCode = getOrderCode as ReturnType<typeof vi.fn>;
const mockUseWebSocket = useWebSocket as ReturnType<typeof vi.fn>;

const mockOrderPending = {
  paid: false,
  address: '0x1234567890123456789012345678901234567890',
  expectedAmount: 10.0,
  expiresAt: new Date(Date.now() + 600000).toISOString(),
  status: 'pending',
  network: 'sepolia',
  currency: 'USDT',
};

const mockOrderPaid = { ...mockOrderPending, paid: true };

const mockCodes = [
  { code: 'GIFT-123', giftCardType: 'Steam', giftCardId: 1, deliveredAt: null, expiresAt: null },
  { code: 'GIFT-456', giftCardType: 'Amazon', giftCardId: 2, deliveredAt: null, expiresAt: null },
];

beforeEach(() => {
  vi.clearAllMocks();
  mockGetOrderStatus.mockResolvedValue({ data: mockOrderPending });
  mockGetOrderCode.mockResolvedValue({ data: [] });
  mockUseWebSocket.mockReturnValue({ isPaid: false, socket: null, isConnected: false });
});

test('shows loading initially', () => {
  render(
    <MemoryRouter initialEntries={['/order/ORD_123']}>
      <Routes>
        <Route path="/order/:uid" element={<OrderStatus />} />
      </Routes>
    </MemoryRouter>
  );
  expect(screen.getByText(/Loading order details/i)).toBeInTheDocument();
});

test('displays pending payment view when order is not paid', async () => {
  render(
    <MemoryRouter initialEntries={['/order/ORD_123']}>
      <Routes>
        <Route path="/order/:uid" element={<OrderStatus />} />
      </Routes>
    </MemoryRouter>
  );
  await waitFor(() => expect(screen.getByText(/Order #ORD_123/i)).toBeInTheDocument());
  expect(screen.getByText(/Amount/)).toBeInTheDocument();
  expect(screen.getByText('10 USDT')).toBeInTheDocument();
  expect(screen.getByText('sepolia')).toBeInTheDocument();
  expect(screen.getByText(/Waiting for payment/)).toBeInTheDocument();
  expect(screen.getByTestId('qr-mock')).toBeInTheDocument();
});

test('switches to paid view when WebSocket notifies payment', async () => {
  mockGetOrderStatus.mockResolvedValue({ data: mockOrderPending });
  mockUseWebSocket.mockReturnValue({ isPaid: false });

  render(
    <MemoryRouter initialEntries={['/order/ORD_123']}>
      <Routes>
        <Route path="/order/:uid" element={<OrderStatus />} />
      </Routes>
    </MemoryRouter>
  );

  await waitFor(() => expect(screen.getByText(/Waiting for payment/)).toBeInTheDocument());
  expect(screen.queryByText(/Payment confirmed/)).not.toBeInTheDocument();

  mockUseWebSocket.mockReturnValue({ isPaid: true });
  mockGetOrderStatus.mockResolvedValue({ data: mockOrderPaid });
  mockGetOrderCode.mockResolvedValue({ data: mockCodes });

  // Re‑render to trigger the effect
  const {rerender} = render(
    <MemoryRouter initialEntries={['/order/ORD_123']}>
      <Routes>
        <Route path="/order/:uid" element={<OrderStatus />} />
      </Routes>
    </MemoryRouter>
  );

  await waitFor(() => expect(screen.getByText(/Payment confirmed/)).toBeInTheDocument());
  expect(screen.getByText('Your gift card(s) are ready')).toBeInTheDocument();
  expect(screen.getByText('GIFT-123')).toBeInTheDocument();
  expect(screen.getByText('GIFT-456')).toBeInTheDocument();
});

test('shows loading codes while fetching after payment', async () => {
  // Simulate order already paid from the start, but codes not yet loaded
  mockGetOrderStatus.mockResolvedValueOnce({ data: mockOrderPaid });
  mockGetOrderCode.mockImplementationOnce(() => new Promise(() => {})); // never resolves
  render(
    <MemoryRouter initialEntries={['/order/ORD_123']}>
      <Routes>
        <Route path="/order/:uid" element={<OrderStatus />} />
      </Routes>
    </MemoryRouter>
  );
  await waitFor(() => expect(screen.getByText(/Payment confirmed/)).toBeInTheDocument());
  expect(screen.getByText(/Loading your gift card codes/i)).toBeInTheDocument();
});

test('handles expired order', async () => {
  const expiredOrder = {
    ...mockOrderPending,
    expiresAt: new Date(Date.now() - 60000).toISOString(),
  };
  mockGetOrderStatus.mockResolvedValue({ data: expiredOrder });
  render(
    <MemoryRouter initialEntries={['/order/ORD_123']}>
      <Routes>
        <Route path="/order/:uid" element={<OrderStatus />} />
      </Routes>
    </MemoryRouter>
  );
  await waitFor(() => expect(screen.getByText(/Order expired. Please create a new order/i)).toBeInTheDocument());
});