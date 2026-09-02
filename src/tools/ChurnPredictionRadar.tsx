import React, { useMemo, useState } from 'react';
import { AlertTriangle, RadioTower, ShieldCheck } from 'lucide-react';

export interface CustomerActivity {
  id: string;
  name: string;
  daysSinceLastLogin: number;
  weeklyLoginsAvg: number; // متوسط عدد مرات الدخول أسبوعيًا
  supportTickets: number; // عدد تذاكر الدعم آخر 30 يوم
  monthsSubscribed: number;
  planValueUsd: number;
}

export interface ChurnResult extends CustomerActivity {
  riskScore: number; // 0-100
  tier: 'low' | 'medium' | 'high';
  suggestedAction: string;
}

/** درجة مخاطر حتمية (0-100) موزونة: الخمول (40%)، ضعف الاستخدام (25%)، تذاكر الدعم (20%)، وحداثة الاشتراك (15%) — مش تنبؤ AI حقيقي، لكن نموذج قواعد صريح وقابل للتفسير */
export function scoreChurnRisk(c: CustomerActivity): ChurnResult {
  const inactivityScore = Math.min(c.daysSinceLastLogin / 30, 1) * 40;
  const lowUsageScore = Math.min(Math.max(3 - c.weeklyLoginsAvg, 0) / 3, 1) * 25;
  const supportScore = Math.min(c.supportTickets / 5, 1) * 20;
  const newCustomerRiskScore = Math.min(Math.max(3 - c.monthsSubscribed, 0) / 3, 1) * 15;

  const riskScore = Math.round(inactivityScore + lowUsageScore + supportScore + newCustomerRiskScore);

  const tier: ChurnResult['tier'] = riskScore >= 60 ? 'high' : riskScore >= 30 ? 'medium' : 'low';

  const suggestedAction =
    tier === 'high'
      ? 'اتصال شخصي فوري + عرض خصم استثنائي أو جلسة دعم مجانية'
      : tier === 'medium'
      ? 'بريد تفعيل مع نصائح استخدام + عرض ترقية مخفض'
      : 'رسالة شكر روتينية — العميل مستقر';

  return { ...c, riskScore, tier, suggestedAction };
}

const seedCustomers = (): CustomerActivity[] => [
  { id: '1', name: 'شركة نُظم', daysSinceLastLogin: 2, weeklyLoginsAvg: 12, supportTickets: 0, monthsSubscribed: 14, planValueUsd: 199 },
  { id: '2', name: 'متجر بازار', daysSinceLastLogin: 25, weeklyLoginsAvg: 1, supportTickets: 3, monthsSubscribed: 2, planValueUsd: 49 },
  { id: '3', name: 'عيادة الشفاء', daysSinceLastLogin: 35, weeklyLoginsAvg: 0, supportTickets: 4, monthsSubscribed: 1, planValueUsd: 79 },
  { id: '4', name: 'أكاديمية بُنيان', daysSinceLastLogin: 8, weeklyLoginsAvg: 4, supportTickets: 1, monthsSubscribed: 6, planValueUsd: 99 },
];

export function ChurnPredictionRadarDemo() {
  const [customers, setCustomers] = useState<CustomerActivity[]>(seedCustomers());

  const results = useMemo(() => customers.map(scoreChurnRisk).sort((a, b) => b.riskScore - a.riskScore), [customers]);
  const highRiskValueUsd = results.filter((r) => r.tier === 'high').reduce((s, r) => s + r.planValueUsd, 0);

  const update = (id: string, field: keyof CustomerActivity, value: string) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: field === 'name' ? value : Number(value) || 0 } : c)));
  };

  const tierMeta: Record<ChurnResult['tier'], { label: string; cls: string; icon: React.ReactNode }> = {
    high: { label: 'خطر مرتفع', cls: 'bg-red-50 border-red-200 text-red-700', icon: <AlertTriangle size={13} /> },
    medium: { label: 'خطر متوسط', cls: 'bg-amber-50 border-amber-200 text-amber-700', icon: <RadioTower size={13} /> },
    low: { label: 'مستقر', cls: 'bg-emerald-50 border-emerald-200 text-emerald-700', icon: <ShieldCheck size={13} /> },
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-2 text-indigo-900 flex items-center gap-2"><RadioTower size={20} /> رادار التنبؤ بإلغاء الاشتراكات (نسخة تعمل بالكامل)</h3>
      <p className="text-xs text-gray-500 mb-5">تسجيل مخاطر بقواعد صريحة وقابلة للتفسير (وليس نموذج ذكاء اصطناعي أسود الصندوق) — كل عامل ووزنه معروف ومرئي.</p>

      {highRiskValueUsd > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold p-3 rounded-lg mb-4 flex items-center gap-2">
          <AlertTriangle size={14} /> ${highRiskValueUsd}/شهر من الإيرادات معرضة لخطر إلغاء مرتفع الآن
        </div>
      )}

      <div className="space-y-3">
        {results.map((r) => (
          <div key={r.id} className={`bg-white p-4 rounded-lg border shadow-sm ${r.tier === 'high' ? 'ring-1 ring-red-100' : ''}`}>
            <div className="flex items-center justify-between mb-2">
              <input value={r.name} onChange={(e) => update(r.id, 'name', e.target.value)} className="font-bold text-sm text-gray-800 border-b border-transparent focus:border-indigo-300 outline-none" />
              <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border ${tierMeta[r.tier].cls}`}>{tierMeta[r.tier].icon} {tierMeta[r.tier].label} — {r.riskScore}/100</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
              <Mini label="أيام منذ آخر دخول" value={r.daysSinceLastLogin} onChange={(v) => update(r.id, 'daysSinceLastLogin', v)} />
              <Mini label="متوسط دخول أسبوعي" value={r.weeklyLoginsAvg} onChange={(v) => update(r.id, 'weeklyLoginsAvg', v)} />
              <Mini label="تذاكر دعم (30 يوم)" value={r.supportTickets} onChange={(v) => update(r.id, 'supportTickets', v)} />
              <Mini label="أشهر الاشتراك" value={r.monthsSubscribed} onChange={(v) => update(r.id, 'monthsSubscribed', v)} />
            </div>

            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
              <div className={`h-1.5 rounded-full ${r.tier === 'high' ? 'bg-red-500' : r.tier === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${r.riskScore}%` }} />
            </div>
            <p className="text-[11px] text-gray-500">💡 {r.suggestedAction}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Mini({ label, value, onChange }: { label: string; value: number; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[10px] text-gray-500 mb-1">{label}</label>
      <input type="number" value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-2 py-1.5 border rounded-md text-xs" dir="ltr" />
    </div>
  );
}
