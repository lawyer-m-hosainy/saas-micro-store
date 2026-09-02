import React, { useMemo, useState } from 'react';
import { AlertTriangle, CalendarPlus, Mic2, Plus, Trash2 } from 'lucide-react';

export interface Session {
  id: string;
  title: string;
  speaker: string;
  room: string;
  start: string; // "HH:MM"
  end: string; // "HH:MM"
}

export interface RoomConflict {
  room: string;
  sessionIds: [string, string];
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/** يكتشف أي جلستين في نفس القاعة بأوقات متداخلة زمنياً — منطق حساب تداخل فترات كلاسيكي */
export function findRoomConflicts(sessions: Session[]): RoomConflict[] {
  const conflicts: RoomConflict[] = [];
  for (let i = 0; i < sessions.length; i++) {
    for (let j = i + 1; j < sessions.length; j++) {
      const a = sessions[i];
      const b = sessions[j];
      if (a.room !== b.room) continue;
      const overlap = toMinutes(a.start) < toMinutes(b.end) && toMinutes(b.start) < toMinutes(a.end);
      if (overlap) conflicts.push({ room: a.room, sessionIds: [a.id, b.id] });
    }
  }
  return conflicts;
}

/** يبني رابط Google Calendar القياسي (render?action=TEMPLATE) لإضافة الجلسة بنقرة واحدة بدون أي OAuth */
export function buildGoogleCalendarLink(session: Session, eventDate: string): string {
  const fmt = (hhmm: string) => `${eventDate.replace(/-/g, '')}T${hhmm.replace(':', '')}00`;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: session.title,
    dates: `${fmt(session.start)}/${fmt(session.end)}`,
    location: session.room,
    details: `المتحدث: ${session.speaker}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

const seedSessions = (): Session[] => [
  { id: '1', title: 'مستقبل الذكاء الاصطناعي', speaker: 'د. ياسمين علي', room: 'القاعة الرئيسية', start: '10:00', end: '11:00' },
  { id: '2', title: 'بناء SaaS مربح', speaker: 'محمد عبد الرحمن', room: 'قاعة B', start: '10:30', end: '11:30' },
  { id: '3', title: 'ورشة تصميم المنتجات', speaker: 'سارة فوزي', room: 'قاعة B', start: '11:30', end: '13:00' },
];

export function SpeakerAgendaBuilderDemo() {
  const [eventDate, setEventDate] = useState('2025-11-15');
  const [sessions, setSessions] = useState<Session[]>(seedSessions());

  const conflicts = useMemo(() => findRoomConflicts(sessions), [sessions]);
  const conflictIds = new Set(conflicts.flatMap((c) => c.sessionIds));

  const update = (id: string, field: keyof Session, value: string) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const byRoom = useMemo(() => {
    const map = new Map<string, Session[]>();
    sessions.forEach((s) => {
      const list = map.get(s.room) || [];
      list.push(s);
      map.set(s.room, list);
    });
    return map;
  }, [sessions]);

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-2 text-indigo-900 flex items-center gap-2"><Mic2 size={20} /> منشئ جدول جلسات المؤتمرات (نسخة تعمل بالكامل)</h3>
      <div className="flex items-center gap-2 mb-5">
        <label className="text-xs text-gray-600">تاريخ الفعالية</label>
        <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="px-2 py-1 border rounded-md text-xs" dir="ltr" />
      </div>

      {conflicts.length > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold p-3 rounded-lg mb-4 flex items-center gap-2">
          <AlertTriangle size={14} /> يوجد {conflicts.length} تعارض في مواعيد القاعات — تحقق من الجلسات المظللة بالأحمر
        </div>
      )}

      <div className="space-y-2 mb-4">
        {sessions.map((s) => (
          <div key={s.id} className={`bg-white p-3 rounded-lg border shadow-sm ${conflictIds.has(s.id) ? 'border-red-300 ring-1 ring-red-100' : 'border-gray-100'}`}>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 items-center">
              <input value={s.title} onChange={(e) => update(s.id, 'title', e.target.value)} className="col-span-2 px-2 py-1.5 border rounded-md text-xs font-bold" />
              <input value={s.speaker} onChange={(e) => update(s.id, 'speaker', e.target.value)} className="px-2 py-1.5 border rounded-md text-xs" />
              <input value={s.room} onChange={(e) => update(s.id, 'room', e.target.value)} className="px-2 py-1.5 border rounded-md text-xs" />
              <div className="flex items-center gap-1">
                <input type="time" value={s.start} onChange={(e) => update(s.id, 'start', e.target.value)} className="w-full px-1 py-1.5 border rounded-md text-[11px]" dir="ltr" />
                <input type="time" value={s.end} onChange={(e) => update(s.id, 'end', e.target.value)} className="w-full px-1 py-1.5 border rounded-md text-[11px]" dir="ltr" />
              </div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <a href={buildGoogleCalendarLink(s, eventDate)} target="_blank" rel="noreferrer" className="text-[11px] text-indigo-600 font-bold flex items-center gap-1">
                <CalendarPlus size={12} /> إضافة لتقويم جوجل
              </a>
              {sessions.length > 1 && <button onClick={() => setSessions((prev) => prev.filter((x) => x.id !== s.id))} className="text-gray-300 hover:text-red-500"><Trash2 size={13} /></button>}
            </div>
          </div>
        ))}
      </div>

      <button onClick={() => setSessions((prev) => [...prev, { id: Date.now().toString(), title: 'جلسة جديدة', speaker: '', room: 'القاعة الرئيسية', start: '12:00', end: '13:00' }])} className="text-sm text-indigo-600 font-medium flex items-center gap-1 mb-5">
        <Plus size={16} /> إضافة جلسة
      </button>

      <div className="text-xs text-gray-400">{byRoom.size} قاعة · {sessions.length} جلسة إجمالاً</div>
    </div>
  );
}
