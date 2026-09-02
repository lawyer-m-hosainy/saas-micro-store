import { describe, expect, it } from 'vitest';
import { analyzeCampaigns, buildUtmLink } from './UtmCampaignRoiTracker';

describe('buildUtmLink', () => {
  it('appends utm_source, utm_medium, and utm_campaign as query params', () => {
    const link = buildUtmLink({ baseUrl: 'https://x.com/p', source: 'ig', medium: 'social', campaign: 'sale' });
    expect(link).toBe('https://x.com/p?utm_source=ig&utm_medium=social&utm_campaign=sale');
  });

  it('uses & instead of ? when the base URL already has query params', () => {
    const link = buildUtmLink({ baseUrl: 'https://x.com/p?ref=1', source: 'ig', medium: '', campaign: '' });
    expect(link).toBe('https://x.com/p?ref=1&utm_source=ig');
  });

  it('URL-encodes values with special characters', () => {
    const link = buildUtmLink({ baseUrl: 'https://x.com', source: 'my source', medium: '', campaign: '' });
    expect(link).toContain('utm_source=my%20source');
  });

  it('returns an empty string when there is no base URL', () => {
    expect(buildUtmLink({ baseUrl: '', source: 'ig', medium: '', campaign: '' })).toBe('');
  });

  it('returns the base URL unchanged when no UTM fields are filled', () => {
    expect(buildUtmLink({ baseUrl: 'https://x.com', source: '', medium: '', campaign: '' })).toBe('https://x.com');
  });
});

describe('analyzeCampaigns', () => {
  it('computes ROI% as (revenue - spend) / spend * 100', () => {
    const [r] = analyzeCampaigns([{ id: '1', name: 'A', spend: 100, clicks: 50, conversions: 5, revenue: 250 }]);
    expect(r.roiPct).toBeCloseTo(150, 5);
  });

  it('computes conversion rate as conversions / clicks * 100', () => {
    const [r] = analyzeCampaigns([{ id: '1', name: 'A', spend: 100, clicks: 200, conversions: 10, revenue: 100 }]);
    expect(r.conversionRatePct).toBeCloseTo(5, 5);
  });

  it('computes cost per click', () => {
    const [r] = analyzeCampaigns([{ id: '1', name: 'A', spend: 100, clicks: 50, conversions: 5, revenue: 100 }]);
    expect(r.cpc).toBe(2);
  });

  it('reports negative ROI when revenue is below spend', () => {
    const [r] = analyzeCampaigns([{ id: '1', name: 'A', spend: 500, clicks: 100, conversions: 2, revenue: 100 }]);
    expect(r.roiPct).toBeLessThan(0);
  });

  it('avoids division by zero when spend or clicks are zero', () => {
    const [r] = analyzeCampaigns([{ id: '1', name: 'A', spend: 0, clicks: 0, conversions: 0, revenue: 0 }]);
    expect(r.roiPct).toBe(0);
    expect(r.cpc).toBe(0);
    expect(r.conversionRatePct).toBe(0);
  });
});
