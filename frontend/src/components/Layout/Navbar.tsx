import { useState } from 'react';
import { Link } from 'react-router-dom'; 
import { useCart } from '../../context/CartContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { cartItemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className={styles.navbar}>
      <Link to="/" className={styles.brand} onClick={closeMenu}>
        GiftCard Shop
      </Link>

      {/* Hamburger icon */}
      <div className={styles.menuIcon} onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>
      </div>

      <ul className={`${styles.navLinks} ${menuOpen ? styles.open : ''}`}>
        <li>
          <Link to="/" onClick={closeMenu}>Home</Link>
        </li>
        <li>
          <Link to="/cart" onClick={closeMenu}>
            Cart
            {cartItemCount > 0 && (
              <span className={styles.cartBadge}>{cartItemCount}</span>
            )}
          </Link>
        </li>
      </ul>
    </nav>
  );
}