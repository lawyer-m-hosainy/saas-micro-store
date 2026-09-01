import React, { useState } from 'react';
import { Calculator, TrendingUp, Users, Sparkles, ArrowLeft, Coins, Zap, BarChart3 } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

interface SaaSROICalculatorProps {
  onExploreStore?: () => void;
}

export function SaaSROICalculator({ onExploreStore }: SaaSROICalculatorProps) {
  const { currency, formatPrice } = useCurrency();

  // Price parameters based on currency
  const isEgp = currency === 'EGP';
  
  // Default values
  const defaultToolCost = isEgp ? 1450 : 29;
  const [monthlyPricePerClient, setMonthlyPricePerClient] = useState<number>(isEgp ? 350 : 15);

  React.useEffect(() => {
    setMonthlyPricePerClient(isEgp ? 350 : 15);
  }, [isEgp]);
  const [clientCount, setClientCount] = useState<number>(10);

  // Calculations
  const monthlyRevenue = monthlyPricePerClient * clientCount;
  const annualRevenue = monthlyRevenue * 12;
  const initialCost = defaultToolCost;
  const annualProfit = annualRevenue - initialCost;
  const roiPercentage = Math.round((annualProfit / initialCost) * 100);
  const clientsToBreakEven = Math.ceil(initialCost / (monthlyPricePerClient || 1));
  const daysToBreakEven = Math.max(1, Math.round((initialCost / (monthlyRevenue / 30 || 1))));

  return (
    <section className="py-16 bg-gradient-to-b from-white via-indigo-50/30 to-white border-y border-gray-100" dir="rtl" id="roi-calculator">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3.5 py-1.5 rounded-full text-xs font-black border border-indigo-100 mb-3 shadow-xs">
            <Calculator size={14} className="text-indigo-600" />
            <span>حاسبة الأرباح والعائد الاستثماري (SaaS ROI)</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-gray-950 tracking-tight leading-tight">
            كم ستحقق من أرباح شهرية عند إعادة بيع الأدوات لعملائك؟
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-3 leading-relaxed">
            اشترِ الكود المصدري مرة واحدة فقط، وأعد بيع الأداة كاشتراك شهري أو سنوي للشركات والمحلات والعيادات بعلامتك التجارية وحصّل أرباحاً دورية متكررة (MRR).
          </p>
        </div>

        {/* Calculator Grid */}
        <div className="bg-white rounded-3xl border border-gray-200/90 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x lg:divide-x-reverse divide-gray-100">
          
          {/* Controls Column (6 cols) */}
          <div className="lg:col-span-6 p-6 sm:p-8 space-y-8 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-gray-900 text-base sm:text-lg flex items-center gap-2">
                <BarChart3 size={18} className="text-indigo-600" />
                <span>حدد خطة التسعير لعملائك:</span>
              </h3>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-lg">
                استثمار لمرة واحدة: {isEgp ? '1,450 ج.م' : '$29'}
              </span>
            </div>

            {/* Slider 1: Monthly Subscription Price per client */}
            <div className="space-y-3 bg-white p-5 rounded-2xl border border-gray-200/70 shadow-xs">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Coins size={15} className="text-amber-500" />
                  <span>سعر الاشتراك الشهري للعميل الواحد:</span>
                </label>
                <div className="text-base font-black text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-100">
                  {monthlyPricePerClient.toLocaleString()} {isEgp ? 'ج.م / شهرياً' : '$ / mo'}
                </div>
              </div>
              <input
                type="range"
                min={isEgp ? 100 : 5}
                max={isEgp ? 2500 : 100}
                step={isEgp ? 50 : 5}
                value={monthlyPricePerClient}
                onChange={(e) => setMonthlyPricePerClient(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                <span>{isEgp ? '100 ج.م' : '$5'} (سعر اقتصادي)</span>
                <span>{isEgp ? '2,500 ج.م' : '$100'} (سعر شركات)</span>
              </div>
            </div>

            {/* Slider 2: Number of Clients */}
            <div className="space-y-3 bg-white p-5 rounded-2xl border border-gray-200/70 shadow-xs">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Users size={15} className="text-teal-600" />
                  <span>عدد العملاء أو المشتركين المتوقعين:</span>
                </label>
                <div className="text-base font-black text-teal-700 bg-teal-50 px-3 py-1 rounded-xl border border-teal-100">
                  {clientCount} {clientCount > 10 ? 'عميل' : 'عملاء'}
                </div>
              </div>
              <input
                type="range"
                min={1}
                max={60}
                step={1}
                value={clientCount}
                onChange={(e) => setClientCount(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                <span>عميل واحد</span>
                <span>30 عميل</span>
                <span>60 عميل (وكالة برمجية)</span>
              </div>
            </div>

            {/* Local market insight */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 leading-relaxed">
              <p className="font-bold flex items-center gap-1.5 mb-1">
                <Sparkles size={14} className="text-amber-600" />
                <span>نصيحة تسويقية من واقع السوق المحلي:</span>
              </p>
              في مصر والخليج، تبحث المطاعم والمكاتب والشركات عن أدوات ذكية توفر وقتهم ومصروفاتهم، واشتراك {monthlyPricePerClient} {isEgp ? 'ج.م' : '$'} يُعد مبلغاً زهيداً جداً لأي نشاط تجاري مقارنة بقيمة الخدمة.
            </div>
          </div>

          {/* Results Column (6 cols) */}
          <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between bg-white">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-6">
                <TrendingUp size={16} className="text-emerald-600" />
                <span>النتائج التقديرية للأرباح المتكررة:</span>
              </div>

              {/* Big Revenue Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                
                {/* Monthly Income */}
                <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 text-white rounded-2xl p-5 shadow-md">
                  <span className="text-indigo-200 text-xs font-bold block mb-1">الدخل الشهري المتكرر (MRR)</span>
                  <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                    {monthlyRevenue.toLocaleString()} <span className="text-sm font-sans text-indigo-300">{isEgp ? 'ج.م/شهر' : '$/mo'}</span>
                  </div>
                  <span className="text-[11px] text-indigo-300 mt-2 block">
                    صافي ربح شهري يدخل حسابك
                  </span>
                </div>

                {/* Annual Income */}
                <div className="bg-gradient-to-br from-emerald-700 to-teal-900 text-white rounded-2xl p-5 shadow-md">
                  <span className="text-emerald-200 text-xs font-bold block mb-1">الأرباح السنوية الإجمالية (ARR)</span>
                  <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                    {annualRevenue.toLocaleString()} <span className="text-sm font-sans text-emerald-300">{isEgp ? 'ج.م' : '$'}</span>
                  </div>
                  <span className="text-[11px] text-emerald-200 mt-2 block font-bold">
                    عائد استثماري: +{roiPercentage.toLocaleString()}%
                  </span>
                </div>

              </div>

              {/* Break-Even Highlight */}
              <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-4 space-y-2 mb-6">
                <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                  <span>سرعة استرداد رأس المال:</span>
                  <span className="text-emerald-700 font-black bg-emerald-100 px-2 py-0.5 rounded-md">
                    خلال {daysToBreakEven} {daysToBreakEven === 1 ? 'يوم فقط' : 'يوماً'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>عدد العملاء المطلوب لاسترداد التكلفة:</span>
                  <span className="font-bold text-gray-900">{clientsToBreakEven} {clientsToBreakEven === 1 ? 'عميل واحد فقط' : 'عملاء'}</span>
                </div>
                <p className="text-[11px] text-gray-500 pt-1 border-t border-gray-200">
                  💡 بمجرد اشتراك أول {clientsToBreakEven} عميل، تكون قد غطيت تكلفة شراء الكود بالكامل، وكل اشتراك بعد ذلك هو أرباح صافية 100%!
                </p>
              </div>
            </div>

            {/* CTA Button */}
            {onExploreStore && (
              <button
                onClick={onExploreStore}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-2xl font-black text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 group"
              >
                <Zap size={18} className="text-amber-300 fill-amber-300" />
                <span>تصفح الأدوات وابدأ مشروعك البرمجي الآن</span>
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              </button>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}
