import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchGiftCardTypes } from '../../services/giftCardService';
import type { GiftCardType } from '../../services/giftCardService';
import styles from './GiftcardList.module.css';

const GiftcardList = () => {
  const navigate = useNavigate();
  const [giftCardTypes, setGiftCardTypes] = useState<GiftCardType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGiftCardTypes()
      .then(data => setGiftCardTypes(data))
      .catch(err => console.error('Failed to load gift cards', err))
      .finally(() => setLoading(false));
  }, []);


  const handleOnClick = (card: GiftCardType) => {
    navigate(`/giftcard/${card.id}`, { state: { card } });
  };

  if (loading) return <div>Loading gift cards...</div>;

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