import { describe, expect, it } from 'vitest';
import { buildTriageAlerts, TriageForm } from './SymptomTriageIntakeForm';

const base = (overrides: Partial<TriageForm> = {}): TriageForm => ({
  patientName: 'P', age: 30, symptoms: 'headache', durationDays: 1, painLevel: 2,
  allergies: [], chronicConditions: [], currentMedications: '',
  ...overrides,
});

describe('buildTriageAlerts', () => {
  it('produces no alerts for a low-risk, short-duration case', () => {
    expect(buildTriageAlerts(base())).toEqual([]);
  });

  it('flags declared allergies as a high-severity alert', () => {
    const alerts = buildTriageAlerts(base({ allergies: ['بنسلين'] }));
    expect(alerts.some((a) => a.severity === 'high' && a.message.includes('بنسلين'))).toBe(true);
  });

  it('flags declared chronic conditions as a high-severity alert', () => {
    const alerts = buildTriageAlerts(base({ chronicConditions: ['سكري'] }));
    expect(alerts.some((a) => a.severity === 'high' && a.message.includes('سكري'))).toBe(true);
  });

  it('flags pain level 8+ as high severity', () => {
    const alerts = buildTriageAlerts(base({ painLevel: 9 }));
    expect(alerts.some((a) => a.severity === 'high' && a.message.includes('9/10'))).toBe(true);
  });

  it('flags pain level 5-7 as medium severity, not high', () => {
    const alerts = buildTriageAlerts(base({ painLevel: 6 }));
    const painAlert = alerts.find((a) => a.message.includes('6/10'));
    expect(painAlert?.severity).toBe('medium');
  });

  it('does not flag pain level under 5', () => {
    const alerts = buildTriageAlerts(base({ painLevel: 3 }));
    expect(alerts.some((a) => a.message.includes('ألم'))).toBe(false);
  });

  it('flags symptoms lasting 14+ days as medium severity', () => {
    const alerts = buildTriageAlerts(base({ durationDays: 20 }));
    expect(alerts.some((a) => a.severity === 'medium' && a.message.includes('20 يوم'))).toBe(true);
  });

  it('combines multiple alerts when several risk factors are present', () => {
    const alerts = buildTriageAlerts(base({ allergies: ['بنسلين'], painLevel: 9, durationDays: 15 }));
    expect(alerts.length).toBeGreaterThanOrEqual(3);
  });
});
