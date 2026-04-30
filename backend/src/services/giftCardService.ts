import { AppDataSource } from '../db/data-source';
import { Orders, OrderItems, GiftCardCodes } from '../entity/GiftCardDatabase';
import { sendOrderConfirmationEmail } from './emailService';
import { SOCKET_EVENTS } from '../constants/socketEvents';

export async function deliverGiftCards(order: Orders): Promise<void> {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const codesRepo = queryRunner.manager.getRepository(GiftCardCodes);
    const itemsRepo = queryRunner.manager.getRepository(OrderItems);

    const items = await itemsRepo.find({
      where: { order: { id: order.id } },
      relations: ['giftCard', 'giftCard.type'],
    });

    for (const item of items) {
      const giftCardId = item.giftCardId;
      const quantity = item.quantity;

      const availableCodes = await codesRepo
        .createQueryBuilder('code')
        .where('code.gift_card_id = :giftCardId', { giftCardId })
        .andWhere('code.used = :used', { used: false })
        .orderBy('code.id', 'ASC')
        .limit(quantity)
        .getMany();

      if (availableCodes.length < quantity) {
        throw new Error(`Insufficient inventory for gift card ID ${giftCardId}. Need ${quantity}, found ${availableCodes.length}`);
      }

      for (const code of availableCodes) {
        code.used = true;
        code.orderItem = item;
        code.deliveredAt = new Date();
        await codesRepo.save(code);
      }
    }

    await queryRunner.commitTransaction();

    await sendOrderCodesWithSocket(order);
    await sendOrderConfirmationEmail(order.email, order.uid);
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error(`Failed to deliver gift cards for order ${order.id}:`, error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}

async function sendOrderCodesWithSocket(order: Orders): Promise<void> {
  const io = (global as any).io;
  if (!io) {
    console.warn('Socket.io instance not available, cannot send order codes via socket');
    return;
  }

  const codes = await getOrderCodes(order.uid);

  io.emit(SOCKET_EVENTS.ORDER_CODES, { uid: order.uid, codes });
}


async function getOrderCodes(orderUid: string) {
  const orderRepo = AppDataSource.getRepository(Orders);
  const order = await orderRepo.findOne({
    where: { uid: orderUid },
    relations: ['orderItems', 'orderItems.giftCard', 'orderItems.giftCard.type', 'orderItems.giftCard.type'], 
  });

  if (!order) {
    throw new Error('Order not found');
  }

  if (order.status !== 'paid') {
    throw new Error('Order not paid yet');
  }

  const codesRepo = AppDataSource.getRepository(GiftCardCodes);
  const codes = await codesRepo.find({
    where: { orderItem: { order: { id: order.id } } },
    relations: ['giftCard', 'giftCard.type'],
  });

  return codes.map((code) => ({
    code: code.code,
    giftCardId: code.id,
    giftCardType: code.giftCard.type.name,
    deliveredAt: code.deliveredAt,
    denomination: code.giftCard.denomination,
  }));
}