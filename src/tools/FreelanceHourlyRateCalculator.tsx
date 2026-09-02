import React, { useMemo, useState } from 'react';
import { AlertTriangle, Calculator } from 'lucide-react';

export interface RateInputs {
  targetAnnualIncome: number;
  monthlyBusinessExpenses: number;
  vacationDaysPerYear: number;
  publicHolidays: number;
  billableHoursPerDay: number;
  workDaysPerWeek: number;
  taxRatePct: number;
}

export interface RateResult {
  workingDaysPerYear: number;
  billableHoursPerYear: number;
  grossRequiredIncome: number; // بعد إضافة النفقات وتغطية الضريبة
  hourlyRate: number;
  dailyRate: number;
  isBillableHoursTooLow: boolean;
}

/** يحسب عدد أيام العمل الفعلية سنوياً بعد خصم الإجازات، ثم سعر الساعة العادل ليغطي الدخل المستهدف + النفقات + الضريبة */
export function computeHourlyRate(i: RateInputs): RateResult {
  const totalWeeks = 52;
  const grossWorkDays = i.workDaysPerWeek * totalWeeks;
  const workingDaysPerYear = Math.max(grossWorkDays - i.vacationDaysPerYear - i.publicHolidays, 1);
  const billableHoursPerYear = workingDaysPerYear * i.billableHoursPerDay;

  const annualExpenses = i.monthlyBusinessExpenses * 12;
  const preTaxRequired = i.targetAnnualIncome + annualExpenses;
  const grossRequiredIncome = i.taxRatePct < 100 ? preTaxRequired / (1 - i.taxRatePct / 100) : preTaxRequired;

  const hourlyRate = billableHoursPerYear > 0 ? grossRequiredIncome / billableHoursPerYear : 0;
  const dailyRate = hourlyRate * i.billableHoursPerDay;

  return {
    workingDaysPerYear,
    billableHoursPerYear,
    grossRequiredIncome,
    hourlyRate,
    dailyRate,
    isBillableHoursTooLow: i.billableHoursPerDay < 4,
  };
}

export function FreelanceHourlyRateCalculatorDemo() {
  const [inputs, setInputs] = useState<RateInputs>({
    targetAnnualIncome: 240000,
    monthlyBusinessExpenses: 3000,
    vacationDaysPerYear: 21,
    publicHolidays: 14,
    billableHoursPerDay: 5,
    workDaysPerWeek: 5,
    taxRatePct: 10,
  });

  const result = useMemo(() => computeHourlyRate(inputs), [inputs]);
  const [projectHours, setProjectHours] = useState(20);

  const set = (key: keyof RateInputs) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setInputs((prev) => ({ ...prev, [key]: isNaN(v) ? 0 : v }));
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-6 text-indigo-900 flex items-center gap-2"><Calculator size={20} /> حاسبة التسعير العادل للمستقلين (نسخة تعمل بالكامل)</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 space-y-3">
          <Field label="الدخل السنوي المستهدف (ج.م)" value={inputs.targetAnnualIncome} onChange={set('targetAnnualIncome')} />
          <Field label="النفقات الشهرية للعمل (اشتراكات، إنترنت...) (ج.م)" value={inputs.monthlyBusinessExpenses} onChange={set('monthlyBusinessExpenses')} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="أيام الإجازة السنوية" value={inputs.vacationDaysPerYear} onChange={set('vacationDaysPerYear')} />
            <Field label="العطلات الرسمية" value={inputs.publicHolidays} onChange={set('publicHolidays')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="ساعات العمل الفعلية/يوم" value={inputs.billableHoursPerDay} onChange={set('billableHoursPerDay')} />
            <Field label="أيام العمل/أسبوع" value={inputs.workDaysPerWeek} onChange={set('workDaysPerWeek')} />
          </div>
          <Field label="نسبة الضريبة على الدخل (%)" value={inputs.taxRatePct} onChange={set('taxRatePct')} step="0.5" />

          {result.isBillableHoursTooLow && (
            <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
              <AlertTriangle size={14} /> ساعات العمل الفعلية منخفضة جداً — تأكد إنها ساعات "قابلة للفوترة" فعلاً مش وقت حضور فقط.
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-indigo-50 border border-indigo-200 p-5 rounded-lg text-center">
            <div className="text-xs font-bold text-indigo-600 mb-1">سعر الساعة العادل</div>
            <div className="text-4xl font-black text-indigo-700 font-mono" dir="ltr">{result.hourlyRate.toFixed(0)} ج.م</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Stat label="سعر اليوم الكامل" value={`${result.dailyRate.toFixed(0)} ج.م`} />
            <Stat label="أيام العمل الفعلية/سنة" value={`${result.workingDaysPerYear} يوم`} />
            <Stat label="ساعات قابلة للفوترة/سنة" value={`${result.billableHoursPerYear.toFixed(0)} ساعة`} />
            <Stat label="الدخل الإجمالي المطلوب" value={`${result.grossRequiredIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })} ج.م`} />
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
            <h4 className="font-bold text-gray-700 mb-2 text-xs">توليد عرض تسعير للعميل</h4>
            <div className="flex items-center gap-2">
              <input type="number" value={projectHours} onChange={(e) => setProjectHours(Number(e.target.value) || 0)} className="w-24 px-2 py-1.5 border rounded-md text-sm" dir="ltr" />
              <span className="text-xs text-gray-500">ساعة للمشروع =</span>
              <span className="font-mono font-bold text-indigo-700 text-sm" dir="ltr">{(projectHours * result.hourlyRate).toLocaleString(undefined, { maximumFractionDigits: 0 })} ج.م</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, step }: { label: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; step?: string }) {
  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      <input type="number" step={step} value={value} onChange={onChange} className="w-full px-3 py-2 border rounded-md text-sm" dir="ltr" />
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
