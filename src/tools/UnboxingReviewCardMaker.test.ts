import { describe, expect, it } from 'vitest';
import { buildReviewUrl, computeReviewStats, ReviewCardCustomer } from './UnboxingReviewCardMaker';

const customer: ReviewCardCustomer = { id: '1', name: 'Ali', orderRef: 'ORD-1', reviewed: false };

describe('buildReviewUrl', () => {
  it('appends the order ref and discount code as query params', () => {
    const url = buildReviewUrl(customer, 'https://maps.google.com/place', 'SAVE10');
    expect(url).toBe('https://maps.google.com/place?ref=ORD-1&promo=SAVE10');
  });

  it('uses & when the base URL already has a query string', () => {
    const url = buildReviewUrl(customer, 'https://maps.google.com/place?cid=1', 'SAVE10');
    expect(url).toBe('https://maps.google.com/place?cid=1&ref=ORD-1&promo=SAVE10');
  });

  it('falls back to a default maps URL when none is given', () => {
    const url = buildReviewUrl(customer, '', 'SAVE10');
    expect(url.startsWith('https://maps.google.com/your-store?')).toBe(true);
  });

  it('URL-encodes the order ref and discount code', () => {
    const url = buildReviewUrl({ ...customer, orderRef: 'ORD 1&2' }, 'https://maps.google.com/place', 'SAVE 10');
    expect(url).toContain('ref=ORD%201%262');
    expect(url).toContain('promo=SAVE%2010');
  });
});

describe('computeReviewStats', () => {
  it('counts reviewed customers and computes the completion rate', () => {
    const customers: ReviewCardCustomer[] = [
      { id: '1', name: 'A', orderRef: 'O1', reviewed: true },
      { id: '2', name: 'B', orderRef: 'O2', reviewed: false },
      { id: '3', name: 'C', orderRef: 'O3', reviewed: true },
    ];
    const stats = computeReviewStats(customers);
    expect(stats.total).toBe(3);
    expect(stats.reviewed).toBe(2);
    expect(stats.rate).toBeCloseTo(66.666, 2);
  });

  it('returns a zero rate for an empty customer list without dividing by zero', () => {
    const stats = computeReviewStats([]);
    expect(stats.total).toBe(0);
    expect(stats.rate).toBe(0);
  });
});
