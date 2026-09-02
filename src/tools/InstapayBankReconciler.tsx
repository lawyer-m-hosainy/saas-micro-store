import React, { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Copy, HelpCircle, Wallet } from 'lucide-react';

export interface Txn {
  date: string; // yyyy-mm-dd
  amount: number;
  ref: string;
}

export interface ReconciliationResult {
  matched: { sale: Txn; bank: Txn }[];
  missingPayment: Txn[]; // مبيعات بدون تحويل مطابق
  unexplainedDeposit: Txn[]; // تحويلات بدون فاتورة بيع مطابقة
  duplicateBankEntries: Txn[]; // نفس المبلغ + نفس المرجع أكثر من مرة
}

function parseLines(raw: string): Txn[] {
  return raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const [date, amountStr, ...rest] = line.split(',').map((s) => s.trim());
      return { date, amount: Number(amountStr) || 0, ref: rest.join(',') || '' };
    })
    .filter((t) => t.date && !isNaN(t.amount));
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a).getTime();
  const db = new Date(b).getTime();
  if (isNaN(da) || isNaN(db)) return Infinity;
  return Math.abs(da - db) / (1000 * 60 * 60 * 24);
}

/** يطابق كل عملية بيع بأقرب إيصال بنكي بنفس المبلغ خلال 3 أيام، ويكشف الإيصالات المكررة (نفس المبلغ والمرجع) */
export function reconcile(sales: Txn[], bank: Txn[], toleranceDays = 3): ReconciliationResult {
  const bankPool = bank.map((b, idx) => ({ ...b, _idx: idx }));
  const usedBankIdx = new Set<number>();
  const matched: ReconciliationResult['matched'] = [];
  const missingPayment: Txn[] = [];

  for (const sale of sales) {
    const candidate = bankPool.find(
      (b) => !usedBankIdx.has(b._idx) && b.amount === sale.amount && daysBetween(b.date, sale.date) <= toleranceDays
    );
    if (candidate) {
      usedBankIdx.add(candidate._idx);
      matched.push({ sale, bank: { date: candidate.date, amount: candidate.amount, ref: candidate.ref } });
    } else {
      missingPayment.push(sale);
    }
  }

  const unexplainedDeposit = bank.filter((_, idx) => !usedBankIdx.has(idx));

  const seen = new Map<string, number>();
  bank.forEach((b) => {
    const key = `${b.amount}|${b.ref}`;
    seen.set(key, (seen.get(key) || 0) + 1);
  });
  const duplicateBankEntries = bank.filter((b) => (seen.get(`${b.amount}|${b.ref}`) || 0) > 1);

  return { matched, missingPayment, unexplainedDeposit, duplicateBankEntries };
}

const sampleSales = `2025-01-05,450,ORD-1001
2025-01-06,320,ORD-1002
2025-01-07,900,ORD-1003
2025-01-08,150,ORD-1004`;

const sampleBank = `2025-01-05,450,INSTAPAY-88213
2025-01-06,320,INSTAPAY-88214
2025-01-09,900,INSTAPAY-88220
2025-01-06,320,INSTAPAY-88214
2025-01-10,75,INSTAPAY-88225`;

