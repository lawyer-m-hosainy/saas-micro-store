import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { EGP_RATE, MIN_EGP_PRICE } from '../config/constants';

export type Currency = 'EGP' | 'USD';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (priceUsd: number, customEgp?: number) => string;
  getAmount: (priceUsd: number, customEgp?: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'EGP',
  setCurrency: () => {},
  formatPrice: (p) => `${p} ج.م`,
  getAmount: (p) => p,
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const stored = localStorage.getItem('preferred_currency');
    return (stored === 'USD' || stored === 'EGP') ? stored : 'EGP';
  });

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    try { localStorage.setItem('preferred_currency', c); } catch {}
  }, []);

  const getAmount = useCallback((priceUsd: number, customEgp?: number): number => {
    if (priceUsd === 0) return 0;
    if (currency === 'EGP') {
      if (customEgp) return customEgp;
      const calculated = Math.round((priceUsd * EGP_RATE) / 50) * 50 - 1;
      return Math.max(calculated, MIN_EGP_PRICE);
    }
    return priceUsd;
  }, [currency]);

  const formatPrice = useCallback((priceUsd: number, customEgp?: number): string => {
    const amount = getAmount(priceUsd, customEgp);
    if (currency === 'EGP') {
      return `${amount.toLocaleString('ar-EG')} ج.م`;
    }
    return `$${amount.toLocaleString('en-US')}`;
  }, [currency, getAmount]);

  const value = useMemo(() => ({ currency, setCurrency, formatPrice, getAmount }), [currency, setCurrency, formatPrice, getAmount]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
