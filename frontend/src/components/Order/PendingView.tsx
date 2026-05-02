import { QRCodeSVG } from 'qrcode.react';
import type { OrderStatusResponse } from '../../types';
import styles from './OrderStatus.module.css';

interface PendingViewProps {
  uid: string;
  timeLeft: number | null;
  order: OrderStatusResponse;
  addressCopied: boolean;
  copyAddress: () => void;
  cancelling: boolean;
  handleCancelOrder: () => void;
}

export const PendingView = ({
  uid,
  timeLeft,
  order,
  addressCopied,
  copyAddress,
  cancelling,
  handleCancelOrder,
}: PendingViewProps) => {
  const minutes = Math.floor((timeLeft || 0) / 60000);
  const seconds = Math.floor(((timeLeft || 0) % 60000) / 1000);
  const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

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
              <button className={styles.copyIconButton} onClick={copyAddress} title="Copy address">📋</button>
            </div>
            {addressCopied ? <div className={styles.copiedMessage}>Copied!</div> : <div className={styles.nocopiedMessage} />}
          </div>
        </div>
      </div>
      <div className={styles.qrWrapper}>
        <QRCodeSVG value={order.address} size={160} />
      </div>
      <div className={styles.statusBadge}>⏳ Waiting for payment...</div>
      <button
        className={styles.cancelButton}
        onClick={handleCancelOrder}
        disabled={cancelling}
      >
        {cancelling ? 'Cancelling...' : 'Cancel Order'}
      </button>
    </div>
  );
};