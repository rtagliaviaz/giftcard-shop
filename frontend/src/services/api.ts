import axios from 'axios';
import type { CreateOrderRequest, CodeItem, OrderStatusResponse } from '../types';
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
  api.get<CodeItem[]>(API_ROUTES.ORDER_CODES(uid));

export const cancelOrder = (uid: string) =>
  api.post(API_ROUTES.CANCEL_ORDER(uid));