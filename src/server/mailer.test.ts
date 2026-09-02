import { afterEach, describe, expect, it, vi } from 'vitest';

const sendMailMock = vi.fn().mockResolvedValue({});
const createTransportMock = vi.fn((_config: unknown) => ({ sendMail: sendMailMock }));

vi.mock('nodemailer', () => ({
  default: { createTransport: (config: unknown) => createTransportMock(config) },
}));

const ENV_KEYS = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'] as const;

function clearSmtpEnv() {
  for (const key of ENV_KEYS) delete process.env[key];
}

describe('sendOrderDeliveryEmail', () => {
  afterEach(() => {
    clearSmtpEnv();
    vi.resetModules();
    sendMailMock.mockClear();
    createTransportMock.mockClear();
  });

  it('returns false without sending when SMTP env vars are not configured', async () => {
    clearSmtpEnv();
    const { sendOrderDeliveryEmail } = await import('./mailer');
    const sent = await sendOrderDeliveryEmail({
      to: 'buyer@example.com',
      buyerName: 'أحمد',
      productTitle: 'أداة اختبار',
      orderId: '#ORD-123456',
      zipBuffer: Buffer.from('zip'),
      zipFileName: 'tool.zip',
    });
    expect(sent).toBe(false);
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it('sends the ZIP as an attachment when SMTP is configured', async () => {
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_USER = 'store@example.com';
    process.env.SMTP_PASS = 'secret';

    const { sendOrderDeliveryEmail } = await import('./mailer');
    const zipBuffer = Buffer.from('zip-bytes');
    const sent = await sendOrderDeliveryEmail({
      to: 'buyer@example.com',
      buyerName: 'أحمد',
      productTitle: 'أداة اختبار',
      orderId: '#ORD-123456',
      zipBuffer,
      zipFileName: 'tool.zip',
    });

    expect(sent).toBe(true);
    expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({
      to: 'buyer@example.com',
      attachments: [{ filename: 'tool.zip', content: zipBuffer }],
    }));
  });
});
