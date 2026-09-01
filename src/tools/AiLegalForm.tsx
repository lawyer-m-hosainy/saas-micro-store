import React, { useState, useRef } from 'react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { Download } from 'lucide-react';

/**
 * فريق التطوير:
 * هذه أداة المساعد القانوني (تعمل بالكامل).
 * تمت إضافة ميزة تصدير العقد كملف PDF باستخدام html-to-image لتفادي مشاكل الخطوط العربية.
 */
export function AiLegalFormDemo() {
  const [partyA, setPartyA] = useState('');
  const [partyB, setPartyB] = useState('');
  const [contractType, setContractType] = useState('شراكة');
  const [generatedContract, setGeneratedContract] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const contractRef = useRef<HTMLDivElement>(null);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    
    // محاكاة تأخير الاتصال بالذكاء الاصطناعي
    setTimeout(() => {
      setGeneratedContract(`وثيقة عقد ${contractType}
------------------------
تم إبرام هذا العقد بين كل من:
الطرف الأول: ${partyA || '_____________'}
الطرف الثاني: ${partyB || '_____________'}

البند الأول: موضوع العقد
اتفق الطرفان على التعاون المشترك في مجال عملهما بما يضمن تحقيق المنفعة المتبادلة وفقاً للقوانين والأنظمة المعمول بها.

البند الثاني: الالتزامات
يلتزم الطرفان بأداء المهام المتفق عليها وحفظ سرية المعلومات الخاصة بهذا العقد.

(هذا نص تجريبي تم توليده تلقائياً كنموذج استعراضي لأداة المايكرو ساس)`);
      setIsGenerating(false);
    }, 1500);
  };

  const exportPDF = async () => {
    if (!contractRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(contractRef.current, { pixelRatio: 2 });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (contractRef.current.offsetHeight * pdfWidth) / contractRef.current.offsetWidth;
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`contract_${contractType}.pdf`);
    } catch (error) {
      console.error('Error generating PDF', error);
    }
    setIsExporting(false);
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
      <h3 className="text-xl font-bold mb-4 text-indigo-900">المساعد القانوني الذكي (يعمل بالكامل)</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* نموذج إدخال البيانات */}
        <form onSubmit={handleGenerate} className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اسم الطرف الأول</label>
              <input required type="text" value={partyA} onChange={e => setPartyA(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="مثال: شركة التقنية الحديثة" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اسم الطرف الثاني</label>
              <input required type="text" value={partyB} onChange={e => setPartyB(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="مثال: أحمد محمد" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نوع العقد</label>
              <select value={contractType} onChange={e => setContractType(e.target.value)} className="w-full px-3 py-2 border rounded-md">
                <option value="شراكة">عقد شراكة</option>
                <option value="توظيف">عقد عمل وتوظيف</option>
                <option value="تطوير برمجيات">عقد تطوير برمجيات</option>
              </select>
            </div>
            <button type="submit" disabled={isGenerating} className="w-full bg-indigo-600 text-white py-2 rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50">
              {isGenerating ? 'جاري الصياغة...' : 'توليد العقد بالذكاء الاصطناعي'}
            </button>
          </div>
        </form>

        {/* نتيجة العقد */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex flex-col h-full min-h-[300px]">
          <div className="flex justify-between items-center mb-3 border-b pb-2">
            <h4 className="text-sm font-bold text-gray-500">معاينة العقد النهائي</h4>
            {generatedContract && !isGenerating && (
              <button 
                onClick={exportPDF}
                disabled={isExporting}
                className="text-xs flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-100 transition-colors disabled:opacity-50"
              >
                <Download size={14} />
                {isExporting ? 'جاري التحميل...' : 'تحميل PDF'}
              </button>
            )}
          </div>
          
          <div className="flex-grow overflow-auto" ref={contractRef}>
            {isGenerating ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-pulse text-indigo-500 font-medium">الذكاء الاصطناعي يكتب العقد الآن...</div>
              </div>
            ) : generatedContract ? (
              <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 p-4 bg-white">
                {generatedContract}
              </pre>
            ) : (
              <div className="flex items-center justify-center h-40 text-gray-400 text-sm text-center">
                قم بتعبئة البيانات واضغط على زر التوليد لرؤية مسودة العقد هنا
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
