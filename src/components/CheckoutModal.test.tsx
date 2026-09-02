import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CheckoutModal } from './CheckoutModal';
import { CurrencyProvider } from '../context/CurrencyContext';
import { Product } from '../types';

const mockProduct: Product = {
  id: 'test-product-1',
  title: 'مولد الفواتير الذكي',
  description: 'أداة لإصدار فواتير احترافية في ثوانٍ',
  price: 49,
  features: ['تصدير PDF'],
  icon: 'FileText',
  categoryId: 'productivity',
};

function renderModal(onOrderCreated = vi.fn()) {
  render(
    <CurrencyProvider>
      <CheckoutModal product={mockProduct} onClose={vi.fn()} onOrderCreated={onOrderCreated} />
    </CurrencyProvider>
  );
  return { onOrderCreated };
}

function fillBuyerForm() {
  fireEvent.change(screen.getByPlaceholderText('مثال: محمد الحسيني'), { target: { value: 'أحمد سامي' } });
  fireEvent.change(screen.getByPlaceholderText('yourname@gmail.com'), { target: { value: 'ahmed@example.com' } });
  fireEvent.change(screen.getByPlaceholderText('01XXXXXXXXX'), { target: { value: '01012345678' } });
  fireEvent.change(screen.getByPlaceholderText('مثال: رقم محفظتك 010... أو اسم حساب إنستاباي'), { target: { value: '01012345678' } });
}

describe('CheckoutModal', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('submits the order to POST /api/orders and shows the server-issued order number on success', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: '#ORD-555555',
        productId: mockProduct.id,
        productTitle: mockProduct.title,
        buyerName: 'أحمد سامي',
        buyerEmail: 'ahmed@example.com',
        buyerPhone: '01012345678',
        senderAccount: '01012345678',
        amountEgp: 1450,
        amountUsd: 29,
        status: 'pending',
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const { onOrderCreated } = renderModal();
    fillBuyerForm();
    fireEvent.click(screen.getByText(/تأكيد تسجيل طلب الشراء الآن/));

    await waitFor(() => expect(screen.getByText(/#ORD-555555/)).toBeInTheDocument());

    expect(fetchMock).toHaveBeenCalledWith('/api/orders', expect.objectContaining({ method: 'POST' }));
    expect(onOrderCreated).toHaveBeenCalledWith(expect.objectContaining({ id: '#ORD-555555', status: 'pending' }));
  });

  it('shows an error and does not reveal the success screen when the server rejects the order', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Missing required order fields' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const { onOrderCreated } = renderModal();
    fillBuyerForm();
    fireEvent.click(screen.getByText(/تأكيد تسجيل طلب الشراء الآن/));

    await waitFor(() => expect(screen.getByText('Missing required order fields')).toBeInTheDocument());
    expect(screen.queryByText('تم تسجيل طلبك بنجاح!')).not.toBeInTheDocument();
    expect(onOrderCreated).not.toHaveBeenCalled();
  });
});
