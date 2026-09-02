import { describe, expect, it } from 'vitest';
import { computeOnboardingProgress, OnboardingTask } from './OnboardingChecklistBot';

const tasks: OnboardingTask[] = [
  { id: '1', day: 1, title: 'A', done: true },
  { id: '2', day: 1, title: 'B', done: false },
  { id: '3', day: 2, title: 'C', done: true },
];

describe('computeOnboardingProgress', () => {
  it('counts total and done tasks', () => {
    const p = computeOnboardingProgress(tasks);
    expect(p.total).toBe(3);
    expect(p.done).toBe(2);
  });

  it('computes the overall completion percentage', () => {
    const p = computeOnboardingProgress(tasks);
    expect(p.percent).toBe(67); // round(2/3 * 100)
  });

  it('returns 0% for an empty task list without dividing by zero', () => {
    const p = computeOnboardingProgress([]);
    expect(p.percent).toBe(0);
  });

  it('groups task counts by day', () => {
    const p = computeOnboardingProgress(tasks);
    expect(p.byDay.get(1)).toEqual({ total: 2, done: 1 });
    expect(p.byDay.get(2)).toEqual({ total: 1, done: 1 });
  });

  it('reports 100% completion when every task is done', () => {
    const p = computeOnboardingProgress(tasks.map((t) => ({ ...t, done: true })));
    expect(p.percent).toBe(100);
  });
});
