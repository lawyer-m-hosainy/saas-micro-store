import React, { useState } from 'react';
import { Sparkles, ShieldCheck, Radio, ArrowLeft, CheckCircle2, Megaphone, ShoppingCart, Eye, HelpCircle, ChevronDown, User } from 'lucide-react';
import { Product } from '../types';
import { useCurrency } from '../context/CurrencyContext';
import { MidFeedAdBanner, SponsoredProductCard } from './AdBanner';
import { BundleDealsSection, Bundle } from './BundleDealsSection';
import { SaaSROICalculator } from './SaaSROICalculator';
import { BuildVsBuySection } from './BuildVsBuySection';
import * as Icons from 'lucide-react';

interface LandingPageProps {
  products: Product[];
  onEnterStore: () => void;
  onLogin: () => void;
  onOpenRadar: () => void;
  onBuyProduct: (product: Product) => void;
  onDemoProduct: (product: Product) => void;
  onWhitelabelProduct?: (product: Product) => void;
  onOpenAdvertise: () => void;
  isLoggedIn: boolean;
  userName?: string;
}

export function LandingPage({
  products,
  onEnterStore,
  onLogin,
  onOpenRadar,
  onBuyProduct,
  onDemoProduct,
  onWhitelabelProduct,
  onOpenAdvertise,
  isLoggedIn,
  userName
}: LandingPageProps) {
  const { currency, setCurrency, formatPrice } = useCurrency();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const featuredProducts = products.slice(0, 6);

  const faqs = [
    {
      q: 'كيف يعمل الشراء بالجنيه المصري وهل هناك أي اشتراك شهري؟',
      a: 'الأسعار محددة بالجنيه المصري (ج.م) بأسعار تشجيعية ومخفضة جداً تناسب السوق المصري. الدفع لمرة واحدة فقط مدى الحياة (Lifetime) ولا يتم سحب أي اشتراك شهري على الإطلاق.'
    },
    {
      q: 'هل يمكنني بيع هذه البرمجيات لعملائي في مصر والوطن العربي؟',
      a: 'نعم 100%! الترخيص يمنحك الملكية الكاملة للكود المصدري لتغيير الاسم والشعار، وبيع الأداة كخدمة شهرية أو سنوية لعملائك أو المتاجر والمطاعم وتحصيل الأرباح لحسابك الخاص.'
    },
    {
      q: 'ما هو رادار التسويق الجغرافي (5 كم)؟',
      a: 'هو نظام مدمج بالمتجر يستخرج الأنشطة التجارية والمحلات القريبة منك في محيط 5 كيلومتر، ويقوم الذكاء الاصطناعي بصياغة رسائل واتساب تسويقية مخصصة لعرض البرمجيات عليهم فوراً.'
    },
    {
      q: 'كيف يمكنني الإعلان في المنصة أو رعاية منتج؟',
      a: 'نوفر مساحات إعلانية عالية الظهور (الشريط العلوي، بطاقات المنتجات برعاية، والبانرات التفاعلية) لشركات الاستضافة وبوابات الدفع وحلول الأعمال للوصول إلى أكثر من 50,000 رائد أعمال شهرياً.'
    }
  ];

  return (
    <div className="bg-white min-h-screen font-sans text-gray-900" dir="rtl">
      
      {/* 🌟 1. Hero Section with 1-Click Login & Egyptian Pricing Showcase */}
      <section className="relative pt-10 pb-20 lg:pt-16 lg:pb-28 bg-gradient-to-b from-indigo-50/80 via-white to-gray-50/40 border-b border-gray-100 overflow-hidden">
        
        {/* Background visual accents */}
        <div className="absolute top-1/4 right-5 w-80 h-80 bg-indigo-300/30 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute bottom-10 left-5 w-96 h-96 bg-teal-200/25 rounded-full blur-3xl pointer-events-none -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Currency and Welcome Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-white/90 backdrop-blur-md p-3.5 sm:px-6 rounded-2xl border border-gray-200/80 shadow-xs">
            <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span>المنصة الأولى لأدوات المايكرو ساس الجاهزة في مصر والوطن العربي</span>
            </div>

            {/* Currency Switcher */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-bold">العملة:</span>
              <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs font-bold">
                <button
                  onClick={() => setCurrency('EGP')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    currency === 'EGP' 
                      ? 'bg-emerald-600 text-white shadow-xs' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  🇪🇬 الجنيه المصري (ج.م)
                </button>
                <button
                  onClick={() => setCurrency('USD')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    currency === 'USD' 
                      ? 'bg-indigo-600 text-white shadow-xs' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  💵 الدولار ($ USD)
                </button>
              </div>
            </div>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            
            {/* Tagline */}
            <div className="inline-flex items-center gap-2 bg-indigo-100/90 text-indigo-900 text-xs font-black px-4 py-1.5 rounded-full mb-6 border border-indigo-200">
              <Sparkles size={14} className="text-indigo-600 animate-pulse" />
              <span>امتلك كود أداتك البرمجية فوراً | ادفع مرة واحدة للأبد بدون أي اشتراك شهري</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-950 tracking-tight leading-[1.25] mb-6">
              متجر برمجيات الـ SaaS والذكاء الاصطناعي <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-indigo-600 via-indigo-700 to-emerald-600">
                بالتسعير المصري المناسب للجميع
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto mb-8">
              لا تدفع آلاف الجنيهات في اشتراكات البرامج الشهرية. تصفح أكثر من <strong className="text-gray-950 font-bold">500 أداة Micro SaaS</strong> جاهزة، جربها حياً، واحصل على الكود المصدري الكامل (.ZIP) لتبدأ مشروعك أو تعيد بيعها لعملائك.
            </p>

            {/* Quick Action Buttons (Login & Enter) */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto mb-14">
              
              <button
                onClick={onEnterStore}
                className="w-full sm:w-auto flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 py-4 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 text-base flex items-center justify-center gap-2 group"
              >
                <span>دخول وتصفح المتجر الكامل</span>
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              </button>

              {!isLoggedIn ? (
                <button
                  onClick={onLogin}
                  className="w-full sm:w-auto bg-gray-950 hover:bg-gray-800 text-white font-bold px-7 py-4 rounded-2xl transition-all shadow-xs text-sm flex items-center justify-center gap-2 border border-gray-800"
                >
                  <User size={18} />
                  <span>تسجيل دخول سريع بحساب جوجل</span>
                </button>
              ) : (
                <div className="w-full sm:w-auto bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-6 py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>أهلاً بك، {userName}</span>
                </div>
              )}
            </div>

            {/* Live Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-right">
              
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                <div className="text-2xl sm:text-3xl font-black text-indigo-600 mb-1">500+</div>
                <div className="text-xs font-bold text-gray-800">أداة SaaS مبرمجة</div>
                <div className="text-[11px] text-gray-500">جاهزة للتشغيل الفوري</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                <div className="text-2xl sm:text-3xl font-black text-emerald-600 mb-1">299 ج.م</div>
                <div className="text-xs font-bold text-gray-800">أسعار تبدأ من</div>
                <div className="text-[11px] text-gray-500">شراء مدى الحياة</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                <div className="text-2xl sm:text-3xl font-black text-teal-600 mb-1">100%</div>
                <div className="text-xs font-bold text-gray-800">كود مصدري كامل</div>
                <div className="text-[11px] text-gray-500">إعادة البيع والتعديل</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                <div className="text-2xl sm:text-3xl font-black text-amber-600 mb-1">5 كم</div>
                <div className="text-xs font-bold text-gray-800">رادار التسويق الآلي</div>
                <div className="text-[11px] text-gray-500">للمحلات والشركات</div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 🌟 2. Featured SaaS Products Showcase */}
      <section className="py-20 bg-gray-50/70 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full">
                  معاينة حية للمنتجات
                </span>
                <span className="text-xs text-gray-500 font-bold">
                  (التسعير الحالي: {currency === 'EGP' ? 'بالجنيه المصري 🇪🇬' : 'بالدولار 💵'})
                </span>
              </div>
              <h2 className="text-3xl font-black text-gray-950">
                نماذج من أشهر أدوات الـ Micro SaaS المتوفرة
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                يمكنك تجربة أي أداة حياً ببيانات تجريبية قبل الشراء، أو امتلاكها فوراً.
              </p>
            </div>

            <button
              onClick={onEnterStore}
              className="bg-gray-950 hover:bg-gray-800 text-white font-bold px-6 py-3 rounded-2xl text-xs sm:text-sm flex items-center gap-2 self-start md:self-auto transition-all shadow-xs"
            >
              <span>عرض جميع المنتجات الـ 500</span>
              <ArrowLeft size={16} />
            </button>
          </div>

          {/* Grid of Featured Products + 1 Sponsored Ad Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.slice(0, 5).map((product) => {
              const IconComp = (Icons as any)[product.icon] || Icons.Box;
              return (
                <div 
                  key={product.id}
                  className="bg-white rounded-2xl border border-gray-200 p-7 flex flex-col justify-between hover:shadow-md hover:border-indigo-200 transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl group-hover:scale-105 transition-transform">
                        <IconComp size={26} strokeWidth={1.5} />
                      </div>
                      <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">
                        مدى الحياة
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-950 mb-2 leading-tight">
                      {product.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-6 leading-relaxed line-clamp-2">
                      {product.description}
                    </p>

                    <ul className="space-y-2 mb-6 text-xs text-gray-700">
                      {product.features.slice(0, 3).map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2">
                          <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />
                          <span className="truncate">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-5 border-t border-gray-100">
                    <div className="flex items-baseline justify-between mb-4">
                      <div className="text-2xl font-black text-gray-950">
                        {formatPrice(product.price)}
                      </div>
                      <span className="text-[11px] text-gray-500 font-medium">
                        دفع مرة واحدة
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => onBuyProduct(product)}
                        className="flex-1 bg-gray-950 hover:bg-gray-800 text-white py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                      >
                        <ShoppingCart size={14} />
                        شراء
                      </button>
                      <button
                        onClick={() => onDemoProduct(product)}
                        className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Eye size={14} />
                        تجربة حية
                      </button>
                      {onWhitelabelProduct && (
                        <button
                          onClick={() => onWhitelabelProduct(product)}
                          className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 p-2.5 rounded-xl text-xs transition-colors"
                          title="معاينة وتخصيص الهوية التجارية"
                        >
                          <Icons.Palette size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Sponsored Card in grid for extra monetization */}
            <SponsoredProductCard onOpenAdvertise={onOpenAdvertise} />
          </div>

        </div>
      </section>

      {/* 🌟 2.5. Build vs Buy Comparison Section */}
      <BuildVsBuySection onExploreStore={onEnterStore} />

      {/* 🌟 2.8. SaaS Resale & MRR Profit Calculator */}
      <SaaSROICalculator onExploreStore={onEnterStore} />

      {/* 🌟 3. Mid-Page Monetization Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MidFeedAdBanner onOpenAdvertise={onOpenAdvertise} />
      </section>

      {/* 🌟 4. Why Micro SaaS & Egyptian Price Comparison */}
      <section className="py-20 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
              المقارنة الاقتصادية الذكية
            </span>
            <h2 className="text-3xl font-extrabold text-gray-950 mt-3 mb-3">
              لماذا سوق ساس هو الخيار الأفضل في مصر والعالم العربي؟
            </h2>
            <p className="text-gray-500 text-sm sm:text-base">
              وفر ميزانيتك الشهرية وتخلص من الاشتراكات بالدولار المتقلب.
            </p>
          </div>

          <div className="bg-gray-50 rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="grid grid-cols-3 bg-gray-100/80 p-4 border-b border-gray-200 text-xs sm:text-sm font-bold text-gray-700">
              <div>الميزة / المقارنة</div>
              <div className="text-emerald-700 text-center font-black">سوق ساس (شراء لمرة واحدة)</div>
              <div className="text-gray-400 text-center">الاشتراكات الشهرية التقليدية</div>
            </div>

            <div className="divide-y divide-gray-200/60 text-xs sm:text-sm">
              <div className="grid grid-cols-3 p-4 items-center bg-white">
                <div className="font-bold text-gray-900">التكلفة السنوية</div>
                <div className="text-center text-emerald-700 font-bold bg-emerald-50 py-1.5 rounded-xl">
                  {currency === 'EGP' ? '299 - 799 ج.م (ثابت للأبد)' : '$29 - $79 (مرة واحدة)'}
                </div>
                <div className="text-center text-red-500 font-medium">
                  {currency === 'EGP' ? '+15,000 ج.م سنوياً ($30/شهر)' : '+$360 سنوياً'}
                </div>
              </div>

              <div className="grid grid-cols-3 p-4 items-center">
                <div className="font-bold text-gray-900">ملكية الكود المصدري</div>
                <div className="text-center text-emerald-700 font-bold bg-emerald-50 py-1.5 rounded-xl">
                  تنزيل كامل بصيغة .ZIP
                </div>
                <div className="text-center text-red-500 font-medium">
                  لا يمكنك رؤية سطر كود واحد
                </div>
              </div>

              <div className="grid grid-cols-3 p-4 items-center bg-white">
                <div className="font-bold text-gray-900">إعادة البيع (White-Label)</div>
                <div className="text-center text-emerald-700 font-bold bg-emerald-50 py-1.5 rounded-xl">
                  مسموح بيعها لعملائك
                </div>
                <div className="text-center text-red-500 font-medium">
                  ممنوع تماماً
                </div>
              </div>

              <div className="grid grid-cols-3 p-4 items-center">
                <div className="font-bold text-gray-900">عملة الدفع</div>
                <div className="text-center text-emerald-700 font-bold bg-emerald-50 py-1.5 rounded-xl">
                  الجنيه المصري أو الدولار
                </div>
                <div className="text-center text-red-500 font-medium">
                  دولار فقط مع رسوم تدبير عملة
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 🌟 4.5. Bundle Deals Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BundleDealsSection 
          onBuyBundle={(bundle) => {
            // Find a representative product or trigger checkout
            const representativeProduct = products.find(p => p.id === bundle.productIds[0]) || products[0];
            if (!representativeProduct) return;
            onBuyProduct({
              ...representativeProduct,
              title: bundle.title,
              description: bundle.description,
              price: bundle.bundlePriceUsd,
            });
          }}
        />
      </div>

      {/* 🌟 5. B2B 5KM Radar Showcase */}
      <section className="py-20 bg-gradient-to-br from-gray-950 via-indigo-950 to-gray-950 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full">
                <Radio size={14} className="animate-pulse" />
                <span>فرصة بيع محلية لرواد الأعمال</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                رادار التسويق في محيط 5 كم: <br />
                <span className="text-emerald-400">بيع برمجياتك للمحلات القريبة منك فوراً</span>
              </h2>

              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                استخدم رادار الخرائط المدمج للبحث عن المطاعم، الكافيهات، العيادات، والشركات في نطاق 5 كم من موقعك. يقوم نموذج Gemini بصياغة رسائل واتساب تسويقية مخصصة باسم كل نشاط لعرض خدماتك البرمجية عليهم بضغطة زر.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-200">
                  <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                  <span>مسح محيط 5 كم واستخراج المحلات والأرقام تلقائياً</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-200">
                  <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                  <span>توليد رسائل واتساب ذكية مخصصة باسم المتجر</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-200">
                  <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                  <span>تصدير القوائم كملف Excel/CSV للحملات الموسعة</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onOpenRadar}
                  className="bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-black px-7 py-3.5 rounded-2xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 text-xs sm:text-sm"
                >
                  <Radio size={16} />
                  <span>فتح الرادار الجغرافي وبدء الحملة</span>
                </button>
              </div>
            </div>

            {/* Radar Demo Terminal */}
            <div className="lg:col-span-6 bg-gray-900/90 border border-gray-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
                  <span className="text-xs font-mono text-gray-400 mr-2">radar_auto_dispatcher.ai</span>
                </div>
                <span className="text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                  نطاق 5 كم نشط
                </span>
              </div>

              <div className="bg-gray-950 p-4 rounded-2xl border border-gray-800/80 space-y-3 text-xs">
                <div className="text-indigo-300 font-bold">📍 كافيه ومحمصة أرابيكا (1.4 كم):</div>
                <p className="text-gray-300 leading-relaxed font-sans">
                  "مرحباً فريق أرابيكا 👋 يسعدنا تقديم نظام ذكاء اصطناعي لإدارة الطلبات والرد الآلي على استفسارات عملائكم بالواتساب لزيادة مبيعاتكم..."
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-gray-800 text-[11px] text-gray-400">
                  <span>الأداة المقترحة: روبوت الطلبات والمبيعات الذكي</span>
                  <span className="text-emerald-400 font-bold">جاهز للإرسال ✓</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 🌟 6. FAQ Section */}
      <section className="py-20 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
              الأسئلة الشائعة
            </span>
            <h2 className="text-3xl font-extrabold text-gray-950 mt-3 mb-2">
              كل ما تود معرفته عن المتجر والشراء
            </h2>
            <p className="text-gray-500 text-sm">
              إجابات واضحة ومباشرة لكافة استفساراتكم.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="border border-gray-200 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-right flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
                >
                  <span className="font-bold text-gray-900 text-xs sm:text-sm flex items-center gap-2">
                    <HelpCircle size={17} className="text-indigo-600 flex-shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown 
                    size={17} 
                    className={`text-gray-400 transition-transform duration-200 ${openFaq === idx ? 'rotate-180 text-indigo-600' : ''}`} 
                  />
                </button>

                {openFaq === idx && (
                  <div className="p-5 pt-0 bg-white text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 animate-in fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 🌟 7. Bottom CTA */}
      <section className="py-16 bg-gradient-to-l from-indigo-700 via-indigo-800 to-indigo-950 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black">ابدأ الآن وامتلك أدواتك البرمجية بضغطة زر</h2>
          <p className="text-indigo-100 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            انضم إلى مئات رواد الأعمال والمطورين الذين يبنون مشاريعهم بأعلى كفاءة وأقل تكلفة.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onEnterStore}
              className="w-full sm:w-auto bg-white text-indigo-950 hover:bg-indigo-50 font-black px-8 py-4 rounded-2xl transition-all shadow-xl text-sm inline-flex items-center justify-center gap-2"
            >
              <span>دخول المتجر واستكشاف المنتجات</span>
              <ArrowLeft size={16} />
            </button>
            <button
              onClick={onOpenAdvertise}
              className="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 text-gray-950 font-bold px-6 py-4 rounded-2xl transition-all text-sm inline-flex items-center justify-center gap-2"
            >
              <Megaphone size={16} />
              <span>فرص الإعلان والرعاية</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
