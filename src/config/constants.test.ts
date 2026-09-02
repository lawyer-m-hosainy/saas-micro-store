import { describe, expect, it } from 'vitest';
import { getDeploymentFeeEgp, MIN_DEPLOYMENT_FEE_EGP } from './constants';

describe('getDeploymentFeeEgp', () => {
  it('applies the MIN_DEPLOYMENT_FEE_EGP floor once the product price can absorb it', () => {
    expect(getDeploymentFeeEgp(499)).toBe(MIN_DEPLOYMENT_FEE_EGP);
  });

  it('caps the fee at the product price itself for very cheap products (never pricier than the product)', () => {
    expect(getDeploymentFeeEgp(199)).toBe(199);
    expect(getDeploymentFeeEgp(0)).toBe(0);
  });

  it('scales as ~40% of the product price once that exceeds the floor', () => {
    // 40% of 899 = 359.6 -> rounded to nearest 10 = 360
    expect(getDeploymentFeeEgp(899)).toBe(360);
  });

  it('never exceeds the product price across the real catalog price range (199-899 EGP)', () => {
    for (const price of [199, 299, 499, 699, 899]) {
      expect(getDeploymentFeeEgp(price)).toBeLessThanOrEqual(price);
    }
  });
});
