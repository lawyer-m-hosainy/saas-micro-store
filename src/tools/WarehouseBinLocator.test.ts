import { describe, expect, it } from 'vitest';
import { BinEntry, findBin } from './WarehouseBinLocator';

const bins: BinEntry[] = [
  { id: '1', binCode: 'A1-03', aisle: 'Aisle A', productName: 'Dell Laptop', quantity: 12 },
  { id: '2', binCode: 'A2-11', aisle: 'Aisle A', productName: 'Wireless Mouse', quantity: 340 },
];

describe('findBin', () => {
  it('finds a bin by exact bin code, case-insensitively', () => {
    const results = findBin(bins, 'a1-03');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('1');
  });

  it('finds a bin by partial, case-insensitive product name match', () => {
    const results = findBin(bins, 'mouse');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('2');
  });

  it('returns an empty array for an empty query', () => {
    expect(findBin(bins, '')).toEqual([]);
    expect(findBin(bins, '   ')).toEqual([]);
  });

  it('returns an empty array when nothing matches', () => {
    expect(findBin(bins, 'nonexistent')).toEqual([]);
  });

  it('can match multiple bins for a broad query', () => {
    const wideBins: BinEntry[] = [
      { id: '1', binCode: 'A1-01', aisle: 'A', productName: 'USB Cable', quantity: 1 },
      { id: '2', binCode: 'A1-02', aisle: 'A', productName: 'USB Hub', quantity: 1 },
    ];
    expect(findBin(wideBins, 'usb')).toHaveLength(2);
  });
});
