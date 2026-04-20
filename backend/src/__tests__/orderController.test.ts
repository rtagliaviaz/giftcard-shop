import request from 'supertest';
import app from '../app';
import { AppDataSource } from '../db/data-source';
import { initializeDatabase } from '../db/init';

import { GiftCard, GiftCardType, Settings } from '../entity/GiftCardDatabase';

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await initializeDatabase();

  const typeRepo = AppDataSource.getRepository(GiftCardType);
  let steamType = await typeRepo.findOneBy({ name: 'Steam Gift Card' });
  if (!steamType) {
    steamType = typeRepo.create({
      name: 'Steam Gift Card',
      image: '/assets/steam.webp',
      active: true,
    });
    await typeRepo.save(steamType);
  }

  const giftCardRepo = AppDataSource.getRepository(GiftCard);
  const existingGiftCard = await giftCardRepo.findOneBy({ id: 1 });
  if (!existingGiftCard) {
    const giftCard = giftCardRepo.create({
      id: 1,
      denomination: 10.00,
      active: true,
      type: steamType,
    });
    await giftCardRepo.save(giftCard);
  }

  const settingsRepo = AppDataSource.getRepository(Settings);
  let setting = await settingsRepo.findOneBy({ settingKey: 'last_address_index' });
  if (!setting) {
    setting = settingsRepo.create({ settingKey: 'last_address_index', value: 0 });
    await settingsRepo.save(setting);
  }
});


afterAll(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});

describe('POST /api/create-order', () => {
  it('should create an order and return a unique uid', async () => {
    const response = await request(app)
      .post('/api/create-order')
      .send({
        email: 'test@example.com',
        items: [{ giftCardId: 1, quantity: 1, unitAmountUSD: 10 }],
        totalAmountRaw: 10000000,
        termsAccepted: true,
        network: 'sepolia'
      });


    if (response.status !== 201) {
      console.error('Error response:', response.body);
    }

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('uid');
    expect(response.body).toHaveProperty('address');
  });

  it('should return 400 if email is missing', async () => {
    const response = await request(app)
      .post('/api/create-order')
      .send({
        items: [{ giftCardId: 1, quantity: 1, unitAmountUSD: 10 }],
        totalAmountRaw: 10000000,
        termsAccepted: true,
        network: 'base-sepolia'
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Missing email or items');
  });

  it('should return 400 if items are missing', async () => {
    const response = await request(app)
      .post('/api/create-order')
      .send({
        email: 'test@example.com',
        totalAmountRaw: 10000000,
        termsAccepted: true,
        network: 'base-sepolia'
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Missing email or items');
  });

  it('should increment address index for each new order', async () => {
    const settingsRepo = AppDataSource.getRepository(Settings);
    const initialSetting = await settingsRepo.findOneBy({ settingKey: 'last_address_index' });
    const initialIndex = initialSetting ? initialSetting.value : 0;

    await request(app)
      .post('/api/create-order')
      .send({
        email: 'test@example.com',
        items: [{ giftCardId: 1, quantity: 1, unitAmountUSD: 10 }],
        totalAmountRaw: 10000000,
        termsAccepted: true,
        network: 'sepolia'
      });

    const updatedSetting = await settingsRepo.findOneBy({ settingKey: 'last_address_index' });
    const updatedIndex = updatedSetting ? updatedSetting.value : 0;

    expect(updatedIndex).toBe(initialIndex + 1);
  });

  it('should generate a valid address based on the index', async () => {
    const response = await request(app)
      .post('/api/create-order')
      .send({
        email: 'test@example.com',
        items: [{ giftCardId: 1, quantity: 1, unitAmountUSD: 10 }],
        totalAmountRaw: 10000000,
        termsAccepted: true,
        network: 'sepolia'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('address');
  });
});



describe('GET /api/order-status/:uid', () => {
  it('should retrieve order details by uid', async () => {
    // First, create an order to get a valid uid
    const createResponse = await request(app)
      .post('/api/create-order')
      .send({
        email: 'test@example.com',
        items: [{ giftCardId: 1, quantity: 1, unitAmountUSD: 10 }],
        totalAmountRaw: 10000000,
        termsAccepted: true,
        network: 'sepolia'
      });

    const uid = createResponse.body.uid
    const getResponse = await request(app).get(`/api/order-status/${uid}`);
    expect(getResponse.status).toBe(200);
    expect(getResponse.body).toHaveProperty('paid');
    expect(getResponse.body).toHaveProperty('address');
    expect(getResponse.body).toHaveProperty('expectedAmount');
    expect(getResponse.body).toHaveProperty('status');
    expect(getResponse.body).toHaveProperty('expiresAt');

  });

  it ('should return 404 for non-existent uid', async () => {
    const getResponse = await request(app).get('/api/order-status/non-existent-uid');
    expect(getResponse.status).toBe(404);
  });
})
