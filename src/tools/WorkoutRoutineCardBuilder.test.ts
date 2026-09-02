import { describe, expect, it } from 'vitest';
import { Exercise, summarizeWorkout } from './WorkoutRoutineCardBuilder';

const exercise = (overrides: Partial<Exercise> = {}): Exercise => ({
  id: '1', name: 'E', sets: 3, reps: 10, restSec: 60, lastWeightKg: 20, ...overrides,
});

describe('summarizeWorkout', () => {
  it('sums sets across all exercises', () => {
    const s = summarizeWorkout([exercise({ sets: 4 }), exercise({ sets: 3 })]);
    expect(s.totalSets).toBe(7);
  });

  it('computes total reps as sum of sets*reps per exercise', () => {
    const s = summarizeWorkout([exercise({ sets: 4, reps: 10 }), exercise({ sets: 3, reps: 8 })]);
    expect(s.totalReps).toBe(4 * 10 + 3 * 8);
  });

  it('finds the maximum weight used across exercises', () => {
    const s = summarizeWorkout([exercise({ lastWeightKg: 40 }), exercise({ lastWeightKg: 80 }), exercise({ lastWeightKg: 60 })]);
    expect(s.maxWeight).toBe(80);
  });

  it('returns zeros for an empty exercise list', () => {
    const s = summarizeWorkout([]);
    expect(s).toEqual({ totalSets: 0, totalReps: 0, maxWeight: 0 });
  });
});
