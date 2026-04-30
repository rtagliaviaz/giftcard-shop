// @ts-nocheck
import { jest } from '@jest/globals';

// mocks must be defined before any imports that use them
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'mock-id' }),
  }),
}));

jest.mock('../../config', () => ({
  default: {
    clientUrl: 'http://localhost:3001',
    email: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user: 'test@example.com', pass: 'test-pass' },
      from: '"Giftcard Shop" <test@example.com>',
    },
  },
}));

// import dynamically so that the mocks are already in place
const { sendOrderConfirmationEmail } = await import('../../services/emailService');
const config = (await import('../../config')).default;

describe('sendOrderConfirmationEmail', () => {
  it('should call sendMail with the correct parameters', async () => {
    const to = 'customer@example.com';
    const orderUid = 'ORD_abc123';

    await sendOrderConfirmationEmail(to, orderUid);

    // retrieve the mocked sendMail function from the transporter
    const { createTransport } = await import('nodemailer');
    const transporter = createTransport();
    const sendMailMock = transporter.sendMail;

    expect(sendMailMock).toHaveBeenCalledTimes(1);
    expect(sendMailMock).toHaveBeenCalledWith({
      from: config.email.from,
      to,
      subject: `Your Gift Card Order #${orderUid}`,
      text: expect.stringContaining(`${config.clientUrl}/order/${orderUid}`),
    });
  });
});