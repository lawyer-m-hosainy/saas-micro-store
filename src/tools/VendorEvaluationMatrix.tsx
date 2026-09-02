import React, { useMemo, useState } from 'react';
import { Award, Plus, Trash2 } from 'lucide-react';

export interface VendorCriteriaWeights {
  pricePct: number;
  qualityPct: number;
  deliveryPct: number;
}

export interface VendorEntry {
  id: string;
  name: string;
  unitPrice: number;
  quantity: number;
  extraCosts: number; // شحن/تركيب/رسوم إضافية تدخل في TCO
  priceScore: number; // 1-10 (10 = أفضل سعر)
  qualityScore: number; // 1-10
  deliveryScore: number; // 1-10
}

export interface VendorResult extends VendorEntry {
  weightedScore: number;
  tco: number;
}

/** درجة موزونة = (سعر × وزن + جودة × وزن + سرعة توريد × وزن) / 10، وTCO = سعر الوحدة × الكمية + تكاليف إضافية */
export function evaluateVendors(vendors: VendorEntry[], weights: VendorCriteriaWeights): VendorResult[] {
  return vendors.map((v) => {
    const weightedScore =
      (v.priceScore * weights.pricePct + v.qualityScore * weights.qualityPct + v.deliveryScore * weights.deliveryPct) / 100;
    const tco = v.unitPrice * v.quantity + v.extraCosts;
    return { ...v, weightedScore, tco };
  });
}

const emptyVendor = (n: number): VendorEntry => ({
  id: Date.now().toString() + n,
  name: `مورد ${n}`,
  unitPrice: 100,
  quantity: 50,
  extraCosts: 500,
  priceScore: 6,
  qualityScore: 6,
  deliveryScore: 6,
});

export function VendorEvaluationMatrixDemo() {
  const [weights, setWeights] = useState<VendorCriteriaWeights>({ pricePct: 40, qualityPct: 40, deliveryPct: 20 });
  const [vendors, setVendors] = useState<VendorEntry[]>([emptyVendor(1), emptyVendor(2)]);

  const weightsSum = weights.pricePct + weights.qualityPct + weights.deliveryPct;
  const results = useMemo(() => evaluateVendors(vendors, weights), [vendors, weights]);
  const best = useMemo(() => (results.length ? results.reduce((a, b) => (b.weightedScore > a.weightedScore ? b : a)) : null), [results]);
  const maxScore = Math.max(...results.map((r) => r.weightedScore), 1);

  const updateVendor = (id: string, field: keyof VendorEntry, value: string) => {
    setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, [field]: field === 'name' ? value : Number(value) || 0 } : v)));
  };
  const updateWeight = (field: keyof VendorCriteriaWeights, value: string) => {
    setWeights((prev) => ({ ...prev, [field]: Number(value) || 0 }));
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-2 text-indigo-900">مصفوفة تقييم الموردين (نسخة تعمل بالكامل)</h3>
      <p className="text-xs text-gray-500 mb-5">قيّم كل مورد من 1-10 في كل معيار، واضبط الأوزان حسب أولوياتك.</p>

      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm mb-5 flex flex-wrap gap-4 items-end">
        <WeightField label="وزن السعر (%)" value={weights.pricePct} onChange={(v) => updateWeight('pricePct', v)} />
        <WeightField label="وزن الجودة (%)" value={weights.qualityPct} onChange={(v) => updateWeight('qualityPct', v)} />
        <WeightField label="وزن سرعة التوريد (%)" value={weights.deliveryPct} onChange={(v) => updateWeight('deliveryPct', v)} />
        <span className={`text-xs font-bold px-2.5 py-1.5 rounded-lg ${weightsSum === 100 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
          مجموع الأوزان: {weightsSum}% {weightsSum !== 100 && '(يفضّل يساوي 100%)'}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        {results.map((r) => {
          const isBest = results.length > 1 && best && r.id === best.id;
          return (
            <div key={r.id} className={`bg-white p-4 rounded-lg border shadow-sm ${isBest ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-gray-100'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <input value={r.name} onChange={(e) => updateVendor(r.id, 'name', e.target.value)} className="font-bold text-sm text-gray-800 border-b border-transparent focus:border-indigo-300 outline-none" />
                  {isBest && <span className="flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full"><Award size={11} /> الأنسب</span>}
                </div>
                {vendors.length > 1 && (
                  <button onClick={() => setVendors((prev) => prev.filter((v) => v.id !== r.id))} className="text-gray-300 hover:text-red-500"><Trash2 size={15} /></button>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
                <Mini label="سعر الوحدة" value={r.unitPrice} onChange={(v) => updateVendor(r.id, 'unitPrice', v)} />
                <Mini label="الكمية" value={r.quantity} onChange={(v) => updateVendor(r.id, 'quantity', v)} />
                <Mini label="تكاليف إضافية" value={r.extraCosts} onChange={(v) => updateVendor(r.id, 'extraCosts', v)} />
                <Mini label="درجة السعر /10" value={r.priceScore} onChange={(v) => updateVendor(r.id, 'priceScore', v)} max={10} />
                <Mini label="درجة الجودة /10" value={r.qualityScore} onChange={(v) => updateVendor(r.id, 'qualityScore', v)} max={10} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 items-center">
                <Mini label="درجة سرعة التوريد /10" value={r.deliveryScore} onChange={(v) => updateVendor(r.id, 'deliveryScore', v)} max={10} />
                <div className="bg-gray-50 rounded-md px-2 py-1.5">
                  <div className="text-[10px] text-gray-500">التكلفة الإجمالية TCO</div>
                  <div className="font-mono font-bold text-xs" dir="ltr">${r.tco.toLocaleString()}</div>
                </div>
                <div className="rounded-md px-2 py-1.5 bg-indigo-50">
                  <div className="text-[10px] text-indigo-600">الدرجة الموزونة</div>
                  <div className="flex items-center gap-2">
                    <div className="font-mono font-bold text-xs text-indigo-700">{r.weightedScore.toFixed(2)}</div>
                    <div className="flex-1 bg-indigo-100 rounded-full h-1.5">
                      <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${(r.weightedScore / maxScore) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={() => setVendors((prev) => [...prev, emptyVendor(prev.length + 1)])} className="text-sm text-indigo-600 font-medium hover:text-indigo-800 flex items-center gap-1">
        <Plus size={16} /> إضافة عرض مورد آخر
      </button>
    </div>
  );
}

function WeightField({ label, value, onChange }: { label: string; value: number; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[11px] text-gray-500 mb-1">{label}</label>
      <input type="number" value={value} onChange={(e) => onChange(e.target.value)} className="w-24 px-2 py-1.5 border rounded-md text-xs" dir="ltr" />
    </div>
  );
}

function Mini({ label, value, onChange, max }: { label: string; value: number; onChange: (v: string) => void; max?: number }) {
  return (
    <div>
      <label className="block text-[10px] text-gray-500 mb-1">{label}</label>
      <input type="number" max={max} min={max ? 1 : undefined} value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-2 py-1.5 border rounded-md text-xs" dir="ltr" />
    </div>
  );
}
