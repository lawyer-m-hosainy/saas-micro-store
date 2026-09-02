import { describe, expect, it } from 'vitest';
import { groupByCategory, searchSnippets, Snippet } from './CannedResponseSnippetManager';

const snippets: Snippet[] = [
  { id: '1', category: 'شحن', title: 'تأخر الشحنة', body: 'نعتذر عن التأخير' },
  { id: '2', category: 'شحن', title: 'تتبع الطلب', body: 'رقم التتبع في رسالة التأكيد' },
  { id: '3', category: 'استرجاع', title: 'سياسة الاسترجاع', body: 'خلال 14 يوم' },
];

describe('searchSnippets', () => {
  it('returns all snippets for an empty query', () => {
    expect(searchSnippets(snippets, '')).toHaveLength(3);
  });

  it('matches by title, case-insensitively', () => {
    const results = searchSnippets(snippets, 'الشحنة');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('1');
  });

  it('matches by body content', () => {
    const results = searchSnippets(snippets, 'التتبع');
    expect(results.some((r) => r.id === '2')).toBe(true);
  });

  it('matches by category', () => {
    const results = searchSnippets(snippets, 'استرجاع');
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('3');
  });

  it('returns an empty array when nothing matches', () => {
    expect(searchSnippets(snippets, 'xyz-nonexistent')).toEqual([]);
  });

  it('ranks title matches above body-only matches', () => {
    const data: Snippet[] = [
      { id: 'a', category: 'C', title: 'general note', body: 'contains refund keyword' },
      { id: 'b', category: 'C', title: 'refund policy', body: 'something else' },
    ];
    const results = searchSnippets(data, 'refund');
    expect(results[0].id).toBe('b');
  });
});

describe('groupByCategory', () => {
  it('groups snippets under their category key', () => {
    const grouped = groupByCategory(snippets);
    expect(grouped.get('شحن')).toHaveLength(2);
    expect(grouped.get('استرجاع')).toHaveLength(1);
  });

  it('returns an empty map for an empty input list', () => {
    expect(groupByCategory([]).size).toBe(0);
  });
});
