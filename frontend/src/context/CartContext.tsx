// contexts/CartContext.tsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { CartContextItem, CartContextType} from '../types';





// ===== Context =====
const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// ===== Provider =====
interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cartItems, setCartItems] = useState<CartContextItem[]>(() => {
    try {
      const saved = localStorage.getItem('giftcard_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load cart from localStorage', error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('giftcard_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  interface CartItemInput {
  giftCardId: number;
  name: string;
  image: string;
  amount: number; // USD value
}

const addToCart = (item: CartItemInput) => {
  setCartItems(prev => {
    const existing = prev.find(i => i.id === item.giftCardId && i.amount === item.amount);
    if (existing) {
      return prev.map(i =>
        i.id === item.giftCardId && i.amount === item.amount
          ? { ...i, quantity: i.quantity + 1 }
          : i
      );
    }
    return [...prev, {
      id: item.giftCardId,
      name: item.name,
      image: item.image,
      amount: item.amount,
      quantity: 1,
      total: item.amount,
    }];
  });
};

  const removeFromCart = useCallback((id: string | number, amount: number) => {
    setCartItems(prev => prev.filter(item => !(item.id === id && item.amount === amount)));
  }, []);

  const updateQuantity = useCallback((id: string | number, amount: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(prev =>
      prev.map(item =>
        item.id === id && item.amount === amount
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  }, []);

  const clearCart = useCallback(() => setCartItems([]), []);

  const getCartTotal = useCallback(() => {
    return cartItems.reduce((sum, item) => sum + (item.amount * item.quantity), 0);
  }, [cartItems]);

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const value: CartContextType = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    cartItemCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};