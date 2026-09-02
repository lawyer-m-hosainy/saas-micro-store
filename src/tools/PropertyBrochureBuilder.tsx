import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { Bed, Download, MapPin, Ruler, Upload } from 'lucide-react';

export interface PropertyDetails {
  title: string;
  price: number;
  areaSqm: number;
  rooms: number;
  location: string;
  description: string;
  brokerName: string;
  brokerPhone: string;
}

export function PropertyBrochureBuilderDemo() {
  const [details, setDetails] = useState<PropertyDetails>({
    title: 'شقة فاخرة بإطلالة بحرية',
    price: 3500000,
    areaSqm: 165,
    rooms: 3,
    location: 'الساحل الشمالي، مارينا',
    description: 'شقة متشطبة بالكامل بتشطيب سوبر لوكس، إطلالة مباشرة على البحر، قريبة من جميع الخدمات.',
    brokerName: 'كريم الوسيط',
    brokerPhone: '01142099605',
  });
  const [photo, setPhoto] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const brochureRef = useRef<HTMLDivElement>(null);

  const set = <K extends keyof PropertyDetails>(key: K) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'number' ? Number(e.target.value) || 0 : e.target.value;
    setDetails((prev) => ({ ...prev, [key]: value as PropertyDetails[K] }));
  };

  const onPhotoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(URL.createObjectURL(file));
  };

  const exportPdf = async () => {
    if (!brochureRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(brochureRef.current, { pixelRatio: 2 });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const width = pdf.internal.pageSize.getWidth();
      const height = (brochureRef.current.offsetHeight * width) / brochureRef.current.offsetWidth;
      pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
      pdf.save(`brochure-${details.title || 'property'}.pdf`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-6 text-indigo-900">صانع البروشورات العقارية (نسخة تعمل بالكامل)</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 space-y-3">
          <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-4 text-xs text-gray-500 cursor-pointer hover:border-indigo-300">
            <Upload size={16} /> {photo ? 'استبدل صورة العقار' : 'ارفع صورة العقار'}
            <input type="file" accept="image/*" className="hidden" onChange={onPhotoSelected} />
          </label>
          <Field label="عنوان الإعلان" value={details.title} onChange={set('title')} />
          <div className="grid grid-cols-3 gap-2">
            <Field label="السعر (ج.م)" value={String(details.price)} onChange={set('price')} type="number" dir="ltr" />
            <Field label="المساحة (م²)" value={String(details.areaSqm)} onChange={set('areaSqm')} type="number" dir="ltr" />
            <Field label="الغرف" value={String(details.rooms)} onChange={set('rooms')} type="number" dir="ltr" />
          </div>
          <Field label="الموقع" value={details.location} onChange={set('location')} />
          <div>
            <label className="block text-xs text-gray-600 mb-1">الوصف التسويقي</label>
            <textarea value={details.description} onChange={set('description')} className="w-full px-3 py-2 border rounded-md text-sm h-20" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="اسم الوسيط" value={details.brokerName} onChange={set('brokerName')} />
            <Field label="رقم الهاتف" value={details.brokerPhone} onChange={set('brokerPhone')} dir="ltr" />
          </div>
          <button onClick={exportPdf} disabled={isExporting} className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-2 text-sm">
            <Download size={16} /> {isExporting ? 'جاري التصدير...' : 'تصدير PDF للمشاركة'}
          </button>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg flex justify-center overflow-auto">
          <div ref={brochureRef} className="bg-white w-full max-w-[380px] shrink-0 overflow-hidden rounded-xl shadow-sm">
            <div className="h-48 bg-gray-200 relative">
              {photo ? <img src={photo} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">صورة العقار</div>}
              <div className="absolute bottom-3 right-3 bg-indigo-600 text-white text-xs font-black px-3 py-1.5 rounded-full">
                {details.price.toLocaleString()} ج.م
              </div>
            </div>
            <div className="p-5">
              <h4 className="font-black text-gray-900 text-lg mb-2">{details.title}</h4>
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                <span className="flex items-center gap-1"><MapPin size={13} /> {details.location}</span>
                <span className="flex items-center gap-1"><Ruler size={13} /> {details.areaSqm} م²</span>
                <span className="flex items-center gap-1"><Bed size={13} /> {details.rooms} غرف</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">{details.description}</p>
              <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800">{details.brokerName}</span>
                <span className="text-xs text-indigo-600 font-mono" dir="ltr">{details.brokerPhone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, dir, type }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; dir?: string; type?: string }) {
  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      <input type={type || 'text'} value={value} onChange={onChange} className="w-full px-3 py-2 border rounded-md text-sm" dir={dir} />
    </div>
  );
}
