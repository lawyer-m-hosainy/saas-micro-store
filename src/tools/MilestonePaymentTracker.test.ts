import { describe, expect, it } from 'vitest';
import { buildPaymentDemandLetter, Milestone, summarizeContract } from './MilestonePaymentTracker';

const milestone = (overrides: Partial<Milestone> = {}): Milestone => ({
  id: '1', name: 'M', amount: 1000, status: 'pending', dueDate: '2025-01-01', ...overrides,
});

const TODAY = new Date('2025-02-01T00:00:00');

describe('summarizeContract', () => {
  it('sums all milestone amounts as total contract value', () => {
    const s = summarizeContract([milestone({ amount: 1000 }), milestone({ amount: 2000 })], TODAY);
    expect(s.totalContractValue).toBe(3000);
  });

  it('sums only paid milestones as paid amount', () => {
    const s = summarizeContract([milestone({ amount: 1000, status: 'paid' }), milestone({ amount: 2000, status: 'pending' })], TODAY);
    expect(s.paidAmount).toBe(1000);
  });

  it('sums only approved-but-unpaid milestones separately', () => {
    const s = summarizeContract([milestone({ amount: 500, status: 'approved' }), milestone({ amount: 1000, status: 'paid' })], TODAY);
    expect(s.approvedUnpaidAmount).toBe(500);
  });

  it('computes remaining amount as total minus paid', () => {
    const s = summarizeContract([milestone({ amount: 1000, status: 'paid' }), milestone({ amount: 2000, status: 'pending' })], TODAY);
    expect(s.remainingAmount).toBe(2000);
  });

  it('flags a non-paid milestone past its due date as overdue', () => {
    const s = summarizeContract([milestone({ status: 'approved', dueDate: '2025-01-01' })], TODAY);
    expect(s.overdueMilestones).toHaveLength(1);
  });

  it('does not flag a paid milestone as overdue even if its due date has passed', () => {
    const s = summarizeContract([milestone({ status: 'paid', dueDate: '2025-01-01' })], TODAY);
    expect(s.overdueMilestones).toHaveLength(0);
  });

  it('does not flag a milestone whose due date is still in the future', () => {
    const s = summarizeContract([milestone({ status: 'pending', dueDate: '2025-03-01' })], TODAY);
    expect(s.overdueMilestones).toHaveLength(0);
  });
});

describe('buildPaymentDemandLetter', () => {
  it('includes the client name, milestone name, amount, and due date', () => {
    const letter = buildPaymentDemandLetter(milestone({ name: 'Phase 1', amount: 5000, dueDate: '2025-01-15' }), 'Acme Inc');
    expect(letter).toContain('Acme Inc');
    expect(letter).toContain('Phase 1');
    expect(letter).toContain('5,000');
    expect(letter).toContain('2025-01-15');
  });
});
