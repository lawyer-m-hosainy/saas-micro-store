import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { CurrencyProvider, useCurrency } from './CurrencyContext';
import { EGP_RATE, MIN_EGP_PRICE } from '../config/constants';

beforeEach(() => {
  localStorage.clear();
});

describe('CurrencyContext', () => {
  it('defaults to EGP when nothing is stored', () => {
    const { result } = renderHook(() => useCurrency(), { wrapper: CurrencyProvider });
    expect(result.current.currency).toBe('EGP');
  });

  it('restores a previously stored currency preference', () => {
    localStorage.setItem('preferred_currency', 'USD');
    const { result } = renderHook(() => useCurrency(), { wrapper: CurrencyProvider });
    expect(result.current.currency).toBe('USD');
  });

  it('returns the raw USD price unchanged when currency is USD', () => {
    const { result } = renderHook(() => useCurrency(), { wrapper: CurrencyProvider });
    act(() => result.current.setCurrency('USD'));
    expect(result.current.getAmount(49)).toBe(49);
    expect(result.current.formatPrice(49)).toBe('$49');
  });

  it('converts USD to EGP using the marketing rate, rounded to a charm price', () => {
    const { result } = renderHook(() => useCurrency(), { wrapper: CurrencyProvider });
    // 49 * 15 = 735 -> rounded to nearest 50 = 750 -> minus 1 = 749
    expect(result.current.getAmount(49)).toBe(749);
  });

  it('never returns less than the minimum EGP price, even for a very cheap item', () => {
    const { result } = renderHook(() => useCurrency(), { wrapper: CurrencyProvider });
    // 1 * 15 = 15 -> rounded to nearest 50 = 0 -> minus 1 = -1, floored to MIN_EGP_PRICE
    expect(result.current.getAmount(1)).toBe(MIN_EGP_PRICE);
  });

  it('treats a zero USD price as free regardless of currency', () => {
    const { result } = renderHook(() => useCurrency(), { wrapper: CurrencyProvider });
    expect(result.current.getAmount(0)).toBe(0);
    act(() => result.current.setCurrency('USD'));
    expect(result.current.getAmount(0)).toBe(0);
  });

  it('honors a custom EGP override instead of the computed rate', () => {
    const { result } = renderHook(() => useCurrency(), { wrapper: CurrencyProvider });
    expect(result.current.getAmount(49, 999)).toBe(999);
  });

  it('persists currency changes to localStorage', () => {
    const { result } = renderHook(() => useCurrency(), { wrapper: CurrencyProvider });
    act(() => result.current.setCurrency('USD'));
    expect(localStorage.getItem('preferred_currency')).toBe('USD');
  });

  it('formats EGP prices using Arabic-Egyptian locale grouping', () => {
    const { result } = renderHook(() => useCurrency(), { wrapper: CurrencyProvider });
    expect(result.current.formatPrice(49)).toBe(
      `${(Math.round((49 * EGP_RATE) / 50) * 50 - 1).toLocaleString('ar-EG')} ج.م`
    );
  });
});
