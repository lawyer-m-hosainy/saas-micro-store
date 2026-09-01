import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Palette, 
  Globe, 
  Upload, 
  Check, 
  Zap, 
  Smartphone, 
  Monitor, 
  Sliders, 
  ShieldCheck, 
  Eye,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { Product } from '../types';
import { useCurrency } from '../context/CurrencyContext';

interface WhitelabelPreviewModalProps {
  product: Product;
  isOpen?: boolean;
  onClose: () => void;
  onBuy?: (product: Product) => void;
  onOrderProduct?: (product: Product) => void;
}

const PRESET_COLORS = [
  { id: 'indigo', name: 'نيلي ملكي', hex: '#4f46e5', bgClass: 'bg-indigo-600', textClass: 'text-indigo-600', borderClass: 'border-indigo-600' },
  { id: 'emerald', name: 'أخضر زمردي', hex: '#059669', bgClass: 'bg-emerald-600', textClass: 'text-emerald-600', borderClass: 'border-emerald-600' },
  { id: 'sapphire', name: 'أزرق محيطي', hex: '#0284c7', bgClass: 'bg-sky-600', textClass: 'text-sky-600', borderClass: 'border-sky-600' },
  { id: 'amber', name: 'ذهبي / برتقالي', hex: '#d97706', bgClass: 'bg-amber-600', textClass: 'text-amber-600', borderClass: 'border-amber-600' },
  { id: 'rose', name: 'وردي عصري', hex: '#e11d48', bgClass: 'bg-rose-600', textClass: 'text-rose-600', borderClass: 'border-rose-600' },
  { id: 'slate', name: 'رمادي تيتانيوم', hex: '#1e293b', bgClass: 'bg-slate-900', textClass: 'text-slate-900', borderClass: 'border-slate-900' },
];

