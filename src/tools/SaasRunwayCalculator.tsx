import React, { useMemo, useState } from 'react';
import { AlertTriangle, Download, TrendingUp, Wallet } from 'lucide-react';
import { jsPDF } from 'jspdf';

export interface RunwayInputs {
  cashBalance: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  monthlyRevenueGrowthPct: number;
  marketingSpend: number;
  newCustomersFromSpend: number;
}

export interface RunwayResult {
  netBurn: number;
  runwayMonths: number | null;
  cac: number | null;
  breakEvenMonth: number | null;
  isSafe: boolean;
  projection: { month: number; cash: number; revenue: number }[];
}

/** حساب الحرق الشهري، الـ Runway، الـ CAC، وشهر التعادل بمحاكاة نمو الإيرادات شهرياً */
export function computeRunway(inputs: RunwayInputs): RunwayResult {
  const { cashBalance, monthlyRevenue, monthlyExpenses, monthlyRevenueGrowthPct, marketingSpend, newCustomersFromSpend } = inputs;

  const netBurn = monthlyExpenses - monthlyRevenue;
  const cac = newCustomersFromSpend > 0 ? marketingSpend / newCustomersFromSpend : null;

  const projection: RunwayResult['projection'] = [];
  let cash = cashBalance;
  let revenue = monthlyRevenue;
  let breakEvenMonth: number | null = null;
  let runwayMonths: number | null = null;

  const growthFactor = 1 + monthlyRevenueGrowthPct / 100;
  const MAX_MONTHS = 60;

  for (let m = 1; m <= MAX_MONTHS; m++) {
    const monthlyBurn = monthlyExpenses - revenue;
    cash -= monthlyBurn;
    projection.push({ month: m, cash: Math.round(cash), revenue: Math.round(revenue) });

    if (breakEvenMonth === null && revenue >= monthlyExpenses) breakEvenMonth = m;
    if (runwayMonths === null && cash <= 0) runwayMonths = m;

    revenue *= growthFactor;
    if (runwayMonths !== null && breakEvenMonth !== null) break;
  }

  if (runwayMonths === null && netBurn <= 0) runwayMonths = null; // لن ينفد الرصيد أبداً بمعدل النمو الحالي

  return {
    netBurn,
    runwayMonths,
    cac,
    breakEvenMonth,
    isSafe: runwayMonths === null || runwayMonths >= 6,
    projection: projection.slice(0, 24),
  };
}

