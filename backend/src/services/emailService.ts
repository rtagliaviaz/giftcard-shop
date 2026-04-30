import nodemailer from 'nodemailer';
import config from '../config';

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: {
    user: config.email.auth.user,
    pass: config.email.auth.pass,
  },
});


export async function sendOrderConfirmationEmail(to: string, orderUid: string): Promise<void> {
  const frontendUrl = config.clientUrl;
  const orderLink = `${frontendUrl}/order/${orderUid}`;
  const subject = `Your Gift Card Order #${orderUid}`;
  const text = `
    Thank you for your purchase!

    Your gift card codes are ready. You can retrieve them at any time using the following link:
    ${orderLink}

    Please keep this link safe. It will give you access to your gift card codes.

    If you have any questions, contact support.
  `;

  await transporter.sendMail({
    from: config.email.from,
    to,
    subject,
    text,
  });
}