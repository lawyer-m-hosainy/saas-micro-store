import { describe, expect, it } from 'vitest';
import { buildMenuText, exportConfig, MenuOption, validateMenu } from './WhatsappAutoResponderBuilder';

const opt = (overrides: Partial<MenuOption> = {}): MenuOption => ({ id: '1', key: '1', label: 'Sales', response: 'Hi!', ...overrides });

describe('validateMenu', () => {
  it('returns no issues for a well-formed menu', () => {
    expect(validateMenu([opt({ id: '1', key: '1' }), opt({ id: '2', key: '2' })])).toEqual([]);
  });

  it('flags duplicate keys', () => {
    const issues = validateMenu([opt({ id: '1', key: '1' }), opt({ id: '2', key: '1' })]);
    expect(issues.some((i) => i.type === 'duplicate-key')).toBe(true);
  });

  it('flags an empty key', () => {
    const issues = validateMenu([opt({ key: '' })]);
    expect(issues.some((i) => i.type === 'empty-key')).toBe(true);
  });

  it('flags an empty response', () => {
    const issues = validateMenu([opt({ response: '' })]);
    expect(issues.some((i) => i.type === 'empty-response')).toBe(true);
  });

  it('does not flag two options both missing a key as duplicates of each other', () => {
    const issues = validateMenu([opt({ key: '' }), opt({ key: '' })]);
    expect(issues.some((i) => i.type === 'duplicate-key')).toBe(false);
  });
});

describe('buildMenuText', () => {
  it('includes the welcome message and every option key/label', () => {
    const text = buildMenuText('Welcome!', [opt({ key: '1', label: 'Sales' }), opt({ key: '2', label: 'Support' })]);
    expect(text).toContain('Welcome!');
    expect(text).toContain('1️⃣ Sales');
    expect(text).toContain('2️⃣ Support');
  });
});

describe('exportConfig', () => {
  it('produces valid JSON with the welcome message and options', () => {
    const json = exportConfig('Welcome!', [opt()]);
    const parsed = JSON.parse(json);
    expect(parsed.welcomeMessage).toBe('Welcome!');
    expect(parsed.options).toHaveLength(1);
    expect(parsed.options[0]).toEqual({ key: '1', label: 'Sales', response: 'Hi!' });
  });
});
