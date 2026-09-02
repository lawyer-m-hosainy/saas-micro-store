import React, { useMemo, useState } from 'react';
import { Activity, AlertTriangle, HeartPulse } from 'lucide-react';

export interface PulseResponse {
  id: string;
  energyScore: number; // 1-5
  stressScore: number; // 1-5 (5 = أعلى ضغط)
  weekLabel: string;
}

export interface PulseSummary {
  count: number;
  avgEnergy: number;
  avgStress: number;
  burnoutRiskPct: number; // نسبة الردود اللي طاقتها منخفضة (≤2) وضغطها عالي (≥4)
  status: 'healthy' | 'watch' | 'critical';
}

/** يجمّع الردود المجهولة الهوية ويحسب مؤشر خطر الإرهاق كنسبة الردود ذات طاقة منخفضة وضغط مرتفع معاً */
export function summarizePulse(responses: PulseResponse[]): PulseSummary {
  const count = responses.length;
  if (count === 0) return { count: 0, avgEnergy: 0, avgStress: 0, burnoutRiskPct: 0, status: 'healthy' };

  const avgEnergy = responses.reduce((s, r) => s + r.energyScore, 0) / count;
  const avgStress = responses.reduce((s, r) => s + r.stressScore, 0) / count;
  const atRisk = responses.filter((r) => r.energyScore <= 2 && r.stressScore >= 4).length;
  const burnoutRiskPct = (atRisk / count) * 100;

  const status: PulseSummary['status'] = burnoutRiskPct >= 30 ? 'critical' : burnoutRiskPct >= 10 ? 'watch' : 'healthy';

  return { count, avgEnergy, avgStress, burnoutRiskPct, status };
}

const seedResponses = (): PulseResponse[] => [
  { id: '1', energyScore: 4, stressScore: 2, weekLabel: 'الأسبوع 1' },
  { id: '2', energyScore: 2, stressScore: 4, weekLabel: 'الأسبوع 1' },
  { id: '3', energyScore: 3, stressScore: 3, weekLabel: 'الأسبوع 1' },
  { id: '4', energyScore: 1, stressScore: 5, weekLabel: 'الأسبوع 1' },
  { id: '5', energyScore: 4, stressScore: 2, weekLabel: 'الأسبوع 1' },
];

export function RemoteTeamBurnoutPulseDemo() {
  const [responses, setResponses] = useState<PulseResponse[]>(seedResponses());
  const [myEnergy, setMyEnergy] = useState(3);
  const [myStress, setMyStress] = useState(3);

  const summary = useMemo(() => summarizePulse(responses), [responses]);

  const submitResponse = () => {
    setResponses((prev) => [...prev, { id: Date.now().toString(), energyScore: myEnergy, stressScore: myStress, weekLabel: 'الأسبوع 1' }]);
  };

  const statusMeta: Record<PulseSummary['status'], { label: string; cls: string }> = {
    healthy: { label: 'الفريق بحالة جيدة', cls: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
    watch: { label: 'يحتاج متابعة', cls: 'bg-amber-50 border-amber-200 text-amber-700' },
    critical: { label: 'خطر إرهاق مرتفع', cls: 'bg-red-50 border-red-200 text-red-700' },
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-6 text-indigo-900 flex items-center gap-2"><HeartPulse size={20} /> مقياس نبض الرضا والإرهاق (نسخة تعمل بالكامل)</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <h4 className="font-bold text-gray-700 mb-4 text-sm">استبيان مجهول الهوية — إجابتك لا تُربط باسمك</h4>
          <div className="space-y-4">
            <ScaleField label="مستوى طاقتك هذا الأسبوع" value={myEnergy} onChange={setMyEnergy} lowLabel="منهك" highLabel="ممتلئ بالطاقة" />
            <ScaleField label="مستوى الضغط الذي تشعر به" value={myStress} onChange={setMyStress} lowLabel="مرتاح" highLabel="ضغط شديد" />
          </div>
          <button onClick={submitResponse} className="w-full mt-5 bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 text-sm">إرسال الإجابة</button>
        </div>

        <div className="space-y-4">
          <div className={`p-5 rounded-lg border flex items-center gap-3 ${statusMeta[summary.status].cls}`}>
            {summary.status === 'critical' ? <AlertTriangle size={20} /> : <Activity size={20} />}
            <div>
              <p className="font-black text-sm">{statusMeta[summary.status].label}</p>
              <p className="text-xs opacity-80">{summary.count} رد · {summary.burnoutRiskPct.toFixed(0)}% في خطر إرهاق</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Stat label="متوسط الطاقة" value={`${summary.avgEnergy.toFixed(1)} / 5`} />
            <Stat label="متوسط الضغط" value={`${summary.avgStress.toFixed(1)} / 5`} />
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
            <h4 className="font-bold text-gray-700 mb-3 text-xs">توزيع الطاقة بين أعضاء الفريق</h4>
            <div className="flex items-end gap-2 h-24">
              {responses.map((r) => (
                <div key={r.id} className="flex-1 flex flex-col items-center justify-end h-full">
                  <div className={`w-full rounded-t ${r.energyScore <= 2 ? 'bg-red-400' : r.energyScore === 3 ? 'bg-amber-400' : 'bg-emerald-400'}`} style={{ height: `${(r.energyScore / 5) * 100}%` }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScaleField({ label, value, onChange, lowLabel, highLabel }: { label: string; value: number; onChange: (v: number) => void; lowLabel: string; highLabel: string }) {
  return (
    <div>
      <label className="block text-xs text-gray-600 mb-2">{label}</label>
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => onChange(n)} className={`flex-1 py-2 rounded-md text-sm font-bold ${value === n ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}>{n}</button>
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-gray-400 mt-1"><span>{lowLabel}</span><span>{highLabel}</span></div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
      <div className="text-[10px] text-gray-500 mb-1">{label}</div>
      <div className="font-mono font-bold text-gray-900 text-sm">{value}</div>
    </div>
  );
}
