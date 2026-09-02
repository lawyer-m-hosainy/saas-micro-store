import { describe, expect, it } from 'vitest';
import { evaluateVendors, VendorEntry } from './VendorEvaluationMatrix';

const vendor = (overrides: Partial<VendorEntry> = {}): VendorEntry => ({
  id: '1', name: 'V', unitPrice: 10, quantity: 100, extraCosts: 200,
  priceScore: 8, qualityScore: 6, deliveryScore: 4,
  ...overrides,
});

describe('evaluateVendors', () => {
  it('computes TCO as unit price times quantity plus extra costs', () => {
    const [r] = evaluateVendors([vendor()], { pricePct: 40, qualityPct: 40, deliveryPct: 20 });
    expect(r.tco).toBe(10 * 100 + 200);
  });

  it('computes the weighted score from the three criteria and their weights', () => {
    const [r] = evaluateVendors([vendor()], { pricePct: 50, qualityPct: 30, deliveryPct: 20 });
    // (8*50 + 6*30 + 4*20) / 100 = (400+180+80)/100 = 6.6
    expect(r.weightedScore).toBeCloseTo(6.6, 5);
  });

  it('ranks a vendor with a higher weighted score above a lower one', () => {
    const results = evaluateVendors(
      [vendor({ id: 'a', priceScore: 9, qualityScore: 9, deliveryScore: 9 }), vendor({ id: 'b', priceScore: 2, qualityScore: 2, deliveryScore: 2 })],
      { pricePct: 34, qualityPct: 33, deliveryPct: 33 }
    );
    const best = results.reduce((x, y) => (y.weightedScore > x.weightedScore ? y : x));
    expect(best.id).toBe('a');
  });

  it('gives a full-weight-on-price vendor a score equal to its price score alone', () => {
    const [r] = evaluateVendors([vendor({ priceScore: 7 })], { pricePct: 100, qualityPct: 0, deliveryPct: 0 });
    expect(r.weightedScore).toBeCloseTo(7, 5);
  });
});
