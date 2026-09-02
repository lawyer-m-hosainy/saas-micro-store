import { describe, expect, it } from 'vitest';
import { checkClimateAlerts, ClimateReading, SafeRange } from './GreenhouseClimateLogger';

const range: SafeRange = { minTempC: 10, maxTempC: 32, minHumidityPct: 40, maxHumidityPct: 75 };
const reading = (overrides: Partial<ClimateReading> = {}): ClimateReading => ({ id: '1', time: '12:00', tempC: 20, humidityPct: 55, ...overrides });

describe('checkClimateAlerts', () => {
  it('produces no alerts for a reading fully within range', () => {
    expect(checkClimateAlerts([reading()], range)).toEqual([]);
  });

  it('flags a frost risk when temperature is below the minimum', () => {
    const alerts = checkClimateAlerts([reading({ tempC: 5 })], range);
    expect(alerts.some((a) => a.message.includes('صقيع'))).toBe(true);
  });

  it('flags a heatwave when temperature is above the maximum', () => {
    const alerts = checkClimateAlerts([reading({ tempC: 40 })], range);
    expect(alerts.some((a) => a.message.includes('حر'))).toBe(true);
  });

  it('flags low humidity below the minimum', () => {
    const alerts = checkClimateAlerts([reading({ humidityPct: 20 })], range);
    expect(alerts.some((a) => a.message.includes('منخفضة'))).toBe(true);
  });

  it('flags high humidity above the maximum', () => {
    const alerts = checkClimateAlerts([reading({ humidityPct: 90 })], range);
    expect(alerts.some((a) => a.message.includes('زائدة'))).toBe(true);
  });

  it('can produce two alerts for one reading breaching both temp and humidity', () => {
    const alerts = checkClimateAlerts([reading({ tempC: 40, humidityPct: 90 })], range);
    expect(alerts).toHaveLength(2);
  });

  it('checks every reading independently', () => {
    const alerts = checkClimateAlerts([reading({ id: 'a', tempC: 5 }), reading({ id: 'b', tempC: 20 })], range);
    expect(alerts.filter((a) => a.readingId === 'a')).toHaveLength(1);
    expect(alerts.filter((a) => a.readingId === 'b')).toHaveLength(0);
  });
});
