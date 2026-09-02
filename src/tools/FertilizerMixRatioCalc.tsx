import React, { useMemo, useState } from 'react';
import { AlertTriangle, FlaskConical } from 'lucide-react';

export interface FertilizerInputs {
  tankLiters: number;
  targetPpm: number; // التركيز المستهدف (جزء في المليون)
  fertilizerPurityPct: number; // نسبة العنصر الفعّال في السماد (مثال: سماد NPK 20-20-20 نقاوة العنصر الواحد 20%)
}

export interface FertilizerResult {
  gramsNeeded: number;
  gramsPerLiter: number;
  isDangerouslyHigh: boolean;
}

/** PPM = مجم/لتر تقريباً — الكمية بالجرام = (التركيز المستهدف × حجم الخزان بالتر) ÷ (نسبة النقاوة × 1000)، وفق الكيمياء الزراعية القياسية لخلط الأسمدة */
export function computeFertilizerMix(i: FertilizerInputs): FertilizerResult {
  const purity = i.fertilizerPurityPct / 100;
  const gramsNeeded = purity > 0 ? (i.targetPpm * i.tankLiters) / (purity * 1000) : 0;
  const gramsPerLiter = i.tankLiters > 0 ? gramsNeeded / i.tankLiters : 0;

  return { gramsNeeded, gramsPerLiter, isDangerouslyHigh: i.targetPpm > 300 };
}

export function FertilizerMixRatioCalcDemo() {
  const [inputs, setInputs] = useState<FertilizerInputs>({ tankLiters: 1000, targetPpm: 150, fertilizerPurityPct: 20 });

  const result = useMemo(() => computeFertilizerMix(inputs), [inputs]);

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-6 text-indigo-900 flex items-center gap-2"><FlaskConical size={20} /> حاسبة نسب خلط الأسمدة NPK (نسخة تعمل بالكامل)</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 space-y-3">
          <Field label="حجم خزان الري (لتر)" value={inputs.tankLiters} onChange={(v) => setInputs((p) => ({ ...p, tankLiters: v }))} />
          <Field label="التركيز المستهدف (PPM)" value={inputs.targetPpm} onChange={(v) => setInputs((p) => ({ ...p, targetPpm: v }))} />
          <Field label="نسبة نقاوة العنصر بالسماد (%)" value={inputs.fertilizerPurityPct} onChange={(v) => setInputs((p) => ({ ...p, fertilizerPurityPct: v }))} />
          {result.isDangerouslyHigh && (
            <div className="flex items-center gap-1.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-2.5">
              <AlertTriangle size={14} /> تركيز أعلى من 300 PPM قد يحرق أوراق معظم النباتات — راجع توصيات محصولك.
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="bg-indigo-50 border border-indigo-200 p-5 rounded-lg text-center">
            <div className="text-xs font-bold text-indigo-600 mb-1">إجمالي السماد المطلوب للخزان</div>
            <div className="text-3xl font-black font-mono text-indigo-700" dir="ltr">{result.gramsNeeded.toFixed(0)} جم</div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
            <div className="text-[10px] text-gray-500 mb-1">الجرعة لكل لتر ماء</div>
            <div className="font-mono font-bold text-gray-900 text-sm">{result.gramsPerLiter.toFixed(3)} جم/لتر</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} className="w-full px-3 py-2 border rounded-md text-sm" dir="ltr" />
    </div>
  );
}
