import { describe, expect, it } from 'vitest';
import { BannerConfig, estimateSnippetSizeKb, generateBannerSnippet } from './CookieConsentBanner';

const cfg: BannerConfig = {
  message: 'نستخدم كوكيز.',
  acceptLabel: 'موافق',
  rejectLabel: 'رفض',
  accentColor: '#4f46e5',
  position: 'bottom',
  language: 'ar',
};

describe('generateBannerSnippet', () => {
  it('embeds the custom message and button labels in the output', () => {
    const html = generateBannerSnippet(cfg);
    expect(html).toContain('نستخدم كوكيز.');
    expect(html).toContain('موافق');
    expect(html).toContain('رفض');
  });

  it('uses the chosen accent color for the accept button', () => {
    const html = generateBannerSnippet({ ...cfg, accentColor: '#ff0000' });
    expect(html).toContain('#ff0000');
  });

  it('positions the banner at the bottom or top per config', () => {
    expect(generateBannerSnippet({ ...cfg, position: 'bottom' })).toContain('bottom:0');
    expect(generateBannerSnippet({ ...cfg, position: 'top' })).toContain('top:0');
  });

  it('persists the consent decision to localStorage and hides the banner on accept/reject', () => {
    const html = generateBannerSnippet(cfg);
    expect(html).toContain("localStorage.setItem(STORAGE_KEY, value)");
    expect(html).toContain("banner.style.display = 'none';");
  });

  it('does not re-show the banner once a decision was already saved', () => {
    const html = generateBannerSnippet(cfg);
    expect(html).toContain('if (!saved) {');
    expect(html).toContain("banner.style.display = 'block';");
  });
});

describe('estimateSnippetSizeKb', () => {
  it('stays under 5KB as advertised', () => {
    expect(estimateSnippetSizeKb(cfg)).toBeLessThan(5);
  });
});
