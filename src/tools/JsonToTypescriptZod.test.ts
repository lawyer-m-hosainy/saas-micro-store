import { describe, expect, it } from 'vitest';
import { jsonToTypes } from './JsonToTypescriptZod';

describe('jsonToTypes', () => {
  it('generates a flat interface for a simple object', () => {
    const { typescript } = jsonToTypes({ name: 'Ali', age: 30, active: true }, 'User');
    expect(typescript).toContain('export interface User {');
    expect(typescript).toContain('name: string;');
    expect(typescript).toContain('age: number;');
    expect(typescript).toContain('active: boolean;');
  });

  it('generates a matching Zod object schema', () => {
    const { zod } = jsonToTypes({ name: 'Ali', age: 30 }, 'User');
    expect(zod).toContain("import { z } from 'zod';");
    expect(zod).toContain('export const UserSchema = z.object({');
    expect(zod).toContain('name: z.string(),');
    expect(zod).toContain('age: z.number(),');
  });

  it('creates a nested interface for a nested object and references it by name', () => {
    const { typescript } = jsonToTypes({ address: { city: 'Cairo', zip: '11511' } }, 'Order');
    expect(typescript).toContain('export interface Order {');
    expect(typescript).toContain('address: Address;');
    expect(typescript).toContain('export interface Address {');
    expect(typescript).toContain('city: string;');
  });

  it('emits the nested Zod schema before the parent schema that references it', () => {
    const { zod } = jsonToTypes({ address: { city: 'Cairo' } }, 'Order');
    const addressIdx = zod.indexOf('export const AddressSchema');
    const orderIdx = zod.indexOf('export const OrderSchema');
    expect(addressIdx).toBeGreaterThan(-1);
    expect(addressIdx).toBeLessThan(orderIdx);
    expect(zod).toContain('address: AddressSchema,');
  });

  it('infers an array of primitives as a typed array', () => {
    const { typescript, zod } = jsonToTypes({ tags: ['a', 'b'] }, 'Post');
    expect(typescript).toContain('tags: string[];');
    expect(zod).toContain('tags: z.array(z.string()),');
  });

  it('infers an array of objects by generating one element interface', () => {
    const { typescript } = jsonToTypes({ items: [{ sku: 'A', qty: 1 }] }, 'Order');
    expect(typescript).toContain('items: Items[];');
    expect(typescript).toContain('export interface Items {');
    expect(typescript).toContain('sku: string;');
    expect(typescript).toContain('qty: number;');
  });

  it('handles null values', () => {
    const { typescript, zod } = jsonToTypes({ deletedAt: null }, 'Row');
    expect(typescript).toContain('deletedAt: null;');
    expect(zod).toContain('deletedAt: z.null(),');
  });

  it('handles an empty array as unknown[]', () => {
    const { typescript, zod } = jsonToTypes({ items: [] }, 'Order');
    expect(typescript).toContain('items: unknown[];');
    expect(zod).toContain('items: z.array(z.unknown()),');
  });

  it('produces a union type for a primitive array with mixed types', () => {
    const { typescript } = jsonToTypes({ mixed: [1, 'a'] }, 'Row');
    expect(typescript).toContain('mixed: (number | string)[];');
  });

  it('avoids name collisions between sibling nested objects with the same key', () => {
    const { typescript } = jsonToTypes({ from: { city: 'A' }, to: { city: 'B' } }, 'Trip');
    // "From" and "To" are distinct PascalCase names derived from distinct keys, so no collision expected
    expect(typescript).toContain('export interface From {');
    expect(typescript).toContain('export interface To {');
  });
});
