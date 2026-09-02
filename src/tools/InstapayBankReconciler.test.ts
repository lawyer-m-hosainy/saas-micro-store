import { describe, expect, it } from 'vitest';
import { reconcile, Txn } from './InstapayBankReconciler';

describe('reconcile', () => {
  it('matches a sale to a bank entry with the same amount within tolerance', () => {
    const sales: Txn[] = [{ date: '2025-01-05', amount: 450, ref: 'ORD-1' }];
    const bank: Txn[] = [{ date: '2025-01-06', amount: 450, ref: 'INSTAPAY-1' }];
    const r = reconcile(sales, bank);
    expect(r.matched).toHaveLength(1);
    expect(r.missingPayment).toHaveLength(0);
  });

  it('flags a sale with no matching bank entry as missing payment', () => {
    const sales: Txn[] = [{ date: '2025-01-05', amount: 450, ref: 'ORD-1' }];
    const bank: Txn[] = [];
    const r = reconcile(sales, bank);
    expect(r.missingPayment).toEqual(sales);
  });

  it('flags a bank deposit with no matching sale as an unexplained deposit', () => {
    const sales: Txn[] = [];
    const bank: Txn[] = [{ date: '2025-01-05', amount: 450, ref: 'INSTAPAY-1' }];
    const r = reconcile(sales, bank);
    expect(r.unexplainedDeposit).toEqual(bank);
  });

  it('does not match across the tolerance window', () => {
    const sales: Txn[] = [{ date: '2025-01-01', amount: 100, ref: 'ORD-1' }];
    const bank: Txn[] = [{ date: '2025-01-10', amount: 100, ref: 'INSTAPAY-1' }];
    const r = reconcile(sales, bank, 3);
    expect(r.matched).toHaveLength(0);
    expect(r.missingPayment).toHaveLength(1);
    expect(r.unexplainedDeposit).toHaveLength(1);
  });

  it('does not double-match the same bank entry to two sales', () => {
    const sales: Txn[] = [
      { date: '2025-01-05', amount: 450, ref: 'ORD-1' },
      { date: '2025-01-05', amount: 450, ref: 'ORD-2' },
    ];
    const bank: Txn[] = [{ date: '2025-01-05', amount: 450, ref: 'INSTAPAY-1' }];
    const r = reconcile(sales, bank);
    expect(r.matched).toHaveLength(1);
    expect(r.missingPayment).toHaveLength(1);
  });

  it('flags bank entries sharing the same amount and reference as duplicates', () => {
    const bank: Txn[] = [
      { date: '2025-01-05', amount: 320, ref: 'INSTAPAY-2' },
      { date: '2025-01-05', amount: 320, ref: 'INSTAPAY-2' },
    ];
    const r = reconcile([], bank);
    expect(r.duplicateBankEntries).toHaveLength(2);
  });

  it('does not flag two different bank entries with the same amount but different references', () => {
    const bank: Txn[] = [
      { date: '2025-01-05', amount: 320, ref: 'INSTAPAY-2' },
      { date: '2025-01-06', amount: 320, ref: 'INSTAPAY-3' },
    ];
    const r = reconcile([], bank);
    expect(r.duplicateBankEntries).toHaveLength(0);
  });
});
