import { describe, expect, it } from 'vitest';
import { ArticleFields, buildJsonLd, FaqItem, LocalBusinessFields, ProductFields, toScriptTag } from './SchemaMarkupBuilder';

describe('buildJsonLd', () => {
  it('builds a valid Product schema with nested Brand and Offer', () => {
    const fields: ProductFields = { name: 'Widget', description: 'A widget', priceUsd: 49, currency: 'USD', brand: 'Acme', ratingValue: 4.5, reviewCount: 10 };
    const jsonLd = buildJsonLd('Product', fields) as any;
    expect(jsonLd['@context']).toBe('https://schema.org/');
    expect(jsonLd['@type']).toBe('Product');
    expect(jsonLd.name).toBe('Widget');
    expect(jsonLd.brand).toEqual({ '@type': 'Brand', name: 'Acme' });
    expect(jsonLd.offers).toEqual({ '@type': 'Offer', price: 49, priceCurrency: 'USD', availability: 'https://schema.org/InStock' });
  });

  it('omits aggregateRating when there are no reviews', () => {
    const fields: ProductFields = { name: 'Widget', description: 'A widget', priceUsd: 49, currency: 'USD', brand: 'Acme', ratingValue: 0, reviewCount: 0 };
    const jsonLd = buildJsonLd('Product', fields) as any;
    expect(jsonLd.aggregateRating).toBeUndefined();
  });

  it('includes aggregateRating when reviewCount is positive', () => {
    const fields: ProductFields = { name: 'Widget', description: 'A widget', priceUsd: 49, currency: 'USD', brand: 'Acme', ratingValue: 4.8, reviewCount: 120 };
    const jsonLd = buildJsonLd('Product', fields) as any;
    expect(jsonLd.aggregateRating).toEqual({ '@type': 'AggregateRating', ratingValue: 4.8, reviewCount: 120 });
  });

  it('builds a valid Article schema with a nested Person author', () => {
    const fields: ArticleFields = { headline: 'Hello', authorName: 'Jane', datePublished: '2025-01-01', image: 'https://x.com/a.jpg' };
    const jsonLd = buildJsonLd('Article', fields) as any;
    expect(jsonLd['@type']).toBe('Article');
    expect(jsonLd.author).toEqual({ '@type': 'Person', name: 'Jane' });
  });

  it('builds a valid FAQPage schema with one Question/Answer pair per item', () => {
    const items: FaqItem[] = [
      { question: 'Q1?', answer: 'A1' },
      { question: 'Q2?', answer: 'A2' },
    ];
    const jsonLd = buildJsonLd('FAQPage', items) as any;
    expect(jsonLd['@type']).toBe('FAQPage');
    expect(jsonLd.mainEntity).toHaveLength(2);
    expect(jsonLd.mainEntity[0]).toEqual({ '@type': 'Question', name: 'Q1?', acceptedAnswer: { '@type': 'Answer', text: 'A1' } });
  });

  it('filters out FAQ items with an empty question', () => {
    const items: FaqItem[] = [{ question: '', answer: 'A1' }, { question: 'Q2?', answer: 'A2' }];
    const jsonLd = buildJsonLd('FAQPage', items) as any;
    expect(jsonLd.mainEntity).toHaveLength(1);
  });

  it('builds a valid LocalBusiness schema', () => {
    const fields: LocalBusinessFields = { name: 'My Shop', address: 'Cairo', telephone: '+201000000000', priceRange: '$$' };
    const jsonLd = buildJsonLd('LocalBusiness', fields) as any;
    expect(jsonLd['@type']).toBe('LocalBusiness');
    expect(jsonLd.telephone).toBe('+201000000000');
  });
});

describe('toScriptTag', () => {
  it('wraps the JSON-LD object in a valid application/ld+json script tag', () => {
    const tag = toScriptTag({ '@type': 'Thing' });
    expect(tag.startsWith('<script type="application/ld+json">')).toBe(true);
    expect(tag.trim().endsWith('</script>')).toBe(true);
    expect(tag).toContain('"@type": "Thing"');
  });
});
