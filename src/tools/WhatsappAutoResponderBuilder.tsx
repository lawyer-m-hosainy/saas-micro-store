import React, { useMemo, useState } from 'react';
import { AlertTriangle, Copy, GitBranch, Plus, Trash2 } from 'lucide-react';

export interface MenuOption {
  id: string;
  key: string; // مثال: "1"
  label: string;
  response: string;
}

export interface ValidationIssue {
  type: 'duplicate-key' | 'empty-key' | 'empty-response';
  message: string;
}

/** يتحقق من عدم وجود مفتاحين مكررين (زي "1" مرتين) ومن عدم وجود مفتاح أو رد فارغ قبل السماح بالتصدير */
export function validateMenu(options: MenuOption[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const seenKeys = new Map<string, number>();

  options.forEach((o) => {
    if (!o.key.trim()) issues.push({ type: 'empty-key', message: `الخيار "${o.label || 'بدون عنوان'}" بدون مفتاح ضغط` });
    if (!o.response.trim()) issues.push({ type: 'empty-response', message: `الخيار "${o.key}" بدون رد نصي` });
    seenKeys.set(o.key, (seenKeys.get(o.key) || 0) + 1);
  });

  seenKeys.forEach((count, key) => {
    if (count > 1 && key.trim()) issues.push({ type: 'duplicate-key', message: `المفتاح "${key}" مستخدم ${count} مرات` });
  });

  return issues;
}

/** يبني نص القائمة الرئيسية اللي هيتبعت للعميل، وملف إعدادات JSON قابل للتصدير لأي محرك ردود آلية */
export function buildMenuText(welcomeMessage: string, options: MenuOption[]): string {
  const lines = [welcomeMessage, ''];
  options.forEach((o) => lines.push(`${o.key}️⃣ ${o.label}`));
  return lines.join('\n');
}

export function exportConfig(welcomeMessage: string, options: MenuOption[]): string {
  return JSON.stringify({ welcomeMessage, options: options.map((o) => ({ key: o.key, label: o.label, response: o.response })) }, null, 2);
}

const seedOptions = (): MenuOption[] => [
  { id: '1', key: '1', label: 'المبيعات والاستفسارات', response: 'أهلاً بيك! فريق المبيعات هيرد عليك خلال دقايق 🙌' },
  { id: '2', key: '2', label: 'الدعم الفني', response: 'تمام، ابعتلنا وصف المشكلة وهنحلها في أقرب وقت.' },
  { id: '3', key: '3', label: 'تتبع الطلب', response: 'ابعتلنا رقم الطلب وهنبعتلك حالته فورًا.' },
];

export function WhatsappAutoResponderBuilderDemo() {
  const [welcomeMessage, setWelcomeMessage] = useState('أهلاً بيك في متجرنا 👋 اختر رقم اللي يناسبك:');
  const [options, setOptions] = useState<MenuOption[]>(seedOptions());
  const [copied, setCopied] = useState(false);

  const issues = useMemo(() => validateMenu(options), [options]);
  const menuText = useMemo(() => buildMenuText(welcomeMessage, options), [welcomeMessage, options]);
  const config = useMemo(() => exportConfig(welcomeMessage, options), [welcomeMessage, options]);

  const update = (id: string, field: keyof MenuOption, value: string) => setOptions((prev) => prev.map((o) => (o.id === id ? { ...o, [field]: value } : o)));

  const copy = async () => {
    await navigator.clipboard.writeText(config);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-2 text-indigo-900 flex items-center gap-2"><GitBranch size={20} /> باني سيناريوهات الرد الآلي لواتساب (نسخة تعمل بالكامل)</h3>
      <p className="text-xs text-gray-500 mb-5">تحقق حقيقي من صحة الشجرة (مفاتيح مكررة/فارغة) قبل تصدير الإعدادات.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">رسالة الترحيب</label>
            <textarea value={welcomeMessage} onChange={(e) => setWelcomeMessage(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm h-16" />
          </div>

          {options.map((o) => (
            <div key={o.id} className="border border-gray-100 rounded-md p-2.5 space-y-1.5">
              <div className="flex items-center gap-2">
                <input value={o.key} onChange={(e) => update(o.id, 'key', e.target.value)} className="w-10 px-2 py-1.5 border rounded-md text-xs text-center" dir="ltr" />
                <input value={o.label} onChange={(e) => update(o.id, 'label', e.target.value)} className="flex-1 px-2 py-1.5 border rounded-md text-xs" placeholder="عنوان الخيار" />
                {options.length > 1 && <button onClick={() => setOptions((prev) => prev.filter((x) => x.id !== o.id))} className="text-gray-300 hover:text-red-500"><Trash2 size={13} /></button>}
              </div>
              <textarea value={o.response} onChange={(e) => update(o.id, 'response', e.target.value)} className="w-full px-2 py-1.5 border rounded-md text-xs h-12" placeholder="نص الرد التلقائي" />
            </div>
          ))}
          <button onClick={() => setOptions((prev) => [...prev, { id: Date.now().toString(), key: String(prev.length + 1), label: 'خيار جديد', response: '' }])} className="text-xs text-indigo-600 font-bold flex items-center gap-1">
            <Plus size={14} /> إضافة خيار
          </button>
        </div>

        <div className="space-y-3">
          {issues.length > 0 && (
            <div className="space-y-1.5">
              {issues.map((issue, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-bold bg-red-50 border border-red-200 text-red-700 p-2 rounded-lg">
                  <AlertTriangle size={13} /> {issue.message}
                </div>
              ))}
            </div>
          )}

          <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-600 mb-2">معاينة رسالة واتساب</p>
            <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans bg-gray-50 p-3 rounded-md">{menuText}</pre>
          </div>

          <div>
            <div className="flex justify-end mb-1">
              <button onClick={copy} className="text-xs text-indigo-600 font-bold flex items-center gap-1"><Copy size={13} /> {copied ? 'تم النسخ ✓' : 'نسخ إعدادات JSON'}</button>
            </div>
            <pre dir="ltr" className="w-full h-40 p-3 font-mono text-[10.5px] border rounded-lg bg-gray-900 text-emerald-300 overflow-auto whitespace-pre-wrap">{config}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
