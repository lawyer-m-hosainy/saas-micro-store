import React, { useMemo, useState } from 'react';
import { AlertTriangle, Home, Plus, Printer, Trash2 } from 'lucide-react';

export interface LeaseEntry {
  id: string;
  tenantName: string;
  unit: string;
  monthlyRent: number;
  leaseEndDate: string; // ISO yyyy-mm-dd
  lastPaymentPaid: boolean;
}

export interface LeaseResult extends LeaseEntry {
  daysRemaining: number;
  urgency: 'expired' | 'critical' | 'warning' | 'ok';
}

/** يحسب الأيام المتبقية حتى انتهاء العقد بالنسبة لتاريخ مرجعي، ويصنّف درجة الإلحاح حسب عتبات 30/60 يوماً */
export function analyzeLeases(leases: LeaseEntry[], today: Date = new Date()): LeaseResult[] {
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

  return leases.map((l) => {
    const end = new Date(l.leaseEndDate);
    const endMidnight = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
    const daysRemaining = Math.round((endMidnight - todayMidnight) / (1000 * 60 * 60 * 24));

    let urgency: LeaseResult['urgency'] = 'ok';
    if (daysRemaining < 0) urgency = 'expired';
    else if (daysRemaining <= 30) urgency = 'critical';
    else if (daysRemaining <= 60) urgency = 'warning';

    return { ...l, daysRemaining, urgency };
  });
}

export function buildRenewalLetter(l: LeaseEntry): string {
  return `إلى: ${l.tenantName}\nالموضوع: تجديد عقد إيجار الوحدة ${l.unit}\n\nتحية طيبة،\n\nينتهي عقد إيجاركم الحالي للوحدة "${l.unit}" بتاريخ ${l.leaseEndDate}. برجاء التواصل معنا خلال 15 يوماً لتأكيد رغبتكم في التجديد بنفس القيمة الإيجارية الشهرية (${l.monthlyRent.toLocaleString()} ج.م) أو مناقشة الشروط الجديدة.\n\nمع خالص التحية،\nإدارة العقار`;
}

const seedLeases = (): LeaseEntry[] => {
  const today = new Date();
  const inDays = (d: number) => {
    const dt = new Date(today);
    dt.setDate(dt.getDate() + d);
    return dt.toISOString().split('T')[0];
  };
  return [
    { id: '1', tenantName: 'أحمد فتحي', unit: 'شقة 12 - برج النخيل', monthlyRent: 8500, leaseEndDate: inDays(18), lastPaymentPaid: true },
    { id: '2', tenantName: 'شركة النور للتجارة', unit: 'محل 3 - مول التجاري', monthlyRent: 15000, leaseEndDate: inDays(52), lastPaymentPaid: false },
    { id: '3', tenantName: 'سارة محمود', unit: 'شقة 7 - عمارة الياسمين', monthlyRent: 6000, leaseEndDate: inDays(120), lastPaymentPaid: true },
  ];
};