export function InstapayBankReconcilerDemo() {
  const [salesRaw, setSalesRaw] = useState(sampleSales);
  const [bankRaw, setBankRaw] = useState(sampleBank);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const sales = parseLines(salesRaw);
    const bank = parseLines(bankRaw);
    return reconcile(sales, bank);
  }, [salesRaw, bankRaw]);

  const copyReport = async () => {
    const lines = [
      `تقرير المطابقة — ${new Date().toLocaleDateString('ar-EG')}`,
      `مطابق: ${result.matched.length} | مبيعات بدون تحويل: ${result.missingPayment.length} | تحويلات غير مفسرة: ${result.unexplainedDeposit.length} | مكرر محتمل: ${result.duplicateBankEntries.length}`,
      '',
      ...result.missingPayment.map((s) => `⚠ لم يُدفع: ${s.ref} بمبلغ ${s.amount} بتاريخ ${s.date}`),
      ...result.unexplainedDeposit.map((b) => `❓ تحويل بدون فاتورة: ${b.ref} بمبلغ ${b.amount} بتاريخ ${b.date}`),
      ...result.duplicateBankEntries.map((b) => `⚠⚠ محتمل مكرر: ${b.ref} بمبلغ ${b.amount} بتاريخ ${b.date}`),
    ];
    await navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-2 text-indigo-900 flex items-center gap-2"><Wallet size={20} /> مُطابق إيصالات إنستاباي والمحافظ (نسخة تعمل بالكامل)</h3>
      <p className="text-xs text-gray-500 mb-5">صيغة كل سطر: <code dir="ltr" className="bg-gray-200 px-1 rounded">التاريخ,المبلغ,المرجع</code> — المطابقة تتم بنفس المبلغ خلال ±3 أيام.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">سجل المبيعات (فواتيرك)</label>
          <textarea value={salesRaw} onChange={(e) => setSalesRaw(e.target.value)} dir="ltr" spellCheck={false} className="w-full h-32 p-3 font-mono text-[11px] border rounded-lg bg-white" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">كشف حساب البنك/إنستاباي</label>
          <textarea value={bankRaw} onChange={(e) => setBankRaw(e.target.value)} dir="ltr" spellCheck={false} className="w-full h-32 p-3 font-mono text-[11px] border rounded-lg bg-white" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Stat label="مطابق تمامًا" value={result.matched.length} tone="emerald" icon={<CheckCircle2 size={14} />} />
        <Stat label="لم يُدفع بعد" value={result.missingPayment.length} tone="red" icon={<AlertTriangle size={14} />} />
        <Stat label="تحويل بدون فاتورة" value={result.unexplainedDeposit.length} tone="amber" icon={<HelpCircle size={14} />} />
        <Stat label="مكرر محتمل" value={result.duplicateBankEntries.length} tone="red" icon={<AlertTriangle size={14} />} />
      </div>

      <div className="space-y-2 mb-4">
        {result.missingPayment.map((s, i) => (
          <Row key={`m${i}`} tone="red" text={`لم يُدفع بعد: ${s.ref} — ${s.amount} ج.م بتاريخ ${s.date}`} />
        ))}
        {result.unexplainedDeposit.map((b, i) => (
          <Row key={`u${i}`} tone="amber" text={`تحويل بدون فاتورة مطابقة: ${b.ref} — ${b.amount} ج.م بتاريخ ${b.date}`} />
        ))}
        {result.duplicateBankEntries.map((b, i) => (
          <Row key={`d${i}`} tone="red" text={`محتمل إيصال مكرر: ${b.ref} — ${b.amount} ج.م بتاريخ ${b.date}`} />
        ))}
        {result.missingPayment.length + result.unexplainedDeposit.length + result.duplicateBankEntries.length === 0 && (
          <Row tone="emerald" text="كل العمليات متطابقة تمامًا — لا توجد ملاحظات." />
        )}
      </div>

      <button onClick={copyReport} className="bg-indigo-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2 text-sm">
        <Copy size={16} /> {copied ? 'تم النسخ ✓' : 'نسخ تقرير المطابقة'}
      </button>
    </div>
  );
}

function Stat({ label, value, tone, icon }: { label: string; value: number; tone: 'emerald' | 'red' | 'amber'; icon: React.ReactNode }) {
  const cls = tone === 'emerald' ? 'text-emerald-600 bg-emerald-50' : tone === 'red' ? 'text-red-600 bg-red-50' : 'text-amber-600 bg-amber-50';
  return (
    <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
      <div className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full mb-1.5 ${cls}`}>{icon}{label}</div>
      <div className="font-mono font-bold text-gray-900 text-lg">{value}</div>
    </div>
  );
}

function Row({ tone, text }: { tone: 'red' | 'amber' | 'emerald'; text: string }) {
  const cls = tone === 'red' ? 'bg-red-50 border-red-200 text-red-700' : tone === 'amber' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700';
  return <div className={`text-xs font-medium p-2.5 rounded-lg border ${cls}`}>{text}</div>;
}
