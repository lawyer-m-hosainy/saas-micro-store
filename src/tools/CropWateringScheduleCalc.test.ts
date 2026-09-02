import { describe, expect, it } from 'vitest';
import { computeWateringSchedule } from './CropWateringScheduleCalc';

describe('computeWateringSchedule', () => {
  it('computes daily ETc as ET0 * crop coefficient * soil factor', () => {
    const r = computeWateringSchedule({ crop: 'tomato', soil: 'loamy', refEvapotranspirationMm: 5, areaSqm: 100 });
    // tomato Kc=1.15, loamy factor=1.0 -> 5 * 1.15 * 1.0 = 5.75
    expect(r.dailyEtcMm).toBeCloseTo(5.75, 5);
  });

  it('converts mm over the given area to liters (1mm over 1sqm = 1 liter)', () => {
    const r = computeWateringSchedule({ crop: 'wheat', soil: 'loamy', refEvapotranspirationMm: 4, areaSqm: 200 });
    // wheat Kc=1.0, loamy=1.0 -> etc=4mm -> 4 * 200 = 800 liters/day
    expect(r.dailyLiters).toBe(800);
  });

  it('computes weekly liters as 7x daily liters', () => {
    const r = computeWateringSchedule({ crop: 'wheat', soil: 'loamy', refEvapotranspirationMm: 4, areaSqm: 200 });
    expect(r.weeklyLiters).toBe(r.dailyLiters * 7);
  });

  it('requires more water for sandy soil than clay soil, all else equal', () => {
    const sandy = computeWateringSchedule({ crop: 'palm', soil: 'sandy', refEvapotranspirationMm: 5, areaSqm: 100 });
    const clay = computeWateringSchedule({ crop: 'palm', soil: 'clay', refEvapotranspirationMm: 5, areaSqm: 100 });
    expect(sandy.dailyLiters).toBeGreaterThan(clay.dailyLiters);
  });

  it('scales linearly with area', () => {
    const small = computeWateringSchedule({ crop: 'citrus', soil: 'loamy', refEvapotranspirationMm: 5, areaSqm: 100 });
    const large = computeWateringSchedule({ crop: 'citrus', soil: 'loamy', refEvapotranspirationMm: 5, areaSqm: 200 });
    expect(large.dailyLiters).toBeCloseTo(small.dailyLiters * 2, 5);
  });
});
