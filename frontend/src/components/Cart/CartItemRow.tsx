import type { CartContextItem } from '../../types';
import styles from './Cart.module.css';

interface CartItemRowProps {
  item: CartContextItem;
  onUpdateQuantity: (id: number, amount: number, newQuantity: number) => void;
  onRemove: (id: number, amount: number) => void;
}

const CartItemRow = ({ item, onUpdateQuantity, onRemove }: CartItemRowProps) => {
  return (
    <div className={styles.cartItem}>
      <img src={item.image} alt={item.name} className={styles.itemImage} />
      <div className={styles.itemInfo}>
        <div className={styles.itemName}>{item.name}</div>
        <div className={styles.itemPrice}>${item.amount} each</div>
      </div>
      <div className={styles.itemAmount}>${item.amount}</div>
      <div className={styles.quantityControls}>
        <button
          className={styles.quantityBtn}
          onClick={() => onUpdateQuantity(item.id, item.amount, item.quantity - 1)}
        >
          -
        </button>
        <span className={styles.quantity}>{item.quantity}</span>
        <button
          className={styles.quantityBtn}
          onClick={() => onUpdateQuantity(item.id, item.amount, item.quantity + 1)}
        >
          +
        </button>
      </div>
      <div className={styles.itemTotal}>${item.amount * item.quantity}</div>
      <button
        className={styles.removeBtn}
        onClick={() => onRemove(item.id, item.amount)}
        aria-label="Remove item"
      >
        ✕
      </button>
    </div>
  );
};

export default CartItemRow;