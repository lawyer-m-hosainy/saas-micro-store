import { describe, expect, it } from 'vitest';
import { buildChangeOrderDocument, computeChangeOrderCost, ExtraWorkItem } from './ScopeCreepChangeOrderGen';

const items: ExtraWorkItem[] = [
  { id: '1', description: 'Extra page', hours: 4 },
  { id: '2', description: 'Redesign', hours: 6 },
];

describe('computeChangeOrderCost', () => {
  it('sums hours across all items', () => {
    expect(computeChangeOrderCost(items, 100).totalHours).toBe(10);
  });

  it('computes total cost as hours times hourly rate', () => {
    expect(computeChangeOrderCost(items, 100).totalCost).toBe(1000);
  });

  it('rounds extra days up to the nearest whole day', () => {
    // 10 hours / 6 hours-per-day = 1.67 -> ceil = 2
    expect(computeChangeOrderCost(items, 100, 6).extraDays).toBe(2);
  });

  it('computes exactly whole days when hours divide evenly', () => {
    expect(computeChangeOrderCost(items, 100, 5).extraDays).toBe(2);
  });

  it('returns zero cost and days for an empty item list', () => {
    const r = computeChangeOrderCost([], 100);
    expect(r.totalHours).toBe(0);
    expect(r.totalCost).toBe(0);
    expect(r.extraDays).toBe(0);
  });
});

describe('buildChangeOrderDocument', () => {
  it('includes the client name, project name, and every item description', () => {
    const doc = buildChangeOrderDocument('Acme Inc', 'Website Redesign', items, 100);
    expect(doc).toContain('Acme Inc');
    expect(doc).toContain('Website Redesign');
    expect(doc).toContain('Extra page');
    expect(doc).toContain('Redesign');
  });

  it('includes the computed total hours and cost', () => {
    const doc = buildChangeOrderDocument('Acme', 'Project', items, 100);
    expect(doc).toContain('10 ساعة');
    expect(doc).toContain('1,000');
  });
});
