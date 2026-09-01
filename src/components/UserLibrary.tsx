import React, { useState } from 'react';
import { Product } from '../types';
import { Play, Package, Clock, ShieldCheck, Download, FileCode2, Check, Sparkles, FileText, Award } from 'lucide-react';
import { downloadProductZip } from '../utils/zipGenerator';
import { LicenseCertificateModal } from './LicenseCertificateModal';

interface UserLibraryProps {
  purchasedProducts: Product[];
  onOpenTool: (product: Product) => void;
  userName?: string;
}

export function UserLibrary({ purchasedProducts, onOpenTool, userName = 'عميلنا العزيز' }: UserLibraryProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [certProduct, setCertProduct] = useState<Product | null>(null);

  const handleDownload = async (product: Product) => {
    setDownloadingId(product.id);
    try {
      await downloadProductZip(product);
    } catch (e) {
      console.error('Failed to download zip package:', e);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="py-12 bg-gray-50 min-h-[calc(100vh-64px)] animate-in fade-in duration-300" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ترحيب وملخص */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                مساحة العمل والتراخيص
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">مرحباً بك، {userName} 👋</h1>
            <p className="text-gray-500 text-sm">
              هنا تجد جميع أدوات المايكرو ساس التي قمت بشرائها مع شهادات التراخيص التجارية وإمكانية تشغيلها أو تنزيل حزم الكود المصدري الكاملة (.ZIP).
            </p>
          </div>
          <div className="flex gap-4">
            <div className="bg-indigo-50 px-5 py-3 rounded-2xl text-center min-w-[110px] border border-indigo-100">
              <div className="text-2xl font-black text-indigo-700">{purchasedProducts.length}</div>
              <div className="text-xs font-bold text-indigo-600 mt-0.5">أدوات مرخصة</div>
            </div>
            <div className="bg-emerald-50 px-5 py-3 rounded-2xl text-center min-w-[110px] border border-emerald-100">
              <div className="text-2xl font-black text-emerald-700">100%</div>
              <div className="text-xs font-bold text-emerald-600 mt-0.5">ملكية كاملة</div>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Package className="text-indigo-600" />
          مكتبة الأدوات والتطبيقات
        </h2>

        {purchasedProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-xs">
            <Package size={52} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-800 mb-2">مكتبتك فارغة حالياً</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              تصفح المتجر واختر الأداة المناسبة لمشروعك، واشترها لمرة واحدة فقط لتمتلك الكود الكامل ومدى الحياة.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {purchasedProducts.map(product => (
              <div key={product.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col justify-between">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
                      <Sparkles size={24} />
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <ShieldCheck size={14} />
                      ترخيص تجاري مدى الحياة
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                    {product.title}
                  </h3>
                  
                  <p className="text-xs text-gray-500 mb-4 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between gap-2 text-xs text-gray-500 font-medium bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-gray-400" />
                      <span>مرخص ومفعل</span>
                    </div>
                    <button
                      onClick={() => setCertProduct(product)}
                      className="text-indigo-700 hover:text-indigo-900 font-bold flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors text-[11px]"
                    >
                      <Award size={13} className="text-indigo-600" />
                      <span>شهادة الترخيص PDF</span>
                    </button>
                  </div>
                </div>
                
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row gap-2">
                  <button 
                    onClick={() => onOpenTool(product)}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 text-xs shadow-xs"
                  >
                    <Play size={14} />
                    تشغيل الأداة
                  </button>
                  <button 
                    onClick={() => handleDownload(product)}
                    disabled={downloadingId === product.id}
                    className="bg-white hover:bg-gray-100 text-gray-800 border border-gray-200 font-bold py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 text-xs shadow-xs disabled:opacity-50"
                    title="تحميل ملفات المشروع كاملة بصيغة ZIP"
                  >
                    <Download size={14} />
                    {downloadingId === product.id ? 'جاري التحضير...' : 'تحميل كود ZIP'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Commercial License Modal */}
      {certProduct && (
        <LicenseCertificateModal
          product={certProduct}
          buyerName={userName}
          onClose={() => setCertProduct(null)}
        />
      )}
    </div>
  );
}
