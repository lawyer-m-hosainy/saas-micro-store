import { describe, expect, it } from 'vitest';
import { computeHourlyRate, RateInputs } from './FreelanceHourlyRateCalculator';

const base = (overrides: Partial<RateInputs> = {}): RateInputs => ({
  targetAnnualIncome: 100000,
  monthlyBusinessExpenses: 0,
  vacationDaysPerYear: 0,
  publicHolidays: 0,
  billableHoursPerDay: 8,
  workDaysPerWeek: 5,
  taxRatePct: 0,
  ...overrides,
});

describe('computeHourlyRate', () => {
  it('computes working days as work days/week * 52 minus vacation and holidays', () => {
    const r = computeHourlyRate(base({ vacationDaysPerYear: 20, publicHolidays: 10 }));
    // 5*52=260 - 20 - 10 = 230
    expect(r.workingDaysPerYear).toBe(230);
  });

  it('computes billable hours per year as working days * hours/day', () => {
    const r = computeHourlyRate(base({ vacationDaysPerYear: 0, publicHolidays: 0, billableHoursPerDay: 6 }));
    // 260 days * 6h = 1560
    expect(r.billableHoursPerYear).toBe(1560);
  });

  it('divides the gross required income by billable hours to get the hourly rate', () => {
    const r = computeHourlyRate(base({ targetAnnualIncome: 260000, billableHoursPerDay: 8, taxRatePct: 0, monthlyBusinessExpenses: 0 }));
    // billable hours = 260*8=2080, hourlyRate = 260000/2080 = 125
    expect(r.hourlyRate).toBeCloseTo(125, 2);
  });

  it('grosses up the required income to account for the tax rate', () => {
    const r = computeHourlyRate(base({ targetAnnualIncome: 90000, taxRatePct: 10 }));
    // grossRequired = 90000 / 0.9 = 100000
    expect(r.grossRequiredIncome).toBeCloseTo(100000, 2);
  });

  it('includes monthly business expenses annualized in the required income', () => {
    const r = computeHourlyRate(base({ targetAnnualIncome: 100000, monthlyBusinessExpenses: 1000, taxRatePct: 0 }));
    expect(r.grossRequiredIncome).toBeCloseTo(112000, 2);
  });

  it('computes daily rate as hourly rate times billable hours per day', () => {
    const r = computeHourlyRate(base({ billableHoursPerDay: 6 }));
    expect(r.dailyRate).toBeCloseTo(r.hourlyRate * 6, 5);
  });

  it('flags billable hours per day under 4 as too low', () => {
    expect(computeHourlyRate(base({ billableHoursPerDay: 3 })).isBillableHoursTooLow).toBe(true);
    expect(computeHourlyRate(base({ billableHoursPerDay: 6 })).isBillableHoursTooLow).toBe(false);
  });

  it('never lets working days per year drop to zero or below', () => {
    const r = computeHourlyRate(base({ vacationDaysPerYear: 200, publicHolidays: 200 }));
    expect(r.workingDaysPerYear).toBeGreaterThan(0);
  });
});
