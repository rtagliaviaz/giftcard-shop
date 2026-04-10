import { Request, Response } from 'express';
import { AppDataSource } from '../db/data-source';
import { Orders, OrderItems, Settings } from '../entity/GiftCardDatabase';
import { generateAddressFromXpub } from '../services/walletService';
import { nanoid } from 'nanoid';

// Helper to get next address index (sequential)
async function getNextAddressIndex(): Promise<number> {
    const settingsRepo = AppDataSource.getRepository(Settings);
    let setting = await settingsRepo.findOneBy({ settingKey: 'last_address_index' });
    if (!setting) {
        setting = settingsRepo.create({ settingKey: 'last_address_index', value: 0 });
    }
    setting.value += 1;
    await settingsRepo.save(setting);
    return setting.value;
}

export const createOrder = async (req: Request, res: Response) => {
  const { email, items, totalAmountRaw, termsAccepted, currency = 'USDT' } = req.body;

  console.log('Create order request:', { email, items, totalAmountRaw, termsAccepted, currency });

  if (!email || !items?.length) {
    return res.status(400).json({ error: 'Missing email or items' });
  }

  const addressIndex = await getNextAddressIndex();
  const address = generateAddressFromXpub(addressIndex);
  const expiresAt = new Date(Date.now() + 20 * 60 * 1000); // 20 min
  const withdrawnDeadline = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days (example)

  const uid = `ORD_${nanoid(10)}`;

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const orderRepo = queryRunner.manager.getRepository(Orders);
    const newOrder = orderRepo.create({
      uid,
      address,
      addressIndex,
      currency,
      email,
      expectedAmount: totalAmountRaw,
      status: 'pending',
      expiresAt,
      withdrawnDeadline,
      termsAccepted,
      createdAt: new Date(),
      swept: false,
      paidAt: null,
    });
    const savedOrder = await orderRepo.save(newOrder);

    const itemsRepo = queryRunner.manager.getRepository(OrderItems);
    console.log('Creating order items:', items);  
    const orderItems = items.map((item: any) =>
      itemsRepo.create({
        order: savedOrder,
        giftCardId: item.giftCardId,
        quantity: item.quantity,
        unitAmount: item.amountUSD,
        totalAmount: item.totalUSD,
      })
    );
    await itemsRepo.save(orderItems);

    await queryRunner.commitTransaction();

    res.status(201).json({
      uid: savedOrder.uid,
      address: savedOrder.address,
      expiresAt: savedOrder.expiresAt,
    });
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  } finally {
    await queryRunner.release();
  }
};

export const getOrderStatus = async (req: Request, res: Response) => {
  const { uid } = req.params;
  const orderRepo = AppDataSource.getRepository(Orders);
  const order = await orderRepo.findOne({
    where: { uid: uid as string },
    relations: ['orderItems'], // if you have the relation defined
  });

  if (!order) return res.status(404).json({ error: 'Order not found' });

  // Convert expected amount back to human‑readable (if USDT with 6 decimals)
  const expectedAmountHuman = order.expectedAmount / 1_000_000;

  res.json({
    paid: order.status === 'paid',
    address: order.address,
    expectedAmount: expectedAmountHuman,
    expiresAt: order.expiresAt,
    status: order.status,
  });
};