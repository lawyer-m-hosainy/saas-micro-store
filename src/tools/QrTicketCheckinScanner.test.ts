import { describe, expect, it } from 'vitest';
import { checkIn, signTicketCode, verifyTicketCode } from './QrTicketCheckinScanner';

const SECRET = 'EVENT-SECRET';

describe('signTicketCode / verifyTicketCode', () => {
  it('produces a code that verifies as valid for the same secret and ticket id', () => {
    const code = signTicketCode(SECRET, 'TCK-1');
    expect(verifyTicketCode(SECRET, code).valid).toBe(true);
  });

  it('is deterministic — the same secret and ticket id always produce the same code', () => {
    expect(signTicketCode(SECRET, 'TCK-1')).toBe(signTicketCode(SECRET, 'TCK-1'));
  });

  it('rejects a code signed with a different event secret', () => {
    const code = signTicketCode('OTHER-SECRET', 'TCK-1');
    expect(verifyTicketCode(SECRET, code).valid).toBe(false);
  });

  it('rejects a tampered code', () => {
    const code = signTicketCode(SECRET, 'TCK-1');
    const tampered = code.slice(0, -1) + (code.slice(-1) === 'A' ? 'B' : 'A');
    expect(verifyTicketCode(SECRET, tampered).valid).toBe(false);
  });

  it('produces different codes for different ticket ids', () => {
    expect(signTicketCode(SECRET, 'TCK-1')).not.toBe(signTicketCode(SECRET, 'TCK-2'));
  });
});

describe('checkIn', () => {
  it('allows check-in for a valid, unused ticket', () => {
    const code = signTicketCode(SECRET, 'TCK-1');
    const result = checkIn(SECRET, code, new Set());
    expect(result.status).toBe('ok');
  });

  it('rejects check-in for an invalid code', () => {
    const result = checkIn(SECRET, 'garbage-code', new Set());
    expect(result.status).toBe('invalid');
  });

  it('rejects a second check-in attempt with the same code as a duplicate', () => {
    const code = signTicketCode(SECRET, 'TCK-1');
    const result = checkIn(SECRET, code, new Set([code]));
    expect(result.status).toBe('duplicate');
  });

  it('does not flag two different valid tickets as duplicates of each other', () => {
    const codeA = signTicketCode(SECRET, 'TCK-1');
    const codeB = signTicketCode(SECRET, 'TCK-2');
    const result = checkIn(SECRET, codeB, new Set([codeA]));
    expect(result.status).toBe('ok');
  });
});
