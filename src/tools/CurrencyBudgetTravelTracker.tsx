import React, { useMemo, useState } from 'react';
import { Plane, Plus, Trash2, Wallet } from 'lucide-react';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  currency: string;
}

export type ExchangeRates = Record<string, number>; // كم يساوي وحدة واحدة من هذه العملة بالعملة المحلية

/** يحوّل مصروفاً واحداً للعملة المحلية بضربه في سعر الصرف المُدخل من المستخدم */
export function convertToHome(expense: Expense, rates: ExchangeRates): number {
  const rate = rates[expense.currency] ?? 1;
  return expense.amount * rate;
}

export function computeBudgetSummary(expenses: Expense[], rates: ExchangeRates, budgetHome: number, groupSize: number) {
  const totalHome = expenses.reduce((s, e) => s + convertToHome(e, rates), 0);
  const remaining = budgetHome - totalHome;
  const perPerson = groupSize > 0 ? totalHome / groupSize : totalHome;
  return { totalHome, remaining, perPerson, overBudget: remaining < 0 };
}

const seedExpenses = (): Expense[] => [
  { id: '1', description: 'فندق 3 ليالي', amount: 250, currency: 'USD' },
  { id: '2', description: 'مواصلات محلية', amount: 40, currency: 'EUR' },
  { id: '3', description: 'أكل وشرب', amount: 1200, currency: 'EGP' },
];

export function CurrencyBudgetTravelTrackerDemo() {
  const [rates, setRates] = useState<ExchangeRates>({ USD: 49, EUR: 53, EGP: 1 });
  const [expenses, setExpenses] = useState<Expense[]>(seedExpenses());
  const [budgetHome, setBudgetHome] = useState(30000);
  const [groupSize, setGroupSize] = useState(2);

  const summary = useMemo(() => computeBudgetSummary(expenses, rates, budgetHome, groupSize), [expenses, rates, budgetHome, groupSize]);

  const updateExpense = (id: string, field: keyof Expense, value: string) => {
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: field === 'amount' ? Number(value) || 0 : value } : e)));
  };
  const updateRate = (currency: string, value: string) => setRates((prev) => ({ ...prev, [currency]: Number(value) || 0 }));

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-6 text-indigo-900 flex items-center gap-2"><Plane size={20} /> متتبع نفقات الرحلات متعدد العملات (نسخة تعمل بالكامل)</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">الميزانية الإجمالية (ج.م)</label>
              <input type="number" value={budgetHome} onChange={(e) => setBudgetHome(Number(e.target.value) || 0)} className="w-full px-2 py-1.5 border rounded-md text-sm" dir="ltr" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">عدد أفراد الرحلة</label>
              <input type="number" value={groupSize} onChange={(e) => setGroupSize(Number(e.target.value) || 1)} className="w-full px-2 py-1.5 border rounded-md text-sm" dir="ltr" />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-2">
            <p className="text-xs font-bold text-gray-600 mb-1.5">أسعار الصرف مقابل الجنيه</p>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(rates).map(([cur, rate]) => (
                <div key={cur}>
                  <label className="block text-[10px] text-gray-500">{cur}</label>
                  <input type="number" value={rate} onChange={(e) => updateRate(cur, e.target.value)} className="w-full px-2 py-1 border rounded-md text-xs" dir="ltr" />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 border-t border-gray-100 pt-2">
            {expenses.map((e) => (
              <div key={e.id} className="flex items-center gap-2">
                <input value={e.description} onChange={(ev) => updateExpense(e.id, 'description', ev.target.value)} className="flex-1 px-2 py-1.5 border rounded-md text-xs" />
                <input type="number" value={e.amount} onChange={(ev) => updateExpense(e.id, 'amount', ev.target.value)} className="w-20 px-2 py-1.5 border rounded-md text-xs" dir="ltr" />
                <select value={e.currency} onChange={(ev) => updateExpense(e.id, 'currency', ev.target.value)} className="px-1 py-1.5 border rounded-md text-xs">
                  {Object.keys(rates).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {expenses.length > 1 && <button onClick={() => setExpenses((prev) => prev.filter((x) => x.id !== e.id))} className="text-gray-300 hover:text-red-500"><Trash2 size={13} /></button>}
              </div>
            ))}
            <button onClick={() => setExpenses((prev) => [...prev, { id: Date.now().toString(), description: 'مصروف جديد', amount: 0, currency: 'EGP' }])} className="text-xs text-indigo-600 font-bold flex items-center gap-1">
              <Plus size={14} /> إضافة مصروف
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className={`p-5 rounded-lg border text-center ${summary.overBudget ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
            <div className="text-xs font-bold text-gray-500 mb-1 flex items-center justify-center gap-1"><Wallet size={13} /> {summary.overBudget ? 'تجاوزت الميزانية' : 'المتبقي من الميزانية'}</div>
            <div className={`text-3xl font-black font-mono ${summary.overBudget ? 'text-red-600' : 'text-emerald-600'}`} dir="ltr">
              {Math.abs(summary.remaining).toLocaleString(undefined, { maximumFractionDigits: 0 })} ج.م
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Stat label="إجمالي المصروفات" value={`${summary.totalHome.toLocaleString(undefined, { maximumFractionDigits: 0 })} ج.م`} />
            <Stat label="نصيب الفرد" value={`${summary.perPerson.toLocaleString(undefined, { maximumFractionDigits: 0 })} ج.م`} />
          </div>
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
