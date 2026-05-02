import { normalizeGiftCardName } from '../../utils/format';
import type { CodeItem } from '../../types';
import styles from './OrderStatus.module.css';

interface PaidViewProps {
  codes: CodeItem[];
}

export const PaidView = ({ codes }: PaidViewProps) => (
  <div className={styles.container}>
    <div className={styles.successIcon}>🎉</div>
    <h2 className={styles.title}>Payment confirmed!</h2>
    <div className={styles.subtitle}>Your gift card(s) are ready</div>
    {codes.length > 0 ? (
      <div className={styles.codesList}>
        {codes.map((item, idx) => (
          <div key={idx} className={styles.codeCard}>
            <div className={styles.codeHeader}>
              <strong>{normalizeGiftCardName(item.giftCardType, item.denomination)}</strong>
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