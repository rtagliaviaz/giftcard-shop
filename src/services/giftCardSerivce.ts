import { AppDataSource } from '../db/data-source';
import { Orders, OrderItems, GiftCardCodes } from '../entity/GiftCardDatabase';

/**
 * Deliver gift card codes for a paid order.
 * - For each order item, claim the required quantity of unused codes.
 * - Mark codes as used and associate them with the order item.
 * - Send an email with all codes.
 */
export async function deliverGiftCards(order: Orders): Promise<void> {
  console.log(`Delivering gift cards for order ${order.id}`);

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const codesRepo = queryRunner.manager.getRepository(GiftCardCodes);
    const itemsRepo = queryRunner.manager.getRepository(OrderItems);

    // Load order items with their gift card details (you may need to populate giftCard relation)
    const items = await itemsRepo.find({
      where: { order: { id: order.id } },
      relations: ['giftCard'], // assuming you have a @ManyToOne relation to GiftCard entity
    });

    const deliveredCodes: Array<{ code: string; giftCardName: string; amount: number }> = [];

    for (const item of items) {
      const giftCardId = item.giftCardId;
      const quantity = item.quantity;

      // Find available (unused) codes for this gift card
      const availableCodes = await codesRepo
        .createQueryBuilder('code')
        .where('code.gift_card_id = :giftCardId', { giftCardId })
        .andWhere('code.used = :used', { used: false })
        .orderBy('code.id', 'ASC')
        .limit(quantity)
        .getMany();

      if (availableCodes.length < quantity) {
        throw new Error(`Insufficient inventory for gift card ID ${giftCardId}. Need ${quantity}, found ${availableCodes.length}`);
      }

      // Mark codes as used and link to order item
      for (const code of availableCodes) {
        code.used = true; // Mark as used to prevent future allocation
        code.orderItem = item;
        code.deliveredAt = new Date();
        await codesRepo.save(code);
        deliveredCodes.push({
          code: code.code,
          giftCardName: item.giftCard?.name || `Gift Card #${giftCardId}`, // assuming giftCard has a name field
          amount: item.unitAmount, // or item.totalAmount depending on how you want to display it
        });
      }
    }

    await queryRunner.commitTransaction();

    // Send email with codes
    await sendOrderConfirmationEmail(order.email, order.id, deliveredCodes);
    console.log(`Gift cards delivered for order ${order.id}`);
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error(`Failed to deliver gift cards for order ${order.id}:`, error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}

/**
 * Simulate sending an email (replace with actual email service).
 */
async function sendOrderConfirmationEmail(
  to: string,
  orderId: number,
  codes: Array<{ code: string; giftCardName: string; amount: number }>
): Promise<void> {
  const subject = `Your Gift Card Codes for Order #${orderId}`;
  let body = `Thank you for your purchase!\n\nHere are your gift card codes:\n\n`;
  for (const item of codes) {
    body += `${item.giftCardName} ($${item.amount}): ${item.code}\n`;
  }
  body += `\nPlease keep this email safe.\n`;

  // For now, log to console. In production, use Nodemailer, SendGrid, etc.
  console.log(`\n--- EMAIL TO ${to} ---\nSubject: ${subject}\n\n${body}\n--- END EMAIL ---\n`);

  // Example using nodemailer (uncomment and configure if needed):
  /*
  const transporter = nodemailer.createTransport({ ... });
  await transporter.sendMail({
    from: 'no-reply@yourstore.com',
    to,
    subject,
    text: body,
  });
  */
}