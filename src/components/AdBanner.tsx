import React, { useState } from 'react';
import { WHATSAPP_NUMBER } from '../config/constants';
import { Megaphone, X, ExternalLink, Sparkles, CheckCircle2, Send, MessageCircle } from 'lucide-react';

interface AdvertiseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const adPackages = [
    {
      title: 'بانر الشريط العلوي (Top Ribbon)',
      placement: 'يظهر في أعلى كل صفحات المتجر للزوار',
      views: '+75,000 مشاهدة شهرياً',
      price: '1,500 ج.م / شهر',
      features: ['ظهور دائم وثابت', 'رابط مباشر لموقعك', 'تقرير نقرات أسبوعي']
    },
    {
      title: 'بطاقة أداة مميزة (Sponsored In-Feed)',
      placement: 'بين أول صف في شبكة منتجات الـ SaaS',
      views: '+50,000 ظهور مخصص',
      price: '2,200 ج.م / شهر',
      popular: true,
      features: ['تصميم متناسق عالي التحويل', 'وسام "برعاية" مميز', 'زر شراء/استعراض مباشر']
    },
    {
      title: 'حزمة الشريك الاستراتيجي الشاملة',
      placement: 'شريط علوي + بطاقة منتج + رعاية في الرادار',
      views: '+120,000 تفاعل كامل',
      price: '3,800 ج.م / شهر',
      features: ['أعلى أولوية ظهور', 'تغطية شاملة للمنصة', 'إبراز في النشرة البريدية']
    }
  ];

