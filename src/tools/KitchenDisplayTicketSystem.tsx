import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ChefHat, Clock } from 'lucide-react';

export interface KitchenTicket {
  id: string;
  tableNumber: number;
  items: string[];
  createdAt: number;
  completed: boolean;
}

export type WaitTier = 'fresh' | 'warning' | 'urgent';

/** يصنّف كل تذكرة حسب دقائق الانتظار: أقل من 8 = عادي، 8-15 = تحذير، أكثر من 15 = عاجل — عتبات قابلة للتعديل */
export function classifyWait(createdAt: number, now: number, warningMin = 8, urgentMin = 15): WaitTier {
  const minutes = (now - createdAt) / 60000;
  if (minutes >= urgentMin) return 'urgent';
  if (minutes >= warningMin) return 'warning';
  return 'fresh';
}

const seedTickets = (): KitchenTicket[] => {
  const now = Date.now();
  return [
    { id: '1', tableNumber: 3, items: ['برجر لحم ×2', 'بطاطس'], createdAt: now - 2 * 60000, completed: false },
    { id: '2', tableNumber: 7, items: ['بيتزا مارجريتا'], createdAt: now - 10 * 60000, completed: false },
    { id: '3', tableNumber: 5, items: ['سلطة سيزر', 'عصير برتقال ×2'], createdAt: now - 18 * 60000, completed: false },
  ];
};

export function KitchenDisplayTicketSystemDemo() {
  const [tickets, setTickets] = useState<KitchenTicket[]>(seedTickets());
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(id);
  }, []);

  const active = useMemo(() => tickets.filter((t) => !t.completed).sort((a, b) => a.createdAt - b.createdAt), [tickets]);

  const complete = (id: string) => setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, completed: true } : t)));

  const tierMeta: Record<WaitTier, { label: string; cls: string }> = {
    fresh: { label: 'جديد', cls: 'bg-emerald-50 border-emerald-300' },
    warning: { label: 'انتبه', cls: 'bg-amber-50 border-amber-300' },
    urgent: { label: 'عاجل!', cls: 'bg-red-50 border-red-400' },
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-2 text-indigo-900 flex items-center gap-2"><ChefHat size={20} /> شاشة عرض طلبات المطبخ (نسخة تعمل بالكامل)</h3>
      <p className="text-xs text-gray-500 mb-5">الألوان تتحدث تلقائيًا كل 5 ثوانٍ حسب دقائق الانتظار الفعلية.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {active.map((t) => {
          const tier = classifyWait(t.createdAt, now);
          const minutes = Math.floor((now - t.createdAt) / 60000);
          return (
            <div key={t.id} className={`rounded-xl border-2 p-4 shadow-sm ${tierMeta[tier].cls}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-black text-gray-900">طاولة {t.tableNumber}</span>
                <span className="text-[10px] font-bold flex items-center gap-1 text-gray-600"><Clock size={11} /> {minutes} د · {tierMeta[tier].label}</span>
              </div>
              <ul className="text-sm text-gray-700 space-y-1 mb-3">
                {t.items.map((item, i) => <li key={i}>• {item}</li>)}
              </ul>
              <button onClick={() => complete(t.id)} className="w-full bg-gray-900 text-white py-2 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-gray-800">
                <CheckCircle2 size={14} /> تم التحضير
              </button>
            </div>
          );
        })}
        {active.length === 0 && <p className="text-sm text-gray-400 col-span-full text-center py-10">لا توجد طلبات قيد الانتظار 🎉</p>}
      </div>
    </div>
  );
}
