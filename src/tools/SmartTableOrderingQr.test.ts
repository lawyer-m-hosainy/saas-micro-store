import { describe, expect, it } from 'vitest';
import { computeCartTotal, MenuItem, nextStatus } from './SmartTableOrderingQr';

const menu: MenuItem[] = [
  { id: 'a', name: 'Burger', price: 100 },
  { id: 'b', name: 'Salad', price: 50 },
];

describe('computeCartTotal', () => {
  it('sums price times quantity for each line', () => {
    const total = computeCartTotal([{ itemId: 'a', qty: 2 }, { itemId: 'b', qty: 1 }], menu);
    expect(total).toBe(250);
  });

  it('returns 0 for an empty cart', () => {
    expect(computeCartTotal([], menu)).toBe(0);
  });

  it('ignores a cart line referencing a menu item that no longer exists', () => {
    const total = computeCartTotal([{ itemId: 'missing', qty: 3 }], menu);
    expect(total).toBe(0);
  });
});

describe('nextStatus', () => {
  it('advances pending to preparing', () => {
    expect(nextStatus('pending')).toBe('preparing');
  });

  it('advances preparing to served', () => {
    expect(nextStatus('preparing')).toBe('served');
  });

  it('returns null once an order is served (no further advance)', () => {
    expect(nextStatus('served')).toBeNull();
  });
});
