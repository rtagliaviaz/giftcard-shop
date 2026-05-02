import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getOrderStatus, cancelOrder } from '../../services/api';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useExpiryTimer } from '../../hooks/useExpiryTimer';
import { useOrderData } from '../../hooks/useOrderData';
import { PaidView } from './PaidView';
import { PendingView } from './PendingView';
import styles from './OrderStatus.module.css';

export default function OrderStatus() {
  const { uid } = useParams<{ uid: string }>();
  const { order, codes, updateOrder, setOrderCodes } = useOrderData(uid);
  const { isPaid, orderCodes } = useWebSocket(uid || null);
  const [addressCopied, setAddressCopied] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const { timeLeft, expired } = useExpiryTimer(order?.expiresAt, order?.paid ?? false);

  const copyAddress = () => {
    if (order?.address) {
      navigator.clipboard.writeText(order.address);
      setAddressCopied(true);
      setTimeout(() => setAddressCopied(false), 2000);
    }
  };

  // refresh order status when WebSocket says paid
  useEffect(() => {
    if (isPaid && uid) {
      getOrderStatus(uid).then(res => updateOrder(res.data));
    }
  }, [isPaid, uid]);

  // update codes when WebSocket sends them directly
  useEffect(() => {
    if (orderCodes && orderCodes.length > 0) {
      setOrderCodes(orderCodes);
    }
  }, [orderCodes]);

  const handleCancelOrder = async () => {
  if (!uid) return;
  setCancelling(true);
  try {
    const response = await cancelOrder(uid);
    if (response.status === 200) {
      const statusRes = await getOrderStatus(uid);
      updateOrder(statusRes.data);
    } else {
      alert(response.data.error || 'Failed to cancel order');
    }
  } catch (error: any) {
    console.error('Cancel error:', error);
    alert(error.response?.data?.error || 'Network error. Please try again.');
  } finally {
    setCancelling(false);
  }
};

  if (!order) return <div className={styles.loading}>Loading order details...</div>;
  if (expired) return <div className={styles.expired}>⏰ Order expired. Please create a new order.</div>;
  if (order.status === 'cancelled') {
    return <div className={styles.expired}>Order has been cancelled.</div>;
  }

  if (order.paid) {
    return <PaidView codes={codes} />;
  }

  return (
    <PendingView
      uid={uid as string}
      timeLeft={timeLeft}
      order={order}
      addressCopied={addressCopied}
      copyAddress={copyAddress}
      cancelling={cancelling}
      handleCancelOrder={handleCancelOrder}
    />
  );
}