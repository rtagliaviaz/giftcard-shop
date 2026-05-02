import { useCallback, useEffect, useState } from 'react';
import { getOrderStatus, getOrderCode } from '../services/api';
import type { OrderStatusResponse, CodeItem } from '../types';

export const useOrderData = (uid: string | undefined) => {
  const [order, setOrder] = useState<OrderStatusResponse | null>(null);
  const [codes, setCodes] = useState<CodeItem[]>([]);

  const fetchData = async (uid: string) => {
    const statusRes = await getOrderStatus(uid);
    setOrder(statusRes.data);
    if (statusRes.data.paid) {
      const codeRes = await getOrderCode(uid);
      setCodes(Array.isArray(codeRes.data) ? codeRes.data : []);
    }
  };

  useEffect(() => {
    if (uid) fetchData(uid);
  }, [uid]);

  const updateOrder = useCallback((orderData: OrderStatusResponse) => setOrder(orderData), []);
  const setOrderCodes = useCallback((newCodes: CodeItem[]) => setCodes(newCodes), []);

  return { order, codes, updateOrder, setOrderCodes, fetchData };
};