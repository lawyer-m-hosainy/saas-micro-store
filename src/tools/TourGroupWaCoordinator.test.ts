import { describe, expect, it } from 'vitest';
import { buildReminderWaLink, computeAttendanceStats, Traveler } from './TourGroupWaCoordinator';

const traveler = (overrides: Partial<Traveler> = {}): Traveler => ({ id: '1', name: 'Ali', phone: '201012345678', confirmed: false, ...overrides });

describe('buildReminderWaLink', () => {
  it('builds a wa.me link using the digits-only phone number', () => {
    const link = buildReminderWaLink(traveler({ phone: '+20 101 234 5678' }), 'Lobby', '8am');
    expect(link.startsWith('https://wa.me/201012345678?text=')).toBe(true);
  });

  it('includes the traveler name, meeting point, and time in the encoded message', () => {
    const link = buildReminderWaLink(traveler({ name: 'Sara' }), 'Hotel Lobby', '9am');
    const text = decodeURIComponent(link.split('text=')[1]);
    expect(text).toContain('Sara');
    expect(text).toContain('Hotel Lobby');
    expect(text).toContain('9am');
  });
});

describe('computeAttendanceStats', () => {
  it('counts confirmed and pending travelers', () => {
    const stats = computeAttendanceStats([traveler({ confirmed: true }), traveler({ confirmed: false }), traveler({ confirmed: true })]);
    expect(stats.confirmed).toBe(2);
    expect(stats.pending).toBe(1);
    expect(stats.total).toBe(3);
  });

  it('computes the confirmation rate as a percentage', () => {
    const stats = computeAttendanceStats([traveler({ confirmed: true }), traveler({ confirmed: false })]);
    expect(stats.rate).toBe(50);
  });

  it('handles an empty traveler list without dividing by zero', () => {
    const stats = computeAttendanceStats([]);
    expect(stats.rate).toBe(0);
  });
});
