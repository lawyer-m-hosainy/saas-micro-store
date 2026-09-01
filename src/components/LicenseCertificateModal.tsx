import React, { useState, useMemo } from 'react';
import { ShieldCheck, Printer, CheckCircle, QrCode, X } from 'lucide-react';
import { Product } from '../types';

interface LicenseCertificateModalProps {
  product: Product;
  buyerName?: string;
  orderNumber?: string;
  onClose: () => void;
}

export function LicenseCertificateModal({
  product,
  buyerName = 'العميل الموقر',
  orderNumber = `LIC-${Math.floor(100000 + Math.random() * 900000)}`,
  onClose
}: LicenseCertificateModalProps) {
  const licenseKey = useMemo(() => { const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; let key = 'MSS-'; for (let i = 0; i < 4; i++) { for (let j = 0; j < 4; j++) { key += chars.charAt(Math.floor(Math.random() * chars.length)); } if (i < 3) key += '-'; } return key; }, [product?.id]);
  const issueDate = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-10 shadow-2xl border-4 border-amber-600/20 relative my-8 text-gray-900 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Certificate Printable Area */}
        <div id="printable-certificate" className="border-8 border-double border-indigo-900/20 p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-indigo-50/30 via-white to-amber-50/20 text-center relative overflow-hidden">
          
          {/* Watermark Seal in Background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <ShieldCheck size={360} className="text-indigo-900" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <ShieldCheck size={32} className="text-indigo-700" />
            <span className="text-xs font-black uppercase tracking-wider text-indigo-900">
              شهادة الترخيص التجاري الرسمي ومدى الحياة
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-1">
            Commercial Software License
          </h2>
          <p className="text-xs text-gray-500 mb-6">
            ترخيص حقوق الاستخدام وإعادة البيع والتضمين التجاري (White-Label Rights)
          </p>

          <div className="w-24 h-1 bg-amber-500 mx-auto mb-6 rounded-full"></div>

          {/* Certificate Body */}
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed mb-6">
            تشهد منصة <strong className="text-indigo-900 font-bold">Micro SaaS Store</strong> بأن المشتري المذكور أدناه يمتلك ترخيصاً تجارياً رسمياً، دائماً وغير قابل للإلغاء لكامل الكود المصدري البرمجي للأداة:
          </p>

          {/* Product Box */}
          <div className="bg-indigo-900 text-white p-4 rounded-xl mb-6 shadow-md">
            <div className="text-xs text-indigo-300 font-medium mb-1">اسم الأداة البرمجية المرخصة</div>
            <div className="text-lg sm:text-xl font-black text-amber-300">{product.title}</div>
            <div className="text-[11px] text-gray-300 mt-1">معرف الأداة: {product.id}</div>
          </div>

          {/* License Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 text-right text-xs bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
            <div>
              <span className="text-gray-500 block text-[11px]">اسم المرخص له:</span>
              <strong className="text-gray-900 font-bold">{buyerName}</strong>
            </div>
            <div>
              <span className="text-gray-500 block text-[11px]">رقم المعاملة:</span>
              <strong className="text-gray-900 font-mono">{orderNumber}</strong>
            </div>
            <div>
              <span className="text-gray-500 block text-[11px]">تاريخ الإصدار:</span>
              <strong className="text-gray-900">{issueDate}</strong>
            </div>
            <div>
              <span className="text-gray-500 block text-[11px]">نوع الترخيص:</span>
              <strong className="text-emerald-700 font-bold">تجاري مدى الحياة (100% Royalty Free)</strong>
            </div>
          </div>

          {/* Rights Granted */}
          <div className="text-right text-[11px] text-gray-600 bg-emerald-50/60 p-3 rounded-lg border border-emerald-200 mb-6 space-y-1">
            <div className="font-bold text-emerald-900 mb-1 flex items-center gap-1">
              <CheckCircle size={13} className="text-emerald-600" />
              الحقوق الممنوحة بموجب هذا الترخيص:
            </div>
            <div>• يحق للمرخص له تشغيل وتعديل وتطوير الكود البرمجي دون قيود.</div>
            <div>• يحق للمرخص له إعادة بيع الخدمة لعملائه بالاسم والعلامة التجارية الخاصة به.</div>
            <div>• لا توجد أي حقوق ملكية أو عمولات مستقبلية مستحقة للمنصة.</div>
          </div>

          {/* License Key & Verification */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200">
            <div className="text-right">
              <div className="text-[10px] text-gray-500">رمز التفعيل والتحقق المشفر (License Key):</div>
              <div className="font-mono text-xs font-bold text-indigo-900 bg-indigo-50 px-2 py-1 rounded border border-indigo-200">
                {licenseKey}
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-indigo-950">
              <QrCode size={40} className="text-indigo-900" />
              <div className="text-[10px] text-right text-gray-500">
                <span>وثيقة إلكترونية معتمدة</span>
                <span className="block text-emerald-600 font-bold">Verified & Active</span>
              </div>
            </div>
          </div>

        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-indigo-900 hover:bg-indigo-950 text-white text-xs sm:text-sm font-bold py-2.5 px-5 rounded-xl shadow-md transition-all active:scale-95"
          >
            <Printer size={16} />
            <span>طباعة الشهادة / حفظ PDF</span>
          </button>
          <button
            onClick={onClose}
            className="text-xs sm:text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 py-2.5 px-4 rounded-xl transition-colors"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
}
