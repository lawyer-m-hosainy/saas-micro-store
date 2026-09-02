import { describe, expect, it } from 'vitest';
import { generateMockRecords, MockField } from './ApiMockEndpointBuilder';

const fields: MockField[] = [
  { id: '1', name: 'name', type: 'string' },
  { id: '2', name: 'email', type: 'email' },
  { id: '3', name: 'active', type: 'boolean' },
  { id: '4', name: 'age', type: 'number' },
];

describe('generateMockRecords', () => {
  it('generates the requested number of records', () => {
    expect(generateMockRecords(fields, 5)).toHaveLength(5);
  });

  it('gives each record a sequential numeric id', () => {
    const records = generateMockRecords(fields, 3);
    expect(records.map((r) => r.id)).toEqual([1, 2, 3]);
  });

  it('populates every defined field on each record', () => {
    const [record] = generateMockRecords(fields, 1);
    expect(record).toHaveProperty('name');
    expect(record).toHaveProperty('email');
    expect(record).toHaveProperty('active');
    expect(record).toHaveProperty('age');
  });

  it('produces the correct JS type for each field type', () => {
    const [record] = generateMockRecords(fields, 1);
    expect(typeof record.name).toBe('string');
    expect(typeof record.email).toBe('string');
    expect(typeof record.active).toBe('boolean');
    expect(typeof record.age).toBe('number');
  });

  it('generates emails containing an @ and a known domain', () => {
    const records = generateMockRecords([{ id: '1', name: 'email', type: 'email' }], 5);
    records.forEach((r) => expect(String(r.email)).toMatch(/^user\d+@[\w.]+$/));
  });

  it('is deterministic for the same seed', () => {
    const a = generateMockRecords(fields, 5, 42);
    const b = generateMockRecords(fields, 5, 42);
    expect(a).toEqual(b);
  });

  it('produces different data for a different seed', () => {
    const a = generateMockRecords(fields, 5, 1);
    const b = generateMockRecords(fields, 5, 2);
    expect(a).not.toEqual(b);
  });

  it('generates a well-formed v4-shaped UUID', () => {
    const [record] = generateMockRecords([{ id: '1', name: 'id', type: 'uuid' }], 1);
    expect(String(record.id)).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });
});
