import React, { useState } from 'react';
import { PDFDocument, rgb, degrees } from 'pdf-lib';
import { Download, FileText } from 'lucide-react';

export function PdfWatermarkDemo() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPdfFile(e.target.files[0]);
      setErrorMsg('');
    }
  };

  const applyWatermark = async () => {
    if (!pdfFile || !watermarkText) return;
    setIsProcessing(true);
    setErrorMsg('');

    try {
      // قراءة الملف كـ ArrayBuffer
      const arrayBuffer = await pdfFile.arrayBuffer();
      // تحميل ملف الـ PDF
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      // إضافة العلامة المائية على كل صفحة
      for (const page of pages) {
        const { width, height } = page.getSize();
        try {
          page.drawText(watermarkText, {
            x: width / 4,
            y: height / 2,
            size: 50,
            color: rgb(0.95, 0.1, 0.1), // لون أحمر
            opacity: 0.3,
            rotate: degrees(45),
          });
        } catch (textErr) {
          setErrorMsg('عذراً، خاصية العلامة المائية تدعم النصوص الإنجليزية فقط حالياً. يرجى استخدام نص إنجليزي.');
          setIsProcessing(false);
          return;
        }
      }

      // حفظ الـ PDF الجديد
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      // تحميل الملف
      const link = document.createElement('a');
      link.href = url;
      link.download = `watermarked_${pdfFile.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Error applying watermark:', error);
      setErrorMsg('حدث خطأ أثناء معالجة الملف. يرجى التأكد من أنه ملف PDF صالح.');
    }

    setIsProcessing(false);
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
      <h3 className="text-xl font-bold mb-4 text-indigo-900">أداة العلامة المائية للـ PDF (تعمل بالكامل)</h3>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 max-w-2xl mx-auto">
        <div className="space-y-6">
          
          {/* رفع الملف */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">اختر ملف PDF</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
              <input 
                type="file" 
                accept="application/pdf" 
                onChange={handleFileChange}
                className="hidden" 
                id="pdf-upload"
              />
              <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center">
                <FileText className="text-indigo-400 mb-3" size={40} />
                <span className="text-sm font-medium text-indigo-600">اضغط لرفع الملف</span>
                <span className="text-xs text-gray-400 mt-1">{pdfFile ? pdfFile.name : 'لم يتم اختيار ملف'}</span>
              </label>
            </div>
          </div>

          {/* نص العلامة المائية */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">نص العلامة المائية</label>
            <input 
              type="text" 
              value={watermarkText} 
              onChange={e => setWatermarkText(e.target.value)} 
              className="w-full px-4 py-2 border rounded-md"
              placeholder="مثال: سري للغاية، مسودة، حقوق الطبع..."
            />
          </div>

          {/* زر التطبيق */}
          <button 
            onClick={applyWatermark}
            disabled={!pdfFile || !watermarkText || isProcessing}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 flex justify-center items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <span>جاري المعالجة...</span>
            ) : (
              <>
                <Download size={20} />
                <span>إضافة العلامة المائية وتحميل</span>
              </>
            )}
          </button>
          
        </div>
      </div>
    </div>
  );
}
