import React, { useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle2, ChefHat, Clock, ShoppingCart } from 'lucide-react';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
}

export interface CartLine {
  itemId: string;
  qty: number;
}

export type OrderStatus = 'pending' | 'preparing' | 'served';

export interface KitchenOrder {
  id: string;
  tableNumber: number;
  lines: CartLine[];
  total: number;
  status: OrderStatus;
  createdAt: number;
}

const MENU: MenuItem[] = [
  { id: 'm1', name: 'برجر لحم', price: 145 },
  { id: 'm2', name: 'بيتزا مارجريتا', price: 120 },
  { id: 'm3', name: 'سلطة سيزر', price: 85 },
  { id: 'm4', name: 'عصير برتقال طازج', price: 40 },
];

/** يحسب إجمالي الطلب من الأصناف والكميات بضرب سعر كل صنف في كميته وجمع الكل */
export function computeCartTotal(cart: CartLine[], menu: MenuItem[]): number {
  return cart.reduce((sum, line) => {
    const item = menu.find((m) => m.id === line.itemId);
    return sum + (item ? item.price * line.qty : 0);
  }, 0);
}

/** ترتيب الحالات المسموح به: طلب جديد → قيد التحضير → تم التقديم فقط، بدون رجوع للخلف */
export function nextStatus(current: OrderStatus): OrderStatus | null {
  if (current === 'pending') return 'preparing';
  if (current === 'preparing') return 'served';
  return null;
}

export function SmartTableOrderingQrDemo() {
  const [tableNumber, setTableNumber] = useState(4);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [orders, setOrders] = useState<KitchenOrder[]>([]);

  const total = useMemo(() => computeCartTotal(cart, MENU), [cart]);

  const addToCart = (itemId: string) => {
    setCart((prev) => {
      const existing = prev.find((l) => l.itemId === itemId);
      if (existing) return prev.map((l) => (l.itemId === itemId ? { ...l, qty: l.qty + 1 } : l));
      return [...prev, { itemId, qty: 1 }];
    });
  };

  const submitOrder = () => {
    if (cart.length === 0) return;
    setOrders((prev) => [
      ...prev,
      { id: Date.now().toString(), tableNumber, lines: cart, total, status: 'pending', createdAt: Date.now() },
    ]);
    setCart([]);
  };

  const advanceStatus = (id: string) => {
    setOrders((prev) => prev.map((o) => {
      if (o.id !== id) return o;
      const next = nextStatus(o.status);
      return next ? { ...o, status: next } : o;
    }));
  };

  const statusMeta: Record<OrderStatus, { label: string; cls: string }> = {
    pending: { label: 'طلب جديد', cls: 'bg-amber-50 border-amber-200 text-amber-700' },
    preparing: { label: 'قيد التحضير', cls: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
    served: { label: 'تم التقديم', cls: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-6 text-indigo-900 flex items-center gap-2"><ShoppingCart size={20} /> نظام طلبات الطاولات بالـQR (نسخة تعمل بالكامل)</h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm text-center">
          <p className="text-xs text-gray-500 mb-2">QR طاولة رقم</p>
          <input type="number" value={tableNumber} onChange={(e) => setTableNumber(Number(e.target.value) || 1)} className="w-16 text-center px-2 py-1 border rounded-md text-sm mb-3" />
          <QRCodeSVG value={JSON.stringify({ table: tableNumber })} size={110} level="M" className="mx-auto" />
          <p className="text-[10px] text-gray-400 mt-2">امسح لتصفح المنيو وتأكيد الطلب</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
          <h4 className="font-bold text-gray-700 text-sm mb-3">منيو محاكاة الزبون (طاولة {tableNumber})</h4>
          <div className="space-y-2 mb-3">
            {MENU.map((m) => (
              <button key={m.id} onClick={() => addToCart(m.id)} className="w-full flex items-center justify-between bg-gray-50 hover:bg-indigo-50 p-2.5 rounded-md text-xs">
                <span className="font-bold text-gray-700">{m.name}</span>
                <span className="font-mono text-gray-500">{m.price} ج.م</span>
              </button>
            ))}
          </div>
          {cart.length > 0 && (
            <div className="border-t border-gray-100 pt-2 mb-3 space-y-1">
              {cart.map((l) => {
                const item = MENU.find((m) => m.id === l.itemId)!;
                return <p key={l.itemId} className="text-[11px] text-gray-500">{item.name} × {l.qty}</p>;
              })}
            </div>
          )}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">الإجمالي</span>
            <span className="font-mono font-bold text-indigo-700">{total} ج.م</span>
          </div>
          <button onClick={submitOrder} disabled={cart.length === 0} className="w-full bg-indigo-600 text-white py-2 rounded-md text-xs font-bold disabled:opacity-50">تأكيد الطلب للمطبخ</button>
        </div>

        <div>
          <h4 className="font-bold text-gray-700 text-sm mb-3 flex items-center gap-1.5"><ChefHat size={16} /> شاشة المطبخ ({orders.length})</h4>
          <div className="space-y-2">
            {orders.slice().reverse().map((o) => (
              <div key={o.id} className={`bg-white p-3 rounded-lg border shadow-sm ${o.status !== 'served' ? 'border-gray-100' : 'opacity-60'}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs text-gray-800">طاولة {o.tableNumber}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusMeta[o.status].cls}`}>{statusMeta[o.status].label}</span>
                </div>
                <p className="text-[10px] text-gray-400 mb-2">{o.lines.length} صنف · {o.total} ج.م</p>
                {o.status !== 'served' && (
                  <button onClick={() => advanceStatus(o.id)} className="text-[10px] text-indigo-600 font-bold flex items-center gap-1">
                    {o.status === 'pending' ? <Clock size={11} /> : <CheckCircle2 size={11} />} {o.status === 'pending' ? 'بدء التحضير' : 'تم التقديم'}
                  </button>
                )}
              </div>
            ))}
            {orders.length === 0 && <p className="text-xs text-gray-400">لا توجد طلبات بعد.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
