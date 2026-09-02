import { describe, expect, it } from 'vitest';
import { extractWaveformPeaks, normalizePeaks } from './SoundbiteQuoteVisualizer';

function makeChannel(values: number[]): Float32Array {
  return new Float32Array(values);
}

describe('extractWaveformPeaks', () => {
  it('returns exactly barCount peaks', () => {
    const data = makeChannel(Array.from({ length: 1000 }, () => Math.random()));
    expect(extractWaveformPeaks(data, 10)).toHaveLength(10);
  });

  it('finds the max absolute amplitude within each segment', () => {
    // 4 samples, 2 bars -> bar0 covers [0,1], bar1 covers [2,3]
    const data = makeChannel([0.1, -0.5, 0.3, 0.05]);
    const peaks = extractWaveformPeaks(data, 2);
    expect(peaks[0]).toBeCloseTo(0.5, 5);
    expect(peaks[1]).toBeCloseTo(0.3, 5);
  });

  it('returns an empty array for a non-positive bar count', () => {
    expect(extractWaveformPeaks(makeChannel([1, 2, 3]), 0)).toEqual([]);
  });

  it('handles silence (all zeros) without producing NaN', () => {
    const peaks = extractWaveformPeaks(makeChannel(new Array(100).fill(0)), 8);
    peaks.forEach((p) => expect(p).toBe(0));
  });
});

describe('normalizePeaks', () => {
  it('scales the largest peak to 1', () => {
    const normalized = normalizePeaks([0.2, 0.5, 0.1]);
    expect(Math.max(...normalized)).toBe(1);
  });

  it('preserves relative proportions between peaks', () => {
    const normalized = normalizePeaks([0.25, 0.5]);
    expect(normalized[0]).toBeCloseTo(0.5, 5);
    expect(normalized[1]).toBeCloseTo(1, 5);
  });

  it('does not divide by zero for an all-silent track', () => {
    const normalized = normalizePeaks([0, 0, 0]);
    normalized.forEach((n) => expect(Number.isFinite(n)).toBe(true));
  });
});
