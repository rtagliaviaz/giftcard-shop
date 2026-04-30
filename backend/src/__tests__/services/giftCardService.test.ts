import { jest } from '@jest/globals';
import { AppDataSource } from '../../db/data-source';
import { initializeDatabase } from '../../db/init';
import { Orders, OrderItems, GiftCardCodes, GiftCard, GiftCardType } from '../../entity/GiftCardDatabase';
import { deliverGiftCards } from '../../services/giftCardService';
import { SOCKET_EVENTS } from '../../constants/socketEvents';

describe('deliverGiftCards (integration)', () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await initializeDatabase();

    const typeRepo = AppDataSource.getRepository(GiftCardType);
    const giftCardRepo = AppDataSource.getRepository(GiftCard);
    const codesRepo = AppDataSource.getRepository(GiftCardCodes);

    const giftCardType = typeRepo.create({
      name: 'Steam Gift Card',
      image: '/steam.png',
      active: true,
    });
    await typeRepo.save(giftCardType);

    const giftCard = giftCardRepo.create({
      denomination: 10,
      active: true,
      type: giftCardType,
    });
    await giftCardRepo.save(giftCard);

    const code1 = codesRepo.create({ code: 'CODE-001', giftCard, used: false });
    const code2 = codesRepo.create({ code: 'CODE-002', giftCard, used: false });
    await codesRepo.save([code1, code2]);
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  it('should mark codes as used, commit and send socket notification', async () => {
    const orderRepo = AppDataSource.getRepository(Orders);
    const order = orderRepo.create({
      uid: 'ORD_test123',
      address: '0x123',
      addressIndex: 0,
      currency: 'USDT',
      network: 'sepolia',
      email: 'test@example.com',
      expectedAmount: 10000000,
      status: 'paid',
      expiresAt: new Date(Date.now() + 600000),
      createdAt: new Date(),
    });
    await orderRepo.save(order);

    const itemsRepo = AppDataSource.getRepository(OrderItems);
    const giftCard = await AppDataSource.getRepository(GiftCard).findOneBy({ denomination: 10 });
    const item = itemsRepo.create({
      order,
      giftCardId: giftCard!.id,
      quantity: 2,
      unitAmount: 10,
      totalAmount: 20,
    });
    await itemsRepo.save(item);

    const mockEmit = jest.fn();
    (global as any).io = { emit: mockEmit };

    await deliverGiftCards(order);

    const codesRepo = AppDataSource.getRepository(GiftCardCodes);
    const usedCodes = await codesRepo.find({
      where: { used: true },
      relations: ['orderItem'],
    });
    expect(usedCodes).toHaveLength(2);
    expect(usedCodes.every(c => c.used)).toBe(true);
    expect(usedCodes[0].orderItem?.id).toBe(item.id);

    expect(mockEmit).toHaveBeenCalledWith(
      SOCKET_EVENTS.ORDER_CODES,
      expect.objectContaining({ uid: order.uid })
    );

  });
});

