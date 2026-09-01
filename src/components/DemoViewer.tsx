import React from 'react';
import { Product } from '../types';
import { X, Sparkles, Zap, Palette } from 'lucide-react';
import { AiLegalFormDemo } from '../tools/AiLegalForm';
import { InvoiceGeneratorDemo } from '../tools/InvoiceGenerator';
import { WhatsAppLinkGenDemo } from '../tools/WhatsAppLinkGen';
import { PrivacyPolicyGenDemo } from '../tools/PrivacyPolicyGen';
import { QrMenuMakerDemo } from '../tools/QrMenuMaker';
import { ExpenseTrackerDemo } from '../tools/ExpenseTracker';
import { PdfWatermarkDemo } from '../tools/PdfWatermark';
import { LinkInBioDemo } from '../tools/LinkInBio';
import { NicheContentDemo } from '../tools/NicheContent';
import { PdfChatDemo } from '../tools/PdfChat';
import { SeoMetaGeneratorDemo } from '../tools/SeoMetaGenerator';
import ErrorBoundary from './ErrorBoundary';
import { GenericToolSimulator } from '../tools/GenericToolSimulator';
import { ReviewSection } from './ReviewSection';
import { useCurrency } from '../context/CurrencyContext';

interface DemoViewerProps {
  product: Product;
  onClose: () => void;
  onOpenWhitelabel?: (product: Product) => void;
  onBuy?: (product: Product) => void;
}

/**
 * فريق التطوير:
 * عنصر DemoViewer يقوم بعرض نافذة استعراض للبرمجية (Micro SaaS) قبل الشراء.
 * نقوم بفحص معرّف المنتج (product.id) وعرض المكون البرمجي المناسب له.
 */
export function DemoViewer({ product, onClose, onOpenWhitelabel, onBuy }: DemoViewerProps) {
  const { formatPrice } = useCurrency();
  
  // دالة لتحديد أي مكون (أداة) يجب عرضه بناءً على الـ ID
  const renderToolDemo = () => {
    switch (product.id) {
      case 'ai-legal-form':
        return <AiLegalFormDemo />;
      case 'invoice-gen':
        return <InvoiceGeneratorDemo />;
      case 'wa-link-gen':
        return <WhatsAppLinkGenDemo />;
      case 'privacy-policy-gen':
        return <PrivacyPolicyGenDemo />;
      case 'qr-menu-maker':
        return <QrMenuMakerDemo />;
      case 'expense-tracker':
        return <ExpenseTrackerDemo />;
      case 'pdf-watermark':
        return <PdfWatermarkDemo />;
      case 'link-in-bio':
        return <LinkInBioDemo />;
      case 'niche-content':
        return <NicheContentDemo />;
      case 'pdf-chat':
        return <PdfChatDemo />;
      case 'seo-meta-gen':
        return <SeoMetaGeneratorDemo />;
      default:
        // محاكي عام لجميع الأدوات الـ 490 التي تم توليدها
        return <GenericToolSimulator product={product} />;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-8 bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300" dir="rtl">
        {/* رأس النافذة */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-indigo-100">
                استعراض حي
              </span>
              <h2 className="text-lg sm:text-xl font-black text-gray-900">{product.title}</h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">{product.description}</p>
          </div>

          <div className="flex items-center gap-2">
            {onOpenWhitelabel && (
              <button
                onClick={() => onOpenWhitelabel(product)}
                className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="تخصيص الهوية والشعار"
              >
                <Palette size={14} className="text-amber-600" />
                <span className="hidden sm:inline">معاينة بهويتك التجارية</span>
              </button>
            )}

            <button 
              onClick={onClose} 
              aria-label="إغلاق"
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        {/* منطقة عرض الأداة (المحتوى الديناميكي) */}
        <div className="p-6 overflow-y-auto flex-grow bg-white">
          <ErrorBoundary>{renderToolDemo()}</ErrorBoundary>
          
          {/* قسم التقييمات */}
          <ReviewSection productId={product.id} />
        </div>
        
        {/* شريط سفلي تحفيزي */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 font-medium text-center sm:text-right">
            <Sparkles size={16} className="text-indigo-600 flex-shrink-0" />
            <span>هل أعجبتك الأداة؟ احصل على الكود المصدري وامتلكها للأبد تحت علامتك التجارية.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="text-lg font-black text-gray-950 font-mono">
              {formatPrice(product.price)}
            </div>

            {onBuy && (
              <button
                onClick={() => {
                  onClose();
                  onBuy(product);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Zap size={15} className="text-amber-300 fill-amber-300" />
                <span>شراء وترخيص الأداة</span>
              </button>
            )}
          </div>
        </div>

    </div>
  );
}
