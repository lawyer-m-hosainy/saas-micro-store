import React, { useMemo, useState } from 'react';
import { Droplets, Sprout } from 'lucide-react';

export type CropType = 'palm' | 'tomato' | 'citrus' | 'wheat';
export type SoilType = 'sandy' | 'loamy' | 'clay';

// معاملات المحصول (Kc) التقريبية المعتمدة في حسابات الري الزراعي القياسية (FAO-56)
const CROP_COEFFICIENT: Record<CropType, number> = { palm: 0.9, tomato: 1.15, citrus: 0.65, wheat: 1.0 };
const CROP_LABEL: Record<CropType, string> = { palm: 'نخيل', tomato: 'طماطم', citrus: 'حمضيات', wheat: 'قمح' };

// معامل تعديل حسب نوع التربة (الرملية تحتاج ري أكثر تكراراً لضعف احتفاظها بالماء)
const SOIL_FACTOR: Record<SoilType, number> = { sandy: 1.25, loamy: 1.0, clay: 0.85 };
const SOIL_LABEL: Record<SoilType, string> = { sandy: 'رملية', loamy: 'طينية متوسطة', clay: 'طينية ثقيلة' };

export interface WateringInputs {
  crop: CropType;
  soil: SoilType;
  refEvapotranspirationMm: number; // ET0 اليومي بالملم (من بيانات الطقس المحلية)
  areaSqm: number;
}

export interface WateringResult {
  dailyEtcMm: number; // احتياج المحصول الفعلي بعد معامل المحصول
  dailyLiters: number;
  weeklyLiters: number;
}

/** يحسب الاحتياج المائي وفق معادلة ETc = ET0 × Kc (المعيار العالمي FAO-56) مع تعديل بسيط حسب نوع التربة، ثم يحوّل الملم لمساحة الأرض إلى لترات */
export function computeWateringSchedule(i: WateringInputs): WateringResult {
  const dailyEtcMm = i.refEvapotranspirationMm * CROP_COEFFICIENT[i.crop] * SOIL_FACTOR[i.soil];
  // 1 ملم على 1 م² = 1 لتر ماء بالضبط
  const dailyLiters = dailyEtcMm * i.areaSqm;
  return { dailyEtcMm, dailyLiters, weeklyLiters: dailyLiters * 7 };
}

export function CropWateringScheduleCalcDemo() {
  const [inputs, setInputs] = useState<WateringInputs>({ crop: 'tomato', soil: 'loamy', refEvapotranspirationMm: 5, areaSqm: 500 });

  const result = useMemo(() => computeWateringSchedule(inputs), [inputs]);

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-6 text-indigo-900 flex items-center gap-2"><Sprout size={20} /> حاسبة جداول ري المحاصيل الذكية (نسخة تعمل بالكامل)</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">نوع المحصول</label>
            <select value={inputs.crop} onChange={(e) => setInputs((p) => ({ ...p, crop: e.target.value as CropType }))} className="w-full px-3 py-2 border rounded-md text-sm">
              {(Object.keys(CROP_LABEL) as CropType[]).map((c) => <option key={c} value={c}>{CROP_LABEL[c]}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">نوع التربة</label>
            <select value={inputs.soil} onChange={(e) => setInputs((p) => ({ ...p, soil: e.target.value as SoilType }))} className="w-full px-3 py-2 border rounded-md text-sm">
              {(Object.keys(SOIL_LABEL) as SoilType[]).map((s) => <option key={s} value={s}>{SOIL_LABEL[s]}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">التبخر-نتح المرجعي اليومي ET0 (ملم) — من بيانات الطقس</label>
            <input type="number" step="0.1" value={inputs.refEvapotranspirationMm} onChange={(e) => setInputs((p) => ({ ...p, refEvapotranspirationMm: Number(e.target.value) || 0 }))} className="w-full px-3 py-2 border rounded-md text-sm" dir="ltr" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">مساحة الأرض (م²)</label>
            <input type="number" value={inputs.areaSqm} onChange={(e) => setInputs((p) => ({ ...p, areaSqm: Number(e.target.value) || 0 }))} className="w-full px-3 py-2 border rounded-md text-sm" dir="ltr" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-indigo-50 border border-indigo-200 p-5 rounded-lg text-center">
            <div className="text-xs font-bold text-indigo-600 mb-1 flex items-center justify-center gap-1"><Droplets size={13} /> الاحتياج المائي الأسبوعي</div>
            <div className="text-3xl font-black font-mono text-indigo-700" dir="ltr">{result.weeklyLiters.toLocaleString(undefined, { maximumFractionDigits: 0 })} لتر</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="الاحتياج اليومي" value={`${result.dailyEtcMm.toFixed(1)} ملم`} />
            <Stat label="لترات يومياً" value={`${result.dailyLiters.toLocaleString(undefined, { maximumFractionDigits: 0 })} لتر`} />
          </div>
          <p className="text-[11px] text-gray-400">محسوبة وفق ETc = ET0 × Kc (معامل المحصول القياسي FAO-56) مع تعديل نوع التربة.</p>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
      <div className="text-[10px] text-gray-500 mb-1">{label}</div>
      <div className="font-mono font-bold text-gray-900 text-sm">{value}</div>
    </div>
  );
}
