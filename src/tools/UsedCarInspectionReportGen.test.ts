import { describe, expect, it } from 'vitest';
import { computeOverallScore, InspectionCategory, scoreVerdict } from './UsedCarInspectionReportGen';

const cat = (score: number, weight: number, id = '1'): InspectionCategory => ({ id, name: 'C', score, weight });

describe('computeOverallScore', () => {
  it('computes a simple average as a percentage when weights are equal', () => {
    const pct = computeOverallScore([cat(10, 1, '1'), cat(0, 1, '2')]);
    expect(pct).toBe(50);
  });

  it('weights categories by their relative importance', () => {
    // category 1: score 10, weight 3 ; category 2: score 0, weight 1
    // weighted = (10*3 + 0*1) / (4*10) * 100 = 75
    const pct = computeOverallScore([cat(10, 3, '1'), cat(0, 1, '2')]);
    expect(pct).toBe(75);
  });

  it('returns 100 when every category scores a perfect 10', () => {
    expect(computeOverallScore([cat(10, 2, '1'), cat(10, 5, '2')])).toBe(100);
  });

  it('returns 0 for an empty category list without dividing by zero', () => {
    expect(computeOverallScore([])).toBe(0);
  });
});

describe('scoreVerdict', () => {
  it('returns the excellent verdict for 85%+', () => {
    expect(scoreVerdict(90)).toContain('ممتازة');
  });

  it('returns the very-good verdict for 70-84%', () => {
    expect(scoreVerdict(75)).toContain('جيدة جداً');
  });

  it('returns the acceptable verdict for 50-69%', () => {
    expect(scoreVerdict(55)).toContain('مقبولة');
  });

  it('returns the weak verdict below 50%', () => {
    expect(scoreVerdict(30)).toContain('ضعيفة');
  });
});
