import { describe, expect, it } from 'vitest';
import { computeServiceStatus, ServiceItem } from './CarMaintenanceMileageLogger';

const item = (overrides: Partial<ServiceItem> = {}): ServiceItem => ({ id: '1', name: 'Oil', intervalKm: 10000, lastServiceKm: 0, ...overrides });

describe('computeServiceStatus', () => {
  it('computes km since service and km remaining', () => {
    const s = computeServiceStatus(item({ lastServiceKm: 40000, intervalKm: 10000 }), 45000);
    expect(s.kmSinceService).toBe(5000);
    expect(s.kmRemaining).toBe(5000);
  });

  it('marks status as ok when well within the interval', () => {
    const s = computeServiceStatus(item({ lastServiceKm: 40000, intervalKm: 10000 }), 41000);
    expect(s.status).toBe('ok');
  });

  it('marks status as due-soon when 500km or less remain', () => {
    const s = computeServiceStatus(item({ lastServiceKm: 40000, intervalKm: 10000 }), 49600);
    expect(s.kmRemaining).toBe(400);
    expect(s.status).toBe('due-soon');
  });

  it('marks status as overdue once kmRemaining reaches zero or below', () => {
    const s = computeServiceStatus(item({ lastServiceKm: 40000, intervalKm: 10000 }), 50500);
    expect(s.kmRemaining).toBeLessThanOrEqual(0);
    expect(s.status).toBe('overdue');
  });

  it('treats exactly zero km remaining as overdue (boundary is inclusive)', () => {
    const s = computeServiceStatus(item({ lastServiceKm: 40000, intervalKm: 10000 }), 50000);
    expect(s.kmRemaining).toBe(0);
    expect(s.status).toBe('overdue');
  });
});
