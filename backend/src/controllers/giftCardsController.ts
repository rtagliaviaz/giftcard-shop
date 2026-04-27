import { AppDataSource } from '../db/data-source';
import { Request, Response } from 'express';
import { GiftCard, GiftCardType } from '../entity/GiftCardDatabase';
import { GiftCardTypeResponse, GiftCardTypeInterface, GiftCardTypeByIdResponse } from '../types/GiftCardInterfaces';

export const getGiftCardTypes = async (req: Request, res: Response) => {
    try {
        const typeRepo = AppDataSource.getRepository(GiftCardType);
        const types = await typeRepo.find({
            where: { active: true },
            relations: ['denominations'],
            order: { name: 'ASC' },
        });

        const result = types.map((type: GiftCardTypeInterface) => ({
            id: type.id,
            name: type.name,
            image: type.image,
            denominations: type.denominations
                .filter(d => d.active)
                .map(d => ({
                    id: d.id,           
                    value: d.denomination,
                }))
                .sort((a, b) => a.value - b.value),
        }));

        res.json(result as GiftCardTypeResponse[]);
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

    if (!type) {
      return res.status(404).json({ error: 'Gift card type not found' });
    }

    const result = {
      id: type.id,
      name: type.name,
      image: type.image,
      denominations: type.denominations
        .filter(d => d.active)
        .map(d => ({
          id: d.id,           
          value: d.denomination,
        }))
        .sort((a, b) => a.value - b.value),
    };

    res.json(result as GiftCardTypeByIdResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch gift card type' });
  }
}