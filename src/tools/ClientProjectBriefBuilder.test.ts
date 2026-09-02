import { describe, expect, it } from 'vitest';
import { computeBriefCompleteness, ProjectBrief } from './ClientProjectBriefBuilder';

const emptyBrief: ProjectBrief = {
  clientName: '', projectGoal: '', targetAudience: '', deliverables: '', budgetRange: '', deadline: '', outOfScope: '',
};

describe('computeBriefCompleteness', () => {
  it('returns 0% for a fully empty brief', () => {
    expect(computeBriefCompleteness(emptyBrief)).toBe(0);
  });

  it('returns 100% when every field is filled', () => {
    const full: ProjectBrief = {
      clientName: 'A', projectGoal: 'B', targetAudience: 'C', deliverables: 'D', budgetRange: 'E', deadline: 'F', outOfScope: 'G',
    };
    expect(computeBriefCompleteness(full)).toBe(100);
  });

  it('counts a whitespace-only field as not filled', () => {
    const brief = { ...emptyBrief, clientName: '   ' };
    expect(computeBriefCompleteness(brief)).toBe(0);
  });

  it('computes a proportional percentage for a partially filled brief', () => {
    // 7 fields total, 1 filled -> round(1/7*100) = 14
    const brief = { ...emptyBrief, clientName: 'Acme' };
    expect(computeBriefCompleteness(brief)).toBe(14);
  });
});
