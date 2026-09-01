import React from 'react';
import { ShieldCheck, Clock, CheckCircle2, RotateCcw, X, FileText, Lock, Sparkles } from 'lucide-react';

interface TermsAndRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermsAndRefundModal({ isOpen, onClose }: TermsAndRefundModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 relative my-8 text-gray-900 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-900 flex items-center justify-center">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-gray-950">
              الشروط والأحكام وسياسة الترخيص والتسليم
            </h2>
            <p className="text-xs text-gray-500">
              Micro SaaS Commercial License & 24h Fulfillment Policy
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-5 text-xs sm:text-sm text-gray-700 max-h-[60vh] overflow-y-auto pr-2">
          
          {/* Section 1 */}
          <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
            <h3 className="font-bold text-indigo-950 text-sm mb-2 flex items-center gap-1.5">
              <Sparkles size={16} className="text-indigo-600" />
              1. حقوق الترخيص التجاري وإعادة البيع (White-Label License)
            </h3>
            <p className="leading-relaxed text-gray-600 text-xs">
              عند شراء أي أداة من المنصة، يُمنح المشتري ترخيصاً تجارياً رسمياً ودائماً يتيح له:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-xs text-gray-600">
              <li>استخدام وتعديل وتطوير الكود المصدري بدون أي قيود برمجية.</li>
              <li>إعادة بيع وتشغيل الأداة لعملائه بالاسم والعلامة التجارية الخاصة به (White-Label).</li>
              <li>الاحتفاظ بـ 100% من أرباح عملائه دون دفع أي عمولات أو رسوم دورية للمنصة.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
            <h3 className="font-bold text-amber-950 text-sm mb-2 flex items-center gap-1.5">
              <Clock size={16} className="text-amber-600" />
              2. مدة وآلية التسليم (Fulfillment within 24 Hours)
            </h3>
            <p className="leading-relaxed text-gray-600 text-xs">
              - بعد إتمام التحويل عبر إنستاباي أو المحافظ إلى الرقم المعتمد <strong className="font-mono text-gray-900">01142099605</strong> وتعبئة بيانات الطلب، يتم فحص وتأكيد العملية.
              <br />
              - يتم تسليم حزمة الكود المصدري كاملة بصيغة (<strong className="font-mono text-gray-900">.ZIP</strong>) مع شهادة الترخيص المعتمدة إلى البريد الإلكتروني ورقم الواتساب المسجل خلال **24 ساعة كحد أقصى**.
            </p>
          </div>

          {/* Section 3 */}
          <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
            <h3 className="font-bold text-emerald-950 text-sm mb-2 flex items-center gap-1.5">
              <RotateCcw size={16} className="text-emerald-600" />
              3. سياسة الاسترجاع وضمان الجودة (100% Satisfaction Guarantee)
            </h3>
            <p className="leading-relaxed text-gray-600 text-xs">
              - نظراً لأن المنتجات هي برمجيات رقمية وكود مصدري كامل قابل للنسخ، فإن الشراء نهائي، ولكننا نضمن لك الدعم الفني الكامل إذا واجهتك أي صعوبة في تشغيل الأداة أو وجود أي عيب برمجي مثبت، ويحق لك استرداد المبلغ كاملاً إذا لم يتم حل المشكلة التقنية خلال 48 ساعة.
            </p>
          </div>

          {/* Section 4 */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-xs text-gray-500">
            <h4 className="font-bold text-gray-800 mb-1">4. الدعم الفني والاستفسارات:</h4>
            <p>
              لأي استفسار بخصوص الطلبات، التراخيص، أو التطوير المخصص، يرجى التواصل عبر الواتساب المباشر على الرقم: <strong className="font-mono text-indigo-900 font-bold">01142099605</strong>.
            </p>
          </div>

        </div>

        {/* Footer Action */}
        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="bg-indigo-900 hover:bg-indigo-950 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-all active:scale-95"
          >
            فهمت وموافق
          </button>
        </div>

      </div>
    </div>
  );
}
