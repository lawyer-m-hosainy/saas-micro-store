import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { EGP_RATE, MIN_EGP_PRICE } from '../config/constants';

// المتجر بيعتمد على الجنيه المصري فقط — العملة مش قابلة للتغيير من المستخدم.
export type Currency = 'EGP';

interface CurrencyContextType {
  currency: Currency;
  formatPrice: (priceUsd: number, customEgp?: number) => string;
  getAmount: (priceUsd: number, customEgp?: number) => number;
}

function computeEgpAmount(priceUsd: number, customEgp?: number): number {
  if (priceUsd === 0) return 0;
  if (customEgp) return customEgp;
  const calculated = Math.round((priceUsd * EGP_RATE) / 50) * 50 - 1;
  return Math.max(calculated, MIN_EGP_PRICE);
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'EGP',
  formatPrice: (p, c) => `${computeEgpAmount(p, c).toLocaleString('ar-EG')} ج.م`,
  getAmount: computeEgpAmount,
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const getAmount = useCallback((priceUsd: number, customEgp?: number): number => {
    return computeEgpAmount(priceUsd, customEgp);
  }, []);

  const formatPrice = useCallback((priceUsd: number, customEgp?: number): string => {
    return `${getAmount(priceUsd, customEgp).toLocaleString('ar-EG')} ج.م`;
  }, [getAmount]);

  const value = useMemo(() => ({ currency: 'EGP' as const, formatPrice, getAmount }), [formatPrice, getAmount]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
