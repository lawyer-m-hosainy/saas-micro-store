import React, { useMemo, useState } from 'react';
import { Building2, Plus, Trash2, TrendingUp } from 'lucide-react';

export interface PropertyInputs {
  id: string;
  name: string;
  purchasePrice: number;
  annualRent: number;
  vacancyRatePct: number;
  annualMaintenancePct: number;
  annualPropertyTax: number;
  appreciationPct: number;
}

export interface PropertyResult {
  id: string;
  name: string;
  effectiveAnnualRent: number;
  grossYieldPct: number;
  netYieldPct: number;
  netAnnualIncome: number;
  valueIn5Years: number;
}

/** العائد الإجمالي = الإيجار السنوي / سعر الشراء، والصافي بعد الشواغر والصيانة والضرائب */
export function computePropertyRoi(p: PropertyInputs): PropertyResult {
  const effectiveAnnualRent = p.annualRent * (1 - p.vacancyRatePct / 100);
  const maintenanceCost = p.purchasePrice * (p.annualMaintenancePct / 100);
  const netAnnualIncome = effectiveAnnualRent - maintenanceCost - p.annualPropertyTax;

  const grossYieldPct = p.purchasePrice > 0 ? (p.annualRent / p.purchasePrice) * 100 : 0;
  const netYieldPct = p.purchasePrice > 0 ? (netAnnualIncome / p.purchasePrice) * 100 : 0;
  const valueIn5Years = p.purchasePrice * Math.pow(1 + p.appreciationPct / 100, 5);

  return {
    id: p.id,
    name: p.name,
    effectiveAnnualRent,
    grossYieldPct,
    netYieldPct,
    netAnnualIncome,
    valueIn5Years,
  };
}

const emptyProperty = (n: number): PropertyInputs => ({
  id: Date.now().toString() + n,
  name: `عقار ${n}`,
  purchasePrice: 2000000,
  annualRent: 150000,
  vacancyRatePct: 8,
  annualMaintenancePct: 1.5,
  annualPropertyTax: 5000,
  appreciationPct: 7,
});

export function RealEstateRoiCalculatorDemo() {
  const [properties, setProperties] = useState<PropertyInputs[]>([emptyProperty(1)]);

  const results = useMemo(() => properties.map(computePropertyRoi), [properties]);
  const best = useMemo(() => results.reduce((a, b) => (b.netYieldPct > a.netYieldPct ? b : a), results[0]), [results]);

  const updateProperty = (id: string, field: keyof PropertyInputs, value: string) => {
    setProperties((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: field === 'name' ? value : Number(value) || 0 } : p)));
  };

  const addProperty = () => setProperties((prev) => [...prev, emptyProperty(prev.length + 1)]);
  const removeProperty = (id: string) => setProperties((prev) => (prev.length > 1 ? prev.filter((p) => p.id !== id) : prev));

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-6 text-indigo-900">حاسبة العائد الإيجاري الصافي (نسخة تعمل بالكامل)</h3>

      <div className="space-y-4 mb-5">
        {properties.map((p, idx) => {
          const r = results[idx];
          const isBest = properties.length > 1 && r?.id === best?.id;
          return (
            <div key={p.id} className={`bg-white p-4 rounded-lg border shadow-sm ${isBest ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-gray-100'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Building2 size={16} className="text-indigo-500" />
                  <input value={p.name} onChange={(e) => updateProperty(p.id, 'name', e.target.value)} className="font-bold text-sm text-gray-800 border-b border-transparent focus:border-indigo-300 outline-none" />
                  {isBest && <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">الأفضل عائداً</span>}
                </div>
                {properties.length > 1 && (
                  <button onClick={() => removeProperty(p.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={15} /></button>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                <MiniField label="سعر الشراء ($)" value={p.purchasePrice} onChange={(v) => updateProperty(p.id, 'purchasePrice', v)} />
                <MiniField label="الإيجار السنوي ($)" value={p.annualRent} onChange={(v) => updateProperty(p.id, 'annualRent', v)} />
                <MiniField label="نسبة الشواغر (%)" value={p.vacancyRatePct} onChange={(v) => updateProperty(p.id, 'vacancyRatePct', v)} />
                <MiniField label="الصيانة السنوية (%)" value={p.annualMaintenancePct} onChange={(v) => updateProperty(p.id, 'annualMaintenancePct', v)} />
                <MiniField label="ضرائب/رسوم سنوية ($)" value={p.annualPropertyTax} onChange={(v) => updateProperty(p.id, 'annualPropertyTax', v)} />
                <MiniField label="نمو رأس المال المتوقع (%)" value={p.appreciationPct} onChange={(v) => updateProperty(p.id, 'appreciationPct', v)} />
              </div>

              {r && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border-t border-gray-100 pt-3">
                  <StatMini label="العائد الإجمالي" value={`${r.grossYieldPct.toFixed(2)}%`} />
                  <StatMini label="العائد الصافي" value={`${r.netYieldPct.toFixed(2)}%`} tone="emerald" />
                  <StatMini label="صافي الدخل السنوي" value={`$${r.netAnnualIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
                  <StatMini label="القيمة بعد 5 سنوات" value={`$${r.valueIn5Years.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={<TrendingUp size={12} />} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button onClick={addProperty} className="text-sm text-indigo-600 font-medium hover:text-indigo-800 flex items-center gap-1">
        <Plus size={16} /> مقارنة عقار آخر
      </button>
    </div>
  );
}

function MiniField({ label, value, onChange }: { label: string; value: number; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[11px] text-gray-500 mb-1">{label}</label>
      <input type="number" value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-2 py-1.5 border rounded-md text-xs" dir="ltr" />
    </div>
  );
}

function StatMini({ label, value, tone, icon }: { label: string; value: string; tone?: 'emerald'; icon?: React.ReactNode }) {
  return (
    <div className="bg-gray-50 rounded-md px-2 py-1.5">
      <div className="text-[10px] text-gray-500">{label}</div>
      <div className={`font-mono font-bold text-xs flex items-center gap-1 ${tone === 'emerald' ? 'text-emerald-600' : 'text-gray-800'}`}>{icon}{value}</div>
    </div>
  );
}
