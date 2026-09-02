import React, { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Circle, CreditCard } from 'lucide-react';

export type MilestoneStatus = 'pending' | 'approved' | 'paid';

export interface Milestone {
  id: string;
  name: string;
  amount: number;
  status: MilestoneStatus;
  dueDate: string;
}

export interface ContractSummary {
  totalContractValue: number;
  paidAmount: number;
  approvedUnpaidAmount: number;
  remainingAmount: number;
  overdueMilestones: Milestone[];
}

/** يحسب إجمالي قيمة العقد، المدفوع فعلياً، المعتمد وغير المدفوع بعد، والمتبقي — ويحدد أي مرحلة معتمدة تجاوزت موعد استحقاقها بدون دفع */
export function summarizeContract(milestones: Milestone[], today: Date = new Date()): ContractSummary {
  const totalContractValue = milestones.reduce((s, m) => s + m.amount, 0);
  const paidAmount = milestones.filter((m) => m.status === 'paid').reduce((s, m) => s + m.amount, 0);
  const approvedUnpaidAmount = milestones.filter((m) => m.status === 'approved').reduce((s, m) => s + m.amount, 0);
  const remainingAmount = totalContractValue - paidAmount;

  const overdueMilestones = milestones.filter((m) => m.status !== 'paid' && new Date(m.dueDate) < today);

  return { totalContractValue, paidAmount, approvedUnpaidAmount, remainingAmount, overdueMilestones };
}

export function buildPaymentDemandLetter(milestone: Milestone, clientName: string): string {
  return `إلى: ${clientName}\nالموضوع: مطالبة مالية — ${milestone.name}\n\nتحية طيبة،\n\nنود التذكير باستحقاق دفعة "${milestone.name}" بقيمة ${milestone.amount.toLocaleString()} ج.م، والمستحقة بتاريخ ${milestone.dueDate}. برجاء إتمام السداد في أقرب وقت ممكن لاستكمال المراحل التالية من المشروع دون تأخير.\n\nمع خالص التقدير.`;
}

const seedMilestones = (): Milestone[] => [
  { id: '1', name: 'دفعة البدء (30%)', amount: 15000, status: 'paid', dueDate: '2025-01-05' },
  { id: '2', name: 'تسليم النسخة الأولى (40%)', amount: 20000, status: 'approved', dueDate: '2025-02-01' },
  { id: '3', name: 'التسليم النهائي (30%)', amount: 15000, status: 'pending', dueDate: '2025-03-01' },
];

export function MilestonePaymentTrackerDemo() {
  const [clientName, setClientName] = useState('شركة أوج للاستثمار');
  const [milestones, setMilestones] = useState<Milestone[]>(seedMilestones());

  const summary = useMemo(() => summarizeContract(milestones), [milestones]);

  const update = (id: string, field: keyof Milestone, value: string) => {
    setMilestones((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: field === 'amount' ? Number(value) || 0 : value } : m)));
  };

  const statusMeta: Record<MilestoneStatus, { label: string; cls: string; icon: React.ReactNode }> = {
    pending: { label: 'في الانتظار', cls: 'bg-gray-50 border-gray-200 text-gray-500', icon: <Circle size={13} /> },
    approved: { label: 'معتمدة وغير مدفوعة', cls: 'bg-amber-50 border-amber-200 text-amber-700', icon: <AlertTriangle size={13} /> },
    paid: { label: 'مدفوعة', cls: 'bg-emerald-50 border-emerald-200 text-emerald-700', icon: <CheckCircle2 size={13} /> },
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-2 text-indigo-900 flex items-center gap-2"><CreditCard size={20} /> متتبع دفعات العقود بمراحل الإنجاز (نسخة تعمل بالكامل)</h3>
      <input value={clientName} onChange={(e) => setClientName(e.target.value)} className="text-sm font-bold text-gray-700 border-b border-transparent focus:border-indigo-300 outline-none mb-5" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Stat label="قيمة العقد" value={`${summary.totalContractValue.toLocaleString()} ج.م`} />
        <Stat label="المدفوع" value={`${summary.paidAmount.toLocaleString()} ج.م`} tone="emerald" />
        <Stat label="معتمد وغير مدفوع" value={`${summary.approvedUnpaidAmount.toLocaleString()} ج.م`} tone="amber" />
        <Stat label="المتبقي" value={`${summary.remainingAmount.toLocaleString()} ج.م`} />
      </div>

      {summary.overdueMilestones.length > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold p-3 rounded-lg mb-4 flex items-center gap-2">
          <AlertTriangle size={14} /> {summary.overdueMilestones.length} دفعة تجاوزت موعد الاستحقاق بدون سداد
        </div>
      )}

      <div className="space-y-2">
        {milestones.map((m) => (
          <div key={m.id} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <input value={m.name} onChange={(e) => update(m.id, 'name', e.target.value)} className="font-bold text-sm text-gray-800 border-b border-transparent focus:border-indigo-300 outline-none" />
              <select value={m.status} onChange={(e) => update(m.id, 'status', e.target.value)} className={`text-[10px] font-bold px-2 py-1 rounded-full border ${statusMeta[m.status].cls}`}>
                <option value="pending">في الانتظار</option>
                <option value="approved">معتمدة</option>
                <option value="paid">مدفوعة</option>
              </select>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="font-mono">{m.amount.toLocaleString()} ج.م</span>
              <input type="date" value={m.dueDate} onChange={(e) => update(m.id, 'dueDate', e.target.value)} className="px-1.5 py-1 border rounded-md text-[11px]" dir="ltr" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'emerald' | 'amber' }) {
  const cls = tone === 'emerald' ? 'text-emerald-600' : tone === 'amber' ? 'text-amber-600' : 'text-gray-800';
  return (
    <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
      <div className="text-[10px] text-gray-500 mb-1">{label}</div>
      <div className={`font-mono font-bold text-sm ${cls}`}>{value}</div>
    </div>
  );
}
