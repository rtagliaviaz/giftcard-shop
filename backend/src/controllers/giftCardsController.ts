import { AppDataSource } from '../db/data-source';
import { Request, Response } from 'express';
import { GiftCard, GiftCardType, GiftCardCodes } from '../entity/GiftCardDatabase';
import { GiftCardTypeResponse, GiftCardTypeInterface, GiftCardTypeByIdResponse } from '../types/GiftCardInterfaces';

export const getGiftCardTypes = async (req: Request, res: Response) => {
  try {
    const typeRepo = AppDataSource.getRepository(GiftCardType);
    const types = await typeRepo.find({
      where: { active: true },
      relations: ['denominations'],
      order: { name: 'ASC' },
    });

    const result = [];
    for (const type of types) {
      const denominationsWithStock = [];
      for (const denom of type.denominations) {
        // Count available (unused) codes for this denomination
        const availableCount = await AppDataSource.getRepository(GiftCardCodes).count({
          where: { giftCard: { id: denom.id }, used: false },
        });
        if (availableCount > 0) {
          denominationsWithStock.push({
            id: denom.id,
            value: denom.denomination,
          });
        }
      }
      if (denominationsWithStock.length > 0) {
        result.push({
          id: type.id,
          name: type.name,
          image: type.image,
          denominations: denominationsWithStock,
        });
      }
    }
    res.status(200).json(result as GiftCardTypeResponse[]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch gift card types' });
  }
};


export const getGiftCardTypeById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const typeRepo = AppDataSource.getRepository(GiftCardType);
    const type = await typeRepo.findOne({
      where: { id: parseInt(id as string), active: true },
      relations: ['denominations'],
    });
    if (!type) return res.status(404).json({ error: 'Gift card type not found' });

    const denominationsWithStock = [];
    for (const denom of type.denominations) {
      const availableCount = await AppDataSource.getRepository(GiftCardCodes).count({
        where: { giftCard: { id: denom.id }, used: false },
      });
      if (availableCount > 0) {
        denominationsWithStock.push({
          id: denom.id,
          value: denom.denomination,
        });
      }
    }
    res.status(200).json({
      id: type.id,
      name: type.name,
      image: type.image,
      denominations: denominationsWithStock,
    } as GiftCardTypeByIdResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch gift card type' });
  }
};