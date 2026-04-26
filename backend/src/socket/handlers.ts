import { Server, Socket } from 'socket.io';
import { AppDataSource } from '../db/data-source';
import { Orders } from '../entity/GiftCardDatabase';
import {SOCKET_EVENTS} from '../constants/socketEvents';

export function registerSocketHandlers(io: Server) {
  io.on(SOCKET_EVENTS.CONNECTION, (socket: Socket) => {

    socket.on(SOCKET_EVENTS.CANCEL_ORDER, async (data: { uid: string }) => {
      const { uid } = data;
      try {
        const orderRepo = AppDataSource.getRepository(Orders);
        const order = await orderRepo.findOne({ where: { uid } });
        if (!order) {
          socket.emit(SOCKET_EVENTS.ORDER_CANCELLED, { uid, error: 'Order not found' });
          return;
        }
        if (order.status !== 'pending') {
          socket.emit(SOCKET_EVENTS.ORDER_CANCELLED, { uid, error: 'Order cannot be cancelled (already paid or expired)' });
          return;
        }
        if (new Date() > order.expiresAt) {
          socket.emit(SOCKET_EVENTS.ORDER_CANCELLED, { uid, error: 'Order already expired' });
          return;
        }
        order.status = 'cancelled';
        await orderRepo.save(order);
        io.emit(SOCKET_EVENTS.ORDER_CANCELLED, { uid, success: true });
      } catch (error) {
        console.error('Error cancelling order:', error);
        socket.emit(SOCKET_EVENTS.ORDER_CANCELLED, { uid, error: 'Internal server error' });
      }
    });

    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      console.log('Client disconnected:', socket.id);
    });
  });
}