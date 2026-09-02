import { describe, expect, it } from 'vitest';
import { analyzeRoutes, DeliveryOrder } from './DeliveryCostRouteOptimizer';

const order = (zone: string, distanceKm: number, id = '1'): DeliveryOrder => ({ id, zone, distanceKm, orderValue: 100 });

describe('analyzeRoutes', () => {
  it('groups orders by zone', () => {
    const results = analyzeRoutes([order('A', 5, '1'), order('A', 3, '2'), order('B', 10, '3')], 4, { flatFeePerOrder: 30 });
    const zones = results.map((r) => r.zone).sort();
    expect(zones).toEqual(['A', 'B']);
  });

  it('sums distance and computes in-house cost as distance * cost per km', () => {
    const [r] = analyzeRoutes([order('A', 5, '1'), order('A', 3, '2')], 4, { flatFeePerOrder: 30 });
    expect(r.totalDistanceKm).toBe(8);
    expect(r.inHouseCost).toBe(32);
  });

  it('computes courier cost as order count * flat fee', () => {
    const [r] = analyzeRoutes([order('A', 5, '1'), order('A', 3, '2')], 4, { flatFeePerOrder: 30 });
    expect(r.courierCost).toBe(60);
  });

  it('picks in-house when it is cheaper', () => {
    const [r] = analyzeRoutes([order('A', 2, '1')], 1, { flatFeePerOrder: 50 });
    // in-house = 2, courier = 50
    expect(r.cheaperOption).toBe('in-house');
    expect(r.savings).toBe(48);
  });

  it('picks courier when it is cheaper', () => {
    const [r] = analyzeRoutes([order('A', 50, '1')], 5, { flatFeePerOrder: 30 });
    // in-house = 250, courier = 30
    expect(r.cheaperOption).toBe('courier');
    expect(r.savings).toBe(220);
  });

  it('produces one analysis entry per distinct zone', () => {
    const results = analyzeRoutes([order('A', 5, '1'), order('B', 5, '2'), order('C', 5, '3')], 4, { flatFeePerOrder: 30 });
    expect(results).toHaveLength(3);
  });
});
