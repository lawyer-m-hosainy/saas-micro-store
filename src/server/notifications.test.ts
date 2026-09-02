import { describe, expect, it } from 'vitest';
import { buildOrderAlertText } from './notifications';

describe('buildOrderAlertText', () => {
  it('includes the product title, amount, buyer name/phone, and order id', () => {
    const text = buildOrderAlertText({
      id: '#ORD-123456',
      productTitle: 'أداة اختبار',
      buyerName: 'أحمد',
      buyerPhone: '0100000000',
      amountEgp: 500,
    });
    expect(text).toContain('أداة اختبار');
    expect(text).toContain('500 ج.م');
    expect(text).toContain('أحمد');
    expect(text).toContain('0100000000');
    expect(text).toContain('#ORD-123456');
  });
});
