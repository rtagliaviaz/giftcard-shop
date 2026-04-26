import { AppDataSource } from '../db/data-source';
import { Orders, OrderItems, GiftCardCodes } from '../entity/GiftCardDatabase';
import config from '../config';
import { SOCKET_EVENTS } from '../constants/socketEvents';

export async function deliverGiftCards(order: Orders): Promise<void> {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const codesRepo = queryRunner.manager.getRepository(GiftCardCodes);
    const itemsRepo = queryRunner.manager.getRepository(OrderItems);

    // Load order items with gift card and its type relation
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


async function sendOrderConfirmationEmail(to: string, orderUid: string): Promise<void> {
  const frontendUrl = config.clientUrl;
  const orderLink = `${frontendUrl}/order/${orderUid}`;
  const subject = `Your Gift Card Order #${orderUid}`;
  const body = `
    Thank you for your purchase!

    Your gift card codes are ready. You can retrieve them at any time using the following link:
    ${orderLink}

    Please keep this link safe. It will give you access to your gift card codes.

    If you have any questions, contact support.
  `;

      console.log(`\n--- EMAIL TO ${to} ---\nSubject: ${subject}\n\n${body}\n--- END EMAIL ---\n`);

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
      relations: ['orderItems', 'orderItems.giftCard', 'orderItems.giftCard.type', 'orderItems.giftCard.type'], // load related gift card and its type
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
      expiresAt: code.expiresAt,
    }));
  }