export function TenantLeaseTrackerDemo() {
  const [leases, setLeases] = useState<LeaseEntry[]>(seedLeases());
  const results = useMemo(() => analyzeLeases(leases).sort((a, b) => a.daysRemaining - b.daysRemaining), [leases]);

  const update = (id: string, field: keyof LeaseEntry, value: string | boolean) => {
    setLeases((prev) => prev.map((l) => (l.id === id ? { ...l, [field]: field === 'monthlyRent' ? Number(value) || 0 : value } : l)));
  };

  const printLetter = (l: LeaseEntry) => {
    const w = window.open('', '_blank', 'width=500,height=600');
    if (!w) return;
    w.document.write(`<pre style="font-family:sans-serif;white-space:pre-wrap;padding:24px;direction:rtl">${buildRenewalLetter(l)}</pre>`);
    w.document.close();
    w.print();
  };

  const urgencyStyle: Record<LeaseResult['urgency'], string> = {
    expired: 'bg-gray-100 border-gray-300 text-gray-600',
    critical: 'bg-red-50 border-red-300 text-red-700',
    warning: 'bg-amber-50 border-amber-300 text-amber-700',
    ok: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  };
  const urgencyLabel: Record<LeaseResult['urgency'], string> = {
    expired: 'منتهي', critical: 'حرج (≤30 يوم)', warning: 'قريب (≤60 يوم)', ok: 'ساري',
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-6 text-indigo-900 flex items-center gap-2"><Home size={20} /> متتبع مواعيد انتهاء عقود الإيجار (نسخة تعمل بالكامل)</h3>

      <div className="space-y-3 mb-4">
        {results.map((l) => (
          <div key={l.id} className={`bg-white p-4 rounded-lg border shadow-sm ${l.urgency === 'critical' || l.urgency === 'expired' ? 'ring-1 ring-red-100' : ''}`}>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <input value={l.tenantName} onChange={(e) => update(l.id, 'tenantName', e.target.value)} className="font-bold text-sm text-gray-800 border-b border-transparent focus:border-indigo-300 outline-none" />
                <span className="text-xs text-gray-400">/</span>
                <input value={l.unit} onChange={(e) => update(l.id, 'unit', e.target.value)} className="text-xs text-gray-500 border-b border-transparent focus:border-indigo-300 outline-none" />
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${urgencyStyle[l.urgency]}`}>
                  {urgencyLabel[l.urgency]} {l.urgency !== 'expired' && `· ${l.daysRemaining} يوم`}
                </span>
                {leases.length > 1 && (
                  <button onClick={() => setLeases((prev) => prev.filter((x) => x.id !== l.id))} className="text-gray-300 hover:text-red-500"><Trash2 size={14} /></button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 items-end">
              <Mini label="نهاية العقد">
                <input type="date" value={l.leaseEndDate} onChange={(e) => update(l.id, 'leaseEndDate', e.target.value)} className="w-full px-2 py-1.5 border rounded-md text-xs" dir="ltr" />
              </Mini>
              <Mini label="الإيجار الشهري">
                <input type="number" value={l.monthlyRent} onChange={(e) => update(l.id, 'monthlyRent', e.target.value)} className="w-full px-2 py-1.5 border rounded-md text-xs" dir="ltr" />
              </Mini>
              <Mini label="حالة السداد">
                <button
                  onClick={() => update(l.id, 'lastPaymentPaid', !l.lastPaymentPaid)}
                  className={`w-full py-1.5 rounded-md text-xs font-bold ${l.lastPaymentPaid ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}
                >
                  {l.lastPaymentPaid ? 'مسدد ✓' : 'متأخر ✗'}
                </button>
              </Mini>
              <button onClick={() => printLetter(l)} className="flex items-center justify-center gap-1.5 bg-indigo-50 text-indigo-700 py-1.5 rounded-md text-xs font-bold hover:bg-indigo-100">
                <Printer size={13} /> خطاب تجديد
              </button>
            </div>
          </div>
        ))}
      </div>

      {results.some((l) => l.urgency === 'critical') && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs font-medium p-3 rounded-lg mb-3">
          <AlertTriangle size={14} /> يوجد عقود تنتهي خلال 30 يوماً — تحتاج تواصل فوري مع المستأجرين.
        </div>
      )}

      <button
        onClick={() => setLeases((prev) => [...prev, { id: Date.now().toString(), tenantName: 'مستأجر جديد', unit: '', monthlyRent: 5000, leaseEndDate: new Date().toISOString().split('T')[0], lastPaymentPaid: true }])}
        className="text-sm text-indigo-600 font-medium hover:text-indigo-800 flex items-center gap-1"
      >
        <Plus size={16} /> إضافة عقد إيجار
      </button>
    </div>
  );
}

function Mini({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] text-gray-500 mb-1">{label}</label>
      {children}
    </div>
  );
}
