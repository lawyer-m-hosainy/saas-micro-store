import React, { useMemo, useState } from 'react';
import { ArrowLeftRight, Plus, Trash2 } from 'lucide-react';

export type TransformOp = 'rename' | 'remove' | 'add';

export interface TransformRule {
  id: string;
  op: TransformOp;
  key: string; // للـrename: الحقل المصدر / remove: الحقل المحذوف / add: اسم الحقل الجديد
  newKey?: string; // للـrename فقط
  value?: string; // للـadd فقط
}

/** يطبّق قواعد إعادة تسمية/حذف/إضافة الحقول بالترتيب على أي كائن JSON، بدون تعديل الكائن الأصلي */
export function applyTransform(input: Record<string, unknown>, rules: TransformRule[]): Record<string, unknown> {
  let result: Record<string, unknown> = { ...input };

  for (const rule of rules) {
    if (rule.op === 'rename' && rule.newKey && rule.key in result) {
      const value = result[rule.key];
      const next = { ...result };
      delete next[rule.key];
      next[rule.newKey] = value;
      result = next;
    } else if (rule.op === 'remove') {
      if (rule.key in result) {
        const next = { ...result };
        delete next[rule.key];
        result = next;
      }
    } else if (rule.op === 'add' && rule.key) {
      result = { ...result, [rule.key]: rule.value ?? '' };
    }
  }

  return result;
}

const samplePayload = `{
  "event_type": "order.created",
  "customer_email": "client@example.com",
  "order_total_cents": 15000,
  "internal_debug_id": "dbg-88213"
}`;

export function WebhookPayloadTransformerDemo() {
  const [rawInput, setRawInput] = useState(samplePayload);
  const [rules, setRules] = useState<TransformRule[]>([
    { id: '1', op: 'rename', key: 'event_type', newKey: 'event' },
    { id: '2', op: 'rename', key: 'customer_email', newKey: 'email' },
    { id: '3', op: 'remove', key: 'internal_debug_id' },
    { id: '4', op: 'add', key: 'source', value: 'store-webhook-bridge' },
  ]);

  const { parsed, parseError } = useMemo(() => {
    try {
      return { parsed: JSON.parse(rawInput) as Record<string, unknown>, parseError: null as string | null };
    } catch (e) {
      return { parsed: null, parseError: e instanceof Error ? e.message : 'JSON غير صالح' };
    }
  }, [rawInput]);

  const output = useMemo(() => (parsed ? applyTransform(parsed, rules) : null), [parsed, rules]);

  const updateRule = (id: string, field: keyof TransformRule, value: string) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };
  const removeRule = (id: string) => setRules((prev) => prev.filter((r) => r.id !== id));
  const addRule = () => setRules((prev) => [...prev, { id: Date.now().toString(), op: 'add', key: '', value: '' }]);

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-2 text-indigo-900 flex items-center gap-2"><ArrowLeftRight size={20} /> محول ومُفلتر بيانات Webhook (نسخة تعمل بالكامل)</h3>
      <p className="text-xs text-gray-500 mb-5">عرّف قواعد التحويل مرة واحدة، وشوف الناتج يتحدث فوراً — نفس المنطق اللي يشتغل خلف باكند خفيف في النسخة المستضافة.</p>

      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm mb-5">
        <h4 className="font-bold text-gray-700 mb-3 text-sm">قواعد التحويل ({rules.length})</h4>
        <div className="space-y-2">
          {rules.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center gap-2 bg-gray-50 p-2 rounded-md">
              <select value={r.op} onChange={(e) => updateRule(r.id, 'op', e.target.value)} className="text-xs border rounded-md px-2 py-1.5 bg-white">
                <option value="rename">إعادة تسمية</option>
                <option value="remove">حذف حقل</option>
                <option value="add">إضافة حقل ثابت</option>
              </select>
              <input value={r.key} onChange={(e) => updateRule(r.id, 'key', e.target.value)} placeholder={r.op === 'add' ? 'اسم الحقل الجديد' : 'اسم الحقل'} className="text-xs border rounded-md px-2 py-1.5 w-40" dir="ltr" />
              {r.op === 'rename' && (
                <>
                  <span className="text-gray-400 text-xs">←</span>
                  <input value={r.newKey || ''} onChange={(e) => updateRule(r.id, 'newKey', e.target.value)} placeholder="الاسم الجديد" className="text-xs border rounded-md px-2 py-1.5 w-32" dir="ltr" />
                </>
              )}
              {r.op === 'add' && (
                <input value={r.value || ''} onChange={(e) => updateRule(r.id, 'value', e.target.value)} placeholder="القيمة" className="text-xs border rounded-md px-2 py-1.5 w-32" dir="ltr" />
              )}
              <button onClick={() => removeRule(r.id)} className="text-gray-300 hover:text-red-500 ms-auto"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
        <button onClick={addRule} className="text-xs text-indigo-600 font-medium hover:text-indigo-800 flex items-center gap-1 mt-3">
          <Plus size={14} /> إضافة قاعدة
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-bold">JSON الوارد (Input)</label>
          <textarea value={rawInput} onChange={(e) => setRawInput(e.target.value)} dir="ltr" spellCheck={false} className="w-full h-56 p-3 font-mono text-[11px] border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none" />
          {parseError && <p className="text-xs text-red-600 mt-1.5">{parseError}</p>}
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-bold">JSON الناتج بعد التحويل (Output)</label>
          <pre dir="ltr" className="w-full h-56 p-3 font-mono text-[11px] border rounded-lg bg-gray-900 text-emerald-300 overflow-auto">
            {output ? JSON.stringify(output, null, 2) : '—'}
          </pre>
        </div>
      </div>
    </div>
  );
}
