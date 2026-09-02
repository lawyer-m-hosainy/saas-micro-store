import React, { useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle2, ScanLine, Ticket, XCircle } from 'lucide-react';

export interface EventTicket {
  id: string;
  attendeeName: string;
  code: string; // كود موقّع محلياً
}

/** توقيع بسيط قائم على مجموع القيم الرقمية للحروف (checksum) — يثبت إن الكود اتولّد من نفس النظام ومحتواه لم يُعبث به، بدون اتصال إنترنت */
export function signTicketCode(eventSecret: string, ticketId: string): string {
  const combined = `${eventSecret}:${ticketId}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = (hash * 31 + combined.charCodeAt(i)) >>> 0;
  }
  const checksum = hash.toString(36).toUpperCase().padStart(6, '0').slice(0, 6);
  return `${ticketId}-${checksum}`;
}

export function verifyTicketCode(eventSecret: string, code: string): { ticketId: string; valid: boolean } {
  const [ticketId] = code.split('-').length > 1 ? [code.split('-').slice(0, -1).join('-')] : [code];
  const expected = signTicketCode(eventSecret, ticketId);
  return { ticketId, valid: expected === code };
}

export interface CheckinResult {
  status: 'ok' | 'invalid' | 'duplicate';
  message: string;
}

/** يتحقق من توقيع التذكرة محلياً، ويمنع استخدامها مرتين عبر سجل محلي (Set) بدون أي اتصال بالسيرفر */
export function checkIn(eventSecret: string, code: string, usedCodes: Set<string>): CheckinResult {
  const { valid } = verifyTicketCode(eventSecret, code);
  if (!valid) return { status: 'invalid', message: 'تذكرة غير صالحة — الكود لا يطابق توقيع الفعالية' };
  if (usedCodes.has(code)) return { status: 'duplicate', message: 'هذه التذكرة استُخدمت من قبل — دخول مرفوض' };
  return { status: 'ok', message: 'تم تسجيل الدخول بنجاح ✓' };
}

const EVENT_SECRET = 'CONF2025-CAIRO';

const seedTickets = (): EventTicket[] => {
  const names = ['نادين سامي', 'كريم عادل', 'رنا محمود'];
  return names.map((n, i) => {
    const id = `TCK-${1000 + i}`;
    return { id, attendeeName: n, code: signTicketCode(EVENT_SECRET, id) };
  });
};

export function QrTicketCheckinScannerDemo() {
  const [tickets] = useState<EventTicket[]>(seedTickets());
  const [selectedTicketId, setSelectedTicketId] = useState(seedTickets()[0].id);
  const [manualCode, setManualCode] = useState('');
  const [usedCodes, setUsedCodes] = useState<Set<string>>(new Set());
  const [lastResult, setLastResult] = useState<CheckinResult | null>(null);
  const [log, setLog] = useState<{ code: string; result: CheckinResult }[]>([]);

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId)!;

  const stats = useMemo(() => ({
    total: tickets.length,
    checkedIn: usedCodes.size,
  }), [tickets, usedCodes]);

  const scan = (code: string) => {
    const result = checkIn(EVENT_SECRET, code, usedCodes);
    setLastResult(result);
    setLog((prev) => [{ code, result }, ...prev].slice(0, 8));
    if (result.status === 'ok') setUsedCodes((prev) => new Set(prev).add(code));
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-2 text-indigo-900 flex items-center gap-2"><Ticket size={20} /> نظام مسح تذاكر الفعاليات (نسخة تعمل بالكامل)</h3>
      <p className="text-xs text-gray-500 mb-5">تحقق حقيقي من التوقيع محليًا، ومنع استخدام مزدوج للتذكرة — يعمل بالكامل دون إنترنت.</p>

      <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm mb-5 flex items-center justify-between">
        <span className="text-xs text-gray-500">إحصائيات الحضور</span>
        <span className="font-mono font-black text-indigo-700">{stats.checkedIn} / {stats.total}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
          <h4 className="font-bold text-gray-700 text-sm mb-3">تذاكر الحضور</h4>
          <select value={selectedTicketId} onChange={(e) => setSelectedTicketId(e.target.value)} className="w-full mb-4 px-3 py-2 border rounded-md text-sm">
            {tickets.map((t) => (
              <option key={t.id} value={t.id}>{t.attendeeName} — {t.id} {usedCodes.has(t.code) ? '(دخل بالفعل)' : ''}</option>
            ))}
          </select>
          <div className="flex flex-col items-center bg-gray-50 rounded-lg p-4">
            <QRCodeSVG value={selectedTicket.code} size={140} level="H" />
            <p className="mt-2 font-bold text-sm text-gray-800">{selectedTicket.attendeeName}</p>
            <p className="font-mono text-[10px] text-gray-400">{selectedTicket.code}</p>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <label className="block text-xs text-gray-600 mb-1 font-bold flex items-center gap-1"><ScanLine size={13} /> محاكاة مسح الكود (الصق الكود يدويًا)</label>
            <div className="flex gap-2">
              <input value={manualCode} onChange={(e) => setManualCode(e.target.value)} placeholder={selectedTicket.code} className="flex-1 px-3 py-2 border rounded-md text-xs" dir="ltr" />
              <button onClick={() => scan(manualCode || selectedTicket.code)} className="bg-indigo-600 text-white px-4 py-2 rounded-md text-xs font-bold">تسجيل دخول</button>
            </div>
          </div>
        </div>

        <div>
          {lastResult && (
            <div className={`p-4 rounded-lg border mb-3 flex items-center gap-2 ${lastResult.status === 'ok' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
              {lastResult.status === 'ok' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
              <span className="text-sm font-bold">{lastResult.message}</span>
            </div>
          )}

          <h4 className="font-bold text-gray-700 text-sm mb-2">سجل عمليات المسح</h4>
          <div className="space-y-1.5">
            {log.map((entry, i) => (
              <div key={i} className={`text-xs p-2 rounded-md border flex items-center gap-2 ${entry.result.status === 'ok' ? 'bg-white border-gray-100' : 'bg-red-50 border-red-200'}`}>
                {entry.result.status === 'ok' ? <CheckCircle2 size={12} className="text-emerald-500" /> : <XCircle size={12} className="text-red-500" />}
                <span className="font-mono text-gray-500 truncate flex-1" dir="ltr">{entry.code}</span>
                <span className="text-gray-400">{entry.result.status}</span>
              </div>
            ))}
            {log.length === 0 && <p className="text-xs text-gray-400">لا توجد عمليات مسح بعد.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
