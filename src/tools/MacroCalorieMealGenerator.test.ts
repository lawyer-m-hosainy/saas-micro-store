import { describe, expect, it } from 'vitest';
import { computeMealPlan, MealPlanInputs } from './MacroCalorieMealGenerator';

const base = (overrides: Partial<MealPlanInputs> = {}): MealPlanInputs => ({
  weightKg: 70,
  heightCm: 170,
  age: 30,
  gender: 'male',
  activityLevel: 'sedentary',
  goal: 'maintain',
  ...overrides,
});

describe('computeMealPlan', () => {
  it('computes BMR for men using the Mifflin-St Jeor formula', () => {
    const r = computeMealPlan(base({ weightKg: 70, heightCm: 170, age: 30, gender: 'male' }));
    // 10*70 + 6.25*170 - 5*30 + 5 = 700 + 1062.5 - 150 + 5 = 1617.5
    expect(r.bmr).toBeCloseTo(1617.5, 2);
  });

  it('computes BMR for women using the Mifflin-St Jeor formula', () => {
    const r = computeMealPlan(base({ weightKg: 70, heightCm: 170, age: 30, gender: 'female' }));
    // 10*70 + 6.25*170 - 5*30 - 161 = 700 + 1062.5 - 150 - 161 = 1451.5
    expect(r.bmr).toBeCloseTo(1451.5, 2);
  });

  it('multiplies BMR by the correct activity factor for TDEE', () => {
    const r = computeMealPlan(base({ activityLevel: 'moderate' }));
    expect(r.tdee).toBeCloseTo(r.bmr * 1.55, 5);
  });

  it('subtracts 500 kcal for a cut goal', () => {
    const maintain = computeMealPlan(base({ goal: 'maintain' }));
    const cut = computeMealPlan(base({ goal: 'cut' }));
    expect(cut.targetCalories).toBeCloseTo(maintain.targetCalories - 500, 2);
  });

  it('adds 300 kcal for a bulk goal', () => {
    const maintain = computeMealPlan(base({ goal: 'maintain' }));
    const bulk = computeMealPlan(base({ goal: 'bulk' }));
    expect(bulk.targetCalories).toBeCloseTo(maintain.targetCalories + 300, 2);
  });

  it('never lets target calories fall below 1200', () => {
    const r = computeMealPlan(base({ weightKg: 40, heightCm: 150, age: 60, activityLevel: 'sedentary', goal: 'cut' }));
    expect(r.targetCalories).toBeGreaterThanOrEqual(1200);
  });

  it('assigns more protein per kg for a cut goal than for maintenance', () => {
    const maintain = computeMealPlan(base({ goal: 'maintain', weightKg: 70 }));
    const cut = computeMealPlan(base({ goal: 'cut', weightKg: 70 }));
    expect(cut.proteinGrams).toBeGreaterThan(maintain.proteinGrams);
  });

  it('allocates protein, carbs, and fat calories that sum to roughly the target calories', () => {
    const r = computeMealPlan(base());
    const total = r.proteinGrams * 4 + r.carbsGrams * 4 + r.fatGrams * 9;
    expect(total).toBeCloseTo(r.targetCalories, 1);
  });
});
