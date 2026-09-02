import { describe, expect, it } from 'vitest';
import { computePropertyRoi } from './RealEstateRoiCalculator';

describe('computePropertyRoi', () => {
  it('computes gross yield as annual rent over purchase price', () => {
    const r = computePropertyRoi({
      id: '1', name: 'A', purchasePrice: 1000000, annualRent: 80000,
      vacancyRatePct: 0, annualMaintenancePct: 0, annualPropertyTax: 0, appreciationPct: 0,
    });
    expect(r.grossYieldPct).toBeCloseTo(8, 5);
  });

  it('deducts vacancy, maintenance, and tax to compute net yield', () => {
    const r = computePropertyRoi({
      id: '1', name: 'A', purchasePrice: 1000000, annualRent: 100000,
      vacancyRatePct: 10, annualMaintenancePct: 2, annualPropertyTax: 3000, appreciationPct: 0,
    });
    // effective rent = 90000, maintenance = 20000, net income = 90000 - 20000 - 3000 = 67000
    expect(r.netAnnualIncome).toBe(67000);
    expect(r.netYieldPct).toBeCloseTo(6.7, 5);
  });

  it('compounds appreciation over 5 years', () => {
    const r = computePropertyRoi({
      id: '1', name: 'A', purchasePrice: 100000, annualRent: 0,
      vacancyRatePct: 0, annualMaintenancePct: 0, annualPropertyTax: 0, appreciationPct: 10,
    });
    expect(r.valueIn5Years).toBeCloseTo(100000 * Math.pow(1.1, 5), 2);
  });

  it('handles a zero purchase price without dividing by zero', () => {
    const r = computePropertyRoi({
      id: '1', name: 'A', purchasePrice: 0, annualRent: 1000,
      vacancyRatePct: 0, annualMaintenancePct: 0, annualPropertyTax: 0, appreciationPct: 5,
    });
    expect(r.grossYieldPct).toBe(0);
    expect(r.netYieldPct).toBe(0);
    expect(Number.isFinite(r.grossYieldPct)).toBe(true);
  });
});
