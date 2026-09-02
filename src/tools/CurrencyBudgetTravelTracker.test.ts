import { describe, expect, it } from 'vitest';
import { computeBudgetSummary, convertToHome, Expense } from './CurrencyBudgetTravelTracker';

const rates = { USD: 50, EUR: 55, EGP: 1 };

describe('convertToHome', () => {
  it('converts an expense using its currency rate', () => {
    const e: Expense = { id: '1', description: 'Hotel', amount: 100, currency: 'USD' };
    expect(convertToHome(e, rates)).toBe(5000);
  });

  it('treats an unknown currency as a 1:1 rate', () => {
    const e: Expense = { id: '1', description: 'X', amount: 100, currency: 'XYZ' };
    expect(convertToHome(e, rates)).toBe(100);
  });
});

describe('computeBudgetSummary', () => {
  const expenses: Expense[] = [
    { id: '1', description: 'Hotel', amount: 100, currency: 'USD' }, // 5000 EGP
    { id: '2', description: 'Food', amount: 500, currency: 'EGP' },
  ];

  it('sums all expenses converted to home currency', () => {
    const s = computeBudgetSummary(expenses, rates, 10000, 1);
    expect(s.totalHome).toBe(5500);
  });

  it('computes remaining budget as budget minus total spent', () => {
    const s = computeBudgetSummary(expenses, rates, 10000, 1);
    expect(s.remaining).toBe(4500);
  });

  it('flags overBudget when spending exceeds the budget', () => {
    const s = computeBudgetSummary(expenses, rates, 1000, 1);
    expect(s.overBudget).toBe(true);
    expect(s.remaining).toBeLessThan(0);
  });

  it('divides total spend evenly across the group size for per-person cost', () => {
    const s = computeBudgetSummary(expenses, rates, 10000, 2);
    expect(s.perPerson).toBe(2750);
  });

  it('does not divide by zero for a group size of zero', () => {
    const s = computeBudgetSummary(expenses, rates, 10000, 0);
    expect(Number.isFinite(s.perPerson)).toBe(true);
  });
});
