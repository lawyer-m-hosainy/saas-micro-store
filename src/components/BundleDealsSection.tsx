import React, { useState } from 'react';
import { 
  Package, 
  Sparkles, 
  CheckCircle2, 
  ShoppingCart, 
  ArrowLeft, 
  Percent, 
  ShieldCheck,
  Zap,
  Gift
} from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { Product } from '../types';

export interface Bundle {
  id: string;
  title: string;
  badge: string;
  description: string;
  productIds: string[];
  productTitles: string[];
  originalPriceUsd: number;
  bundlePriceUsd: number;
  discountPercentage: number;
  icon: string;
  gradient: string;
}

export const saasBundles: Bundle[] = [
  {
    id: 'bundle-ecommerce-pro',
    title: 'حزمة التاجر الرقمي الشاملة (E-Commerce Mega Pack)',
    badge: 'الأكثر مبيعاً 🔥',
    description: 'كل ما تحتاجه لالتقاط الطلبات من التعليقات والرسائل، وتحويل الزوار لعملاء عبر بطاقات الشكر وقوائم QR التفاعلية.',
    productIds: ['qr-menu-maker', 'social-comment-order-bot', 'unboxing-review-card-maker'],
    productTitles: [
      'مُلتقط أوردرات الكومنتات والرسائل الذكي',
      'صانع بطاقات الشكر وطلب تقييمات خرائط جوجل',
      'صانع منيو الباركود الرقمي التفاعلي (QR Menu)'
    ],
    originalPriceUsd: 89,
    bundlePriceUsd: 37,
    discountPercentage: 58,
    icon: 'ShoppingBag',
    gradient: 'from-indigo-600 via-indigo-700 to-purple-800'
  },
  {
    id: 'bundle-legal-finance',
    title: 'حزمة الشركات والمكاتب القانونية والمالية (Compliance & Legal Suite)',
    badge: 'وفر 65% 💼',
    description: 'ترسانة متكاملة لتوليد العقود بالذكاء الاصطناعي، مطابقة الفواتير الإلكترونية، وحماية المستندات والعلامات المائية.',
    productIds: ['ai-legal-form', 'eta-einvoice-json-validator', 'instapay-bank-reconciler', 'pdf-chat', 'pdf-watermark'],
    productTitles: [
      'المُساعد القانوني الذكي وصانع العقود',
      'مُهيئ وفاحص الفواتير الإلكترونية (ETA Validator)',
      'مُطابق إيصالات الدفع والمحافظ (إنستاباي / كاش)',
      'مُلخص ومحلل المستندات (Chat with PDF)',
      'حامي ملفات PDF وإضافة الختم المائي'
    ],
    originalPriceUsd: 221,
    bundlePriceUsd: 89,
    discountPercentage: 60,
    icon: 'Scale',
    gradient: 'from-emerald-700 via-teal-800 to-slate-900'
  },
  {
    id: 'bundle-marketing-content',
    title: 'حزمة وكالات التسويق وصناع المحتوى (Viral Growth Engine)',
    badge: 'نمو سريع 🚀',
    description: 'أدوات توليد المحتوى، تحويل الأفكار لكتب إلكترونية جاذبة للعملاء، وتفريغ الاجتماعات، واختبار جاذبية العناوين قبل النشر.',
    productIds: ['ai-content-gen', 'ai-lead-magnet-funnel', 'arabic-meeting-minutes-transcriber', 'viral-hook-headline-tester'],
    productTitles: [
      'مُوَلِّد خطط المحتوى التسويقي المتخصص',
      'صانع نماذج استقطاب العملاء والكتب الإلكترونية',
      'مُفرغ الاجتماعات والمحاضر باللهجة العامية',
      'مُختبر العناوين الجاذبة (Viral Hooks)'
    ],
    originalPriceUsd: 154,
    bundlePriceUsd: 63,
    discountPercentage: 59,
    icon: 'Sparkles',
    gradient: 'from-amber-600 via-rose-700 to-indigo-900'
  }
];

interface BundleDealsSectionProps {
  onBuyBundle: (bundle: Bundle) => void;
}

export function BundleDealsSection({ onBuyBundle }: BundleDealsSectionProps) {
  const { formatPrice, currency } = useCurrency();

  return (
    <section className="py-16 bg-gradient-to-b from-gray-900 via-indigo-950 to-gray-950 text-white rounded-3xl my-12 border border-indigo-900/50 shadow-2xl relative overflow-hidden" dir="rtl">
      
      {/* Decorative Glows */}
      <div className="absolute -top-24 right-0 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 text-xs font-black px-4 py-1.5 rounded-full mb-3 border border-amber-400/30">
            <Gift size={14} className="text-amber-400" />
            <span>عروض الحزم الشاملة (وفر حتى 65%)</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
            امتلك منظومة برمجية متكاملة بسعر أداة واحدة
          </h2>
          <p className="text-gray-300 text-xs sm:text-sm mt-3 leading-relaxed">
            احصل على باقات متناسقة تضم أهم 5 برمجيات في مجالك مع تراخيص تجارية كاملة مدى الحياة وكود مصدري نظيف.
          </p>
        </div>

        {/* Bundles Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {saasBundles.map((bundle) => (
            <div 
              key={bundle.id}
              className="bg-gray-900/80 backdrop-blur-md rounded-3xl border border-gray-800 p-7 flex flex-col justify-between hover:border-indigo-500/60 transition-all duration-300 shadow-xl group relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 left-0 h-2 bg-gradient-to-l ${bundle.gradient}`}></div>

              <div>
                {/* Badge and Discount */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="bg-amber-400 text-gray-950 text-[11px] font-black px-3 py-1 rounded-full shadow-xs">
                    {bundle.badge}
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
                    <Percent size={12} />
                    خصم {bundle.discountPercentage}%
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 leading-snug">
                  {bundle.title}
                </h3>
                <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                  {bundle.description}
                </p>

                {/* Included Tools Checklist */}
                <div className="bg-gray-950/60 rounded-2xl p-4 border border-gray-800/80 mb-6 space-y-2.5">
                  <div className="text-[11px] font-bold text-indigo-300 flex items-center gap-1.5 mb-2">
                    <Zap size={13} className="text-amber-400" />
                    تتضمن 5 برمجيات كاملة:
                  </div>
                  {bundle.productTitles.map((title, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                      <CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="leading-tight">{title}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price & Action */}
              <div className="pt-4 border-t border-gray-800">
                <div className="flex items-baseline justify-between mb-4">
                  <div>
                    <div className="text-xs text-gray-400 line-through">
                      السعر الأصلي: {formatPrice(bundle.originalPriceUsd)}
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                      {formatPrice(bundle.bundlePriceUsd)}
                    </div>
                  </div>
                  <span className="text-[11px] text-gray-400 font-medium">
                    دفع لمرة واحدة للأبد
                  </span>
                </div>

                <button
                  onClick={() => onBuyBundle(bundle)}
                  className={`w-full bg-gradient-to-l ${bundle.gradient} hover:opacity-95 text-white font-black py-3.5 px-4 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95`}
                >
                  <ShoppingCart size={16} />
                  <span>امتلك الحزمة كاملة الآن ({formatPrice(bundle.bundlePriceUsd)})</span>
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
