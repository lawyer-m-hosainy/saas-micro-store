import { describe, expect, it } from 'vitest';
import { getRealToolSource, estimateEgpPrice } from './zipGenerator';
import { TOOL_SOURCE_FILE } from '../toolSourceMap';

describe('getRealToolSource', () => {
  it('returns the real, tested source for a product with a mapped tool file', () => {
    const [id, fileName] = Object.entries(TOOL_SOURCE_FILE)[0];
    const result = getRealToolSource(id);
    expect(result).not.toBeNull();
    expect(result!.fileName).toBe(fileName);
    expect(result!.exportName).toBe(`${fileName}Demo`);
    expect(result!.code).toContain(`${fileName}Demo`);
  });

  it('returns null for a product id with no mapped real source (falls back to the generic simulator)', () => {
    expect(getRealToolSource('some-unmapped-product-id')).toBeNull();
  });
});

describe('estimateEgpPrice', () => {
  it('treats a zero base price as free', () => {
    expect(estimateEgpPrice(0)).toBe(0);
  });

  it('converts a base price to a charm EGP price using the marketing rate', () => {
    // 49 * 15 = 735 -> rounded to nearest 50 = 750 -> minus 1 = 749
    expect(estimateEgpPrice(49)).toBe(749);
  });
});
