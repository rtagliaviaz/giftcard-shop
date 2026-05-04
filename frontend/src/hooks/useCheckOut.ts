import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../services/api';
import type { CreateOrderRequest, CreateOrderResponse, UseCheckoutProps} from '../types';


export const useCheckout = ({ cartItems, email, selectedCurrency, clearCart }: UseCheckoutProps) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (!email) {
      alert('Please enter your email to receive gift card codes.');
      return;
    }
    if (cartItems.length === 0) {
      alert('Your cart is empty.');
      return;
    }
    setLoading(true);
    try {
      const totalUSD = cartItems.reduce((sum, item) => sum + item.amount * item.quantity, 0);
      const body: CreateOrderRequest = {
        email,
        currency: selectedCurrency,
        items: cartItems.map((item) => ({
          giftCardId: item.id,
          name: item.name,
          unitAmountUSD: item.amount,
          quantity: item.quantity,
          totalUSD: item.amount * item.quantity,
        })),
        totalAmountRaw: totalUSD * 1_000_000,
        network: selectedCurrency === 'USDT' ? 'sepolia' : 'baseSepolia',
      };

      const apiResponse = await createOrder(body);
      const data = apiResponse.data as CreateOrderResponse;

      clearCart();
      navigate(`/order/${data.uid}`);
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return { loading, handleCheckout };
};