import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import styles from './Cart.module.css';
import CartItemRow from './CartItemRow';
import { useCheckout } from '../../hooks/useCheckOut';
import type { Currency } from '../../types';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('USDT');
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const { loading, handleCheckout } = useCheckout({ cartItems, email, selectedCurrency, clearCart });

  const totalUSD = getCartTotal();


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
        <div className={styles.cartItems}>
           <div className={styles.cartHeader}>
            <div className={styles.headerImage}></div>
            <div className={styles.headerProduct}>Product</div>
            <div className={styles.headerUnitPrice}>Unit Price</div>
            <div className={styles.headerQuantity}>Quantity</div>
            <div className={styles.headerTotal}>Total</div>
            <div className={styles.headerAction}></div>
          </div>
          {cartItems.map((item) => (
            <CartItemRow
              key={`${item.id}-${item.amount}`}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeFromCart}
            />
          ))}
        </div>

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