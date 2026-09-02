import React, { useMemo, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { CarFront, Download } from 'lucide-react';

export interface InspectionCategory {
  id: string;
  name: string;
  score: number; // 0-10
  weight: number; // أهمية نسبية
}

/** يحسب نسبة التقييم المئوية الإجمالية كمتوسط موزون لكل بند فحص حسب أهميته النسبية */
export function computeOverallScore(categories: InspectionCategory[]): number {
  const totalWeight = categories.reduce((s, c) => s + c.weight, 0);
  if (totalWeight === 0) return 0;
  const weightedSum = categories.reduce((s, c) => s + c.score * c.weight, 0);
  return (weightedSum / (totalWeight * 10)) * 100;
}

export function scoreVerdict(pct: number): string {
  if (pct >= 85) return 'ممتازة — حالة شبه جديدة';
  if (pct >= 70) return 'جيدة جداً — صيانة بسيطة متوقعة';
  if (pct >= 50) return 'مقبولة — تحتاج صيانة قبل الاستخدام';
  return 'ضعيفة — يُنصح بفحص متخصص إضافي';
}

const seedCategories = (): InspectionCategory[] => [
  { id: '1', name: 'الهيكل الخارجي والدهان', score: 8, weight: 2 },
  { id: '2', name: 'المحرك وناقل الحركة', score: 7, weight: 3 },
  { id: '3', name: 'الفرامل والإطارات', score: 6, weight: 2 },
  { id: '4', name: 'الكهرباء والإلكترونيات', score: 9, weight: 1 },
  { id: '5', name: 'الداخلية والمقصورة', score: 8, weight: 1 },
];

export function UsedCarInspectionReportGenDemo() {
  const [carModel, setCarModel] = useState('تويوتا كورولا 2019');
  const [inspectorName, setInspectorName] = useState('م. كريم فحص السيارات');
  const [categories, setCategories] = useState<InspectionCategory[]>(seedCategories());
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const overallScore = useMemo(() => computeOverallScore(categories), [categories]);
  const verdict = scoreVerdict(overallScore);

  const update = (id: string, value: string) => setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, score: Number(value) || 0 } : c)));

  const exportPdf = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(reportRef.current, { pixelRatio: 2 });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const width = pdf.internal.pageSize.getWidth();
      const height = (reportRef.current.offsetHeight * width) / reportRef.current.offsetWidth;
      pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
      pdf.save(`inspection-${carModel}.pdf`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-6 text-indigo-900 flex items-center gap-2"><CarFront size={20} /> مولّد تقارير فحص السيارات المستعملة (نسخة تعمل بالكامل)</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Field label="موديل السيارة" value={carModel} onChange={setCarModel} />
            <Field label="اسم الفاحص" value={inspectorName} onChange={setInspectorName} />
          </div>
          {categories.map((c) => (
            <div key={c.id}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-bold text-gray-700">{c.name}</span>
                <span className="font-mono text-indigo-600">{c.score}/10</span>
              </div>
              <input type="range" min={0} max={10} value={c.score} onChange={(e) => update(c.id, e.target.value)} className="w-full" />
            </div>
          ))}
          <button onClick={exportPdf} disabled={isExporting} className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-2 text-sm">
            <Download size={16} /> {isExporting ? 'جاري التصدير...' : 'تصدير تقرير PDF'}
          </button>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-center">
          <div ref={reportRef} className="bg-white rounded-xl p-6 w-full">
            <h4 className="font-black text-lg text-gray-900 mb-1">تقرير فحص: {carModel}</h4>
            <p className="text-xs text-gray-400 mb-4">بواسطة {inspectorName} — {new Date().toLocaleDateString('ar-EG')}</p>

            <div className="text-center bg-indigo-50 rounded-lg p-4 mb-4">
              <p className="text-4xl font-black text-indigo-700 font-mono">{overallScore.toFixed(0)}%</p>
              <p className="text-xs text-indigo-600 font-bold mt-1">{verdict}</p>
            </div>

            <div className="space-y-1.5">
              {categories.map((c) => (
                <div key={c.id} className="flex items-center gap-2 text-xs">
                  <span className="w-40 text-gray-600">{c.name}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className={`h-2 rounded-full ${c.score >= 7 ? 'bg-emerald-500' : c.score >= 5 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${c.score * 10}%` }} />
                  </div>
                  <span className="font-mono text-gray-400 w-8">{c.score}/10</span>
                </div>
              ))}
            </div>
          </div>
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
