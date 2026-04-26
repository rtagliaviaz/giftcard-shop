import axios from 'axios';
import type { CreateOrderRequest, OrderCodeResponse, OrderStatusResponse } from '../types';
import { API_ROUTES } from '../constants/apiRoutes';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const createOrder = (data: CreateOrderRequest) =>
  api.post<{ uid: string; address: string; expiresAt: string; network: string; currency: string }>(API_ROUTES.CREATE_ORDER, data);

export const getOrderStatus = (uid: string) =>
  api.get<OrderStatusResponse>(API_ROUTES.ORDER_STATUS(uid));

export const getOrderCode = (uid: string) =>
  api.get<OrderCodeResponse>(API_ROUTES.ORDER_CODES(uid));