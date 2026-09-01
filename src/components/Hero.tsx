import React, { useState } from 'react';
import { 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Code2, 
  PackageCheck, 
  Radio, 
  Download, 
  Layers, 
  ArrowLeft, 
  CheckCircle2, 
  DollarSign, 
  Rocket, 
  Cpu, 
  Globe, 
  Building2, 
  Terminal, 
  ChevronDown, 
  Play,
  TrendingUp,
  MessageCircle,
  HelpCircle,
  FileCode2,
  Check
} from 'lucide-react';
import { categories } from '../data';

interface HeroProps {
  onExploreClick?: () => void;
  onOpenRadar?: () => void;
}

export function Hero({ onExploreClick, onOpenRadar }: HeroProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const scrollToProducts = () => {
    if (onExploreClick) {
      onExploreClick();
    } else {
      document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const faqs = [
    {
      q: 'ما الذي أحصل عليه بالضبط عند شراء أي أداة؟',
      a: 'تحصل فوراً على رخصة تجارية مدى الحياة (Lifetime License) وحزمة كود مصدري كاملة (.ZIP) تتضمن واجهة المستخدم، محرك الذكاء الاصطناعي، ملفات التهيئة (package.json, .env.example, README)، وإمكانية تشغيل الأداة مباشرة من حسابك في المتجر.'
    },
    {
      q: 'هل يحق لي بيع الأداة لعملائي تحت علامتي التجارية (White-Label)؟',
      a: 'نعم 100%! الترخيص يمنحك كامل الحقوق لإعادة التسمية، التعديل على الكود، استضافة الأداة على نطاقك الخاص (Custom Domain)، وبيعها للشركات والمحلات كخدمة شهرية أو بيع مباشر وتحصيل الأرباح لحسابك الخاص.'
    },
    {
      q: 'هل أحتاج لخبرة برمجية لتشغيل واستخدام الأدوات؟',
      a: 'كلا! يمكنك تجربة وتشغيل أي أداة مباشرة من المتصفح عبر متجرنا في قسم "مكتبتي". وإذا كنت مبرمجاً أو ترغب في استضافتها محلياً، فالحزم مجهزة بالكامل لتعمل بأمر واحد: `npm run dev`.'
    },
    {
      q: 'كيف يعمل رادار التسويق الآلي للأنشطة المحلية (5 كم)؟',
      a: 'هو نظام مدمج في متجرنا يحدد موقعك ويمسح دائرة قطرها 5 كم لاستخراج المتاجر والشركات المحيطة، ثم يقوم نموذج Gemini 3.7 بتحليل كل نشاط وصياغة رسالة تسويقية مخصصة بالواتساب لتعرض عليهم خدماتك وبرمجياتك بضغطة زر.'
    }
  ];

  return (
    <div className="bg-white overflow-hidden" dir="rtl">
      
      {/* 🌟 1. Main Hero Banner */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 bg-gradient-to-b from-indigo-50/70 via-white to-gray-50/50 border-b border-gray-100">
        
        {/* Subtle decorative background blur shapes */}
        <div className="absolute top-1/4 right-10 w-72 h-72 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-teal-200/30 rounded-full blur-3xl pointer-events-none -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 bg-indigo-100/80 border border-indigo-200/60 text-indigo-900 text-xs font-bold px-4 py-1.5 rounded-full mb-6 shadow-xs animate-in fade-in slide-in-from-top-3">
              <Sparkles size={14} className="text-indigo-600 animate-pulse" />
              <span>المنصة الأولى لأدوات المايكرو ساس الجاهزة بالكامل | 500+ أداة برمجية</span>
            </div>

            {/* Display Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-950 tracking-tight leading-[1.2] mb-6">
              امتلك برمجياتك الخاصة <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-indigo-600 via-indigo-700 to-teal-600">
                وادفع لمرة واحدة فقط للأبد
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto mb-10">
              تصفح مكتبة ضخمة من تطبيقات <strong className="text-gray-900 font-bold">Micro SaaS</strong> المطورة بالذكاء الاصطناعي. جرب الأداة حياً، اطلع على الكود المصدري، واحصل على الملكية التجارية الكاملة بدون أي اشتراكات شهرية متكررة.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <button
                onClick={scrollToProducts}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 text-base group"
              >
                <span>استكشف المنتجات الـ 500</span>
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onOpenRadar}
                className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 font-bold px-7 py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xs text-base hover:border-emerald-300"
              >
                <Radio size={18} className="text-emerald-600 animate-pulse" />
                <span>رادار التسويق للمحلات (5 كم)</span>
              </button>
            </div>

            {/* Live Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              
              <div className="bg-white/80 backdrop-blur-xs p-5 rounded-2xl border border-gray-200/80 shadow-xs text-center">
                <div className="text-3xl font-black text-indigo-600 mb-1">500+</div>
                <div className="text-xs font-bold text-gray-700">أداة SaaS مبرمجة</div>
                <div className="text-[11px] text-gray-400 mt-0.5">جاهزة للتجربة والتشغيل</div>
              </div>

              <div className="bg-white/80 backdrop-blur-xs p-5 rounded-2xl border border-gray-200/80 shadow-xs text-center">
                <div className="text-3xl font-black text-emerald-600 mb-1">$0</div>
                <div className="text-xs font-bold text-gray-700">اشتراكات متكررة</div>
                <div className="text-[11px] text-gray-400 mt-0.5">شراء لمرة واحدة مدى الحياة</div>
              </div>

              <div className="bg-white/80 backdrop-blur-xs p-5 rounded-2xl border border-gray-200/80 shadow-xs text-center">
                <div className="text-3xl font-black text-teal-600 mb-1">100%</div>
                <div className="text-xs font-bold text-gray-700">ملكية الكود المصدري</div>
                <div className="text-[11px] text-gray-400 mt-0.5">حقوق إعادة البيع والتعديل</div>
              </div>

              <div className="bg-white/80 backdrop-blur-xs p-5 rounded-2xl border border-gray-200/80 shadow-xs text-center">
                <div className="text-3xl font-black text-amber-600 mb-1">Gemini</div>
                <div className="text-xs font-bold text-gray-700">ذكاء اصطناعي مدمج</div>
                <div className="text-[11px] text-gray-400 mt-0.5">معالجة فورية وتلقائية</div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 🚀 2. How It Works (3 Easy Steps) */}
      <section className="py-20 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
              آلية العمل السريعة
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-3 mb-4">
              كيف تبدأ مع سوق ساس في 3 خطوات؟
            </h2>
            <p className="text-gray-500 text-sm sm:text-base">
              صممنا تجربة تضمن لك الشفافية التامة؛ لا تشتري أداة دون أن تجرب مدخلاتها وتطلع على كودها المصدري أولاً.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <div className="bg-gray-50/70 p-8 rounded-3xl border border-gray-200 relative flex flex-col justify-between group hover:border-indigo-300 hover:bg-indigo-50/30 transition-all">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl mb-6 shadow-md shadow-indigo-200">
                  1
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">اختر الأداة وجربها حياً</h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-4">
                  تصفح أي أداة من الـ 500، اضغط على "تجربة حية" لتجربتها ببياناتك الفعلية أو بنماذج تجريبية وتطلع على الكود المصدري قبل الشراء.
                </p>
              </div>
              <div className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                <Play size={14} /> محاكاة برمجية فورية
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-gray-50/70 p-8 rounded-3xl border border-gray-200 relative flex flex-col justify-between group hover:border-emerald-300 hover:bg-emerald-50/30 transition-all">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl mb-6 shadow-md shadow-emerald-200">
                  2
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">شراء لمرة واحدة مدى الحياة</h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-4">
                  ادفع بأمان عبر Stripe بضغطة زر واحدة بدون أي رسوم اشتراك شهرية متكررة أو قيود على عدد الاستخدامات.
                </p>
              </div>
              <div className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <ShieldCheck size={14} /> ترخيص تجاري معتمد للأبد
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-gray-50/70 p-8 rounded-3xl border border-gray-200 relative flex flex-col justify-between group hover:border-teal-300 hover:bg-teal-50/30 transition-all">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black text-xl mb-6 shadow-md shadow-teal-200">
                  3
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">شغّل أو حمّل حزمة الكود (.ZIP)</h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-4">
                  استخدم الأداة فوراً من مساحة "مكتبتي"، أو حمّل المشروع كاملاً مضغوطاً بصيغة ZIP وأعد نشره تحت علامتك التجارية لعملائك.
                </p>
              </div>
              <div className="text-xs font-bold text-teal-600 flex items-center gap-1">
                <Download size={14} /> تنزيل فوري بضغطة زر
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 🧭 3. The 5KM B2B Local Outreach Engine Showcase */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 text-white relative overflow-hidden">
        
        {/* Background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full">
                <Radio size={14} className="animate-pulse" />
                <span>ميزة حصرية لرواد الأعمال والمسوقين</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                رادار التسويق الجغرافي (5 كم): <br />
                <span className="text-emerald-400">حوّل البرمجيات إلى مبيعات حقيقية</span>
              </h2>

              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                لا تكتفِ بشراء الأدوات لمشروعك فقط؛ استخدم رادار الخرائط المدمج للبحث عن المطاعم، الكافيهات، العيادات والشركات في محيط 5 كيلومتر من موقعك. يقوم نموذج Gemini بصياغة عروض مخصصة بالواتساب لتبيع لهم هذه البرمجيات كخدمات جاهزة وتحقق أرباحاً فورية.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-200">
                  <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                  <span>مسح جغرافي فوري للأنشطة التجارية في نطاق 5 كم</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-200">
                  <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                  <span>توليد رسائل واتساب تسويقية مخصصة باسم كل نشاط بالذكاء الاصطناعي</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-200">
                  <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                  <span>تصدير قوائم جهات الاتصال كملفات Excel/CSV للحملات الموسعة</span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={onOpenRadar}
                  className="bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-black px-6 py-3.5 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 text-sm"
                >
                  <Radio size={16} />
                  <span>فتح رادار الشركاء المحليين الآن</span>
                </button>
              </div>
            </div>

            {/* Visual Demo Card */}
            <div className="lg:col-span-6 bg-gray-800/80 border border-gray-700 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-gray-700 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs font-mono text-gray-400 mr-2">5km_radar_dispatcher.ai</span>
                </div>
                <span className="text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                  نشط وجاهز
                </span>
              </div>

              <div className="bg-gray-900/90 p-4 rounded-2xl border border-gray-800 space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>تم اكتشاف: 15 نشاط تجاري محلي</span>
                  <span className="text-emerald-400 font-bold">نسبة تطابق الأدوات 98%</span>
                </div>
                <div className="p-3 bg-gray-800/80 rounded-xl border border-gray-700 text-xs text-gray-300 leading-relaxed font-sans">
                  <div className="font-bold text-indigo-300 mb-1">📍 كافيه ومحمصة إكسبرسو (1.2 كم):</div>
                  "مرحباً فريق إكسبرسو 👋 صممنا لكم روبوت ذكي لإدارة الطلبات والرد الآلي على استفسارات العملاء على الواتساب لمضاعفة مبيعاتكم..."
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center text-xs">
                <div className="bg-gray-900/60 p-3 rounded-xl border border-gray-800">
                  <div className="text-lg font-black text-white">100%</div>
                  <div className="text-gray-400 text-[11px]">مراسلة بنقرة واحدة</div>
                </div>
                <div className="bg-gray-900/60 p-3 rounded-xl border border-gray-800">
                  <div className="text-lg font-black text-emerald-400">مباشر</div>
                  <div className="text-gray-400 text-[11px]">بدون وسيط أو عمولات</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ⚖️ 4. Comparison Table: Why Micro SaaS vs Traditional SaaS */}
      <section className="py-20 bg-gray-50 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
              المقارنة الذكية
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 mt-3 mb-3">
              لماذا تختار سوق ساس بدلاً من الاشتراكات الشهرية؟
            </h2>
            <p className="text-gray-500 text-sm">
              وفر آلاف الدولارات سنوياً وتحكم في برمجياتك وبياناتك دون الاعتماد على شركات خارجية.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="grid grid-cols-3 bg-gray-50 p-4 border-b border-gray-200 text-xs sm:text-sm font-bold text-gray-700">
              <div>المعيار</div>
              <div className="text-indigo-600 text-center font-extrabold">سوق ساس (Micro SaaS)</div>
              <div className="text-gray-400 text-center">الاشتراكات التقليدية</div>
            </div>

            <div className="divide-y divide-gray-100 text-xs sm:text-sm">
              
              <div className="grid grid-cols-3 p-4 items-center">
                <div className="font-bold text-gray-900">نموذج الدفع</div>
                <div className="text-center text-emerald-600 font-bold bg-emerald-50 py-1 rounded-lg">
                  مرة واحدة للأبد ($29 - $79)
                </div>
                <div className="text-center text-red-500">
                  شهري متكرر ($20 - $200 / شهر)
                </div>
              </div>

              <div className="grid grid-cols-3 p-4 items-center bg-gray-50/40">
                <div className="font-bold text-gray-900">ملكية الكود المصدري</div>
                <div className="text-center text-emerald-600 font-bold bg-emerald-50 py-1 rounded-lg">
                  100% مفتوح وقابل للتنزيل
                </div>
                <div className="text-center text-red-500">
                  مغلق ومحجوب تماماً
                </div>
              </div>

              <div className="grid grid-cols-3 p-4 items-center">
                <div className="font-bold text-gray-900">حقوق إعادة البيع (White-Label)</div>
                <div className="text-center text-emerald-600 font-bold bg-emerald-50 py-1 rounded-lg">
                  متاحة بالكامل لعملائك
                </div>
                <div className="text-center text-red-500">
                  ممنوعة ومحظورة
                </div>
              </div>

              <div className="grid grid-cols-3 p-4 items-center bg-gray-50/40">
                <div className="font-bold text-gray-900">التخصيص والتطوير</div>
                <div className="text-center text-emerald-600 font-bold bg-emerald-50 py-1 rounded-lg">
                  حرية مطلقة لتعديل أي ميزة
                </div>
                <div className="text-center text-red-500">
                  مقيد بما توفره الشركة فقط
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ❓ 5. Frequently Asked Questions (FAQ) */}
      <section className="py-20 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
              الأسئلة الشائعة
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 mt-3 mb-3">
              كل ما تود معرفته عن سوق ساس
            </h2>
            <p className="text-gray-500 text-sm">
              إجابات مباشرة على أكثر الاستفسارات شيوعاً بين رواد الأعمال والمطورين.
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
                  <span className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
                    <HelpCircle size={18} className="text-indigo-600 flex-shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown 
                    size={18} 
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

      {/* 🎯 6. Bottom Call to Action */}
      <section className="py-16 bg-gradient-to-l from-indigo-700 to-indigo-900 text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black">جاهز لإطلاق مشروعك الرقمي القادم؟</h2>
          <p className="text-indigo-100 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            اختر من بين 500 أداة جاهزة، جربها حياً، وامتلك كودها المصدري مدى الحياة في دقائق معدودة.
          </p>
          <button
            onClick={scrollToProducts}
            className="bg-white text-indigo-900 hover:bg-indigo-50 font-black px-8 py-4 rounded-2xl transition-all shadow-xl text-base inline-flex items-center gap-2"
          >
            <span>استعراض الأدوات والبدء فوراً</span>
            <Rocket size={18} className="text-indigo-600" />
          </button>
        </div>
      </section>

    </div>
  );
}
