import { describe, expect, it } from 'vitest';
import { buildApacheRules, buildNginxRules, levenshteinDistance, mapRedirects, similarity } from './BrokenLinkRedirectMapper';

describe('levenshteinDistance', () => {
  it('returns 0 for identical strings', () => {
    expect(levenshteinDistance('abc', 'abc')).toBe(0);
  });

  it('returns the length of the other string when one is empty', () => {
    expect(levenshteinDistance('', 'abc')).toBe(3);
    expect(levenshteinDistance('abc', '')).toBe(3);
  });

  it('counts a single substitution as distance 1', () => {
    expect(levenshteinDistance('cat', 'bat')).toBe(1);
  });

  it('counts a classic edit-distance example correctly', () => {
    expect(levenshteinDistance('kitten', 'sitting')).toBe(3);
  });
});

describe('similarity', () => {
  it('returns 1 for identical strings', () => {
    expect(similarity('/product/shoes', '/product/shoes')).toBe(1);
  });

  it('returns a higher score for a near-typo than for an unrelated string', () => {
    const near = similarity('/prodcut/red-shoes', '/product/red-shoes');
    const far = similarity('/prodcut/red-shoes', '/about-us');
    expect(near).toBeGreaterThan(far);
  });
});

describe('mapRedirects', () => {
  it('maps a broken URL to the closest live URL by path similarity', () => {
    const [r] = mapRedirects(['https://x.com/prodcut/red-shoes'], ['https://x.com/product/red-shoes', 'https://x.com/about-us']);
    expect(r.bestMatch).toBe('https://x.com/product/red-shoes');
    expect(r.confidence).toBeGreaterThan(0.8);
  });

  it('returns null bestMatch when there are no live URLs to match against', () => {
    const [r] = mapRedirects(['https://x.com/dead'], []);
    expect(r.bestMatch).toBeNull();
    expect(r.confidence).toBe(0);
  });

  it('produces one mapping per broken URL', () => {
    const results = mapRedirects(['https://x.com/a', 'https://x.com/b'], ['https://x.com/a']);
    expect(results).toHaveLength(2);
  });
});

describe('buildApacheRules / buildNginxRules', () => {
  const mappings = mapRedirects(['https://x.com/prodcut/red-shoes'], ['https://x.com/product/red-shoes']);

  it('generates a valid Apache Redirect 301 directive', () => {
    const rules = buildApacheRules(mappings);
    expect(rules).toContain('Redirect 301 /prodcut/red-shoes https://x.com/product/red-shoes');
  });

  it('generates a valid Nginx rewrite directive', () => {
    const rules = buildNginxRules(mappings);
    expect(rules).toContain('rewrite ^/prodcut/red-shoes$ https://x.com/product/red-shoes permanent;');
  });

  it('skips mappings with no match in either output format', () => {
    const noMatch = mapRedirects(['https://x.com/dead'], []);
    expect(buildApacheRules(noMatch)).toBe('');
    expect(buildNginxRules(noMatch)).toBe('');
  });
});
