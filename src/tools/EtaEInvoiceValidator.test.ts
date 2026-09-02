import { describe, expect, it } from 'vitest';
import { computeGtinCheckDigit, validateEInvoice, validateGtin, InvoiceDocument } from './EtaEInvoiceValidator';

describe('computeGtinCheckDigit', () => {
  it('computes the standard GS1 check digit for a 12-digit data prefix', () => {
    expect(computeGtinCheckDigit('622400000000')).toBe(4);
  });

  it('is self-consistent: appending the computed digit always validates', () => {
    const data = '111122223333';
    const digit = computeGtinCheckDigit(data);
    expect(validateGtin(data + digit)).toBe(true);
  });
});

describe('validateGtin', () => {
  it('accepts a code whose check digit matches the GS1 algorithm', () => {
    expect(validateGtin('6224000000004')).toBe(true);
  });

  it('rejects a code with a tampered check digit', () => {
    expect(validateGtin('6224000000009')).toBe(false);
  });

  it('rejects non-numeric or wrong-length codes', () => {
    expect(validateGtin('abc')).toBe(false);
    expect(validateGtin('123')).toBe(false);
    expect(validateGtin('')).toBe(false);
  });
});

describe('validateEInvoice', () => {
  const validDoc: InvoiceDocument = {
    documentUuid: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    documentHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    totalAmount: 570,
    lines: [{ description: 'Laptop', itemCode: '6224000000004', quantity: 1, unitPrice: 500 }],
  };

  it('passes every check for a well-formed, correctly-totaled invoice', () => {
    const checks = validateEInvoice(validDoc);
    expect(checks.every((c) => c.pass)).toBe(true);
  });

  it('flags an invalid UUID', () => {
    const checks = validateEInvoice({ ...validDoc, documentUuid: 'not-a-uuid' });
    expect(checks.find((c) => c.key === 'uuid')?.pass).toBe(false);
  });

  it('flags a hash that is not 64 hex characters', () => {
    const checks = validateEInvoice({ ...validDoc, documentHash: 'deadbeef' });
    expect(checks.find((c) => c.key === 'hash')?.pass).toBe(false);
  });

  it('flags a line item code with an invalid GS1 check digit', () => {
    const checks = validateEInvoice({ ...validDoc, lines: [{ ...validDoc.lines[0], itemCode: '6224000000009' }] });
    expect(checks.find((c) => c.key === 'gtin-0')?.pass).toBe(false);
  });

  it('flags a stated total that does not match quantity*price plus 14% VAT', () => {
    const checks = validateEInvoice({ ...validDoc, totalAmount: 999 });
    expect(checks.find((c) => c.key === 'vat')?.pass).toBe(false);
  });

  it('respects a custom VAT rate', () => {
    // 500 * 1.10 = 550
    const checks = validateEInvoice({ ...validDoc, totalAmount: 550 }, 10);
    expect(checks.find((c) => c.key === 'vat')?.pass).toBe(true);
  });
});
