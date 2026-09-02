import { describe, expect, it } from 'vitest';
import { maskSecret, scanForSecrets, SECRET_PATTERNS } from './ApiKeyLeakScanner';

describe('scanForSecrets', () => {
  it('detects an OpenAI-style key', () => {
    const matches = scanForSecrets('OPENAI_API_KEY=sk-proj-aBcDeFgHiJkLmNoPqRsTuVwXyZ123456');
    expect(matches.some((m) => m.name === 'OpenAI API Key')).toBe(true);
  });

  it('detects a Stripe live secret key', () => {
    // مُجمَّعة من أجزاء عمداً حتى لا تُقرأ كمفتاح Stripe حقيقي متصل بواسطة أدوات فحص التسريبات
    const fakeStripeKey = ['sk_live_', '51H8xyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].join('');
    const matches = scanForSecrets(`const key = "${fakeStripeKey}";`);
    expect(matches.some((m) => m.name === 'Stripe Live Secret Key')).toBe(true);
  });

  it('detects an AWS access key id', () => {
    const matches = scanForSecrets('AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE');
    expect(matches.some((m) => m.name === 'AWS Access Key ID')).toBe(true);
  });

  it('detects a Postgres connection string with embedded credentials', () => {
    const matches = scanForSecrets('DATABASE_URL=postgres://admin:SuperSecret123@db.example.com:5432/prod');
    expect(matches.some((m) => m.name === 'Postgres/MySQL Connection String')).toBe(true);
  });

  it('reports the correct 1-indexed line number for each match', () => {
    const matches = scanForSecrets('line one\nline two\nAWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE\nline four');
    const m = matches.find((x) => x.name === 'AWS Access Key ID');
    expect(m?.line).toBe(3);
  });

  it('finds nothing in ordinary code with no secrets', () => {
    const matches = scanForSecrets('function add(a, b) { return a + b; }');
    expect(matches).toHaveLength(0);
  });

  it('covers at least 30 distinct secret patterns', () => {
    expect(SECRET_PATTERNS.length).toBeGreaterThanOrEqual(30);
  });

  it('finds multiple distinct secrets across multiple lines', () => {
    const text = [
      'OPENAI_API_KEY=sk-proj-aBcDeFgHiJkLmNoPqRsTuVwXyZ123456',
      'GITHUB_TOKEN=ghp_16C7e42F292c6912E7710c838347Ae178B4a',
    ].join('\n');
    const matches = scanForSecrets(text);
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });
});

describe('maskSecret', () => {
  it('keeps the first and last few characters and masks the middle', () => {
    const masked = maskSecret('sk-proj-aBcDeFgHiJkLmNoPqRsTuVwXyZ123456');
    expect(masked.startsWith('sk-pro')).toBe(true);
    expect(masked.endsWith('3456')).toBe(true);
    expect(masked).toContain('••••••••');
  });

  it('never reveals the full secret', () => {
    const secret = 'AKIAIOSFODNN7EXAMPLE';
    const masked = maskSecret(secret);
    expect(masked).not.toBe(secret);
  });
});
