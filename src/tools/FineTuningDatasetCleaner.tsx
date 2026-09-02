import React, { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Database, Download } from 'lucide-react';

export type ChatRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface LineResult {
  lineNumber: number;
  raw: string;
  valid: boolean;
  error: string | null;
  messages: ChatMessage[] | null;
  isDuplicate: boolean;
  estimatedTokens: number;
}

/** تقدير تقريبي لعدد التوكنز (~4 أحرف = توكن واحد بالإنجليزية، معلن كتقدير وليس عداً دقيقاً) */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function validateLine(raw: string): { messages: ChatMessage[] | null; error: string | null } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { messages: null, error: 'صيغة JSON غير صالحة' };
  }

  const obj = parsed as { messages?: unknown };
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.messages)) {
    return { messages: null, error: "يجب أن يحتوي السطر على مصفوفة 'messages'" };
  }

  const messages = obj.messages as unknown[];
  if (messages.length === 0) return { messages: null, error: 'مصفوفة messages فارغة' };

  const validRoles: ChatRole[] = ['system', 'user', 'assistant'];
  for (const m of messages) {
    const msg = m as Partial<ChatMessage>;
    if (!msg || typeof msg.content !== 'string' || !msg.content.trim()) {
      return { messages: null, error: 'كل رسالة يجب أن تحتوي على content نصي غير فارغ' };
    }
    if (!msg.role || !validRoles.includes(msg.role as ChatRole)) {
      return { messages: null, error: `role غير صالح: ${msg.role}` };
    }
  }

  const hasAssistant = messages.some((m) => (m as ChatMessage).role === 'assistant');
  if (!hasAssistant) return { messages: null, error: 'يجب وجود رسالة واحدة على الأقل بدور assistant' };

  return { messages: messages as ChatMessage[], error: null };
}

/** يفحص كل سطر JSONL كمحادثة مستقلة، يكشف التكرار بمقارنة محتوى الرسائل، ويقدّر عدد التوكنز الإجمالي */
export function analyzeJsonl(raw: string): LineResult[] {
  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
  const seenContent = new Set<string>();

  return lines.map((line, idx) => {
    const { messages, error } = validateLine(line);
    const contentKey = messages ? messages.map((m) => `${m.role}:${m.content}`).join('|') : null;
    const isDuplicate = contentKey ? seenContent.has(contentKey) : false;
    if (contentKey) seenContent.add(contentKey);

    const estimatedTokens = messages ? messages.reduce((s, m) => s + estimateTokens(m.content), 0) : 0;

    return { lineNumber: idx + 1, raw: line, valid: !error, error, messages, isDuplicate, estimatedTokens };
  });
}

const sampleJsonl = `{"messages": [{"role": "system", "content": "أنت مساعد خدمة عملاء لطيف."}, {"role": "user", "content": "إمتى الشحنة هتوصل؟"}, {"role": "assistant", "content": "شحنتك هتوصل خلال 2-3 أيام عمل."}]}
{"messages": [{"role": "user", "content": "عايز أرجع المنتج"}, {"role": "assistant", "content": "تقدر ترجع المنتج خلال 14 يوم من الاستلام."}]}
{"messages": [{"role": "user", "content": "عايز أرجع المنتج"}, {"role": "assistant", "content": "تقدر ترجع المنتج خلال 14 يوم من الاستلام."}]}
{"messages": [{"role": "user", "content": "ما هو سعر الشحن؟"}]}
{invalid json here}`;

export function FineTuningDatasetCleanerDemo() {
  const [raw, setRaw] = useState(sampleJsonl);

  const results = useMemo(() => analyzeJsonl(raw), [raw]);
  const validCount = results.filter((r) => r.valid && !r.isDuplicate).length;
  const totalTokens = results.filter((r) => r.valid && !r.isDuplicate).reduce((s, r) => s + r.estimatedTokens, 0);

  const downloadCleaned = () => {
    const cleanedLines = results.filter((r) => r.valid && !r.isDuplicate).map((r) => r.raw);
    const blob = new Blob([cleanedLines.join('\n')], { type: 'application/jsonl;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cleaned-dataset.jsonl';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-2 text-indigo-900 flex items-center gap-2"><Database size={20} /> منظف بيانات تدريب الذكاء الاصطناعي JSONL (نسخة تعمل بالكامل)</h3>
      <p className="text-xs text-gray-500 mb-5">فحص حقيقي لصيغة OpenAI Chat Fine-tuning — سطر لكل محادثة.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <textarea value={raw} onChange={(e) => setRaw(e.target.value)} dir="ltr" spellCheck={false} className="w-full h-96 p-3 font-mono text-[11px] border rounded-lg bg-white" />
        </div>

        <div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <Stat label="سطور صالحة" value={validCount} tone="emerald" />
            <Stat label="من إجمالي" value={results.length} tone="gray" />
            <Stat label="توكنز مقدّرة" value={totalTokens} tone="indigo" />
          </div>

          <div className="space-y-1.5 max-h-72 overflow-y-auto mb-3">
            {results.map((r) => (
              <div key={r.lineNumber} className={`text-xs p-2 rounded-md border flex items-start gap-2 ${r.valid && !r.isDuplicate ? 'bg-white border-gray-100' : 'bg-red-50 border-red-200'}`}>
                {r.valid && !r.isDuplicate ? <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" /> : <AlertTriangle size={13} className="text-red-500 shrink-0 mt-0.5" />}
                <span className="text-gray-600">
                  سطر {r.lineNumber}: {!r.valid ? r.error : r.isDuplicate ? 'محادثة مكررة — تم استبعادها' : `✓ صالح (${r.estimatedTokens} توكن تقريبًا)`}
                </span>
              </div>
            ))}
          </div>

          <button onClick={downloadCleaned} disabled={validCount === 0} className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
            <Download size={16} /> تحميل الملف النظيف ({validCount} سطر)
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: 'emerald' | 'gray' | 'indigo' }) {
  const cls = tone === 'emerald' ? 'text-emerald-600' : tone === 'indigo' ? 'text-indigo-600' : 'text-gray-700';
  return (
    <div className="bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm text-center">
      <div className={`font-mono font-black text-lg ${cls}`}>{value}</div>
      <div className="text-[9px] text-gray-500">{label}</div>
    </div>
  );
}
