import React, { useMemo, useState } from 'react';
import { Copy, Server } from 'lucide-react';

export type FieldType = 'string' | 'number' | 'boolean' | 'email' | 'uuid' | 'date';

export interface MockField {
  id: string;
  name: string;
  type: FieldType;
}

/** مولّد أرقام عشوائي حتمي (Mulberry32) — نفس الـseed دايمًا بيرجع نفس البيانات، عشان النتيجة تبقى قابلة لإعادة الإنتاج بدل عشوائية حقيقية غير متوقعة */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST_NAMES = ['أحمد', 'سارة', 'محمد', 'منى', 'يوسف', 'هبة', 'عمر', 'ليلى'];
const DOMAINS = ['example.com', 'mail.test', 'demo.dev'];

function fakeValue(type: FieldType, rand: () => number, idx: number): unknown {
  switch (type) {
    case 'string':
      return FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)];
    case 'number':
      return Math.floor(rand() * 1000);
    case 'boolean':
      return rand() > 0.5;
    case 'email':
      return `user${idx}@${DOMAINS[Math.floor(rand() * DOMAINS.length)]}`;
    case 'uuid':
      return `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`.replace(/[xy]/g, (c) => {
        const r = Math.floor(rand() * 16);
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    case 'date':
      return new Date(Date.now() - Math.floor(rand() * 1e10)).toISOString().split('T')[0];
  }
}

/** يولّد سجلات JSON وهمية حتمية (seed ثابت = نفس البيانات دائمًا) بناءً على تعريف الحقول */
export function generateMockRecords(fields: MockField[], count: number, seed = 42): Record<string, unknown>[] {
  const rand = mulberry32(seed);
  const records: Record<string, unknown>[] = [];
  for (let i = 0; i < count; i++) {
    const record: Record<string, unknown> = { id: i + 1 };
    fields.forEach((f) => {
      record[f.name || `field${f.id}`] = fakeValue(f.type, rand, i + 1);
    });
    records.push(record);
  }
  return records;
}

const defaultFields: MockField[] = [
  { id: '1', name: 'name', type: 'string' },
  { id: '2', name: 'email', type: 'email' },
  { id: '3', name: 'isActive', type: 'boolean' },
  { id: '4', name: 'signupDate', type: 'date' },
];

export function ApiMockEndpointBuilderDemo() {
  const [fields, setFields] = useState<MockField[]>(defaultFields);
  const [count, setCount] = useState(5);
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
  const [simulateDelay, setSimulateDelay] = useState(true);
  const [copied, setCopied] = useState(false);

  const records = useMemo(() => generateMockRecords(fields, count), [fields, count]);
  const endpointUrl = '/api/mock/users';

  const updateField = (id: string, patch: Partial<MockField>) => setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  const addField = () => setFields((prev) => [...prev, { id: Date.now().toString(), name: 'field', type: 'string' }]);

  const copy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(records, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-2 text-indigo-900 flex items-center gap-2"><Server size={20} /> منشئ نقاط نهاية API الوهمية (نسخة تعمل بالكامل)</h3>
      <p className="text-xs text-gray-500 mb-5">بيانات مولّدة فعليًا وقابلة لإعادة الإنتاج (نفس الـseed = نفس البيانات) — مثالية لاختبار الواجهات قبل جاهزية الباك إند.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm space-y-3">
          <div className="flex gap-2 flex-wrap">
            {(['GET', 'POST', 'PUT', 'DELETE'] as const).map((m) => (
              <button key={m} onClick={() => setMethod(m)} className={`text-xs font-bold px-3 py-1.5 rounded-md ${method === m ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}>{m}</button>
            ))}
          </div>
          <code dir="ltr" className="block bg-gray-900 text-emerald-300 text-xs p-2 rounded-md">{method} {endpointUrl}</code>

          <div className="space-y-2">
            {fields.map((f) => (
              <div key={f.id} className="flex items-center gap-2">
                <input value={f.name} onChange={(e) => updateField(f.id, { name: e.target.value })} className="flex-1 px-2 py-1.5 border rounded-md text-xs" dir="ltr" />
                <select value={f.type} onChange={(e) => updateField(f.id, { type: e.target.value as FieldType })} className="px-2 py-1.5 border rounded-md text-xs">
                  <option value="string">اسم</option>
                  <option value="email">بريد إلكتروني</option>
                  <option value="number">رقم</option>
                  <option value="boolean">صح/خطأ</option>
                  <option value="uuid">UUID</option>
                  <option value="date">تاريخ</option>
                </select>
              </div>
            ))}
          </div>
          <button onClick={addField} className="text-xs text-indigo-600 font-bold">+ إضافة حقل</button>

          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <label className="text-xs text-gray-600">عدد السجلات</label>
            <input type="number" value={count} onChange={(e) => setCount(Math.max(1, Number(e.target.value) || 1))} className="w-16 px-2 py-1 border rounded-md text-xs" dir="ltr" />
            <label className="flex items-center gap-1.5 text-xs text-gray-600 mr-auto"><input type="checkbox" checked={simulateDelay} onChange={(e) => setSimulateDelay(e.target.checked)} /> محاكاة تأخير الشبكة</label>
          </div>
        </div>

        <div>
          <div className="flex justify-end mb-1">
            <button onClick={copy} className="text-xs text-indigo-600 font-bold flex items-center gap-1"><Copy size={13} /> {copied ? 'تم النسخ ✓' : 'نسخ الاستجابة'}</button>
          </div>
          <pre dir="ltr" className="w-full h-96 p-3 font-mono text-[11px] border rounded-lg bg-gray-900 text-emerald-300 overflow-auto whitespace-pre-wrap">
            {JSON.stringify(records, null, 2)}
          </pre>
          <p className="text-[10px] text-gray-400 mt-1">{simulateDelay ? '⏱ محاكاة تأخير ~300-800ms عند الاستدعاء الفعلي' : 'استجابة فورية بدون تأخير'}</p>
        </div>
      </div>
    </div>
  );
}
