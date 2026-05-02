import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { fetchGiftCardTypeById } from '../../services/giftCardService';
import styles from './GiftCardDetails.module.css';
import type { GiftCardType, Denomination } from '../../types';

export default function GiftCardDetails() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [card, setCard] = useState<GiftCardType | null>(location.state?.card || null);
  const [loading, setLoading] = useState(!card);
  const [selectedDenom, setSelectedDenom] = useState<Denomination | null>(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (card) {
      if (card.denominations.length > 0) {
        setSelectedDenom(card.denominations[0]);
      }
      return;
    }
    const loadCard = async () => {
      try {
        const data = await fetchGiftCardTypeById(Number(id));
        console.log('Fetched gift card type:', data);
        setCard(data);
        if (data.denominations.length) setSelectedDenom(data.denominations[0]);
      } catch (err) {
        console.error('Failed to load gift card type', err);
      } finally {
        setLoading(false);
      }
    };
    loadCard();
  }, [id, card]);

  const handleAddToCart = () => {
    if (!card || !selectedDenom) return;
    addToCart({
      giftCardId: selectedDenom.id,
      name: card.name,
      image: card.image,
      amount: selectedDenom.value,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return <div>Loading...</div>;
  if (!card) return <div className={styles.errorMessage}>❌ Gift card not found.</div>;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.imageSection}>
          <img src={card.image} alt={card.name} className={styles.image} />
        </div>
        <div className={styles.formSection}>
          <h1 className={styles.title}>{card.name}</h1>
          <label className={styles.amountLabel}>Select amount (USD):</label>
          <select
            value={selectedDenom?.id || ''}
            onChange={(e) => {
              const denom = card.denominations.find(d => d.id === Number(e.target.value));
              if (denom) setSelectedDenom(denom);
            }}
            className={styles.select}
          >
            {card.denominations.map(denom => (
              <option key={denom.id} value={denom.id}>
                ${denom.value} USD
              </option>
            ))}
          </select>
          <div className={styles.buttonGroup}>
            <button onClick={handleAddToCart} className={styles.addButton}>
              Add to Cart
            </button>
            <button onClick={() => navigate('/cart')} className={styles.cartButton}>
              Go to Cart
            </button>
          </div>
          {added && <div className={styles.successMessage}>✓ Added to cart!</div>}
        </div>
      </div>
    </div>
  );
}