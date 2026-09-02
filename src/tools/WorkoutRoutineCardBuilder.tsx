import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dumbbell, Pause, Play, Plus, RotateCcw, Trash2 } from 'lucide-react';

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  restSec: number;
  lastWeightKg: number;
}

/** يحسب إجمالي عدد التكرارات الأسبوعية وأقصى وزن مستخدم عبر كل التمارين، لعرض ملخص حمل التدريب */
export function summarizeWorkout(exercises: Exercise[]) {
  const totalSets = exercises.reduce((s, e) => s + e.sets, 0);
  const totalReps = exercises.reduce((s, e) => s + e.sets * e.reps, 0);
  const maxWeight = exercises.reduce((m, e) => Math.max(m, e.lastWeightKg), 0);
  return { totalSets, totalReps, maxWeight };
}

const seedExercises = (): Exercise[] => [
  { id: '1', name: 'سكوات', sets: 4, reps: 10, restSec: 90, lastWeightKg: 60 },
  { id: '2', name: 'بنش برس', sets: 4, reps: 8, restSec: 120, lastWeightKg: 50 },
  { id: '3', name: 'ديدليفت', sets: 3, reps: 6, restSec: 150, lastWeightKg: 80 },
];

function useCountdown(initialSec: number) {
  const [secondsLeft, setSecondsLeft] = useState(initialSec);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running && secondsLeft > 0) {
      intervalRef.current = setInterval(() => setSecondsLeft((s) => Math.max(s - 1, 0)), 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, secondsLeft]);

  useEffect(() => { if (secondsLeft === 0) setRunning(false); }, [secondsLeft]);

  return {
    secondsLeft,
    running,
    start: () => setRunning(true),
    pause: () => setRunning(false),
    reset: (sec: number) => { setSecondsLeft(sec); setRunning(false); },
  };
}

export function WorkoutRoutineCardBuilderDemo() {
  const [exercises, setExercises] = useState<Exercise[]>(seedExercises());
  const [activeRest, setActiveRest] = useState(exercises[0].restSec);
  const timer = useCountdown(activeRest);
  const summary = useMemo(() => summarizeWorkout(exercises), [exercises]);

  const update = (id: string, field: keyof Exercise, value: string) => {
    setExercises((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: field === 'name' ? value : Number(value) || 0 } : e)));
  };

  const startRestFor = (sec: number) => {
    setActiveRest(sec);
    timer.reset(sec);
    timer.start();
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-6 text-indigo-900 flex items-center gap-2"><Dumbbell size={20} /> صانع بطاقات التمارين مع مؤقت الراحة (نسخة تعمل بالكامل)</h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-2">
          {exercises.map((e) => (
            <div key={e.id} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 items-center mb-2">
                <input value={e.name} onChange={(ev) => update(e.id, 'name', ev.target.value)} className="col-span-2 px-2 py-1.5 border rounded-md text-xs font-bold" />
                <Mini label="مجموعات" value={e.sets} onChange={(v) => update(e.id, 'sets', v)} />
                <Mini label="تكرارات" value={e.reps} onChange={(v) => update(e.id, 'reps', v)} />
                <Mini label="آخر وزن (كجم)" value={e.lastWeightKg} onChange={(v) => update(e.id, 'lastWeightKg', v)} />
              </div>
              <div className="flex items-center justify-between">
                <button onClick={() => startRestFor(e.restSec)} className="text-[11px] text-indigo-600 font-bold">⏱ راحة {e.restSec} ثانية</button>
                {exercises.length > 1 && <button onClick={() => setExercises((prev) => prev.filter((x) => x.id !== e.id))} className="text-gray-300 hover:text-red-500"><Trash2 size={13} /></button>}
              </div>
            </div>
          ))}
          <button onClick={() => setExercises((prev) => [...prev, { id: Date.now().toString(), name: 'تمرين جديد', sets: 3, reps: 10, restSec: 60, lastWeightKg: 0 }])} className="text-sm text-indigo-600 font-medium flex items-center gap-1">
            <Plus size={16} /> إضافة تمرين
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm text-center">
            <p className="text-xs font-bold text-gray-500 mb-2">مؤقت الراحة</p>
            <p className="text-4xl font-black font-mono text-indigo-700 mb-3">{Math.floor(timer.secondsLeft / 60)}:{String(timer.secondsLeft % 60).padStart(2, '0')}</p>
            <div className="flex justify-center gap-2">
              <button onClick={timer.running ? timer.pause : timer.start} className="bg-indigo-600 text-white p-2.5 rounded-full">{timer.running ? <Pause size={16} /> : <Play size={16} />}</button>
              <button onClick={() => timer.reset(activeRest)} className="bg-gray-100 text-gray-600 p-2.5 rounded-full"><RotateCcw size={16} /></button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <StatMini label="مجموعات" value={summary.totalSets} />
            <StatMini label="تكرارات" value={summary.totalReps} />
            <StatMini label="أقصى وزن" value={summary.maxWeight} unit="كجم" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Mini({ label, value, onChange }: { label: string; value: number; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[9px] text-gray-500 mb-0.5">{label}</label>
      <input type="number" value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-2 py-1.5 border rounded-md text-xs" dir="ltr" />
    </div>
  );
}

function StatMini({ label, value, unit }: { label: string; value: number; unit?: string }) {
  return (
    <div className="bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm text-center">
      <div className="font-mono font-black text-gray-900">{value}{unit ? ` ${unit}` : ''}</div>
      <div className="text-[9px] text-gray-500">{label}</div>
    </div>
  );
}