export function AdvertiseModal({ isOpen, onClose }: AdvertiseModalProps) {
  if (!isOpen) return null;

  const handleContactWhatsApp = (pkg: string) => {
    const text = encodeURIComponent(`مرحباً فريق سوق ساس 👋 أود الاستفسار وحجز مساحة إعلانية (${pkg}) على منصتكم.`);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank');
  };

  

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in" dir="rtl">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-l from-indigo-900 via-indigo-800 to-indigo-950 text-white relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-amber-400/20 text-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles size={12} />
                فرص الإعلان والرعاية
              </span>
            </div>
            <h3 className="text-xl font-black">أعلن مع سوق ساس وضاعف مبيعاتك</h3>
            <p className="text-xs text-indigo-200 mt-1">
              صل إلى آلاف رواد الأعمال، المطورين، وأصحاب الأنشطة التجارية في مصر والعالم العربي.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-200 text-center">
            <div>
              <div className="text-xl font-black text-indigo-600">50K+</div>
              <div className="text-[11px] text-gray-500 font-bold">زائر شهري نشط</div>
            </div>
            <div>
              <div className="text-xl font-black text-emerald-600">92%</div>
              <div className="text-[11px] text-gray-500 font-bold">رواد أعمال ومطورين</div>
            </div>
            <div>
              <div className="text-xl font-black text-amber-600">4.8%</div>
              <div className="text-[11px] text-gray-500 font-bold">معدل نقر عالي (CTR)</div>
            </div>
          </div>

          {/* Pricing Tiers */}
          <div className="space-y-3">
            <h4 className="font-bold text-gray-900 text-sm">اختر الباقة الإعلانية المناسبة لنشاطك:</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {adPackages.map((pkg, idx) => (
                <div 
                  key={idx}
                  className={`p-4 rounded-2xl border flex flex-col justify-between transition-all relative ${
                    pkg.popular 
                      ? 'border-indigo-500 bg-indigo-50/40 ring-2 ring-indigo-200' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-2.5 right-3 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      الأكثر طلباً ⭐
                    </span>
                  )}
                  <div>
                    <h5 className="font-bold text-gray-900 text-xs mb-1">{pkg.title}</h5>
                    <p className="text-[10px] text-gray-500 mb-2">{pkg.placement}</p>
                    <div className="text-sm font-black text-indigo-700 mb-3">{pkg.price}</div>
                    
                    <ul className="space-y-1.5 mb-4 text-[11px] text-gray-600">
                      {pkg.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-1.5">
                          <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => handleContactWhatsApp(pkg.title)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                      pkg.popular 
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                        : 'bg-gray-900 hover:bg-gray-800 text-white'
                    }`}
                  >
                    <MessageCircle size={13} />
                    حجز هذه المساحة
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Inquiries */}
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-right">
              <h5 className="font-bold text-emerald-900 text-xs">هل لديك حملة مخصصة أو شبكة إعلانية؟</h5>
              <p className="text-[11px] text-emerald-700 mt-0.5">ندعم إعلانات Google AdSense والروابط التابعة وحملات الشركات المخصصة.</p>
            </div>
            <button
              onClick={() => handleContactWhatsApp('حملة مخصصة')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap shadow-xs"
            >
              <Send size={13} />
              تواصل مع فريق الإعلانات
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

// 🎯 Reusable Ad Components
export function TopRibbonAd({ onOpenAdvertise }: { onOpenAdvertise: () => void }) {
  const [closed, setClosed] = useState(false);
  if (closed) return null;

  return (
    <div className="bg-gradient-to-l from-indigo-900 via-indigo-800 to-purple-900 text-white text-xs py-2 px-4 border-b border-indigo-700/50 shadow-xs relative" dir="rtl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 overflow-hidden">
          <span className="bg-amber-400 text-indigo-950 text-[10px] font-black px-2 py-0.5 rounded-md flex-shrink-0">
            إعلان راعي
          </span>
          <p className="truncate text-indigo-100 text-[11px] sm:text-xs">
            🚀 <strong>استضافة سحابية فائقة السرعة</strong> مخصصة لمشاريع المايكرو ساس والذكاء الاصطناعي — احصل على خصم 60% مع كود <span className="text-amber-300 font-mono font-bold">SAAS2026</span>
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <a
            href="https://digitalocean.com"
            target="_blank"
            rel="noreferrer"
            className="bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold px-3 py-1 rounded-lg border border-white/20 transition-colors flex items-center gap-1"
          >
            <span>استفد من العرض</span>
            <ExternalLink size={11} />
          </a>
          <button
            onClick={onOpenAdvertise}
            className="text-[10px] text-amber-300 hover:text-amber-200 underline font-bold hidden sm:inline"
          >
            أعلن هنا
          </button>
          <button 
            onClick={() => setClosed(true)} 
            className="text-indigo-300 hover:text-white p-0.5"
            title="إغلاق الإعلان"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function MidFeedAdBanner({ onOpenAdvertise }: { onOpenAdvertise: () => void }) {
  return (
    <div className="my-10 bg-gradient-to-l from-gray-900 via-indigo-950 to-gray-900 rounded-3xl p-6 sm:p-8 text-white border border-indigo-900/50 shadow-lg relative overflow-hidden" dir="rtl">
      <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        <div className="space-y-2 text-right max-w-xl">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-500/30">
              <Sparkles size={11} />
              شريك معتمد
            </span>
            <span className="text-gray-400 text-xs">مساحة إعلانية متميزة</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            هل تقدم خدمات استضافة، بوابات دفع، أو حلول برمجية؟
          </h3>
          <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
            ضع منتجك أمام أكثر من 50,000 مشتري ومهتم بحلول الـ SaaS والذكاء الاصطناعي في مصر والعالم العربي.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <button
            onClick={onOpenAdvertise}
            className="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 text-gray-950 font-black px-6 py-3.5 rounded-2xl text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Megaphone size={15} />
            <span>احجز مساحتك الإعلانية الآن</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function SponsoredProductCard({ onOpenAdvertise }: { onOpenAdvertise: () => void }) {
  return (
    <div className="bg-gradient-to-b from-amber-50/60 via-white to-amber-50/30 rounded-2xl border-2 border-dashed border-amber-300 p-8 flex flex-col h-full shadow-xs hover:shadow-md transition-all text-right relative" dir="rtl">
      <div className="absolute top-4 left-4 bg-amber-400 text-gray-950 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
        <Sparkles size={11} />
        مساحة رعاية مميزة
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="bg-amber-100 p-3 rounded-xl text-amber-700">
          <Megaphone size={28} strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">أعلن عن أداتك هنا</h3>
          <span className="text-[11px] text-gray-500">احصل على آلاف الزوار المستهدفين</span>
        </div>
      </div>

      <p className="text-gray-600 text-xs sm:text-sm mb-6 flex-grow leading-relaxed">
        هل تمتلك أداة ذكاء اصطناعي أو خدمة B2B وتريد مضاعفة عملائك؟ احجز هذه البطاقة لتظهر كأداة موصى بها لجميع رواد الأعمال المتصفحين للمتجر.
      </p>

      <ul className="space-y-2.5 mb-6 text-xs text-gray-700">
        <li className="flex items-center gap-2">
          <CheckCircle2 size={14} className="text-amber-600 flex-shrink-0" />
          <span>ظهور دائم في مقدمة كتالوج الأدوات</span>
        </li>
        <li className="flex items-center gap-2">
          <CheckCircle2 size={14} className="text-amber-600 flex-shrink-0" />
          <span>تحويل مباشر لصفحة الدفع أو موقعك</span>
        </li>
        <li className="flex items-center gap-2">
          <CheckCircle2 size={14} className="text-amber-600 flex-shrink-0" />
          <span>أسعار مرنة تبدأ من 1,500 ج.م شهرياً</span>
        </li>
      </ul>

      <div className="mt-auto pt-4 border-t border-amber-200/60">
        <button
          onClick={onOpenAdvertise}
          className="w-full bg-amber-400 hover:bg-amber-500 text-gray-950 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
        >
          <Megaphone size={14} />
          احجز هذه المساحة الآن
        </button>
      </div>
    </div>
  );
}
