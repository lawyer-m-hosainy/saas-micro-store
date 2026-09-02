import { describe, expect, it } from 'vitest';
import { computeCoverCrop, SOCIAL_PRESETS } from './SocialBannerAutoResizer';

describe('computeCoverCrop', () => {
  it('returns the full source image when aspect ratios already match', () => {
    const c = computeCoverCrop(1000, 1000, 500, 500);
    expect(c).toEqual({ cropX: 0, cropY: 0, cropW: 1000, cropH: 1000 });
  });

  it('crops the width (letterboxing sides) when the source is wider than the target ratio', () => {
    // source is a very wide 2000x1000 image (ratio 2), target is square (ratio 1)
    const c = computeCoverCrop(2000, 1000, 500, 500);
    expect(c.cropH).toBe(1000);
    expect(c.cropW).toBe(1000); // sourceH * targetRatio = 1000 * 1 = 1000
    expect(c.cropX).toBe(500); // (2000 - 1000) / 2
    expect(c.cropY).toBe(0);
  });

  it('crops the height (letterboxing top/bottom) when the source is taller than the target ratio', () => {
    // source is a tall 1000x2000 image (ratio 0.5), target is square (ratio 1)
    const c = computeCoverCrop(1000, 2000, 500, 500);
    expect(c.cropW).toBe(1000);
    expect(c.cropH).toBe(1000); // sourceW / targetRatio = 1000 / 1 = 1000
    expect(c.cropY).toBe(500); // (2000 - 1000) / 2
    expect(c.cropX).toBe(0);
  });

  it('always centers the crop within the source bounds', () => {
    const c = computeCoverCrop(1600, 900, 1080, 1080);
    expect(c.cropX).toBeGreaterThanOrEqual(0);
    expect(c.cropY).toBeGreaterThanOrEqual(0);
    expect(c.cropX + c.cropW).toBeLessThanOrEqual(1600 + 0.001);
    expect(c.cropY + c.cropH).toBeLessThanOrEqual(900 + 0.001);
  });
});

describe('SOCIAL_PRESETS', () => {
  it('defines a positive width and height for every preset', () => {
    SOCIAL_PRESETS.forEach((p) => {
      expect(p.width).toBeGreaterThan(0);
      expect(p.height).toBeGreaterThan(0);
    });
  });

  it('has unique preset ids', () => {
    const ids = SOCIAL_PRESETS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
