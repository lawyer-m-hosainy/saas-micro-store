import React, { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Wrench } from 'lucide-react';

export interface ServiceItem {
  id: string;
  name: string;
  intervalKm: number;
  lastServiceKm: number;
}

export interface ServiceStatus extends ServiceItem {
  kmSinceService: number;
  kmRemaining: number;
  status: 'ok' | 'due-soon' | 'overdue';
}

/** يحسب الكيلومترات المتبقية حتى موعد كل صيانة، ويصنف الحالة: عادي / قريب الاستحقاق (أقل من 500 كم) / متأخر */
export function computeServiceStatus(item: ServiceItem, currentMileage: number): ServiceStatus {
  const kmSinceService = currentMileage - item.lastServiceKm;
  const kmRemaining = item.intervalKm - kmSinceService;

  let status: ServiceStatus['status'] = 'ok';
  if (kmRemaining <= 0) status = 'overdue';
  else if (kmRemaining <= 500) status = 'due-soon';

  return { ...item, kmSinceService, kmRemaining, status };
}

const seedServices = (): ServiceItem[] => [
  { id: '1', name: 'تغيير زيت المحرك', intervalKm: 10000, lastServiceKm: 42000 },
  { id: '2', name: 'فحص وتغيير الفرامل', intervalKm: 20000, lastServiceKm: 30000 },
  { id: '3', name: 'تغيير سير الكاتينة', intervalKm: 60000, lastServiceKm: 0 },
];

export function CarMaintenanceMileageLoggerDemo() {
  const [currentMileage, setCurrentMileage] = useState(49700);
  const [services, setServices] = useState<ServiceItem[]>(seedServices());

  const statuses = useMemo(() => services.map((s) => computeServiceStatus(s, currentMileage)).sort((a, b) => a.kmRemaining - b.kmRemaining), [services, currentMileage]);

  const update = (id: string, field: keyof ServiceItem, value: string) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: field === 'name' ? value : Number(value) || 0 } : s)));
  };

  const statusMeta: Record<ServiceStatus['status'], { label: string; cls: string; icon: React.ReactNode }> = {
    ok: { label: 'سليم', cls: 'bg-emerald-50 border-emerald-200 text-emerald-700', icon: <CheckCircle2 size={13} /> },
    'due-soon': { label: 'قريب الاستحقاق', cls: 'bg-amber-50 border-amber-200 text-amber-700', icon: <AlertTriangle size={13} /> },
    overdue: { label: 'متأخر!', cls: 'bg-red-50 border-red-200 text-red-700', icon: <AlertTriangle size={13} /> },
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-6 text-indigo-900 flex items-center gap-2"><Wrench size={20} /> سجل صيانة المركبات ومُنبه تغيير الزيت (نسخة تعمل بالكامل)</h3>

      <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm mb-5 flex items-center gap-3">
        <label className="text-xs font-bold text-gray-600">قراءة العداد الحالية (كم)</label>
        <input type="number" value={currentMileage} onChange={(e) => setCurrentMileage(Number(e.target.value) || 0)} className="px-3 py-1.5 border rounded-md text-sm font-mono" dir="ltr" />
      </div>

      <div className="space-y-3">
        {statuses.map((s) => (
          <div key={s.id} className={`bg-white p-4 rounded-lg border shadow-sm ${s.status === 'overdue' ? 'ring-1 ring-red-100' : ''}`}>
            <div className="flex items-center justify-between mb-2">
              <input value={s.name} onChange={(e) => update(s.id, 'name', e.target.value)} className="font-bold text-sm text-gray-800 border-b border-transparent focus:border-indigo-300 outline-none" />
              <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border ${statusMeta[s.status].cls}`}>{statusMeta[s.status].icon} {statusMeta[s.status].label}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <Mini label="آخر صيانة عند (كم)" value={s.lastServiceKm} onChange={(v) => update(s.id, 'lastServiceKm', v)} />
              <Mini label="الفترة بين الصيانات (كم)" value={s.intervalKm} onChange={(v) => update(s.id, 'intervalKm', v)} />
            </div>
            <p className="text-[11px] text-gray-500">
              {s.status === 'overdue'
                ? `متأخر بـ ${Math.abs(s.kmRemaining).toLocaleString()} كم عن الموعد`
                : `متبقي ${s.kmRemaining.toLocaleString()} كم حتى الصيانة القادمة`}
            </p>
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
