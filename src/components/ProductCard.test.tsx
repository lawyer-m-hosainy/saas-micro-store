import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ProductCard } from './ProductCard';
import { CurrencyProvider } from '../context/CurrencyContext';
import { Product } from '../types';

const mockProduct: Product = {
  id: 'test-product-1',
  title: 'مولد الفواتير الذكي',
  description: 'أداة لإصدار فواتير احترافية في ثوانٍ',
  price: 49,
  features: ['تصدير PDF', 'قوالب متعددة'],
  icon: 'FileText',
  categoryId: 'productivity',
};

function renderCard(overrides: Partial<Parameters<typeof ProductCard>[0]> = {}) {
  const onBuy = vi.fn();
  const onDemo = vi.fn();
  render(
    <CurrencyProvider>
      <ProductCard product={mockProduct} onBuy={onBuy} onDemo={onDemo} {...overrides} />
    </CurrencyProvider>
  );
  return { onBuy, onDemo };
}

describe('ProductCard', () => {
  it('renders the product title, description, and features', () => {
    renderCard();
    expect(screen.getByText(mockProduct.title)).toBeInTheDocument();
    expect(screen.getByText(mockProduct.description)).toBeInTheDocument();
    for (const feature of mockProduct.features) {
      expect(screen.getByText(feature)).toBeInTheDocument();
    }
  });

  it('calls onBuy when the quick-buy button is clicked', () => {
    const { onBuy } = renderCard();
    fireEvent.click(screen.getByText('شراء سريع'));
    expect(onBuy).toHaveBeenCalledWith(mockProduct);
  });

  it('calls onDemo when the live-demo button is clicked', () => {
    const { onDemo } = renderCard();
    fireEvent.click(screen.getByText('تجربة حية'));
    expect(onDemo).toHaveBeenCalledWith(mockProduct);
  });

  it('does not render a whitelabel button when onWhitelabel is not provided', () => {
    renderCard();
    expect(screen.queryByTitle('تخصيص الهوية التجارية والشعار (White-Label)')).not.toBeInTheDocument();
  });

  it('renders a whitelabel button and invokes the callback when provided', () => {
    const onWhitelabel = vi.fn();
    renderCard({ onWhitelabel });
    fireEvent.click(screen.getByTitle('تخصيص الهوية التجارية والشعار (White-Label)'));
    expect(onWhitelabel).toHaveBeenCalledWith(mockProduct);
  });
});
