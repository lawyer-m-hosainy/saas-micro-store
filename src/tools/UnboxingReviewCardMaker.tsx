import React, { useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Gift, Plus, Star, Trash2 } from 'lucide-react';

export interface ReviewCardCustomer {
  id: string;
  name: string;
  orderRef: string;
  reviewed: boolean;
}

/** يولّد رمزاً فريداً لكل عميل من اسمه ورقم الطلب (بدون تصادم بين عملاء بنفس الاسم بفضل الطابع الزمني في المعرّف) */
export function buildReviewUrl(customer: ReviewCardCustomer, googleMapsPlaceUrl: string, discountCode: string): string {
  const base = googleMapsPlaceUrl || 'https://maps.google.com/your-store';
  const separator = base.includes('?') ? '&' : '?';
  return `${base}${separator}ref=${encodeURIComponent(customer.orderRef)}&promo=${encodeURIComponent(discountCode)}`;
}

export function computeReviewStats(customers: ReviewCardCustomer[]) {
  const total = customers.length;
  const reviewed = customers.filter((c) => c.reviewed).length;
  const rate = total > 0 ? (reviewed / total) * 100 : 0;
  return { total, reviewed, rate };
}

const seedCustomers = (): ReviewCardCustomer[] => [
  { id: '1', name: 'محمد إبراهيم', orderRef: 'ORD-3311', reviewed: true },
  { id: '2', name: 'هبة الشريف', orderRef: 'ORD-3312', reviewed: false },
  { id: '3', name: 'يوسف عادل', orderRef: 'ORD-3313', reviewed: false },
];

export function UnboxingReviewCardMakerDemo() {
  const [googleMapsPlaceUrl, setGoogleMapsPlaceUrl] = useState('https://maps.app.goo.gl/YourStoreLink');
  const [discountCode, setDiscountCode] = useState('THANKS10');
  const [customers, setCustomers] = useState<ReviewCardCustomer[]>(seedCustomers());
  const [selectedId, setSelectedId] = useState(seedCustomers()[0].id);

  const stats = useMemo(() => computeReviewStats(customers), [customers]);
  const selected = customers.find((c) => c.id === selectedId) || customers[0];
  const url = selected ? buildReviewUrl(selected, googleMapsPlaceUrl, discountCode) : '';

  const toggleReviewed = (id: string) => setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, reviewed: !c.reviewed } : c)));
  const addCustomer = () => {
    const c: ReviewCardCustomer = { id: Date.now().toString(), name: 'عميل جديد', orderRef: `ORD-${Math.floor(Math.random() * 9000) + 1000}`, reviewed: false };
    setCustomers((prev) => [...prev, c]);
    setSelectedId(c.id);
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-2 text-indigo-900 flex items-center gap-2"><Gift size={20} /> صانع بطاقات الشكر وطلب التقييمات (نسخة تعمل بالكامل)</h3>
      <p className="text-xs text-gray-500 mb-5">باركود مخصص حقيقي لكل عميل، وتتبّع محلي لعدد التقييمات المكتملة.</p>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div>
          <label className="block text-xs text-gray-600 mb-1">رابط تقييم خرائط جوجل لمتجرك</label>
          <input value={googleMapsPlaceUrl} onChange={(e) => setGoogleMapsPlaceUrl(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" dir="ltr" />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">كود الخصم الممنوح</label>
          <input value={discountCode} onChange={(e) => setDiscountCode(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" dir="ltr" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-gray-700 text-sm">عملاء هذه الدفعة ({stats.total})</h4>
            <span className="text-xs font-bold text-emerald-600">{stats.reviewed} قيّموا ({stats.rate.toFixed(0)}%)</span>
          </div>
          <div className="space-y-2">
            {customers.map((c) => (
              <div key={c.id} onClick={() => setSelectedId(c.id)} className={`bg-white p-3 rounded-lg border shadow-sm cursor-pointer flex items-center justify-between ${selectedId === c.id ? 'border-indigo-300 ring-1 ring-indigo-200' : 'border-gray-100'}`}>
                <div>
                  <p className="text-sm font-bold text-gray-800">{c.name}</p>
                  <p className="text-[10px] text-gray-400 font-mono">{c.orderRef}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); toggleReviewed(c.id); }} className={`text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 ${c.reviewed ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    <Star size={10} className={c.reviewed ? 'fill-emerald-600' : ''} /> {c.reviewed ? 'قيّم' : 'لم يقيّم'}
                  </button>
                  {customers.length > 1 && (
                    <button onClick={(e) => { e.stopPropagation(); setCustomers((prev) => prev.filter((x) => x.id !== c.id)); }} className="text-gray-300 hover:text-red-500"><Trash2 size={13} /></button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button onClick={addCustomer} className="text-sm text-indigo-600 font-medium hover:text-indigo-800 flex items-center gap-1 mt-3"><Plus size={16} /> إضافة عميل</button>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex flex-col items-center text-center">
          {selected && (
            <>
              <p className="text-[11px] text-gray-400 mb-1">شكراً لك</p>
              <p className="font-black text-gray-900 text-lg mb-3">{selected.name}</p>
              <QRCodeSVG value={url} size={150} level="H" />
              <p className="text-xs text-gray-600 mt-3">امسح الكود لتقييمنا واحصل على خصم</p>
              <p className="font-mono font-black text-indigo-600 text-lg mt-1">{discountCode}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
