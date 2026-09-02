import React, { useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { PackageSearch, Plus, Search, Trash2 } from 'lucide-react';

export interface BinEntry {
  id: string;
  binCode: string; // مثال: A1-03
  aisle: string;
  productName: string;
  quantity: number;
}

/** يبحث في قاعدة بيانات المخزن المحلية عن رف/موقع منتج معين بمطابقة كود الرف أو اسم المنتج (غير حساس لحالة الأحرف) */
export function findBin(bins: BinEntry[], query: string): BinEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return bins.filter((b) => b.binCode.toLowerCase() === q || b.productName.toLowerCase().includes(q));
}

const seedBins = (): BinEntry[] => [
  { id: '1', binCode: 'A1-03', aisle: 'الممر A', productName: 'لابتوب Dell Inspiron', quantity: 12 },
  { id: '2', binCode: 'A2-11', aisle: 'الممر A', productName: 'ماوس لاسلكي Logitech', quantity: 340 },
  { id: '3', binCode: 'B3-07', aisle: 'الممر B', productName: 'شاحن سريع 65 وات', quantity: 88 },
];

export function WarehouseBinLocatorDemo() {
  const [bins, setBins] = useState<BinEntry[]>(seedBins());
  const [query, setQuery] = useState('لابتوب');
  const [selectedBinId, setSelectedBinId] = useState<string | null>(bins[0]?.id ?? null);

  const searchResults = useMemo(() => findBin(bins, query), [bins, query]);
  const selectedBin = bins.find((b) => b.id === selectedBinId) || null;

  const updateBin = (id: string, field: keyof BinEntry, value: string) => {
    setBins((prev) => prev.map((b) => (b.id === id ? { ...b, [field]: field === 'quantity' ? Number(value) || 0 : value } : b)));
  };
  const addBin = () => {
    const newBin: BinEntry = { id: Date.now().toString(), binCode: 'C1-01', aisle: 'الممر C', productName: 'منتج جديد', quantity: 0 };
    setBins((prev) => [...prev, newBin]);
    setSelectedBinId(newBin.id);
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-6 text-indigo-900 flex items-center gap-2"><PackageSearch size={20} /> نظام تحديد أماكن المخزون بالـQR (نسخة تعمل بالكامل)</h3>

      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm mb-5">
        <label className="block text-xs font-bold text-gray-600 mb-1.5">البحث عن منتج أو كود رف (محاكاة مسح الكاميرا)</label>
        <div className="relative">
          <Search size={15} className="absolute right-3 top-2.5 text-gray-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="اكتب اسم منتج أو كود رف زي A1-03" className="w-full pr-9 pl-3 py-2 border rounded-md text-sm" />
        </div>
        {query && (
          <div className="mt-2 space-y-1.5">
            {searchResults.length === 0 && <p className="text-xs text-gray-400">لا يوجد نتائج مطابقة.</p>}
            {searchResults.map((b) => (
              <button key={b.id} onClick={() => setSelectedBinId(b.id)} className="w-full text-right bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-lg p-2.5 text-xs flex items-center justify-between">
                <span className="font-bold text-indigo-800">{b.productName}</span>
                <span className="font-mono text-indigo-600">{b.binCode} — {b.aisle}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h4 className="font-bold text-gray-700 text-sm mb-1">قاعدة بيانات الرفوف ({bins.length})</h4>
          {bins.map((b) => (
            <div key={b.id} className={`bg-white p-3 rounded-lg border shadow-sm cursor-pointer ${selectedBinId === b.id ? 'border-indigo-300 ring-1 ring-indigo-200' : 'border-gray-100'}`} onClick={() => setSelectedBinId(b.id)}>
              <div className="flex items-center justify-between mb-2">
                <input value={b.binCode} onClick={(e) => e.stopPropagation()} onChange={(e) => updateBin(b.id, 'binCode', e.target.value)} className="font-mono font-bold text-xs text-indigo-700 border-b border-transparent focus:border-indigo-300 outline-none w-20" dir="ltr" />
                {bins.length > 1 && (
                  <button onClick={(e) => { e.stopPropagation(); setBins((prev) => prev.filter((x) => x.id !== b.id)); }} className="text-gray-300 hover:text-red-500"><Trash2 size={13} /></button>
                )}
              </div>
              <input value={b.productName} onClick={(e) => e.stopPropagation()} onChange={(e) => updateBin(b.id, 'productName', e.target.value)} className="text-xs text-gray-800 font-medium border-b border-transparent focus:border-indigo-300 outline-none w-full mb-1" />
              <div className="flex items-center gap-3 text-[10px] text-gray-500">
                <span>{b.aisle}</span>
                <span>الكمية: {b.quantity}</span>
              </div>
            </div>
          ))}
          <button onClick={addBin} className="text-sm text-indigo-600 font-medium hover:text-indigo-800 flex items-center gap-1"><Plus size={16} /> إضافة رف جديد</button>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm flex flex-col items-center justify-center">
          {selectedBin ? (
            <>
              <QRCodeSVG value={JSON.stringify({ bin: selectedBin.binCode, product: selectedBin.productName })} size={160} level="H" />
              <p className="mt-3 font-bold text-gray-800 text-sm">{selectedBin.binCode} — {selectedBin.aisle}</p>
              <p className="text-xs text-gray-500">{selectedBin.productName} · الكمية: {selectedBin.quantity}</p>
              <p className="text-[10px] text-gray-400 mt-2">امسح الكود بكاميرا الهاتف لعرض بيانات الرف فورًا</p>
            </>
          ) : (
            <p className="text-sm text-gray-400">اختر رفًا لعرض كود QR الخاص به</p>
          )}
        </div>
      </div>
    </div>
  );
}
