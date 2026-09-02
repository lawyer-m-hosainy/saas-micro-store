import { describe, expect, it } from 'vitest';
import { computeRunway } from './SaasRunwayCalculator';

describe('computeRunway', () => {
  it('computes net burn as expenses minus revenue', () => {
    const r = computeRunway({
      cashBalance: 100000,
      monthlyRevenue: 10000,
      monthlyExpenses: 15000,
      monthlyRevenueGrowthPct: 0,
      marketingSpend: 0,
      newCustomersFromSpend: 0,
    });
    expect(r.netBurn).toBe(5000);
  });

  it('computes runway in months for a flat burn with no revenue growth', () => {
    const r = computeRunway({
      cashBalance: 50000,
      monthlyRevenue: 0,
      monthlyExpenses: 10000,
      monthlyRevenueGrowthPct: 0,
      marketingSpend: 0,
      newCustomersFromSpend: 0,
    });
    // 50000 / 10000 = 5 months exactly to hit zero
    expect(r.runwayMonths).toBe(5);
    expect(r.isSafe).toBe(false);
  });

  it('returns null runway when the company is already cash-flow positive', () => {
    const r = computeRunway({
      cashBalance: 10000,
      monthlyRevenue: 20000,
      monthlyExpenses: 15000,
      monthlyRevenueGrowthPct: 0,
      marketingSpend: 0,
      newCustomersFromSpend: 0,
    });
    expect(r.runwayMonths).toBeNull();
    expect(r.isSafe).toBe(true);
    expect(r.breakEvenMonth).toBe(1);
  });

  it('computes CAC as spend divided by new customers acquired', () => {
    const r = computeRunway({
      cashBalance: 100000,
      monthlyRevenue: 5000,
      monthlyExpenses: 5000,
      monthlyRevenueGrowthPct: 0,
      marketingSpend: 4000,
      newCustomersFromSpend: 20,
    });
    expect(r.cac).toBe(200);
  });

  it('returns null CAC when no new customers were attributed to the spend', () => {
    const r = computeRunway({
      cashBalance: 100000,
      monthlyRevenue: 5000,
      monthlyExpenses: 5000,
      monthlyRevenueGrowthPct: 0,
      marketingSpend: 4000,
      newCustomersFromSpend: 0,
    });
    expect(r.cac).toBeNull();
  });

  it('finds a break-even month when revenue growth eventually overtakes expenses', () => {
    const r = computeRunway({
      cashBalance: 200000,
      monthlyRevenue: 8000,
      monthlyExpenses: 10000,
      monthlyRevenueGrowthPct: 10,
      marketingSpend: 0,
      newCustomersFromSpend: 0,
    });
    expect(r.breakEvenMonth).not.toBeNull();
    expect(r.breakEvenMonth!).toBeGreaterThan(1);
  });

  it('flags runway under 6 months as unsafe', () => {
    const r = computeRunway({
      cashBalance: 15000,
      monthlyRevenue: 0,
      monthlyExpenses: 10000,
      monthlyRevenueGrowthPct: 0,
      marketingSpend: 0,
      newCustomersFromSpend: 0,
    });
    expect(r.runwayMonths).toBe(2);
    expect(r.isSafe).toBe(false);
  });
});
