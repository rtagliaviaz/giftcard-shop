import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import type { CartContextItem, CreateOrderBody, CreateOrderDataResponse } from '../../types';
import { useNavigate } from 'react-router-dom';
import styles from './Cart.module.css';
import { createOrder } from '../../services/api';

type Currency = 'USDT' | 'USDC';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('USDT');
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const totalUSD = getCartTotal();

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
      const body: CreateOrderBody = {
        email,
        currency: selectedCurrency,
        items: cartItems.map((item: CartContextItem) => ({
          giftCardId: item.id,
          name: item.name,
          unitAmountUSD: item.amount,
          quantity: item.quantity,
          totalUSD: item.amount * item.quantity
        })),
        totalAmountRaw: totalUSD * 1_000_000,
        network: selectedCurrency === 'USDT' ? 'sepolia' : 'baseSepolia'
      };

      const apiResponse = await createOrder(body);
      const data = apiResponse.data as CreateOrderDataResponse;

      clearCart();
      navigate(`/order/${data.uid}`);
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className={styles.emptyCart}>
        <h2>Your cart is empty</h2>
        <button onClick={() => navigate('/')} className={styles.continueButton}>
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>

      <div className={styles.cartGrid}>
        {/* Left column: Cart items */}
        <div className={styles.cartItems}>
           <div className={styles.cartHeader}>
            <div className={styles.headerImage}></div>
            <div className={styles.headerProduct}>Product</div>
            <div className={styles.headerUnitPrice}>Unit Price</div>
            <div className={styles.headerQuantity}>Quantity</div>
            <div className={styles.headerTotal}>Total</div>
            <div className={styles.headerAction}></div>
          </div>
          {cartItems.map((item: CartContextItem) => (
            <div key={`${item.id}-${item.amount}`} className={styles.cartItem}>
              <img src={item.image} alt={item.name} className={styles.itemImage} />
              <div className={styles.itemInfo}>
                <div className={styles.itemName}>{item.name}</div>
                <div className={styles.itemPrice}>${item.amount} each</div>
              </div>
              <div className={styles.itemAmount}>${item.amount}</div>
              <div className={styles.quantityControls}>
                <button
                  className={styles.quantityBtn}
                  onClick={() => updateQuantity(item.id, item.amount, item.quantity - 1)}
                >
                  -
                </button>
                <span className={styles.quantity}>{item.quantity}</span>
                <button
                  className={styles.quantityBtn}
                  onClick={() => updateQuantity(item.id, item.amount, item.quantity + 1)}
                >
                  +
                </button>
              </div>
              <div className={styles.itemTotal}>${item.amount * item.quantity}</div>
              <button
                className={styles.removeBtn}
                onClick={() => removeFromCart(item.id, item.amount)}
                aria-label="Remove item"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Right column: Checkout form (sticky) */}
        <div className={styles.checkoutForm}>
          <div className={styles.summary}>
            <div className={styles.summaryRow}>
              <span>Total (USD)</span>
              <span>${totalUSD}</span>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Pay with:</label>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value as Currency)}
            >
              <option value="sepolia">USDT (Sepolia)</option>
              <option value="baseSepolia">USDC (Base Sepolia)</option>
            </select>
            <small>1 {selectedCurrency} = 1 USD</small>
          </div>

          <div className={styles.formGroup}>
            <label>Your email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>

          {/* <div className={styles.policyBox}>
            <h3>Withdrawal Policy</h3>
            <p>
              You have the right to withdraw from this purchase within <strong>{WITHDRAWAL_DAYS} days</strong> without giving any reason.
              The withdrawal period expires {WITHDRAWAL_DAYS} days after the day we send you the gift card code.
              Once the code is delivered, you lose the right to withdraw if we have started the service (digital delivery).
            </p>
            <label>
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
              />
              I have read and accept the withdrawal policy and general terms & conditions.
            </label>
          </div> */}

          <div className={styles.actionButtons}>
            <button
              onClick={handleCheckout}
              disabled={loading || cartItems.length === 0 || !email}
              className={styles.payButton}
            >
              {loading ? 'Creating order...' : `Pay ${totalUSD} ${selectedCurrency}`}
            </button>
            <button onClick={() => navigate('/')} className={styles.shopButton}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;