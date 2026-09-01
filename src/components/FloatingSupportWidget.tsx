import React, { useState } from 'react';
import { WHATSAPP_NUMBER } from '../config/constants';
import { MessageCircle, Send, X } from 'lucide-react';

const quickQuestions = [
    'كيف استلم الكود المصدري بعد الدفع؟',
    'هل يمكنني إعادة بيع الأداة باسمي وعلامتي التجارية؟',
    'ما هي طرق الدفع المتاحة في مصر والعالم العربي؟',
    'هل يتطلب تشغيل الأداة خوادم باهظة شهرياً؟'
  ];

export function FloatingSupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [userQuery, setUserQuery] = useState('');

  

  const handleWhatsAppContact = (customText?: string) => {
    const textToSend = customText || userQuery || 'مرحباً، لدي استفسار بخصوص شراء إحدى أدوات الـ Micro SaaS.';
    const encodedText = encodeURIComponent(textToSend);
    // WhatsApp Direct Link
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedText}`, '_blank');
  };

  return (
    <div className="fixed bottom-6 left-6 z-40" dir="rtl">
      
      {/* Floating Popover */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-indigo-100 p-5 animate-in fade-in slide-in-from-bottom-5 duration-200 text-gray-900">
          
          {/* Popover Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-md">
                <MessageCircle size={18} />
              </div>
              <div>
                <h4 className="text-sm font-black text-gray-900 leading-tight">فريق الدعم الفني والمبيعات</h4>
                <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  متواجدون للرد المباشر عبر واتساب
                </span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <p className="text-xs text-gray-600 mb-3 leading-relaxed">
            أهلاً بك! نسعد بمساعدتك في اختيار الأداة المناسبة لمشروعك، توضيح شروط الترخيص، أو تفعيل الدفع بالجنيه المصري (إنستاباي/فودافون كاش).
          </p>

          {/* Quick Questions Chips */}
          <div className="space-y-1.5 mb-4">
            <div className="text-[11px] font-bold text-gray-400">أسئلة شائعة سريعة:</div>
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleWhatsAppContact(q)}
                className="w-full text-right text-xs bg-gray-50 hover:bg-indigo-50 hover:text-indigo-900 text-gray-700 p-2 rounded-xl border border-gray-200/70 transition-all flex items-center justify-between gap-1 group"
              >
                <span className="truncate">{q}</span>
                <Send size={12} className="text-gray-400 group-hover:text-indigo-600 flex-shrink-0" />
              </button>
            ))}
          </div>

          {/* Input or Direct WhatsApp */}
          <div className="space-y-2">
            <input
              type="text"
              placeholder="اكتب سؤالك هنا للتواصل الفوري..."
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleWhatsAppContact();
              }}
              className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
            />
            <button
              onClick={() => handleWhatsAppContact()}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
            >
              <MessageCircle size={15} />
              <span>محادثة فورية مع المستشار التقني عبر واتساب</span>
            </button>
          </div>

        </div>
      )}

      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-2xl flex items-center gap-2.5 transition-all transform hover:scale-105 active:scale-95 group border-2 border-white/80"
      >
        <div className="relative">
          <MessageCircle size={22} />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-emerald-600"></span>
        </div>
        <span className="hidden sm:inline font-black text-xs">
          مستشارك التقني (تواصل معنا)
        </span>
      </button>

    </div>
  );
}
