import { describe, expect, it } from 'vitest';
import { buildWatermarkText, computeWatermarkPosition } from './DynamicDrmVideoWatermark';

describe('computeWatermarkPosition', () => {
  it('cycles through 9 distinct positions', () => {
    const positions = Array.from({ length: 9 }, (_, i) => computeWatermarkPosition(i));
    const unique = new Set(positions.map((p) => `${p.topPct},${p.leftPct}`));
    expect(unique.size).toBe(9);
  });

  it('wraps around after 9 ticks (round-robin)', () => {
    expect(computeWatermarkPosition(0)).toEqual(computeWatermarkPosition(9));
    expect(computeWatermarkPosition(5)).toEqual(computeWatermarkPosition(14));
  });

  it('handles negative tick indices without throwing or returning undefined', () => {
    const pos = computeWatermarkPosition(-1);
    expect(pos).toBeDefined();
    expect(typeof pos.topPct).toBe('number');
  });
});

describe('buildWatermarkText', () => {
  it('includes the viewer email, phone, and a formatted timestamp', () => {
    const text = buildWatermarkText('a@b.com', '+201000000000', new Date('2025-01-01T12:30:00Z'));
    expect(text).toContain('a@b.com');
    expect(text).toContain('+201000000000');
    expect(text).toContain('2025-01-01 12:30:00');
  });
});
