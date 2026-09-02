import React, { useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { IdCard, Printer } from 'lucide-react';

export interface AttendeeRow {
  name: string;
  title: string;
}

/** يفكك نص CSV/أسطر بسيط إلى صفوف حضور (اسم، منصب) — يتجاهل الأسطر الفارغة ويتسامح مع فاصلة أو تاب */
export function parseAttendeeList(raw: string): AttendeeRow[] {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/[,\t]/).map((p) => p.trim());
      return { name: parts[0] || '', title: parts[1] || '' };
    })
    .filter((r) => r.name);
}

const sampleList = `أحمد سامي, مدير تسويق
هالة فتحي, مطوّرة برمجيات
عمر خالد, رائد أعمال
دينا حسن, مصممة جرافيك`;

export function BadgeNameTagBulkPrinterDemo() {
  const [raw, setRaw] = useState(sampleList);
  const [eventName, setEventName] = useState('مؤتمر التقنية 2025');

  const attendees = useMemo(() => parseAttendeeList(raw), [raw]);

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-2 text-indigo-900 flex items-center gap-2"><IdCard size={20} /> طابع بطاقات الأسماء الدفعي (نسخة تعمل بالكامل)</h3>
      <p className="text-xs text-gray-500 mb-5">استيراد حقيقي لقائمة الحضور وتوليد شارة QR فريدة لكل شخص، جاهزة للطباعة فورًا.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">اسم الفعالية</label>
            <input value={eventName} onChange={(e) => setEventName(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">قائمة الحضور (اسم، منصب لكل سطر)</label>
            <textarea value={raw} onChange={(e) => setRaw(e.target.value)} className="w-full h-64 p-2 border rounded-md text-xs font-mono" />
          </div>
          <p className="text-[11px] text-gray-400">{attendees.length} بطاقة جاهزة</p>
          <button onClick={() => window.print()} className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 flex items-center justify-center gap-2 text-sm">
            <Printer size={16} /> طباعة كل البطاقات
          </button>
        </div>

        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-3">
          {attendees.map((a, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex flex-col items-center text-center">
              <p className="font-black text-gray-900 text-sm mb-0.5">{a.name}</p>
              <p className="text-[11px] text-gray-500 mb-3">{a.title || '—'}</p>
              <QRCodeSVG value={JSON.stringify({ event: eventName, name: a.name })} size={72} level="M" />
              <p className="text-[9px] text-gray-400 mt-2 uppercase tracking-wide">{eventName}</p>
            </div>
          ))}
          {attendees.length === 0 && <p className="text-sm text-gray-400 col-span-full text-center py-10">ضيف أسماء في القائمة عشان تشوف البطاقات.</p>}
        </div>
      </div>
    </div>
  );
}
