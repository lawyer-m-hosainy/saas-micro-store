import React, { useEffect, useMemo, useState } from 'react';
import { ShieldCheck } from 'lucide-react';

export interface WatermarkPosition {
  topPct: number;
  leftPct: number;
}

/** يحرّك العلامة المائية عبر 9 مواضع ثابتة بالتناوب (Round-robin) حسب رقم الفترة الزمنية — يمنع أي محاولة قص/تمويه بمكان ثابت */
export function computeWatermarkPosition(tickIndex: number): WatermarkPosition {
  const grid: WatermarkPosition[] = [
    { topPct: 10, leftPct: 10 }, { topPct: 10, leftPct: 45 }, { topPct: 10, leftPct: 80 },
    { topPct: 45, leftPct: 10 }, { topPct: 45, leftPct: 45 }, { topPct: 45, leftPct: 80 },
    { topPct: 80, leftPct: 10 }, { topPct: 80, leftPct: 45 }, { topPct: 80, leftPct: 80 },
  ];
  return grid[((tickIndex % grid.length) + grid.length) % grid.length];
}

/** يبني نص العلامة المائية من بيانات المشاهد + طابع زمني، لضمان أن أي تسريب مصوّر يحمل هوية المشاهد ووقت الحدث */
export function buildWatermarkText(viewerEmail: string, viewerPhone: string, timestamp: Date): string {
  const time = timestamp.toISOString().replace('T', ' ').slice(0, 19);
  return `${viewerEmail} · ${viewerPhone} · ${time}`;
}

export function DynamicDrmVideoWatermarkDemo() {
  const [viewerEmail, setViewerEmail] = useState('student@example.com');
  const [viewerPhone, setViewerPhone] = useState('+20 111 234 5678');
  const [intervalSec, setIntervalSec] = useState(4);
  const [tick, setTick] = useState(0);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => {
      setTick((t) => t + 1);
      setNow(new Date());
    }, Math.max(intervalSec, 1) * 1000);
    return () => clearInterval(id);
  }, [intervalSec]);

  const pos = useMemo(() => computeWatermarkPosition(tick), [tick]);
  const text = useMemo(() => buildWatermarkText(viewerEmail, viewerPhone, now), [viewerEmail, viewerPhone, now]);

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-2 text-indigo-900 flex items-center gap-2"><ShieldCheck size={20} /> حامي الفيديوهات بالعلامة المائية المتحركة (نسخة تعمل بالكامل)</h3>
      <p className="text-xs text-gray-500 mb-5">علامة نصية حقيقية تتحرك بين 9 مواضع تلقائيًا — أي تسجيل شاشة يحمل هوية المشاهد ووقت الحدث.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm space-y-3">
          <Field label="بريد المشاهد" value={viewerEmail} onChange={setViewerEmail} dir="ltr" />
          <Field label="هاتف المشاهد" value={viewerPhone} onChange={setViewerPhone} dir="ltr" />
          <div>
            <label className="block text-xs text-gray-600 mb-1">فترة تغيير الموضع (ثانية)</label>
            <input type="number" min={1} value={intervalSec} onChange={(e) => setIntervalSec(Number(e.target.value) || 1)} className="w-full px-3 py-2 border rounded-md text-sm" dir="ltr" />
          </div>
          <p className="text-[11px] text-gray-400">تغيّرت الموضع {tick} مرة حتى الآن.</p>
        </div>

        <div className="lg:col-span-2 relative rounded-lg overflow-hidden bg-gray-900 aspect-video flex items-center justify-center">
          <div className="text-gray-500 text-sm">▶ محاكاة مشغل الفيديو</div>
          <div
            className="absolute text-white text-[11px] font-mono bg-black/0 px-2 py-1 pointer-events-none transition-all duration-1000 ease-in-out select-none"
            style={{ top: `${pos.topPct}%`, left: `${pos.leftPct}%`, opacity: 0.55, textShadow: '0 0 4px rgba(0,0,0,.8)' }}
          >
            {text}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, dir }: { label: string; value: string; onChange: (v: string) => void; dir?: string }) {
  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" dir={dir} />
    </div>
  );
}
