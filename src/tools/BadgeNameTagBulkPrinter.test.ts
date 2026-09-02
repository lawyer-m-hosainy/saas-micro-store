import { describe, expect, it } from 'vitest';
import { parseAttendeeList } from './BadgeNameTagBulkPrinter';

describe('parseAttendeeList', () => {
  it('parses comma-separated name and title pairs', () => {
    const rows = parseAttendeeList('Ali, Manager\nSara, Designer');
    expect(rows).toEqual([{ name: 'Ali', title: 'Manager' }, { name: 'Sara', title: 'Designer' }]);
  });

  it('supports tab-separated values too', () => {
    const rows = parseAttendeeList('Ali\tManager');
    expect(rows).toEqual([{ name: 'Ali', title: 'Manager' }]);
  });

  it('defaults title to an empty string when only a name is given', () => {
    const rows = parseAttendeeList('Ali');
    expect(rows).toEqual([{ name: 'Ali', title: '' }]);
  });

  it('skips blank lines', () => {
    const rows = parseAttendeeList('Ali, Manager\n\n\nSara, Designer');
    expect(rows).toHaveLength(2);
  });

  it('skips lines with no name', () => {
    const rows = parseAttendeeList(', Manager\nAli, Manager');
    expect(rows).toEqual([{ name: 'Ali', title: 'Manager' }]);
  });

  it('trims whitespace around each field', () => {
    const rows = parseAttendeeList('  Ali  ,   Manager  ');
    expect(rows).toEqual([{ name: 'Ali', title: 'Manager' }]);
  });

  it('returns an empty array for empty input', () => {
    expect(parseAttendeeList('')).toEqual([]);
  });
});
