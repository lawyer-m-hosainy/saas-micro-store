import React, { useMemo, useState } from 'react';
import { Flame, UtensilsCrossed } from 'lucide-react';

export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';
export type Goal = 'cut' | 'maintain' | 'bulk';

const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

export interface MealPlanInputs {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  goal: Goal;
}

export interface MealPlanResult {
  bmr: number;
  tdee: number;
  targetCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}

/** معادلة Mifflin-St Jeor لحساب BMR الحقيقية، ثم TDEE بضرب معامل النشاط، ثم توزيع الماكروز حسب الهدف */
export function computeMealPlan(i: MealPlanInputs): MealPlanResult {
  const bmr = i.gender === 'male'
    ? 10 * i.weightKg + 6.25 * i.heightCm - 5 * i.age + 5
    : 10 * i.weightKg + 6.25 * i.heightCm - 5 * i.age - 161;

  const tdee = bmr * ACTIVITY_MULTIPLIER[i.activityLevel];

  const goalAdjustment = i.goal === 'cut' ? -500 : i.goal === 'bulk' ? 300 : 0;
  const targetCalories = Math.max(tdee + goalAdjustment, 1200);

  // بروتين: 2 جم لكل كجم وزن جسم (يزيد قليلاً في التنشيف للحفاظ على العضلات)
  const proteinGrams = i.weightKg * (i.goal === 'cut' ? 2.2 : 1.8);
  const proteinCalories = proteinGrams * 4;

  // دهون: 25% من السعرات المستهدفة
  const fatCalories = targetCalories * 0.25;
  const fatGrams = fatCalories / 9;

  // الباقي كربوهيدرات
  const carbsCalories = Math.max(targetCalories - proteinCalories - fatCalories, 0);
  const carbsGrams = carbsCalories / 4;

  return { bmr, tdee, targetCalories, proteinGrams, carbsGrams, fatGrams };
}

export function MacroCalorieMealGeneratorDemo() {
  const [inputs, setInputs] = useState<MealPlanInputs>({ weightKg: 75, heightCm: 175, age: 28, gender: 'male', activityLevel: 'moderate', goal: 'cut' });

  const result = useMemo(() => computeMealPlan(inputs), [inputs]);

  const set = <K extends keyof MealPlanInputs>(key: K) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const raw = e.target.value;
    const isNumeric = ['weightKg', 'heightCm', 'age'].includes(key as string);
    setInputs((prev) => ({ ...prev, [key]: (isNumeric ? Number(raw) || 0 : raw) as MealPlanInputs[K] }));
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-6 text-indigo-900 flex items-center gap-2"><UtensilsCrossed size={20} /> مولّد السعرات والماكروز المخصصة (نسخة تعمل بالكامل)</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <Field label="الوزن (كجم)" value={inputs.weightKg} onChange={set('weightKg')} />
            <Field label="الطول (سم)" value={inputs.heightCm} onChange={set('heightCm')} />
            <Field label="العمر" value={inputs.age} onChange={set('age')} />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">الجنس</label>
            <select value={inputs.gender} onChange={set('gender')} className="w-full px-3 py-2 border rounded-md text-sm">
              <option value="male">ذكر</option>
              <option value="female">أنثى</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">مستوى النشاط</label>
            <select value={inputs.activityLevel} onChange={set('activityLevel')} className="w-full px-3 py-2 border rounded-md text-sm">
              <option value="sedentary">خامل (بدون رياضة)</option>
              <option value="light">نشاط خفيف (1-3 أيام/أسبوع)</option>
              <option value="moderate">نشاط متوسط (3-5 أيام/أسبوع)</option>
              <option value="active">نشاط عالي (6-7 أيام/أسبوع)</option>
              <option value="veryActive">نشاط مكثف جداً</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">الهدف</label>
            <select value={inputs.goal} onChange={set('goal')} className="w-full px-3 py-2 border rounded-md text-sm">
              <option value="cut">تنشيف (خسارة دهون)</option>
              <option value="maintain">ثبات الوزن</option>
              <option value="bulk">زيادة كتلة عضلية</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-indigo-50 border border-indigo-200 p-5 rounded-lg text-center">
            <div className="text-xs font-bold text-indigo-600 mb-1 flex items-center justify-center gap-1"><Flame size={13} /> السعرات المستهدفة يومياً</div>
            <div className="text-4xl font-black text-indigo-700 font-mono" dir="ltr">{Math.round(result.targetCalories)}</div>
            <div className="text-[11px] text-indigo-500 mt-1">BMR: {Math.round(result.bmr)} · TDEE: {Math.round(result.tdee)}</div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Macro label="بروتين" grams={result.proteinGrams} color="text-red-600 bg-red-50" />
            <Macro label="كربوهيدرات" grams={result.carbsGrams} color="text-amber-600 bg-amber-50" />
            <Macro label="دهون" grams={result.fatGrams} color="text-indigo-600 bg-indigo-50" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      <input type="number" value={value} onChange={onChange} className="w-full px-3 py-2 border rounded-md text-sm" dir="ltr" />
    </div>
  );
}

function Macro({ label, grams, color }: { label: string; grams: number; color: string }) {
  return (
    <div className={`rounded-lg p-3 text-center ${color}`}>
      <div className="text-[11px] font-bold mb-1">{label}</div>
      <div className="font-mono font-black text-lg" dir="ltr">{Math.round(grams)}g</div>
    </div>
  );
}
