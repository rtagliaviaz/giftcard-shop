import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { SOCKET_EVENTS } from '../constants/socketEvents';

export const useWebSocket = (orderUid: string | null) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [orderCodes, setOrderCodes] = useState<any[]>([]);

  useEffect(() => {
    if (!orderUid) return;
      const newSocket = io(import.meta.env.VITE_WS_URL);
    setSocket(newSocket);

    newSocket.on(SOCKET_EVENTS.CONNECT, () => console.log('WebSocket connected'));
    newSocket.on(SOCKET_EVENTS.ORDER_PAID, (data: { uid: string }) => {
      if (data.uid === orderUid) setIsPaid(true);
    });

    newSocket.on(SOCKET_EVENTS.ORDER_CODES, (data: { uid: string, codes: any[] }) => {
      console.log('Received order codes via WebSocket for UID:', data.uid, 'Codes:', data.codes);
      if (data.uid === orderUid) setOrderCodes(data.codes);
    })
    newSocket.on(SOCKET_EVENTS.DISCONNECT, () => console.log('WebSocket disconnected'));

    return () => {
      newSocket.disconnect();
    };
  }, [orderUid]);

  return { isPaid, orderCodes, socket };
};