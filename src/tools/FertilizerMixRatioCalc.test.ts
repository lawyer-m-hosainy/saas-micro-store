import { describe, expect, it } from 'vitest';
import { computeFertilizerMix } from './FertilizerMixRatioCalc';

describe('computeFertilizerMix', () => {
  it('computes grams needed from ppm, tank volume, and purity', () => {
    // 150 ppm * 1000L / (0.20 * 1000) = 150000/200 = 750g
    const r = computeFertilizerMix({ tankLiters: 1000, targetPpm: 150, fertilizerPurityPct: 20 });
    expect(r.gramsNeeded).toBe(750);
  });

  it('requires more fertilizer for lower purity, all else equal', () => {
    const lowPurity = computeFertilizerMix({ tankLiters: 1000, targetPpm: 150, fertilizerPurityPct: 10 });
    const highPurity = computeFertilizerMix({ tankLiters: 1000, targetPpm: 150, fertilizerPurityPct: 40 });
    expect(lowPurity.gramsNeeded).toBeGreaterThan(highPurity.gramsNeeded);
  });

  it('computes grams per liter as total grams divided by tank volume', () => {
    const r = computeFertilizerMix({ tankLiters: 1000, targetPpm: 150, fertilizerPurityPct: 20 });
    expect(r.gramsPerLiter).toBeCloseTo(0.75, 5);
  });

  it('flags a target concentration above 300 ppm as dangerously high', () => {
    expect(computeFertilizerMix({ tankLiters: 100, targetPpm: 350, fertilizerPurityPct: 20 }).isDangerouslyHigh).toBe(true);
    expect(computeFertilizerMix({ tankLiters: 100, targetPpm: 200, fertilizerPurityPct: 20 }).isDangerouslyHigh).toBe(false);
  });

  it('does not divide by zero when purity is 0', () => {
    const r = computeFertilizerMix({ tankLiters: 100, targetPpm: 150, fertilizerPurityPct: 0 });
    expect(r.gramsNeeded).toBe(0);
    expect(Number.isFinite(r.gramsNeeded)).toBe(true);
  });

  it('scales linearly with tank volume', () => {
    const small = computeFertilizerMix({ tankLiters: 100, targetPpm: 150, fertilizerPurityPct: 20 });
    const large = computeFertilizerMix({ tankLiters: 200, targetPpm: 150, fertilizerPurityPct: 20 });
    expect(large.gramsNeeded).toBeCloseTo(small.gramsNeeded * 2, 5);
  });
});
