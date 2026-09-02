import { describe, expect, it } from 'vitest';
import { buildVerificationCode, parseNamesList, verifyCertificate } from './CertificateBulkGenerator';

describe('buildVerificationCode / verifyCertificate', () => {
  it('is deterministic for the same course and student', () => {
    expect(buildVerificationCode('Marketing 101', 'Ali')).toBe(buildVerificationCode('Marketing 101', 'Ali'));
  });

  it('produces different codes for different students', () => {
    expect(buildVerificationCode('Marketing 101', 'Ali')).not.toBe(buildVerificationCode('Marketing 101', 'Sara'));
  });

  it('produces different codes for different courses', () => {
    expect(buildVerificationCode('Marketing 101', 'Ali')).not.toBe(buildVerificationCode('SEO Basics', 'Ali'));
  });

  it('verifies a code generated for the matching course and student', () => {
    const code = buildVerificationCode('Marketing 101', 'Ali');
    expect(verifyCertificate('Marketing 101', 'Ali', code)).toBe(true);
  });

  it('rejects a code checked against a different student name', () => {
    const code = buildVerificationCode('Marketing 101', 'Ali');
    expect(verifyCertificate('Marketing 101', 'Sara', code)).toBe(false);
  });

  it('rejects a tampered code', () => {
    const code = buildVerificationCode('Marketing 101', 'Ali');
    expect(verifyCertificate('Marketing 101', 'Ali', code + 'X')).toBe(false);
  });

  it('always starts with the CERT- prefix', () => {
    expect(buildVerificationCode('Any', 'Name').startsWith('CERT-')).toBe(true);
  });
});

describe('parseNamesList', () => {
  it('splits names by line and trims whitespace', () => {
    expect(parseNamesList('Ali\n  Sara  \nOmar')).toEqual(['Ali', 'Sara', 'Omar']);
  });

  it('skips blank lines', () => {
    expect(parseNamesList('Ali\n\n\nSara')).toEqual(['Ali', 'Sara']);
  });

  it('returns an empty array for empty input', () => {
    expect(parseNamesList('')).toEqual([]);
  });
});
