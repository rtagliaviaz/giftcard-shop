import { AppDataSource } from '../db/data-source';
import { Orders } from '../entity/Orders';

export async function markExpiredOrders() {
  const orderRepo = AppDataSource.getRepository(Orders);
  const now = new Date();
  const result = await orderRepo
    .createQueryBuilder()
    .update(Orders)
    .set({ status: 'expired' })
    .where("status = 'pending' AND expiresAt < :now", { now })
    .execute();
  if (result.affected && result.affected > 0) {
    console.log(`✅ Marked ${result.affected} expired orders.`);
  }
}