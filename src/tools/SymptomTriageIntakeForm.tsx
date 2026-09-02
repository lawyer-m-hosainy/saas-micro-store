import React, { useMemo, useState } from 'react';
import { AlertTriangle, ClipboardPlus, Printer } from 'lucide-react';

export interface TriageForm {
  patientName: string;
  age: number;
  symptoms: string;
  durationDays: number;
  painLevel: number; // 0-10
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string;
}

export interface TriageAlert {
  severity: 'high' | 'medium';
  message: string;
}

/** يبني قائمة تنبيهات صريحة للطبيب بناءً على حساسيات/أمراض مزمنة مُدخلة صراحة من المريض — استمارة تجميع بيانات، وليست أداة تشخيص */
export function buildTriageAlerts(form: TriageForm): TriageAlert[] {
  const alerts: TriageAlert[] = [];

  if (form.allergies.length > 0) {
    alerts.push({ severity: 'high', message: `⚠ حساسية من: ${form.allergies.join('، ')}` });
  }
  if (form.chronicConditions.length > 0) {
    alerts.push({ severity: 'high', message: `مرض مزمن: ${form.chronicConditions.join('، ')}` });
  }
  if (form.painLevel >= 8) {
    alerts.push({ severity: 'high', message: `مستوى ألم مرتفع جداً (${form.painLevel}/10) — يُفضّل الفحص العاجل` });
  } else if (form.painLevel >= 5) {
    alerts.push({ severity: 'medium', message: `مستوى ألم متوسط (${form.painLevel}/10)` });
  }
  if (form.durationDays >= 14) {
    alerts.push({ severity: 'medium', message: `الأعراض مستمرة منذ ${form.durationDays} يوم — قد تحتاج فحوصات إضافية` });
  }

  return alerts;
}

const ALLERGY_OPTIONS = ['بنسلين', 'أسبرين', 'مأكولات بحرية', 'مكسرات', 'لاتكس'];
const CHRONIC_OPTIONS = ['سكري', 'ضغط دم', 'قلب', 'ربو', 'كلى'];

export function SymptomTriageIntakeFormDemo() {
  const [form, setForm] = useState<TriageForm>({
    patientName: 'سلمى وجدي',
    age: 34,
    symptoms: 'صداع مستمر وحرارة خفيفة منذ يومين',
    durationDays: 2,
    painLevel: 6,
    allergies: ['بنسلين'],
    chronicConditions: [],
    currentMedications: 'باراسيتامول عند اللزوم',
  });

  const alerts = useMemo(() => buildTriageAlerts(form), [form]);

  const toggle = (list: 'allergies' | 'chronicConditions', value: string) => {
    setForm((prev) => ({
      ...prev,
      [list]: prev[list].includes(value) ? prev[list].filter((v) => v !== value) : [...prev[list], value],
    }));
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-2 text-indigo-900 flex items-center gap-2"><ClipboardPlus size={20} /> استمارة الفرز الطبي المسبق (نسخة تعمل بالكامل)</h3>
      <p className="text-xs text-gray-500 mb-5">تجميع بيانات منظّم وتنبيهات صريحة للطبيب — بدون أي تشخيص آلي.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="اسم المريض" value={form.patientName} onChange={(v) => setForm((p) => ({ ...p, patientName: v }))} />
            <Field label="العمر" value={String(form.age)} onChange={(v) => setForm((p) => ({ ...p, age: Number(v) || 0 }))} type="number" dir="ltr" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">وصف الأعراض</label>
            <textarea value={form.symptoms} onChange={(e) => setForm((p) => ({ ...p, symptoms: e.target.value }))} className="w-full px-3 py-2 border rounded-md text-sm h-16" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="مدة الأعراض (يوم)" value={String(form.durationDays)} onChange={(v) => setForm((p) => ({ ...p, durationDays: Number(v) || 0 }))} type="number" dir="ltr" />
            <div>
              <label className="block text-xs text-gray-600 mb-1">مستوى الألم (0-10)</label>
              <input type="range" min={0} max={10} value={form.painLevel} onChange={(e) => setForm((p) => ({ ...p, painLevel: Number(e.target.value) }))} className="w-full" />
              <p className="text-center text-xs font-bold text-indigo-600">{form.painLevel}</p>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1.5">الحساسيات</label>
            <div className="flex flex-wrap gap-1.5">
              {ALLERGY_OPTIONS.map((a) => (
                <button key={a} onClick={() => toggle('allergies', a)} className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${form.allergies.includes(a) ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-500 border-gray-200'}`}>{a}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1.5">الأمراض المزمنة</label>
            <div className="flex flex-wrap gap-1.5">
              {CHRONIC_OPTIONS.map((c) => (
                <button key={c} onClick={() => toggle('chronicConditions', c)} className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${form.chronicConditions.includes(c) ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-500 border-gray-200'}`}>{c}</button>
              ))}
            </div>
          </div>
          <Field label="الأدوية الحالية" value={form.currentMedications} onChange={(v) => setForm((p) => ({ ...p, currentMedications: v }))} />
        </div>

        <div className="space-y-3">
          <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-gray-700 text-sm">ملخص للطبيب</h4>
              <button onClick={() => window.print()} className="text-xs text-indigo-600 font-bold flex items-center gap-1"><Printer size={13} /> طباعة</button>
            </div>
            <dl className="text-xs space-y-1.5 text-gray-600">
              <Row label="المريض" value={`${form.patientName} — ${form.age} سنة`} />
              <Row label="الأعراض" value={form.symptoms} />
              <Row label="المدة" value={`${form.durationDays} يوم`} />
              <Row label="الأدوية الحالية" value={form.currentMedications || '—'} />
            </dl>
          </div>

          {alerts.length > 0 && (
            <div className="space-y-2">
              {alerts.map((a, i) => (
                <div key={i} className={`flex items-start gap-2 text-xs font-bold p-3 rounded-lg border ${a.severity === 'high' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" /> {a.message}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, dir, type }: { label: string; value: string; onChange: (v: string) => void; dir?: string; type?: string }) {
  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      <input type={type || 'text'} value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" dir={dir} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="font-bold text-gray-800 shrink-0">{label}:</dt>
      <dd>{value}</dd>
    </div>
  );
}
