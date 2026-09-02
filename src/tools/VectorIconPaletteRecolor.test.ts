import { describe, expect, it } from 'vitest';
import { extractColors, recolorSvg, sanitizeSvgForPreview } from './VectorIconPaletteRecolor';

describe('extractColors', () => {
  it('extracts unique hex colors from fill and stroke attributes', () => {
    const svg = '<circle fill="#4F46E5"/><path stroke="#FFFFFF"/>';
    expect(extractColors(svg)).toEqual(['#4f46e5', '#ffffff']);
  });

  it('deduplicates repeated colors regardless of case', () => {
    const svg = '<a fill="#ABC"/><b fill="#abc"/>';
    expect(extractColors(svg)).toEqual(['#abc']);
  });

  it('returns an empty array when there are no hex colors', () => {
    expect(extractColors('<svg></svg>')).toEqual([]);
  });
});

describe('recolorSvg', () => {
  it('replaces every occurrence of a color with the new one', () => {
    const svg = '<a fill="#4F46E5"/><b stroke="#4F46E5"/>';
    const out = recolorSvg(svg, { '#4f46e5': '#ff0000' });
    expect(out).toBe('<a fill="#ff0000"/><b stroke="#ff0000"/>');
  });

  it('is case-insensitive when matching the old color', () => {
    const svg = '<a fill="#4F46E5"/>';
    const out = recolorSvg(svg, { '#4f46e5': '#000' });
    expect(out).toBe('<a fill="#000"/>');
  });

  it('leaves the SVG unchanged when no override is provided for a color', () => {
    const svg = '<a fill="#4F46E5"/>';
    expect(recolorSvg(svg, {})).toBe(svg);
  });

  it('skips a mapping whose new color is empty', () => {
    const svg = '<a fill="#4F46E5"/>';
    expect(recolorSvg(svg, { '#4f46e5': '' })).toBe(svg);
  });
});

describe('sanitizeSvgForPreview', () => {
  it('strips <script> tags entirely', () => {
    const svg = '<svg><script>alert(1)</script><circle/></svg>';
    const out = sanitizeSvgForPreview(svg);
    expect(out).not.toContain('<script');
    expect(out).not.toContain('alert(1)');
  });

  it('strips quoted inline event handler attributes', () => {
    const svg = `<svg onload="alert(1)"><circle onclick='doEvil()'/></svg>`;
    const out = sanitizeSvgForPreview(svg);
    expect(out).not.toContain('onload');
    expect(out).not.toContain('onclick');
  });

  it('leaves normal SVG markup untouched', () => {
    const svg = '<svg><circle fill="#000"/></svg>';
    expect(sanitizeSvgForPreview(svg)).toBe(svg);
  });
});
