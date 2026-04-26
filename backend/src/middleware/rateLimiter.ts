import rateLimit from 'express-rate-limit';
import { rateLimiterInterface } from '../types/middlewareInterface';

export const orderInfoLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
} as rateLimiterInterface);
