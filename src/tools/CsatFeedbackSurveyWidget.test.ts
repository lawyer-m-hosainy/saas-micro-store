import { describe, expect, it } from 'vitest';
import { CsatRating, summarizeCsat } from './CsatFeedbackSurveyWidget';

const rating = (score: number, id = '1'): CsatRating => ({ id, score });

describe('summarizeCsat', () => {
  it('computes the average score', () => {
    const s = summarizeCsat([rating(5, '1'), rating(3, '2'), rating(4, '3')]);
    expect(s.avgScore).toBeCloseTo(4, 5);
  });

  it('computes CSAT% as the share of 4-5 star ratings', () => {
    const s = summarizeCsat([rating(5, '1'), rating(4, '2'), rating(2, '3'), rating(1, '4')]);
    expect(s.csatPct).toBe(50);
  });

  it('computes detractor% as the share of 1-2 star ratings', () => {
    const s = summarizeCsat([rating(5, '1'), rating(2, '2'), rating(1, '3'), rating(1, '4')]);
    expect(s.detractorPct).toBe(75);
  });

  it('treats a 3-star rating as neither satisfied nor a detractor', () => {
    const s = summarizeCsat([rating(3, '1')]);
    expect(s.csatPct).toBe(0);
    expect(s.detractorPct).toBe(0);
  });

  it('handles an empty rating list without dividing by zero', () => {
    const s = summarizeCsat([]);
    expect(s.count).toBe(0);
    expect(s.csatPct).toBe(0);
    expect(s.avgScore).toBe(0);
  });

  it('reports 100% CSAT when every rating is 4 or 5', () => {
    const s = summarizeCsat([rating(5, '1'), rating(4, '2'), rating(5, '3')]);
    expect(s.csatPct).toBe(100);
  });
});
