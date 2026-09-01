import React from 'react';
import { 
  Check, 
  X, 
  Clock, 
  Coins, 
  AlertTriangle, 
  ShieldCheck, 
  Zap, 
  Code2, 
  ArrowLeft,
  Sparkles,
  Scale
} from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

interface BuildVsBuySectionProps {
  onExploreStore?: () => void;
}

export function BuildVsBuySection({ onExploreStore }: BuildVsBuySectionProps) {
  const { currency } = useCurrency();
  const isEgp = currency === 'EGP';

  const comparisonRows = [
    {
      criteria: 'التكلفة الإجمالية المباشرة',
      scratch: isEgp ? '25,000 - 60,000 ج.م' : '$1,200 - $3,500',
      scratchSub: 'أجور مبرمجين ومصممين واختبارات',
      scratchBad: true,
      souq: isEgp ? '1,450 ج.م فقط' : '$29 فقط',
      souqSub: 'دفعة واحدة مدى الحياة بدون مصاريف خفية',
      souqGood: true
    },
    {
      criteria: 'مدة الاستلام والإطلاق',
      scratch: '6 إلى 12 أسبوعاً',
      scratchSub: 'مفاوضات، تأخيرات، واجتماعات مستمرة',
      scratchBad: true,
      souq: 'فوري (خلال 24 ساعة)',
      souqSub: 'تحميل مباشر لحزمة الكود والترخيص',
      souqGood: true
    },
    {
      criteria: 'استقرار الكود وخلوه من الأخطاء',
      scratch: 'مخاطر عالية وأخطاء برمجية',
      scratchSub: 'يتطلب شهوراً من الـ Debugging بعد التسليم',
      scratchBad: true,
      souq: 'كود نظيف مجرب وموثق 100%',
      souqSub: 'مبني بأحدث تقنيات React & Tailwind & Gemini',
      souqGood: true
    },
    {
      criteria: 'حقوق الملكية وتعديل الشعار (White-Label)',
      scratch: 'حسب بنود عقد المبرمج',
      scratchSub: 'قد يحتفظ المبرمج بحقوق أو يطلب رسوم إضافية',
      scratchBad: false,
      souq: 'ترخيص تجاري كامل وملكك للأبد',
      souqSub: 'إعادة بيع، تغيير الاسم، والربح لحسابك',
      souqGood: true
    },
    {
      criteria: 'خدمة التركيب والتشغيل على السيرفر',
      scratch: 'تكلفة إضافية باهظة',
      scratchSub: 'رسوم خادم وإعدادات معقدة للمبتدئين',
      scratchBad: true,
      souq: 'دليل تشغيل خطوة بخطوة + دعم تركيب',
      souqSub: 'إمكانية التركيب السريع على نطاقك بضغطة زر',
      souqGood: true
    }
  ];

  return (
    <section className="py-16 bg-slate-900 text-white relative overflow-hidden" dir="rtl" id="build-vs-buy">
      
      {/* Background glow visual accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3.5 py-1.5 rounded-full text-xs font-black mb-3">
            <Scale size={14} className="text-indigo-400" />
            <span>مقارنة الجدوى الاقتصادية (Build vs. Buy)</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            لماذا تضيع شهوراً وآلاف الجنيهات في البرمجة من الصفر؟
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-3 leading-relaxed">
            مقارنة واقعية بين توظيف مبرمج مستقل لتطوير الأداة، وبين شرائها جاهزة ومرخصة بالكامل من سوق ساس.
          </p>
        </div>

        {/* Comparison Table / Grid */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
          
          {/* Table Header */}
          <div className="grid grid-cols-12 bg-slate-950/60 p-4 sm:p-6 border-b border-slate-700/80 text-xs sm:text-sm font-black">
            <div className="col-span-4 sm:col-span-4 text-slate-300">
              معيار المقارنة
            </div>
            <div className="col-span-4 sm:col-span-4 text-rose-400 flex items-center gap-1.5">
              <X size={16} className="text-rose-500 flex-shrink-0" />
              <span>البرمجة من الصفر (Build)</span>
            </div>
            <div className="col-span-4 sm:col-span-4 text-emerald-400 flex items-center gap-1.5">
              <Check size={16} className="text-emerald-400 flex-shrink-0" />
              <span>الشراء من سوق ساس (Buy)</span>
            </div>
          </div>

          {/* Comparison Rows */}
          <div className="divide-y divide-slate-700/50">
            {comparisonRows.map((row, idx) => (
              <div key={idx} className="grid grid-cols-12 p-4 sm:p-5 items-center hover:bg-slate-700/30 transition-colors">
                
                {/* Criteria */}
                <div className="col-span-4 sm:col-span-4 pr-1">
                  <span className="font-bold text-xs sm:text-sm text-slate-100 block">{row.criteria}</span>
                </div>

                {/* Build from Scratch */}
                <div className="col-span-4 sm:col-span-4 pr-1">
                  <div className="text-xs sm:text-sm font-bold text-rose-300 flex items-center gap-1">
                    <span>{row.scratch}</span>
                  </div>
                  <span className="text-[10px] sm:text-xs text-slate-400 mt-0.5 block line-clamp-1">{row.scratchSub}</span>
                </div>

                {/* Souq SaaS */}
                <div className="col-span-4 sm:col-span-4 pr-1">
                  <div className="text-xs sm:text-sm font-black text-emerald-300 flex items-center gap-1">
                    <span>{row.souq}</span>
                  </div>
                  <span className="text-[10px] sm:text-xs text-emerald-400/80 mt-0.5 block line-clamp-1">{row.souqSub}</span>
                </div>

              </div>
            ))}
          </div>

          {/* Table Bottom Highlights & Savings banner */}
          <div className="p-6 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 flex-shrink-0">
                <Sparkles size={24} />
              </div>
              <div>
                <div className="text-sm sm:text-base font-black text-white">
                  المحصلة: وفر مالي يفوق 96% وتوفير 60+ يوماً من التطوير
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  ابدأ مشروعك البرمجي اليوم وابدأ ببيع الاشتراكات لعملائك غداً بدون أي مخاطرة تقنية.
                </p>
              </div>
            </div>

            {onExploreStore && (
              <button
                onClick={onExploreStore}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-6 py-3 rounded-2xl font-black text-xs sm:text-sm transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-emerald-900/30 flex-shrink-0"
              >
                <Zap size={16} className="fill-slate-950" />
                <span>اختر أداتك وابدأ فوراً</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
