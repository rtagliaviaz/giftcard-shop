export interface GiftCard {
  id: number;
  name: string;
  denomination: number; // USD value
  image: string;
  active: boolean;
}

export interface CartContextType {
  cartItems: CartContextItem[];
  // addToCart: (giftCard: GiftCard, selectedAmount: number) => void;
  addToCart: (item: AddToCartInput) => void;
  removeFromCart: (id: string | number, amount: number) => void;
  updateQuantity: (id: string | number, amount: number, newQuantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  cartItemCount: number;
}


export interface AddToCartInput {
  giftCardId: number;
  name: string;
  image: string;
  amount: number; // USD value
}


export interface CartContextItem {
  id: number;
  name: string;
  image: string;
  amount: number;      // USD denomination
  quantity: number;
}

export interface CreateOrderBody {
  email: string;
  currency: string;
  network: 'sepolia' | 'baseSepolia';
  totalAmountRaw: number;   // in smallest unit (e.g., USDT * 1e6)
  items: {
    giftCardId: number;
    name: string;
    unitAmountUSD: number;
    quantity: number;
    totalUSD: number;
  }[];
}

export interface GiftCardTypesResponse {
    id: number;
    name: string;
    image: string;
    denominations: {
        id: number;
        value: number;
    }[];
};

export interface GiftCard {
  id: number;
  name: string;
  denomination: number;
  image: string;
  active: boolean;
}

export interface CreateOrderDataResponse {
  uid: string;
  address: string;
  expiresAt: string;
}

export interface OrderItemInput {
  giftCardId: number;
  quantity: number;
  unitAmountUSD: number;
}

export interface CreateOrderRequest {
  email: string;
  items: OrderItemInput[];
  totalAmountRaw: number;   // in smallest unit (e.g., USDT * 1e6)
  network: 'sepolia' | 'baseSepolia';
}

export interface OrderStatusResponse {
  paid: boolean;
  address: string;
  expectedAmount: number;   // human‑readable (e.g., 10.00)
  expiresAt: string;
  status: string;
  network: string;
  currency: string;
}
                        
export interface OrderCodeResponse {
  code: string;
}