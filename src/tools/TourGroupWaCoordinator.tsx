import React, { useMemo, useState } from 'react';
import { CheckCircle2, MessageCircle, Users, XCircle } from 'lucide-react';

export interface Traveler {
  id: string;
  name: string;
  phone: string;
  confirmed: boolean;
}

/** يبني رابط wa.me جاهز مع نص التذكير معبّأ مسبقًا — إرسال حقيقي بنقرة واحدة بدون أي API مدفوع */
export function buildReminderWaLink(traveler: Traveler, meetingPoint: string, meetingTime: string): string {
  const phone = traveler.phone.replace(/[^\d]/g, '');
  const text = `مرحباً ${traveler.name} 👋\nتذكير بموعد التجمع: ${meetingTime}\nمكان التجمع: ${meetingPoint}\nبرجاء الحضور قبل الموعد بـ10 دقائق 🙏`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function computeAttendanceStats(travelers: Traveler[]) {
  const total = travelers.length;
  const confirmed = travelers.filter((t) => t.confirmed).length;
  return { total, confirmed, pending: total - confirmed, rate: total > 0 ? (confirmed / total) * 100 : 0 };
}

const seedTravelers = (): Traveler[] => [
  { id: '1', name: 'محمود سعيد', phone: '201012345678', confirmed: true },
  { id: '2', name: 'إيمان طارق', phone: '201098765432', confirmed: true },
  { id: '3', name: 'أسامة فؤاد', phone: '201156789012', confirmed: false },
  { id: '4', name: 'ندى إبراهيم', phone: '201223456789', confirmed: false },
];

export function TourGroupWaCoordinatorDemo() {
  const [meetingPoint, setMeetingPoint] = useState('لوبي فندق الماسة، الساعة 8 صباحاً')
  const [meetingTime, setMeetingTime] = useState('08:00 صباحاً - غداً');
  const [travelers, setTravelers] = useState<Traveler[]>(seedTravelers());

  const stats = useMemo(() => computeAttendanceStats(travelers), [travelers]);

  const toggle = (id: string) => setTravelers((prev) => prev.map((t) => (t.id === id ? { ...t, confirmed: !t.confirmed } : t)));

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-2 text-indigo-900 flex items-center gap-2"><Users size={20} /> منسق مجموعات الرحلات السياحية (نسخة تعمل بالكامل)</h3>
      <p className="text-xs text-gray-500 mb-5">روابط تذكير واتساب حقيقية جاهزة بنقرة واحدة، وتتبع تأكيدات حي.</p>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
          <label className="block text-xs text-gray-600 mb-1">مكان التجمع</label>
          <input value={meetingPoint} onChange={(e) => setMeetingPoint(e.target.value)} className="w-full px-2 py-1.5 border rounded-md text-xs" />
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
          <label className="block text-xs text-gray-600 mb-1">موعد التجمع</label>
          <input value={meetingTime} onChange={(e) => setMeetingTime(e.target.value)} className="w-full px-2 py-1.5 border rounded-md text-xs" />
        </div>
      </div>

      <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm mb-4 flex items-center justify-between">
        <span className="text-xs text-gray-500">نسبة التأكيد</span>
        <span className="font-mono font-black text-indigo-700">{stats.confirmed}/{stats.total} ({stats.rate.toFixed(0)}%)</span>
      </div>

      <div className="space-y-2">
        {travelers.map((t) => (
          <div key={t.id} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button onClick={() => toggle(t.id)}>
                {t.confirmed ? <CheckCircle2 size={18} className="text-emerald-500" /> : <XCircle size={18} className="text-gray-300" />}
              </button>
              <div>
                <p className="text-sm font-bold text-gray-800">{t.name}</p>
                <p className="text-[10px] text-gray-400 font-mono" dir="ltr">{t.phone}</p>
              </div>
            </div>
            <a href={buildReminderWaLink(t, meetingPoint, meetingTime)} target="_blank" rel="noreferrer" className="text-[11px] bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1.5 rounded-full flex items-center gap-1">
              <MessageCircle size={12} /> إرسال تذكير
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
