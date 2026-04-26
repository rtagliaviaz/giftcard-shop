import axios from 'axios';
import { API_ROUTES } from '../constants/apiRoutes';

export interface GiftCardType {
  id: number;
  name: string;
  image: string;
  denominations: {
    id: number;
    value: number;
  }[];
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const fetchGiftCardTypes = async (): Promise<GiftCardType[]> => {
  const response = await api.get(API_ROUTES.GIFT_CARD_TYPES);
  return response.data;
};

export const fetchGiftCardTypeById = async (id: number): Promise<GiftCardType> => {
  const response = await api.get(API_ROUTES.GIFT_CARD_TYPE_BY_ID(id));
  return response.data;
};