import { describe, expect, it } from 'vitest';
import { classifyWait } from './KitchenDisplayTicketSystem';

describe('classifyWait', () => {
  it('classifies a ticket under 8 minutes as fresh', () => {
    const now = Date.now();
    expect(classifyWait(now - 5 * 60000, now)).toBe('fresh');
  });

  it('classifies a ticket between 8 and 15 minutes as warning', () => {
    const now = Date.now();
    expect(classifyWait(now - 10 * 60000, now)).toBe('warning');
  });

  it('classifies a ticket at or over 15 minutes as urgent', () => {
    const now = Date.now();
    expect(classifyWait(now - 16 * 60000, now)).toBe('urgent');
  });

  it('treats the warning threshold boundary as warning (inclusive)', () => {
    const now = Date.now();
    expect(classifyWait(now - 8 * 60000, now)).toBe('warning');
  });

  it('treats the urgent threshold boundary as urgent (inclusive)', () => {
    const now = Date.now();
    expect(classifyWait(now - 15 * 60000, now)).toBe('urgent');
  });

  it('respects custom thresholds', () => {
    const now = Date.now();
    expect(classifyWait(now - 3 * 60000, now, 2, 5)).toBe('warning');
    expect(classifyWait(now - 6 * 60000, now, 2, 5)).toBe('urgent');
  });
});
