import request from 'supertest';
import app from '../app';
import { AppDataSource } from '../db/data-source';
import { initializeDatabase } from '../db/init';

import { GiftCardType} from '../entity/GiftCardDatabase';

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
});


describe('GET /api/gift-card-types', () => {
  it('should retrieve active gift card types with their active denominations', async () => {
    const typeRepo = AppDataSource.getRepository(GiftCardType);
    let types = await typeRepo.find({
      where: { active: true },
      relations: ['denominations'],
      order: { name: 'ASC' },
    });
    expect(types.length).toBeGreaterThan(0);
    types.forEach(type => {
      expect(type.active).toBe(true);
      type.denominations.forEach(denomination => {
        expect(denomination.active).toBe(true);
      });
    });
  });
})

describe('GET /api/gift-card-types/:id', () => {
  it('should retrieve a specific active gift card type by ID with its active denominations', async () => {
    const typeRepo = AppDataSource.getRepository(GiftCardType);
    const steamType = await typeRepo.findOneBy({ name: 'Steam Gift Card' });
    expect(steamType).toBeDefined();
    if (steamType) {
      const response = await request(app).get(`/api/gift-card-types/${steamType.id}`);
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(steamType.id);
      expect(response.body.name).toBe(steamType.name);
      expect(response.body.image).toBe(steamType.image);
      response.body.denominations.forEach((denomination: any) => {
        expect(denomination.active).toBe(true);
      });
    } else {
      throw new Error('Steam Gift Card type not found in database');
    }
  });
})