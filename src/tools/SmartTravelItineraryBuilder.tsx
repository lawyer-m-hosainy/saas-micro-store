import React, { useMemo, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { Download, MapPin, Plane, Plus, Trash2 } from 'lucide-react';

export interface ItineraryStop {
  id: string;
  day: number;
  time: string;
  place: string;
}

/** يبني رابط خرائط جوجل مباشر (Deep-link) بدون أي API Key أو OAuth — يفتح فورًا على تطبيق الخرائط */
export function buildMapsLink(place: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`;
}

/** يجمع محطات الرحلة حسب رقم اليوم ويرتبها زمنياً داخل كل يوم */
export function groupByDay(stops: ItineraryStop[]): Map<number, ItineraryStop[]> {
  const map = new Map<number, ItineraryStop[]>();
  stops.forEach((s) => {
    const list = map.get(s.day) || [];
    list.push(s);
    map.set(s.day, list);
  });
  map.forEach((list) => list.sort((a, b) => a.time.localeCompare(b.time)));
  return new Map([...map.entries()].sort((a, b) => a[0] - b[0]));
}

const seedStops = (): ItineraryStop[] => [
  { id: '1', day: 1, time: '09:00', place: 'الأهرامات وأبو الهول، الجيزة' },
  { id: '2', day: 1, time: '13:00', place: 'المتحف المصري الكبير' },
  { id: '3', day: 2, time: '10:00', place: 'خان الخليلي' },
  { id: '4', day: 2, time: '16:00', place: 'كورنيش النيل' },
];

export function SmartTravelItineraryBuilderDemo() {
  const [tripName, setTripName] = useState('رحلة القاهرة الثقافية');
  const [companyName, setCompanyName] = useState('شركة رحلاتك للسياحة');
  const [stops, setStops] = useState<ItineraryStop[]>(seedStops());
  const [isExporting, setIsExporting] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const grouped = useMemo(() => groupByDay(stops), [stops]);

  const update = (id: string, field: keyof ItineraryStop, value: string) => {
    setStops((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: field === 'day' ? Number(value) || 1 : value } : s)));
  };

  const exportPdf = async () => {
    if (!pdfRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(pdfRef.current, { pixelRatio: 2 });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const width = pdf.internal.pageSize.getWidth();
      const height = (pdfRef.current.offsetHeight * width) / pdfRef.current.offsetWidth;
      pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
      pdf.save(`${tripName || 'itinerary'}.pdf`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-6 text-indigo-900 flex items-center gap-2"><Plane size={20} /> مخطط البرامج السياحية اليومية (نسخة تعمل بالكامل)</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Field label="اسم الرحلة" value={tripName} onChange={setTripName} />
            <Field label="اسم الشركة" value={companyName} onChange={setCompanyName} />
          </div>

          {stops.map((s) => (
            <div key={s.id} className="flex items-center gap-2">
              <input type="number" min={1} value={s.day} onChange={(e) => update(s.id, 'day', e.target.value)} className="w-12 px-2 py-1.5 border rounded-md text-xs" dir="ltr" title="يوم" />
              <input type="time" value={s.time} onChange={(e) => update(s.id, 'time', e.target.value)} className="w-24 px-2 py-1.5 border rounded-md text-xs" dir="ltr" />
              <input value={s.place} onChange={(e) => update(s.id, 'place', e.target.value)} className="flex-1 px-2 py-1.5 border rounded-md text-xs" />
              {stops.length > 1 && <button onClick={() => setStops((prev) => prev.filter((x) => x.id !== s.id))} className="text-gray-300 hover:text-red-500"><Trash2 size={13} /></button>}
            </div>
          ))}
          <button onClick={() => setStops((prev) => [...prev, { id: Date.now().toString(), day: 1, time: '12:00', place: 'محطة جديدة' }])} className="text-sm text-indigo-600 font-medium flex items-center gap-1">
            <Plus size={16} /> إضافة محطة
          </button>
          <button onClick={exportPdf} disabled={isExporting} className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-2 text-sm">
            <Download size={16} /> {isExporting ? 'جاري التصدير...' : 'تصدير PDF لمشاركته بالواتساب'}
          </button>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg overflow-auto">
          <div ref={pdfRef} className="bg-white rounded-xl p-6">
            <h4 className="font-black text-lg text-gray-900 mb-1">{tripName}</h4>
            <p className="text-xs text-gray-400 mb-4">{companyName}</p>
            {[...grouped.entries()].map(([day, dayStops]) => (
              <div key={day} className="mb-4">
                <p className="text-xs font-bold text-indigo-600 mb-2">اليوم {day}</p>
                <div className="space-y-2">
                  {dayStops.map((s) => (
                    <div key={s.id} className="flex items-center gap-2 text-xs">
                      <span className="font-mono text-gray-400 w-12">{s.time}</span>
                      <MapPin size={12} className="text-indigo-400 shrink-0" />
                      <a href={buildMapsLink(s.place)} target="_blank" rel="noreferrer" className="text-gray-700 hover:text-indigo-600">{s.place}</a>
                    </div>
                  ))}
                </div>
              </div>
            ))}
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
