import { describe, expect, it } from 'vitest';
import { CustomerActivity, scoreChurnRisk } from './ChurnPredictionRadar';

const customer = (overrides: Partial<CustomerActivity> = {}): CustomerActivity => ({
  id: '1', name: 'C', daysSinceLastLogin: 0, weeklyLoginsAvg: 10, supportTickets: 0, monthsSubscribed: 12, planValueUsd: 99,
  ...overrides,
});

describe('scoreChurnRisk', () => {
  it('gives a highly active, long-tenured customer a low risk score', () => {
    const r = scoreChurnRisk(customer());
    expect(r.riskScore).toBeLessThan(30);
    expect(r.tier).toBe('low');
  });

  it('gives an inactive, new, ticket-heavy customer a high risk score', () => {
    const r = scoreChurnRisk(customer({ daysSinceLastLogin: 40, weeklyLoginsAvg: 0, supportTickets: 6, monthsSubscribed: 0 }));
    expect(r.riskScore).toBeGreaterThanOrEqual(60);
    expect(r.tier).toBe('high');
  });

  it('increases risk score monotonically with days since last login', () => {
    const low = scoreChurnRisk(customer({ daysSinceLastLogin: 5 }));
    const high = scoreChurnRisk(customer({ daysSinceLastLogin: 29 }));
    expect(high.riskScore).toBeGreaterThan(low.riskScore);
  });

  it('caps the inactivity contribution at 30 days (does not keep growing past that)', () => {
    const at30 = scoreChurnRisk(customer({ daysSinceLastLogin: 30 }));
    const at90 = scoreChurnRisk(customer({ daysSinceLastLogin: 90 }));
    expect(at30.riskScore).toBe(at90.riskScore);
  });

  it('never produces a risk score outside 0-100', () => {
    const r = scoreChurnRisk(customer({ daysSinceLastLogin: 1000, weeklyLoginsAvg: 0, supportTickets: 100, monthsSubscribed: 0 }));
    expect(r.riskScore).toBeLessThanOrEqual(100);
    expect(r.riskScore).toBeGreaterThanOrEqual(0);
  });

  it('assigns medium tier for a moderate risk score between 30 and 59', () => {
    const r = scoreChurnRisk(customer({ daysSinceLastLogin: 20, weeklyLoginsAvg: 2, supportTickets: 1, monthsSubscribed: 5 }));
    expect(r.riskScore).toBeGreaterThanOrEqual(30);
    expect(r.riskScore).toBeLessThan(60);
    expect(r.tier).toBe('medium');
  });

  it('recommends a different action per tier', () => {
    const high = scoreChurnRisk(customer({ daysSinceLastLogin: 40, weeklyLoginsAvg: 0, supportTickets: 6, monthsSubscribed: 0 }));
    const low = scoreChurnRisk(customer());
    expect(high.suggestedAction).not.toBe(low.suggestedAction);
  });
});
