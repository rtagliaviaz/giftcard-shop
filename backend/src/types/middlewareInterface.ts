export interface rateLimiterInterface {
  windowMs: number;
  limit: number;
  message: { error: string };
  standardHeaders: boolean;
  legacyHeaders: boolean;
}