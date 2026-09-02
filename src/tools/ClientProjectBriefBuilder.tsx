import React, { useMemo, useRef, useState } from 'react';
import { ClipboardCheck, Eraser } from 'lucide-react';

export interface ProjectBrief {
  clientName: string;
  projectGoal: string;
  targetAudience: string;
  deliverables: string;
  budgetRange: string;
  deadline: string;
  outOfScope: string;
}

/** يحسب نسبة اكتمال البريف بعدد الحقول المملوءة فعلياً — يساعد الفريلانسر يعرف لو محتاج يسأل العميل أسئلة إضافية قبل البدء */
export function computeBriefCompleteness(brief: ProjectBrief): number {
  const fields = Object.values(brief);
  const filled = fields.filter((v) => v.trim().length > 0).length;
  return Math.round((filled / fields.length) * 100);
}

export function ClientProjectBriefBuilderDemo() {
  const [brief, setBrief] = useState<ProjectBrief>({
    clientName: 'شركة نمو للتجارة',
    projectGoal: 'إعادة تصميم متجر إلكتروني لزيادة معدل التحويل',
    targetAudience: 'نساء 25-40 سنة، مهتمات بالموضة',
    deliverables: 'تصميم UI/UX كامل + 12 صفحة + دليل تصميم',
    budgetRange: '15,000 - 25,000 ج.م',
    deadline: '',
    outOfScope: '',
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const [signed, setSigned] = useState(false);

  const completeness = useMemo(() => computeBriefCompleteness(brief), [brief]);

  const set = (key: keyof ProjectBrief) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setBrief((prev) => ({ ...prev, [key]: e.target.value }));

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    const ctx = canvasRef.current?.getContext('2d');
    const rect = canvasRef.current?.getBoundingClientRect();
    if (ctx && rect) { ctx.beginPath(); ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top); }
  };
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const ctx = canvasRef.current?.getContext('2d');
    const rect = canvasRef.current?.getBoundingClientRect();
    if (ctx && rect) {
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.stroke();
      setSigned(true);
    }
  };
  const clearSignature = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx && canvasRef.current) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setSigned(false);
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-2 text-indigo-900 flex items-center gap-2"><ClipboardCheck size={20} /> منشئ نماذج استلام متطلبات المشروع (نسخة تعمل بالكامل)</h3>
      <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm mb-5 flex items-center justify-between">
        <span className="text-xs text-gray-500">نسبة اكتمال البريف</span>
        <span className="font-mono font-black text-indigo-700">{completeness}%</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 space-y-3">
          <Field label="اسم العميل" value={brief.clientName} onChange={set('clientName')} />
          <TextField label="الهدف من المشروع" value={brief.projectGoal} onChange={set('projectGoal')} />
          <TextField label="الجمهور المستهدف" value={brief.targetAudience} onChange={set('targetAudience')} />
          <TextField label="المخرجات المطلوبة (Deliverables)" value={brief.deliverables} onChange={set('deliverables')} />
          <Field label="نطاق الميزانية" value={brief.budgetRange} onChange={set('budgetRange')} />
          <Field label="الموعد النهائي" value={brief.deadline} onChange={set('deadline')} />
          <TextField label="خارج النطاق صراحةً (Out of Scope)" value={brief.outOfScope} onChange={set('outOfScope')} />
        </div>

        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
            <h4 className="font-bold text-gray-700 text-sm mb-2">ملخص النطاق المتفق عليه</h4>
            <dl className="text-xs space-y-1.5 text-gray-600">
              <Row label="العميل" value={brief.clientName || '—'} />
              <Row label="الهدف" value={brief.projectGoal || '—'} />
              <Row label="المخرجات" value={brief.deliverables || '—'} />
              <Row label="الميزانية" value={brief.budgetRange || '—'} />
            </dl>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-gray-700 text-xs">توقيع العميل على الموافقة على النطاق</h4>
              <button onClick={clearSignature} className="text-[11px] text-gray-400 flex items-center gap-1"><Eraser size={12} /> مسح</button>
            </div>
            <canvas ref={canvasRef} width={380} height={100} onMouseDown={startDraw} onMouseMove={draw} onMouseUp={() => (isDrawing.current = false)} onMouseLeave={() => (isDrawing.current = false)} className="w-full border border-dashed border-gray-300 rounded-md cursor-crosshair bg-gray-50" />
            <p className={`text-[11px] mt-1.5 font-bold ${signed ? 'text-emerald-600' : 'text-gray-400'}`}>{signed ? `✓ تم التوقيع — ${brief.clientName || 'العميل'}` : 'وقّع بالماوس داخل الإطار'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      <input value={value} onChange={onChange} className="w-full px-3 py-2 border rounded-md text-sm" />
    </div>
  );
}
function TextField({ label, value, onChange }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void }) {
  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      <textarea value={value} onChange={onChange} className="w-full px-3 py-2 border rounded-md text-sm h-14" />
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex gap-2"><dt className="font-bold text-gray-800 shrink-0">{label}:</dt><dd>{value}</dd></div>;
}
