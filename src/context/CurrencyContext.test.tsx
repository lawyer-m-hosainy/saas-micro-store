import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CurrencyProvider, useCurrency } from './CurrencyContext';
import { EGP_RATE, MIN_EGP_PRICE } from '../config/constants';

describe('CurrencyContext', () => {
  it('is always EGP — the store no longer offers a currency switch', () => {
    const { result } = renderHook(() => useCurrency(), { wrapper: CurrencyProvider });
    expect(result.current.currency).toBe('EGP');
  });

  it('converts the internal base price to EGP using the marketing rate, rounded to a charm price', () => {
    const { result } = renderHook(() => useCurrency(), { wrapper: CurrencyProvider });
    // 49 * 15 = 735 -> rounded to nearest 50 = 750 -> minus 1 = 749
    expect(result.current.getAmount(49)).toBe(749);
  });

  it('never returns less than the minimum EGP price, even for a very cheap item', () => {
    const { result } = renderHook(() => useCurrency(), { wrapper: CurrencyProvider });
    // 1 * 15 = 15 -> rounded to nearest 50 = 0 -> minus 1 = -1, floored to MIN_EGP_PRICE
    expect(result.current.getAmount(1)).toBe(MIN_EGP_PRICE);
  });

  it('treats a zero base price as free', () => {
    const { result } = renderHook(() => useCurrency(), { wrapper: CurrencyProvider });
    expect(result.current.getAmount(0)).toBe(0);
  });

  it('honors a custom EGP override instead of the computed rate', () => {
    const { result } = renderHook(() => useCurrency(), { wrapper: CurrencyProvider });
    expect(result.current.getAmount(49, 999)).toBe(999);
  });

  it('formats EGP prices using Arabic-Egyptian locale grouping', () => {
    const { result } = renderHook(() => useCurrency(), { wrapper: CurrencyProvider });
    expect(result.current.formatPrice(49)).toBe(
      `${(Math.round((49 * EGP_RATE) / 50) * 50 - 1).toLocaleString('ar-EG')} ج.م`
    );
  });
});
