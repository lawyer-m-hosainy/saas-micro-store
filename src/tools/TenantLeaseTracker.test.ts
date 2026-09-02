import { describe, expect, it } from 'vitest';
import { analyzeLeases, buildRenewalLetter, LeaseEntry } from './TenantLeaseTracker';

const lease = (overrides: Partial<LeaseEntry> = {}): LeaseEntry => ({
  id: '1', tenantName: 'Ahmed', unit: 'Unit 1', monthlyRent: 5000, leaseEndDate: '2025-01-01', lastPaymentPaid: true,
  ...overrides,
});

const REF_DATE = new Date('2025-01-01T00:00:00');

describe('analyzeLeases', () => {
  it('computes zero days remaining when the lease ends today', () => {
    const [r] = analyzeLeases([lease({ leaseEndDate: '2025-01-01' })], REF_DATE);
    expect(r.daysRemaining).toBe(0);
    expect(r.urgency).toBe('critical');
  });

  it('marks a lease as expired once its end date is in the past', () => {
    const [r] = analyzeLeases([lease({ leaseEndDate: '2024-12-01' })], REF_DATE);
    expect(r.daysRemaining).toBeLessThan(0);
    expect(r.urgency).toBe('expired');
  });

  it('marks a lease within 30 days as critical', () => {
    const [r] = analyzeLeases([lease({ leaseEndDate: '2025-01-20' })], REF_DATE);
    expect(r.daysRemaining).toBe(19);
    expect(r.urgency).toBe('critical');
  });

  it('marks a lease between 31 and 60 days as warning', () => {
    const [r] = analyzeLeases([lease({ leaseEndDate: '2025-02-15' })], REF_DATE);
    expect(r.daysRemaining).toBe(45);
    expect(r.urgency).toBe('warning');
  });

  it('marks a lease beyond 60 days as ok', () => {
    const [r] = analyzeLeases([lease({ leaseEndDate: '2025-06-01' })], REF_DATE);
    expect(r.urgency).toBe('ok');
  });
});

describe('buildRenewalLetter', () => {
  it('includes the tenant name, unit, end date, and rent amount', () => {
    const letter = buildRenewalLetter(lease({ tenantName: 'سارة', unit: 'شقة 5', monthlyRent: 7000, leaseEndDate: '2025-03-10' }));
    expect(letter).toContain('سارة');
    expect(letter).toContain('شقة 5');
    expect(letter).toContain('2025-03-10');
    expect(letter).toContain('7,000');
  });
});
