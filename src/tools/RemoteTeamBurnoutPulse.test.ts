import { describe, expect, it } from 'vitest';
import { PulseResponse, summarizePulse } from './RemoteTeamBurnoutPulse';

const resp = (energyScore: number, stressScore: number, id = '1'): PulseResponse => ({ id, energyScore, stressScore, weekLabel: 'W1' });

describe('summarizePulse', () => {
  it('computes average energy and stress scores', () => {
    const s = summarizePulse([resp(4, 2, '1'), resp(2, 4, '2')]);
    expect(s.avgEnergy).toBe(3);
    expect(s.avgStress).toBe(3);
  });

  it('counts a response as at-risk only when energy is low AND stress is high', () => {
    const s = summarizePulse([resp(1, 5, '1'), resp(5, 1, '2'), resp(1, 1, '3'), resp(5, 5, '4')]);
    // only response 1 (energy<=2 and stress>=4) counts as at-risk -> 1/4 = 25%
    expect(s.burnoutRiskPct).toBe(25);
  });

  it('reports healthy status when risk is under 10%', () => {
    const responses = Array.from({ length: 10 }, (_, i) => resp(4, 2, String(i)));
    expect(summarizePulse(responses).status).toBe('healthy');
  });

  it('reports watch status when risk is between 10% and 30%', () => {
    const responses = [
      ...Array.from({ length: 8 }, (_, i) => resp(4, 2, `ok${i}`)),
      resp(1, 5, 'risk1'),
      resp(1, 5, 'risk2'),
    ];
    const s = summarizePulse(responses);
    expect(s.burnoutRiskPct).toBe(20);
    expect(s.status).toBe('watch');
  });

  it('reports critical status when risk is 30% or higher', () => {
    const responses = [resp(1, 5, '1'), resp(1, 5, '2'), resp(1, 5, '3'), resp(4, 2, '4')];
    const s = summarizePulse(responses);
    expect(s.burnoutRiskPct).toBe(75);
    expect(s.status).toBe('critical');
  });

  it('handles an empty response list without dividing by zero', () => {
    const s = summarizePulse([]);
    expect(s.count).toBe(0);
    expect(s.burnoutRiskPct).toBe(0);
    expect(s.status).toBe('healthy');
  });
});
