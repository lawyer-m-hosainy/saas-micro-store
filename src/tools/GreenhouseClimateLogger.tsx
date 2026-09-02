import React, { useMemo, useState } from 'react';
import { AlertTriangle, Plus, Thermometer, Trash2 } from 'lucide-react';

export interface ClimateReading {
  id: string;
  time: string;
  tempC: number;
  humidityPct: number;
}

export interface SafeRange {
  minTempC: number;
  maxTempC: number;
  minHumidityPct: number;
  maxHumidityPct: number;
}

export interface ReadingAlert {
  readingId: string;
  message: string;
}

/** يفحص كل قراءة مقابل الحدود الآمنة المُدخلة، ويولّد تنبيه صريح لكل قراءة خارج النطاق (صقيع، موجة حر، رطوبة زائدة أو ناقصة) */
export function checkClimateAlerts(readings: ClimateReading[], range: SafeRange): ReadingAlert[] {
  const alerts: ReadingAlert[] = [];
  readings.forEach((r) => {
    if (r.tempC < range.minTempC) alerts.push({ readingId: r.id, message: `⚠ خطر صقيع عند ${r.time}: ${r.tempC}°م (أقل من الحد الآمن ${range.minTempC}°م)` });
    if (r.tempC > range.maxTempC) alerts.push({ readingId: r.id, message: `⚠ موجة حر عند ${r.time}: ${r.tempC}°م (أعلى من الحد الآمن ${range.maxTempC}°م)` });
    if (r.humidityPct < range.minHumidityPct) alerts.push({ readingId: r.id, message: `رطوبة منخفضة عند ${r.time}: ${r.humidityPct}%` });
    if (r.humidityPct > range.maxHumidityPct) alerts.push({ readingId: r.id, message: `رطوبة زائدة عند ${r.time}: ${r.humidityPct}% (خطر فطريات)` });
  });
  return alerts;
}

const seedReadings = (): ClimateReading[] => [
  { id: '1', time: '06:00', tempC: 8, humidityPct: 65 },
  { id: '2', time: '12:00', tempC: 34, humidityPct: 45 },
  { id: '3', time: '18:00', tempC: 22, humidityPct: 80 },
];

export function GreenhouseClimateLoggerDemo() {
  const [range, setRange] = useState<SafeRange>({ minTempC: 10, maxTempC: 32, minHumidityPct: 40, maxHumidityPct: 75 });
  const [readings, setReadings] = useState<ClimateReading[]>(seedReadings());

  const alerts = useMemo(() => checkClimateAlerts(readings, range), [readings, range]);
  const maxTemp = Math.max(...readings.map((r) => r.tempC), 1);

  const update = (id: string, field: keyof ClimateReading, value: string) => {
    setReadings((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: field === 'time' ? value : Number(value) || 0 } : r)));
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-6 text-indigo-900 flex items-center gap-2"><Thermometer size={20} /> سجل مراقبة مناخ البيوت المحمية (نسخة تعمل بالكامل)</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
        <RangeField label="أدنى حرارة آمنة" value={range.minTempC} onChange={(v) => setRange((p) => ({ ...p, minTempC: v }))} />
        <RangeField label="أقصى حرارة آمنة" value={range.maxTempC} onChange={(v) => setRange((p) => ({ ...p, maxTempC: v }))} />
        <RangeField label="أدنى رطوبة آمنة" value={range.minHumidityPct} onChange={(v) => setRange((p) => ({ ...p, minHumidityPct: v }))} />
        <RangeField label="أقصى رطوبة آمنة" value={range.maxHumidityPct} onChange={(v) => setRange((p) => ({ ...p, maxHumidityPct: v }))} />
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm mb-4">
        <h4 className="font-bold text-gray-700 text-xs mb-3">السجل التاريخي اليومي</h4>
        <div className="flex items-end gap-2 h-24 mb-3">
          {readings.map((r) => (
            <div key={r.id} className="flex-1 flex flex-col items-center justify-end h-full" title={`${r.time}: ${r.tempC}°م`}>
              <div className={`w-full rounded-t ${r.tempC < range.minTempC || r.tempC > range.maxTempC ? 'bg-red-400' : 'bg-indigo-400'}`} style={{ height: `${(r.tempC / maxTemp) * 100}%` }} />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {readings.map((r) => (
            <div key={r.id} className="flex items-center gap-2">
              <input type="time" value={r.time} onChange={(e) => update(r.id, 'time', e.target.value)} className="px-2 py-1 border rounded-md text-xs" dir="ltr" />
              <input type="number" value={r.tempC} onChange={(e) => update(r.id, 'tempC', e.target.value)} className="w-16 px-2 py-1 border rounded-md text-xs" dir="ltr" title="حرارة" />
              <input type="number" value={r.humidityPct} onChange={(e) => update(r.id, 'humidityPct', e.target.value)} className="w-16 px-2 py-1 border rounded-md text-xs" dir="ltr" title="رطوبة" />
              {readings.length > 1 && <button onClick={() => setReadings((prev) => prev.filter((x) => x.id !== r.id))} className="text-gray-300 hover:text-red-500"><Trash2 size={13} /></button>}
            </div>
          ))}
          <button onClick={() => setReadings((prev) => [...prev, { id: Date.now().toString(), time: '12:00', tempC: 25, humidityPct: 60 }])} className="text-xs text-indigo-600 font-bold flex items-center gap-1">
            <Plus size={14} /> إضافة قراءة
          </button>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="space-y-1.5">
          {alerts.map((a, i) => (
            <div key={i} className="flex items-center gap-2 text-xs font-bold bg-red-50 border border-red-200 text-red-700 p-2 rounded-lg">
              <AlertTriangle size={13} /> {a.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RangeField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="bg-white p-2 rounded-lg border border-gray-100">
      <label className="block text-[9px] text-gray-500 mb-0.5">{label}</label>
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} className="w-full px-1 py-1 border rounded-md text-xs" dir="ltr" />
    </div>
  );
}
