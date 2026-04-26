import { Router } from 'express';
import { createOrder, getOrderStatus, getOrderCodes } from '../controllers/orderController';
import {getGiftCards, getGiftCardTypes } from '../controllers/giftCardsController';
import { API_ROUTES } from '../constants/apiRoutes';
import { orderInfoLimiter } from '../middleware/rateLimiter';
const router = Router();

router.get(API_ROUTES.HEALTH, (req, res) => {
  res.json({ status: 'ok' });
});
router.post(API_ROUTES.CREATE_ORDER, createOrder);
router.get(API_ROUTES.GET_ORDER_STATUS, orderInfoLimiter, getOrderStatus);
router.get(API_ROUTES.GET_ORDER_CODES,  orderInfoLimiter, getOrderCodes);
router.get(API_ROUTES.GET_GIFT_CARDS, getGiftCards);
router.get(API_ROUTES.GET_GIFT_CARD_TYPES, getGiftCardTypes);

export default router;