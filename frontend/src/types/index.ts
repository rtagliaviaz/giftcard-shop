// ========== General ==========
export type Currency = 'USDT' | 'USDC';

// ========== Gift Card ==========
export interface GiftCard {
  id: number;
  name: string;
  denomination: number;
  image: string;
  active: boolean;
}

export interface Denomination {
  id: number;
  value: number;
}

export interface GiftCardType {
  id: number;
  name: string;
  image: string;
  denominations: Denomination[];
}

// ========== Cart ==========
export interface CartContextItem {
  id: number;
  name: string;
  image: string;
  amount: number;
  quantity: number;
}

export interface AddToCartInput {
  giftCardId: number;
  name: string;
  image: string;
  amount: number;
}

export interface CartContextType {
  cartItems: CartContextItem[];
  addToCart: (item: AddToCartInput) => void;
  removeFromCart: (id: number, amount: number) => void;
  updateQuantity: (id: number, amount: number, newQuantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  cartItemCount: number;
}

// ========== Order / API ==========
export interface OrderItemInput {
  giftCardId: number;
  quantity: number;
  unitAmountUSD: number;
}

export interface CreateOrderRequest {
  email: string;
  items: OrderItemInput[];
  totalAmountRaw: number;
  network: 'sepolia' | 'baseSepolia';
  currency?: Currency;
}

export interface CreateOrderResponse {
  uid: string;
  address: string;
  expiresAt: string;
}

export interface OrderStatusResponse {
  paid: boolean;
  address: string;
  expectedAmount: number;
  expiresAt: string;
  status: string;
  network: string;
  currency: string;
}

export interface CodeItem {
  code: string;
  giftCardId: number;
  giftCardType: string;
  denomination: number;
  deliveredAt: string | null;
}

// ========== Hooks ==========
export interface UseCheckoutProps {
  cartItems: CartContextItem[];
  email: string;
  selectedCurrency: Currency;
  clearCart: () => void;
}