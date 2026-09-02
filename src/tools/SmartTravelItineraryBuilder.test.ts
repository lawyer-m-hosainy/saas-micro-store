import { describe, expect, it } from 'vitest';
import { buildMapsLink, groupByDay, ItineraryStop } from './SmartTravelItineraryBuilder';

describe('buildMapsLink', () => {
  it('builds a valid Google Maps search URL', () => {
    const link = buildMapsLink('Pyramids of Giza');
    expect(link).toBe('https://www.google.com/maps/search/?api=1&query=Pyramids%20of%20Giza');
  });

  it('URL-encodes special characters in the place name', () => {
    const link = buildMapsLink('Café & Co');
    expect(link).toContain(encodeURIComponent('Café & Co'));
  });
});

describe('groupByDay', () => {
  const stop = (day: number, time: string, id: string): ItineraryStop => ({ id, day, time, place: `Place ${id}` });

  it('groups stops under their day number', () => {
    const grouped = groupByDay([stop(1, '09:00', 'a'), stop(2, '10:00', 'b'), stop(1, '13:00', 'c')]);
    expect(grouped.get(1)).toHaveLength(2);
    expect(grouped.get(2)).toHaveLength(1);
  });

  it('sorts stops within a day by time', () => {
    const grouped = groupByDay([stop(1, '15:00', 'a'), stop(1, '09:00', 'b')]);
    expect(grouped.get(1)!.map((s) => s.id)).toEqual(['b', 'a']);
  });

  it('returns days in ascending numeric order', () => {
    const grouped = groupByDay([stop(3, '09:00', 'a'), stop(1, '09:00', 'b'), stop(2, '09:00', 'c')]);
    expect([...grouped.keys()]).toEqual([1, 2, 3]);
  });
});
