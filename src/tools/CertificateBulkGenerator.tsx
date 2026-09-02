import React, { useMemo, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { Award, Download } from 'lucide-react';

/** توقيع تحقق بسيط (checksum) من اسم الدورة + اسم الطالب — يثبت أن الشهادة صادرة من نفس النظام دون اتصال بسيرفر */
export function buildVerificationCode(courseName: string, studentName: string): string {
  const combined = `${courseName}::${studentName}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) hash = (hash * 31 + combined.charCodeAt(i)) >>> 0;
  return `CERT-${hash.toString(36).toUpperCase().slice(0, 8)}`;
}

export function verifyCertificate(courseName: string, studentName: string, code: string): boolean {
  return buildVerificationCode(courseName, studentName) === code;
}

/** يفكك قائمة أسماء (سطر لكل اسم) لتوليد شهادة مستقلة لكل واحد */
export function parseNamesList(raw: string): string[] {
  return raw.split('\n').map((n) => n.trim()).filter(Boolean);
}

const sampleNames = `أحمد سامي\nهالة فتحي\nعمر خالد`;

export function CertificateBulkGeneratorDemo() {
  const [courseName, setCourseName] = useState('أساسيات التسويق الرقمي');
  const [issuerName, setIssuerName] = useState('أكاديمية النجاح');
  const [namesRaw, setNamesRaw] = useState(sampleNames);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  const names = useMemo(() => parseNamesList(namesRaw), [namesRaw]);
  const currentName = names[selectedIdx] || names[0] || '';
  const code = useMemo(() => buildVerificationCode(courseName, currentName), [courseName, currentName]);

  const exportAllPdf = async () => {
    if (!certRef.current) return;
    setIsExporting(true);
    try {
      const pdf = new jsPDF('l', 'mm', 'a4');
      for (let i = 0; i < names.length; i++) {
        setSelectedIdx(i);
        await new Promise((r) => setTimeout(r, 60));
        const dataUrl = await toPng(certRef.current, { pixelRatio: 2 });
        const width = pdf.internal.pageSize.getWidth();
        const height = (certRef.current.offsetHeight * width) / certRef.current.offsetWidth;
        if (i > 0) pdf.addPage();
        pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
      }
      pdf.save(`certificates-${courseName}.pdf`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-6 text-indigo-900 flex items-center gap-2"><Award size={20} /> صانع شهادات التقدير الدفعي (نسخة تعمل بالكامل)</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 space-y-3">
          <Field label="اسم الدورة" value={courseName} onChange={setCourseName} />
          <Field label="جهة الإصدار" value={issuerName} onChange={setIssuerName} />
          <div>
            <label className="block text-xs text-gray-600 mb-1">أسماء الطلاب (سطر لكل اسم)</label>
            <textarea value={namesRaw} onChange={(e) => setNamesRaw(e.target.value)} className="w-full h-32 p-2 border rounded-md text-sm font-mono" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {names.map((n, i) => (
              <button key={i} onClick={() => setSelectedIdx(i)} className={`text-[11px] px-2.5 py-1 rounded-full border ${selectedIdx === i ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-500 border-gray-200'}`}>{n}</button>
            ))}
          </div>
          <button onClick={exportAllPdf} disabled={isExporting || names.length === 0} className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-2 text-sm">
            <Download size={16} /> {isExporting ? `جاري التصدير (${selectedIdx + 1}/${names.length})...` : `تصدير حزمة PDF (${names.length} شهادة)`}
          </button>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-center">
          <div ref={certRef} className="bg-white w-full aspect-[1.41/1] border-[6px] border-indigo-100 rounded-lg p-8 flex flex-col items-center justify-center text-center relative">
            <div className="absolute top-4 left-4"><Award size={28} className="text-amber-500" /></div>
            <p className="text-[10px] tracking-widest text-gray-400 uppercase mb-2">شهادة إتمام</p>
            <p className="text-2xl font-black text-gray-900 mb-3">{currentName || 'اسم الطالب'}</p>
            <p className="text-xs text-gray-500 mb-1">أتم بنجاح دورة</p>
            <p className="text-lg font-bold text-indigo-700 mb-6">{courseName}</p>
            <div className="flex items-end justify-between w-full mt-auto">
              <div className="text-right">
                <p className="text-xs font-bold text-gray-700">{issuerName}</p>
                <p className="text-[9px] text-gray-400">{new Date().toLocaleDateString('ar-EG')}</p>
              </div>
              <div className="flex flex-col items-center">
                <QRCodeSVG value={code} size={48} level="M" />
                <p className="text-[8px] text-gray-400 mt-1 font-mono">{code}</p>
              </div>
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
