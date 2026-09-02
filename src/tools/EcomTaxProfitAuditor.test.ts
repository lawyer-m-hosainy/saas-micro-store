import { describe, expect, it } from 'vitest';
import { computeEcomAudit } from './EcomTaxProfitAuditor';

describe('computeEcomAudit', () => {
  it('walks revenue down through returns, COGS, fees, shipping, VAT, and income tax', () => {
    const r = computeEcomAudit({
      revenue: 100000,
      cogsPct: 40,
      gatewayFeePct: 2,
      shippingCostPerOrder: 50,
      ordersCount: 100,
      returnRatePct: 10,
      vatPct: 14,
      incomeTaxPct: 20,
    });

    expect(r.returnsLoss).toBe(10000);
    expect(r.cogs).toBe(40000);
    expect(r.gatewayFees).toBe(2000);
    expect(r.shippingCost).toBe(5000);

    // revenue after returns = 90000, VAT = 90000 * 0.14 = 12600
    expect(r.vatDue).toBeCloseTo(12600, 5);

    // gross profit = 90000 - 40000 - 2000 - 5000 - 12600 = 30400
    expect(r.grossProfit).toBeCloseTo(30400, 5);
    expect(r.incomeTax).toBeCloseTo(30400 * 0.2, 5);
    expect(r.netProfit).toBeCloseTo(30400 * 0.8, 5);
  });

  it('flags margins under 10% as low', () => {
    const r = computeEcomAudit({
      revenue: 100000, cogsPct: 70, gatewayFeePct: 5, shippingCostPerOrder: 100,
      ordersCount: 200, returnRatePct: 5, vatPct: 14, incomeTaxPct: 22.5,
    });
    expect(r.lowMargin).toBe(true);
  });

  it('does not apply income tax to a negative gross profit', () => {
    const r = computeEcomAudit({
      revenue: 10000, cogsPct: 90, gatewayFeePct: 10, shippingCostPerOrder: 200,
      ordersCount: 50, returnRatePct: 30, vatPct: 14, incomeTaxPct: 20,
    });
    expect(r.grossProfit).toBeLessThan(0);
    expect(r.incomeTax).toBe(0);
    expect(r.netProfit).toBe(r.grossProfit);
  });

  it('handles zero revenue without producing NaN margin', () => {
    const r = computeEcomAudit({
      revenue: 0, cogsPct: 40, gatewayFeePct: 2, shippingCostPerOrder: 50,
      ordersCount: 0, returnRatePct: 10, vatPct: 14, incomeTaxPct: 20,
    });
    expect(r.netMarginPct).toBe(0);
    expect(Number.isFinite(r.netMarginPct)).toBe(true);
  });
});
