import { describe, expect, it } from 'vitest';
import { buildGoogleCalendarLink, findRoomConflicts, Session } from './SpeakerAgendaBuilder';

const session = (overrides: Partial<Session> = {}): Session => ({
  id: '1', title: 'T', speaker: 'S', room: 'A', start: '10:00', end: '11:00', ...overrides,
});

describe('findRoomConflicts', () => {
  it('detects two overlapping sessions in the same room', () => {
    const conflicts = findRoomConflicts([
      session({ id: '1', room: 'A', start: '10:00', end: '11:00' }),
      session({ id: '2', room: 'A', start: '10:30', end: '11:30' }),
    ]);
    expect(conflicts).toHaveLength(1);
  });

  it('does not flag back-to-back sessions in the same room (end == start)', () => {
    const conflicts = findRoomConflicts([
      session({ id: '1', room: 'A', start: '10:00', end: '11:00' }),
      session({ id: '2', room: 'A', start: '11:00', end: '12:00' }),
    ]);
    expect(conflicts).toHaveLength(0);
  });

  it('does not flag overlapping sessions in different rooms', () => {
    const conflicts = findRoomConflicts([
      session({ id: '1', room: 'A', start: '10:00', end: '11:00' }),
      session({ id: '2', room: 'B', start: '10:30', end: '11:30' }),
    ]);
    expect(conflicts).toHaveLength(0);
  });

  it('returns no conflicts for a single session', () => {
    expect(findRoomConflicts([session()])).toEqual([]);
  });

  it('finds multiple conflicts across more than two sessions in one room', () => {
    const conflicts = findRoomConflicts([
      session({ id: '1', room: 'A', start: '10:00', end: '12:00' }),
      session({ id: '2', room: 'A', start: '10:30', end: '11:30' }),
      session({ id: '3', room: 'A', start: '11:00', end: '13:00' }),
    ]);
    expect(conflicts.length).toBeGreaterThanOrEqual(2);
  });
});

describe('buildGoogleCalendarLink', () => {
  it('builds a valid Google Calendar render URL with action=TEMPLATE', () => {
    const link = buildGoogleCalendarLink(session({ title: 'My Talk', start: '10:00', end: '11:00' }), '2025-11-15');
    expect(link).toContain('https://calendar.google.com/calendar/render?');
    expect(link).toContain('action=TEMPLATE');
    expect(link).toContain('text=My+Talk');
  });

  it('formats the date range as YYYYMMDDTHHMMSS/YYYYMMDDTHHMMSS', () => {
    const link = buildGoogleCalendarLink(session({ start: '09:05', end: '10:15' }), '2025-01-05');
    const params = new URL(link).searchParams;
    expect(params.get('dates')).toBe('20250105T090500/20250105T101500');
  });
});