export function WhitelabelPreviewModal({ product, isOpen = true, onClose, onBuy, onOrderProduct }: WhitelabelPreviewModalProps) {
  const { formatPrice } = useCurrency();
  const [brandName, setBrandName] = useState('منصة حلولي للبرمجيات');
  const [tagline, setTagline] = useState('الحل البرمجي الذكي لنمو أعمالك');
  const [subdomain, setSubdomain] = useState('app.myagency.com');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [customLogoText, setCustomLogoText] = useState('حلولي');
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  const handleProceedBuy = () => {
    if (onOrderProduct) {
      onOrderProduct(product);
    } else if (onBuy) {
      onBuy(product);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-gray-950/80 backdrop-blur-sm overflow-y-auto" dir="rtl">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden border border-gray-100 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-gray-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <Sparkles size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black">مُخصص الهوية التجارية الحية (White-Label Simulator)</h2>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  معاينة فورية
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-0.5">
                شاهد كيف ستظهر أداة <strong className="text-white">"{product.title}"</strong> تحت اسم شركتك وهوية علامتك قبل الشراء!
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {/* Modal Body: Split between Controls & Live Frame */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x lg:divide-x-reverse divide-gray-100">
          
          {/* Left Column: Branding Controls (5 Cols) */}
          <div className="lg:col-span-5 p-5 sm:p-6 space-y-5 bg-gray-50/60 overflow-y-auto">
            <div className="flex items-center gap-2 text-xs font-black text-gray-800 uppercase tracking-wider">
              <Sliders size={15} className="text-indigo-600" />
              <span>إعدادات علامتك التجارية (White-Label)</span>
            </div>

            {/* Brand Name & Short Logo */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  اسم شركتك أو علامتك التجارية:
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="مثال: سمارت ساس لتقنية المعلومات"
                  className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    شعار نصي مختصر:
                  </label>
                  <input
                    type="text"
                    value={customLogoText}
                    onChange={(e) => setCustomLogoText(e.target.value)}
                    placeholder="مثال: TechPro"
                    className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    النطاق المخصص (Domain):
                  </label>
                  <input
                    type="text"
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value)}
                    placeholder="app.yourbrand.com"
                    className="w-full text-xs font-mono font-medium px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  شعار فرعي / وصف ترويجي (Tagline):
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="مثال: الأداة الرسمية لإدارة الفواتير والعمليات"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>
            </div>

            {/* Color Palette Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                <Palette size={14} className="text-indigo-600" />
                <span>اختر لون الهوية الرئيسي:</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedColor(c)}
                    className={`p-2 rounded-xl border text-right flex items-center gap-2 transition-all text-xs font-bold ${
                      selectedColor.id === c.id 
                        ? 'border-gray-900 bg-white shadow-sm ring-2 ring-gray-900/10' 
                        : 'border-gray-200 bg-white/70 hover:bg-white text-gray-600'
                    }`}
                  >
                    <span 
                      className="w-4 h-4 rounded-full flex-shrink-0 shadow-xs" 
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="text-[11px] truncate">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* White Label Guarantee Perks */}
            <div className="bg-white border border-emerald-200/80 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span>حقوق إعادة البيع وتغيير الهوية 100%:</span>
              </div>
              <ul className="space-y-1 text-[11px] text-gray-600 pr-4 list-disc marker:text-emerald-500">
                <li>كود مصدري نظيف ومفتوح بالكامل (Full Source Code).</li>
                <li>إزالة أي ذكر لاسم منصة "سوق ساس" تماماً.</li>
                <li>إمكانية رفع الكود على دومينك واستضافتك الخاصة.</li>
                <li>ربط بوابات الدفع الخاصة بك وتحصيل أرباحك بالكامل.</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Live Mockup Viewport (7 Cols) */}
          <div className="lg:col-span-7 p-4 sm:p-6 bg-slate-100 flex flex-col">
            
            {/* Viewport Control Bar */}
            <div className="bg-white px-4 py-2.5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between mb-4">
              {/* Fake Browser URL */}
              <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 border border-gray-200/80 px-3 py-1 rounded-xl max-w-[240px] sm:max-w-xs truncate font-mono">
                <Globe size={13} className="text-gray-400 flex-shrink-0" />
                <span className="truncate">https://{subdomain || 'app.yourbrand.com'}</span>
              </div>

              {/* View toggle */}
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setViewMode('desktop')}
                  className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                    viewMode === 'desktop' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-500 hover:text-gray-900'
                  }`}
                  title="عرض سطح المكتب"
                >
                  <Monitor size={14} />
                  <span className="hidden sm:inline">كمبيوتر</span>
                </button>
                <button
                  onClick={() => setViewMode('mobile')}
                  className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                    viewMode === 'mobile' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-500 hover:text-gray-900'
                  }`}
                  title="عرض الهاتف"
                >
                  <Smartphone size={14} />
                  <span className="hidden sm:inline">جوال</span>
                </button>
              </div>
            </div>

            {/* Mockup Canvas Container */}
            <div className="flex-1 flex items-center justify-center min-h-[360px]">
              <div 
                className={`bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden transition-all duration-300 flex flex-col ${
                  viewMode === 'desktop' ? 'w-full h-full' : 'w-[320px] max-w-full h-[460px] border-4 border-gray-800'
                }`}
              >
                {/* Mockup Dynamic App Header */}
                <div 
                  className="px-4 py-3 text-white flex items-center justify-between transition-colors shadow-sm"
                  style={{ backgroundColor: selectedColor.hex }}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center font-black text-xs border border-white/30">
                      {customLogoText.slice(0, 3) || 'SaaS'}
                    </div>
                    <div>
                      <h4 className="font-black text-xs sm:text-sm leading-tight text-white">{brandName || 'علامتك التجارية'}</h4>
                      <p className="text-[10px] text-white/80 line-clamp-1">{tagline || 'نظام إدارة العمليات'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-white/20 text-white font-bold px-2 py-0.5 rounded-md border border-white/20">
                      نسخة عملائك
                    </span>
                  </div>
                </div>

                {/* Mockup Internal App Content */}
                <div className="p-4 sm:p-5 flex-1 bg-gray-50/50 flex flex-col justify-between overflow-y-auto space-y-4">
                  
                  {/* Tool Title in White-Label */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h5 className="font-bold text-gray-900 text-xs sm:text-sm">{product.title}</h5>
                      <span 
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: selectedColor.hex }}
                      >
                        لوحة تحكم مرخصة
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Feature Checklist inside white-label */}
                  <div className="bg-white p-3.5 rounded-xl border border-gray-200/80 shadow-xs space-y-2">
                    <span className="text-[11px] font-bold text-gray-700 block">المزايا المتاحة لعملائك:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {product.features.slice(0, 4).map((f, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[10px] text-gray-600">
                          <CheckCircle2 size={12} style={{ color: selectedColor.hex }} className="flex-shrink-0" />
                          <span className="truncate">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Interactive Button Preview */}
                  <div className="pt-2">
                    <button
                      type="button"
                      className="w-full py-2.5 rounded-xl font-bold text-white text-xs shadow-md transition-transform active:scale-98 flex items-center justify-center gap-2"
                      style={{ backgroundColor: selectedColor.hex }}
                    >
                      <Zap size={14} />
                      <span>بدء الاستخدام وتوليد النتائج فوراً</span>
                    </button>
                    <p className="text-[10px] text-center text-gray-400 mt-1.5">
                      يتم حفظ كافة البيانات على خادمك الخاص ({subdomain})
                    </p>
                  </div>

                </div>

                {/* Mockup Footer */}
                <div className="px-3 py-1.5 bg-white border-t border-gray-100 text-[10px] text-gray-400 flex items-center justify-between">
                  <span>جميع الحقوق محفوظة © {brandName}</span>
                  <span className="font-mono">v2.4.0 Live</span>
                </div>

              </div>
            </div>

          </div>

        </div>

        {/* Modal Bottom Action Footer */}
        <div className="px-6 py-4 bg-white border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <div className="text-lg font-black text-gray-950">
                {formatPrice(product.price)}
              </div>
              <span className="text-[11px] text-emerald-600 font-bold">
                ترخيص تجاري مدى الحياة + الكود المصدري الكامل
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors text-xs flex-1 sm:flex-initial"
            >
              إلغاء المعاينة
            </button>
            <button
              onClick={() => {
                onClose();
                handleProceedBuy();
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 flex-1 sm:flex-initial"
            >
              <Zap size={16} className="text-amber-300 fill-amber-300" />
              <span>شراء الأداة وامتلاك الكود المصدري</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
