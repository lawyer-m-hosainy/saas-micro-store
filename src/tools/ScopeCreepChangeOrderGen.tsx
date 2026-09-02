import React, { useMemo, useState } from 'react';
import { Copy, FileWarning, Plus, Trash2 } from 'lucide-react';

export interface ExtraWorkItem {
  id: string;
  description: string;
  hours: number;
}

/** يحسب التكلفة الإضافية الإجمالية والأيام المضافة للجدول الزمني من بنود العمل الإضافي وسعر الساعة */
export function computeChangeOrderCost(items: ExtraWorkItem[], hourlyRate: number, hoursPerDay = 6) {
  const totalHours = items.reduce((s, i) => s + i.hours, 0);
  const totalCost = totalHours * hourlyRate;
  const extraDays = Math.ceil(totalHours / hoursPerDay);
  return { totalHours, totalCost, extraDays };
}

/** يبني وثيقة طلب تعديل احترافية ولطيفة تحمي وقت المستقل بدون ما تخرب العلاقة مع العميل */
export function buildChangeOrderDocument(clientName: string, projectName: string, items: ExtraWorkItem[], hourlyRate: number): string {
  const { totalHours, totalCost, extraDays } = computeChangeOrderCost(items, hourlyRate);
  const lines = [
    `طلب تعديل نطاق (Change Order)`,
    `المشروع: ${projectName}`,
    `العميل: ${clientName}`,
    '',
    'أهلاً بيك،',
    '',
    'بمراجعة الطلبات الأخيرة، لاحظنا إنها بتضيف عمل خارج نطاق الاتفاق الأصلي. تفاصيل البنود الإضافية:',
    '',
    ...items.map((i) => `• ${i.description} — ${i.hours} ساعة`),
    '',
    `إجمالي الساعات الإضافية: ${totalHours} ساعة`,
    `التكلفة الإضافية: ${totalCost.toLocaleString()} ج.م`,
    `الأثر على الجدول الزمني: +${extraDays} يوم عمل`,
    '',
    'برجاء الموافقة على البنود دي عشان نكمل بنفس الجودة المعتادة، ونقدر نبدأ فورًا بعد التأكيد.',
    '',
    'شكراً لتفهمك 🙏',
  ];
  return lines.join('\n');
}

const seedItems = (): ExtraWorkItem[] => [
  { id: '1', description: 'إضافة صفحة "من نحن" لم تكن في الاتفاق الأصلي', hours: 4 },
  { id: '2', description: 'تعديل التصميم بعد الموافقة النهائية (نسخة ثالثة)', hours: 6 },
];

export function ScopeCreepChangeOrderGenDemo() {
  const [clientName, setClientName] = useState('شركة الأفق للتسويق');
  const [projectName, setProjectName] = useState('تصميم الهوية البصرية');
  const [hourlyRate, setHourlyRate] = useState(150);
  const [items, setItems] = useState<ExtraWorkItem[]>(seedItems());
  const [copied, setCopied] = useState(false);

  const cost = useMemo(() => computeChangeOrderCost(items, hourlyRate), [items, hourlyRate]);
  const document = useMemo(() => buildChangeOrderDocument(clientName, projectName, items, hourlyRate), [clientName, projectName, items, hourlyRate]);

  const update = (id: string, field: keyof ExtraWorkItem, value: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: field === 'description' ? value : Number(value) || 0 } : i)));
  };

  const copy = async () => {
    await navigator.clipboard.writeText(document);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-2 text-indigo-900 flex items-center gap-2"><FileWarning size={20} /> صانع وثائق طلبات التعديل الإضافية (نسخة تعمل بالكامل)</h3>
      <p className="text-xs text-gray-500 mb-5">وثيقة احترافية جاهزة للإرسال بحساب فعلي للتكلفة والوقت الإضافي.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Field label="اسم العميل" value={clientName} onChange={setClientName} />
            <Field label="اسم المشروع" value={projectName} onChange={setProjectName} />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">سعر الساعة (ج.م)</label>
            <input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(Number(e.target.value) || 0)} className="w-32 px-3 py-2 border rounded-md text-sm" dir="ltr" />
          </div>

          {items.map((i) => (
            <div key={i.id} className="flex items-center gap-2">
              <input value={i.description} onChange={(e) => update(i.id, 'description', e.target.value)} className="flex-1 px-2 py-1.5 border rounded-md text-xs" />
              <input type="number" value={i.hours} onChange={(e) => update(i.id, 'hours', e.target.value)} className="w-16 px-2 py-1.5 border rounded-md text-xs" dir="ltr" />
              {items.length > 1 && <button onClick={() => setItems((prev) => prev.filter((x) => x.id !== i.id))} className="text-gray-300 hover:text-red-500"><Trash2 size={13} /></button>}
            </div>
          ))}
          <button onClick={() => setItems((prev) => [...prev, { id: Date.now().toString(), description: 'بند إضافي جديد', hours: 2 }])} className="text-xs text-indigo-600 font-bold flex items-center gap-1">
            <Plus size={14} /> إضافة بند
          </button>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
            <Stat label="الساعات" value={`${cost.totalHours}`} />
            <Stat label="التكلفة" value={`${cost.totalCost.toLocaleString()} ج.م`} />
            <Stat label="أيام إضافية" value={`+${cost.extraDays}`} />
          </div>
        </div>

        <div>
          <div className="flex justify-end mb-1">
            <button onClick={copy} className="text-xs text-indigo-600 font-bold flex items-center gap-1"><Copy size={13} /> {copied ? 'تم النسخ ✓' : 'نسخ الوثيقة'}</button>
          </div>
          <pre className="w-full h-96 p-4 text-xs border rounded-lg bg-white whitespace-pre-wrap leading-relaxed">{document}</pre>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" />
    </div>
  );
}
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-md p-2 text-center">
      <div className="text-[9px] text-gray-500">{label}</div>
      <div className="font-mono font-bold text-xs">{value}</div>
    </div>
  );
}
