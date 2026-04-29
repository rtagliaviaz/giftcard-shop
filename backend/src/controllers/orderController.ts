import { Request, Response } from 'express';
import { AppDataSource } from '../db/data-source';
import { Orders, OrderItems, Settings, GiftCardCodes } from '../entity/GiftCardDatabase';
import { generateAddressFromXpub } from '../services/walletService';
import { nanoid } from 'nanoid';
import { OrderItem } from '../types/OrdersInterfaces';
import { SUPPORTED_NETWORKS } from '../constants/supportedNetworks';
import config from '../config';

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
  const { email, items, totalAmountRaw, network } = req.body;

  if (!email || !items?.length) {
    return res.status(400).json({ error: 'Missing email or items' });
  }

  if (!SUPPORTED_NETWORKS.includes(network)) {
    return res.status(400).json({ error: 'Unsupported network' });
  }

  const networks = config.networks;
  const currency = networks[network as keyof typeof networks].CURRENCY;

  const addressIndex = await getNextAddressIndex();
  const address = generateAddressFromXpub(addressIndex);
  const expiresAt = new Date(Date.now() + 20 * 60 * 1000); 

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
      createdAt: new Date(),
      swept: false,
      paidAt: null,
      network,
    });
    const savedOrder = await orderRepo.save(newOrder);
    const itemsRepo = queryRunner.manager.getRepository(OrderItems);

    const orderItems = items.map((item: OrderItem) => 
      itemsRepo.create({
        order: savedOrder,
        giftCardId: item.giftCardId,
        quantity: item.quantity,
        unitAmount: item.unitAmountUSD,
        totalAmount: item.unitAmountUSD * item.quantity,
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
    relations: ['orderItems'], 
  });

  if (!order) return res.status(404).json({ error: 'No order found with the provided UID.' });

  // Convert expected amount back to human‑readable (if USDT with 6 decimals)
  const expectedAmountHuman = order.expectedAmount / 1_000_000;

  res.status(200).json({
    paid: order.status === 'paid',
    address: order.address,
    expectedAmount: expectedAmountHuman,
    expiresAt: order.expiresAt,
    status: order.status,
    network: order.network,
    currency: order.currency,
  });
};


export const getOrderCodes = async (req: Request, res: Response) => {
  const { uid } = req.params;
  const orderRepo = AppDataSource.getRepository(Orders);
  const order = await orderRepo.findOne({
    where: { uid: uid as string },
    relations: ['orderItems', 'orderItems.giftCard', 'orderItems.giftCard.type', 'orderItems.giftCard.type'], // load related gift card and its type
  });

  if (!order) return res.status(404).json({ error: 'Order not found' });

  if (order.status !== 'paid') {
    return res.status(400).json({ error: 'Order not paid yet' });
  }

  const codesRepo = AppDataSource.getRepository(GiftCardCodes);
  const codes = await codesRepo.find({
    where: { orderItem: { order: { id: order.id } } },
    relations: ['giftCard', 'giftCard.type'],
  });


  const response = codes.map((code) => ({
    code: code.code,
    giftCardId: code.id,
    giftCardType: code.giftCard.type.name,
    denomination: code.giftCard.denomination,
    deliveredAt: code.deliveredAt,
  }));

  res.status(200).json(response);

}