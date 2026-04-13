import { Router } from 'express';
import { createOrder, getOrderStatus } from '../controllers/orderController';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});
router.post('/create-order', createOrder);
router.get('/order-status/:uid', getOrderStatus);
// more routes: /order-code/:id, /cancel-order/:id, etc.

export default router;