import React, { useState, useRef, useMemo } from 'react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { Plus, Trash2, Download } from 'lucide-react';

interface InvoiceItem {
  id: string;
  description: string;
  price: number | string;
}

/**
 * فريق التطوير:
 * تم تحسين أداة منشئ الفواتير لتصبح (أداة حقيقية).
 * تدعم الآن إضافة سطور متعددة، الحساب التلقائي، وتصدير حقيقي لملف PDF.
 */
export function InvoiceGeneratorDemo() {
  const [clientName, setClientName] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([{ id: '1', description: '', price: 0 }]);
  const [isExporting, setIsExporting] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);
  
  const [invoiceNumber] = useState(() => Math.floor(Math.random() * 9000) + 1000);

  const addItem = () => setItems([...items, { id: Date.now().toString(), description: '', price: 0 }]);
  const removeItem = (id: string) => setItems(items.filter(item => item.id !== id));
  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const total = items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  const exportPDF = async () => {
    if (!invoiceRef.current) return;
    setIsExporting(true);
    try {
      // استخدم html-to-image بدلاً من html2canvas لدعم ألوان oklch الخاصة بـ Tailwind v4
      const dataUrl = await toPng(invoiceRef.current, { pixelRatio: 2 });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (invoiceRef.current.offsetHeight * pdfWidth) / invoiceRef.current.offsetWidth;
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`invoice_${clientName || 'new'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF', error);
    }
    setIsExporting(false);
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
      <h3 className="text-xl font-bold mb-4 text-indigo-900">أداة مُنشئ الفواتير (نسخة تعمل بالكامل)</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* لوحة التحكم */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex flex-col h-full">
          <h4 className="font-bold text-gray-700 mb-4">بيانات الفاتورة</h4>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm text-gray-600 mb-1">اسم العميل / الشركة</label>
              <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="مثال: شركة الإبداع" />
            </div>
            
            <div className="border-t border-gray-100 pt-4">
              <label className="block text-sm text-gray-600 mb-2 font-bold">الخدمات المقدمة</label>
              {items.map((item, index) => (
                <div key={item.id} className="flex gap-2 mb-2 items-center">
                  <input type="text" value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} className="flex-grow px-3 py-2 border rounded-md text-sm" placeholder="وصف الخدمة" />
                  <input type="number" value={item.price || ''} onChange={e => updateItem(item.id, 'price', e.target.value)} className="w-24 px-3 py-2 border rounded-md text-sm text-left" placeholder="0" dir="ltr" />
                  <button onClick={() => removeItem(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-md" disabled={items.length === 1}>
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              <button onClick={addItem} className="text-sm text-indigo-600 font-medium hover:text-indigo-800 flex items-center gap-1 mt-2">
                <Plus size={16} /> إضافة خدمة أخرى
              </button>
            </div>
          </div>
          
          <div className="mt-auto pt-4 border-t border-gray-100">
            <button 
              onClick={exportPDF} 
              disabled={isExporting}
              className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 flex justify-center items-center gap-2 transition-colors disabled:opacity-70"
            >
              <Download size={20} />
              <span>{isExporting ? 'جاري إنشاء الـ PDF...' : 'تحميل الفاتورة (PDF)'}</span>
            </button>
          </div>
        </div>

        {/* المعاينة الحية للفاتورة */}
        <div className="bg-gray-200 p-4 rounded-lg flex justify-center overflow-auto max-h-[600px]">
          <div 
            ref={invoiceRef} 
            className="bg-white w-full max-w-[400px] p-8 shadow-sm relative shrink-0"
            style={{ minHeight: '560px' }}
          >
            {/* تصميم رأس الفاتورة */}
            <div className="absolute top-0 left-0 right-0 h-3 bg-indigo-600"></div>
            
            <div className="flex justify-between items-start mb-10 mt-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">INVOICE</h1>
                <p className="text-sm text-gray-500">#{invoiceNumber}</p>
                <p className="text-xs text-gray-500 mt-1">{new Date().toLocaleDateString('en-US')}</p>
              </div>
              <div className="text-left text-sm">
                <div className="font-bold text-gray-800 text-lg">Your Company</div>
                <div className="text-gray-500 mt-1">contact@yourdomain.com</div>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Billed To</h4>
              <div className="font-semibold text-gray-800 text-lg">{clientName || 'Client Name'}</div>
            </div>

            <table className="w-full text-sm mb-8">
              <thead>
                <tr className="border-b-2 border-gray-800 text-gray-800">
                  <th className="py-2 text-right font-bold w-3/4">Description</th>
                  <th className="py-2 text-left font-bold w-1/4">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-3 text-gray-800 pr-2">{item.description || `Item ${index + 1}`}</td>
                    <td className="py-3 text-left font-medium text-gray-800" dir="ltr">${item.price || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between items-center border-t-2 border-gray-800 pt-4 mt-auto">
              <div className="font-bold text-gray-800 text-lg">Total:</div>
              <div className="text-2xl font-bold text-indigo-600" dir="ltr">${total}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
