import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { getOrderStatus, getOrderCode } from '../../services/api';
import { useWebSocket } from '../../hooks/useWebSocket';
import type { OrderStatusResponse } from '../../types';
import styles from './OrderStatus.module.css';

// Define the shape of a code item as returned by the backend
interface CodeItem {
  code: string;
  giftCardId: number;
  giftCardType: string;
  deliveredAt: string | null;
  expiresAt: string | null;
}

export default function OrderStatus() {
  const { uid } = useParams<{ uid: string }>();
  const [order, setOrder] = useState<OrderStatusResponse | null>(null);
  const [codes, setCodes] = useState<CodeItem[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [expired, setExpired] = useState(false);
  const { isPaid, orderCodes } = useWebSocket(uid || null);

  const [addressCopied, setAddressCopied] = useState(false);

  const copyAddress = () => {
    if (order?.address) {
      navigator.clipboard.writeText(order.address);
      setAddressCopied(true);
      setTimeout(() => setAddressCopied(false), 2000);
    }
  };


  const fetchData = async (uid: string) => {
    try {
      const statusRes = await getOrderStatus(uid);
      setOrder(statusRes.data);
      if (statusRes.data.paid) {
        const codeRes = await getOrderCode(uid);
        setCodes(Array.isArray(codeRes.data) ? codeRes.data : []);
        return;
      }
    } catch (err) {
      console.error('Failed to fetch order status', err);
    }
  };

  

  useEffect(() => {
    if (!uid) return;
    fetchData(uid);
  }, [uid]); 


  useEffect(() => {
    console.log('isPaid changed:', isPaid, 'for uid:', uid);
    if (isPaid && uid) {
      getOrderStatus(uid).then(res => setOrder(res.data));
    }
  }, [isPaid, uid]);


  useEffect(() => {
    if (orderCodes && orderCodes.length > 0) {
      setCodes(orderCodes);
    }
  }, [orderCodes]);

 useEffect(() => {
  if (!order?.expiresAt || order.paid) return;
  const checkExpiry = () => {
    const remaining = new Date(order.expiresAt).getTime() - Date.now();
    if (remaining <= 0) {
      setExpired(true);
      setTimeLeft(0);
      return true; // expired
    } else {
      setTimeLeft(remaining);
      return false;
    }
  };
  // Check immediately
  const isExpired = checkExpiry();
  if (isExpired) return;
  // Otherwise start interval
  const interval = setInterval(checkExpiry, 1000);
  return () => clearInterval(interval);
}, [order?.expiresAt, order?.paid]);

  if (!order) return <div className={styles.loading}>Loading order details...</div>;
  if (expired) return <div className={styles.expired}>⏰ Order expired. Please create a new order.</div>;

  const minutes = Math.floor((timeLeft || 0) / 60000);
  const seconds = Math.floor(((timeLeft || 0) % 60000) / 1000);
  const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;


  if (order.paid) {
  return (
    <div className={styles.container}>
      <div className={styles.successIcon}>🎉</div>
      <h2 className={styles.title}>Payment confirmed!</h2>
      <div className={styles.subtitle}>Your gift card(s) are ready</div>
      {codes.length > 0 ? (
        <div className={styles.codesList}>
          {codes.map((item, idx) => (
            <div key={idx} className={styles.codeCard}>
              <div className={styles.codeHeader}>
                <strong>{item.giftCardType}</strong>
              </div>
              <div className={styles.codeBox}>{item.code}</div>
              <button
                className={styles.copyButton}
                onClick={() => navigator.clipboard.writeText(item.code)}
              >
                📋 Copy code
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.loadingCodes}>Loading your gift card codes...</div>
      )}
      <div className={styles.note}>
        We've also sent a link to your email address. You can retrieve the codes later.
      </div>
    </div>
  );
}
  

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Order #{uid}</h2>
      <div className={styles.subtitle}>Gift card purchase</div>

      {timeLeft !== null && (
        <div className={styles.timerCard}>
          <div className={styles.timerLabel}>Complete payment within</div>
          <div className={styles.timer}>{timeString}</div>
        </div>
      )}

      <div className={styles.paymentDetails}>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Amount</span>
          <span className={styles.detailValue}>
            {order.expectedAmount} {order.currency}
          </span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Network</span>
          <span className={styles.detailValue}>{order.network}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Address</span>
          <div className={styles.addressContainer}>
            <div className={styles.addressValue}>
              <span className={styles.addressText}>{order.address}</span>
              <button
                className={styles.copyIconButton}
                onClick={copyAddress}
                title="Copy address"
              >
                📋
              </button>
            </div>
            {addressCopied ? <div className={styles.copiedMessage}>Copied!</div> : <div className={styles.nocopiedMessage}></div>}
          </div>
        </div>
      </div>

      <div className={styles.qrWrapper}>
        <QRCodeSVG value={order.address} size={160} />
      </div>

      <div className={styles.statusBadge}>⏳ Waiting for payment...</div>
    </div>
  );
}