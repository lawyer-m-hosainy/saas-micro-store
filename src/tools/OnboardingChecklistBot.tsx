import React, { useMemo, useRef, useState } from 'react';
import { CheckCircle2, ClipboardList, Circle, Eraser } from 'lucide-react';

export interface OnboardingTask {
  id: string;
  day: number; // اليوم في الأسبوع الأول (1-5)
  title: string;
  done: boolean;
}

/** يحسب نسبة إنجاز التأهيل الكلية وحالة كل يوم من أيام الأسبوع الأول */
export function computeOnboardingProgress(tasks: OnboardingTask[]) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  const byDay = new Map<number, { total: number; done: number }>();
  tasks.forEach((t) => {
    const cur = byDay.get(t.day) || { total: 0, done: 0 };
    cur.total++;
    if (t.done) cur.done++;
    byDay.set(t.day, cur);
  });

  return { total, done, percent, byDay };
}

const seedTasks = (): OnboardingTask[] => [
  { id: '1', day: 1, title: 'توقيع عقد العمل والاطلاع على سياسات الشركة', done: true },
  { id: '2', day: 1, title: 'استلام بريد إلكتروني رسمي وحسابات الأنظمة', done: true },
  { id: '3', day: 2, title: 'جلسة تعريفية مع مدير القسم المباشر', done: false },
  { id: '4', day: 2, title: 'تركيب أدوات العمل (Slack, Git, ...)', done: false },
  { id: '5', day: 3, title: 'مراجعة أول مهمة تدريبية بسيطة', done: false },
  { id: '6', day: 5, title: 'اجتماع تقييم نهاية الأسبوع الأول', done: false },
];

export function OnboardingChecklistBotDemo() {
  const [employeeName, setEmployeeName] = useState('نور الدين حسن');
  const [tasks, setTasks] = useState<OnboardingTask[]>(seedTasks());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const [signed, setSigned] = useState(false);

  const progress = useMemo(() => computeOnboardingProgress(tasks), [tasks]);

  const toggleTask = (id: string) => setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    const ctx = canvasRef.current?.getContext('2d');
    const rect = canvasRef.current?.getBoundingClientRect();
    if (ctx && rect) {
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    }
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
  const stopDraw = () => { isDrawing.current = false; };
  const clearSignature = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx && canvasRef.current) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setSigned(false);
  };

  const days = [1, 2, 3, 4, 5];

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-2 text-indigo-900 flex items-center gap-2"><ClipboardList size={20} /> منسق تأهيل الموظفين الجدد (نسخة تعمل بالكامل)</h3>
      <input value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} className="text-sm font-bold text-gray-700 border-b border-transparent focus:border-indigo-300 outline-none mb-5" />

      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-gray-600">نسبة إنجاز الأسبوع الأول</span>
          <span className="text-sm font-black text-indigo-700">{progress.percent}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div className="bg-indigo-600 h-2.5 rounded-full transition-all" style={{ width: `${progress.percent}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-5">
        {days.map((day) => {
          const dayTasks = tasks.filter((t) => t.day === day);
          if (dayTasks.length === 0) return <div key={day} />;
          const dayStat = progress.byDay.get(day);
          const dayDone = dayStat && dayStat.done === dayStat.total;
          return (
            <div key={day} className={`bg-white p-3 rounded-lg border shadow-sm ${dayDone ? 'border-emerald-300' : 'border-gray-100'}`}>
              <p className="text-[11px] font-bold text-gray-500 mb-2">اليوم {day}</p>
              <div className="space-y-1.5">
                {dayTasks.map((t) => (
                  <button key={t.id} onClick={() => toggleTask(t.id)} className="flex items-start gap-1.5 text-right w-full">
                    {t.done ? <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" /> : <Circle size={14} className="text-gray-300 shrink-0 mt-0.5" />}
                    <span className={`text-[11px] ${t.done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{t.title}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-bold text-gray-700 text-xs">توقيع الموظف على استلام المهام</h4>
          <button onClick={clearSignature} className="text-[11px] text-gray-400 flex items-center gap-1"><Eraser size={12} /> مسح</button>
        </div>
        <canvas
          ref={canvasRef}
          width={400}
          height={100}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          className="w-full border border-dashed border-gray-300 rounded-md cursor-crosshair bg-gray-50"
        />
        <p className={`text-[11px] mt-1.5 font-bold ${signed ? 'text-emerald-600' : 'text-gray-400'}`}>{signed ? `✓ تم التوقيع — ${employeeName}` : 'وقّع بالماوس داخل الإطار'}</p>
      </div>
    </div>
  );
}
