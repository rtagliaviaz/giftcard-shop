import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchGiftCardTypes } from '../../services/giftCardService';
import type { GiftCardType } from '../../services/giftCardService';
import styles from './GiftcardList.module.css';

const GiftcardList = () => {
  const navigate = useNavigate();
  const [giftCardTypes, setGiftCardTypes] = useState<GiftCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    fetchGiftCardTypes()
      .then(data => {
        setGiftCardTypes(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load gift cards', err);
        setError('Unable to connect to the backend service. Please try again later.');
        setLoading(false);
      });
  }, []);

  const handleOnClick = (card: GiftCardType) => {
    navigate(`/giftcard/${card.id}`, { state: { card } });
  };

  if (loading) return <div className={styles.loading}>Loading gift cards...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (giftCardTypes.length === 0) return <div className={styles.empty}>No gift cards available.</div>;

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {giftCardTypes.map((card) => (
          <div key={card.id} className={styles.card} onClick={() => handleOnClick(card)}>
            <div className={styles.imageWrapper}>
              <img src={card.image} alt={card.name} className={styles.image} />
            </div>
            <div className={styles.cardTitle}>{card.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GiftcardList;