export function SaasRunwayCalculatorDemo() {
  const [inputs, setInputs] = useState<RunwayInputs>({
    cashBalance: 300000,
    monthlyRevenue: 25000,
    monthlyExpenses: 45000,
    monthlyRevenueGrowthPct: 6,
    marketingSpend: 8000,
    newCustomersFromSpend: 20,
  });
  const [isExporting, setIsExporting] = useState(false);

  const result = useMemo(() => computeRunway(inputs), [inputs]);

  const set = (key: keyof RunwayInputs) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setInputs((prev) => ({ ...prev, [key]: isNaN(v) ? 0 : v }));
  };

  const exportSummary = () => {
    setIsExporting(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.setFontSize(18);
      pdf.text('SaaS Runway & Burn Rate Summary', 15, 20);
      pdf.setFontSize(11);
      const lines = [
        `Cash balance: $${inputs.cashBalance.toLocaleString()}`,
        `Monthly revenue: $${inputs.monthlyRevenue.toLocaleString()}`,
        `Monthly expenses: $${inputs.monthlyExpenses.toLocaleString()}`,
        `Net monthly burn: $${result.netBurn.toLocaleString()}`,
        `Runway: ${result.runwayMonths === null ? 'Cash-flow positive / N/A' : `${result.runwayMonths} months`}`,
        `Break-even month: ${result.breakEvenMonth ?? 'Beyond 24-month projection'}`,
        `CAC: ${result.cac === null ? 'N/A' : `$${result.cac.toFixed(2)}`}`,
        `Assumed monthly revenue growth: ${inputs.monthlyRevenueGrowthPct}%`,
      ];
      lines.forEach((l, i) => pdf.text(l, 15, 34 + i * 8));
      pdf.save('runway-summary.pdf');
    } finally {
      setIsExporting(false);
    }
  };

  const maxCash = Math.max(...result.projection.map((p) => Math.abs(p.cash)), 1);

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-6 text-indigo-900">حاسبة معدل الحرق والـ Runway (نسخة تعمل بالكامل)</h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 h-fit space-y-4">
          <h4 className="font-bold text-gray-700">بيانات الشركة</h4>
          <Field label="الرصيد النقدي الحالي ($)" value={inputs.cashBalance} onChange={set('cashBalance')} />
          <Field label="الإيراد الشهري الحالي ($)" value={inputs.monthlyRevenue} onChange={set('monthlyRevenue')} />
          <Field label="المصروفات الشهرية ($)" value={inputs.monthlyExpenses} onChange={set('monthlyExpenses')} />
          <Field label="نمو الإيراد الشهري المتوقع (%)" value={inputs.monthlyRevenueGrowthPct} onChange={set('monthlyRevenueGrowthPct')} step="0.5" />
          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs text-gray-500 mb-2 font-bold">محاكاة تكلفة اكتساب العميل (CAC)</p>
            <Field label="إجمالي إنفاق التسويق ($)" value={inputs.marketingSpend} onChange={set('marketingSpend')} />
            <Field label="عدد عملاء جدد من هذا الإنفاق" value={inputs.newCustomersFromSpend} onChange={set('newCustomersFromSpend')} />
          </div>
          <button onClick={exportSummary} disabled={isExporting} className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-2">
            <Download size={16} /> {isExporting ? 'جاري التصدير...' : 'تصدير ملخص للمستثمرين (PDF)'}
          </button>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="الحرق الشهري الصافي" value={`$${result.netBurn.toLocaleString()}`} tone={result.netBurn > 0 ? 'red' : 'green'} icon={<Wallet size={16} />} />
            <Stat label="Runway" value={result.runwayMonths === null ? 'لن ينفد ✓' : `${result.runwayMonths} شهر`} tone={result.isSafe ? 'green' : 'red'} icon={<TrendingUp size={16} />} />
            <Stat label="شهر التعادل" value={result.breakEvenMonth ? `الشهر ${result.breakEvenMonth}` : 'بعد 24 شهر'} tone="indigo" />
            <Stat label="CAC" value={result.cac === null ? 'N/A' : `$${result.cac.toFixed(1)}`} tone="indigo" />
          </div>

          {!result.isSafe && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-xs font-medium p-3 rounded-lg">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <span>رصيد الأمان أقل من 6 أشهر Runway — راجع المصروفات أو خطط لجولة تمويل قريبة.</span>
            </div>
          )}

          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
            <h4 className="font-bold text-gray-700 mb-3 text-sm">مسار الرصيد النقدي المتوقع (24 شهر)</h4>
            <div className="flex items-end gap-1 h-32">
              {result.projection.map((p) => (
                <div key={p.month} className="flex-1 flex flex-col items-center justify-end h-full" title={`الشهر ${p.month}: $${p.cash.toLocaleString()}`}>
                  <div
                    className={`w-full rounded-t ${p.cash >= 0 ? 'bg-indigo-500' : 'bg-red-400'}`}
                    style={{ height: `${Math.max((Math.abs(p.cash) / maxCash) * 100, 3)}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 mt-1"><span>شهر 1</span><span>شهر {result.projection.length}</span></div>
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

function Stat({ label, value, tone, icon }: { label: string; value: string; tone: 'red' | 'green' | 'indigo'; icon?: React.ReactNode }) {
  const toneClass = tone === 'red' ? 'text-red-600 bg-red-50' : tone === 'green' ? 'text-green-600 bg-green-50' : 'text-indigo-600 bg-indigo-50';
  return (
    <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
      <div className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full mb-1.5 ${toneClass}`}>{icon}{label}</div>
      <div className="font-mono font-bold text-gray-900 text-sm">{value}</div>
    </div>
  );
}
