import { describe, expect, it } from 'vitest';
import { analyzeFleet, VehicleEntry } from './FleetFuelTracker';

const vehicle = (overrides: Partial<VehicleEntry> = {}): VehicleEntry => ({
  id: '1', name: 'V', driver: 'D', distanceKm: 1000, fuelLiters: 100, fuelPricePerLiter: 10,
  ...overrides,
});

describe('analyzeFleet', () => {
  it('computes liters per 100km and cost per km', () => {
    const [r] = analyzeFleet([vehicle({ distanceKm: 1000, fuelLiters: 100, fuelPricePerLiter: 10 })]);
    expect(r.litersPer100km).toBeCloseTo(10, 5);
    expect(r.totalCost).toBe(1000);
    expect(r.costPerKm).toBe(1);
  });

  it('flags a vehicle burning more than 20% above the fleet average', () => {
    const results = analyzeFleet([
      vehicle({ id: 'a', distanceKm: 1000, fuelLiters: 100 }), // 10 L/100km
      vehicle({ id: 'b', distanceKm: 1000, fuelLiters: 100 }), // 10 L/100km
      vehicle({ id: 'c', distanceKm: 1000, fuelLiters: 140 }), // 14 L/100km -> +40% vs avg(~11.33)
    ]);
    const c = results.find((r) => r.id === 'c')!;
    expect(c.isAnomaly).toBe(true);
    expect(c.excessPct).toBeGreaterThan(20);
  });

  it('does not flag vehicles close to the fleet average', () => {
    const results = analyzeFleet([
      vehicle({ id: 'a', distanceKm: 1000, fuelLiters: 100 }),
      vehicle({ id: 'b', distanceKm: 1000, fuelLiters: 105 }),
    ]);
    results.forEach((r) => expect(r.isAnomaly).toBe(false));
  });

  it('handles zero distance without dividing by zero', () => {
    const [r] = analyzeFleet([vehicle({ distanceKm: 0, fuelLiters: 50 })]);
    expect(r.litersPer100km).toBe(0);
    expect(r.costPerKm).toBe(0);
    expect(Number.isFinite(r.litersPer100km)).toBe(true);
  });
});
