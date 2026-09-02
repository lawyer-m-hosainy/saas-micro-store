import React, { useState } from 'react';
import { Product, Order } from '../types';
import { X, Check, Copy, Clock, MessageCircle, CheckCircle2, Zap, Paperclip, ImageOff } from 'lucide-react';
import { SUPPORT_PHONE, WHATSAPP_NUMBER, getDeploymentFeeEgp } from '../config/constants';
import { useCurrency } from '../context/CurrencyContext';

interface CheckoutModalProps {
  product: Product;
  onClose: () => void;
  onOrderCreated?: (newOrder: Order) => void;
}

const MAX_RECEIPT_BYTES = 3 * 1024 * 1024; // 3MB

export function CheckoutModal({ product, onClose, onOrderCreated }: CheckoutModalProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [buyerData, setBuyerData] = useState({
    name: '',
    email: '',
    phone: '',
    senderAccount: '', // رقم المحفظة أو عنوان انستاباي المحول منه
  });
  const [includeDeployment, setIncludeDeployment] = useState(false);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState('');
  const [receiptError, setReceiptError] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');

  const { getAmount } = useCurrency();

  const baseEgpPrice = getAmount(product.price);
  const deploymentFeeEgp = getDeploymentFeeEgp(baseEgpPrice);

  const discountMultiplier = 1 - (discountPercent / 100);
  const totalEgpPrice = Math.round((baseEgpPrice + (includeDeployment ? deploymentFeeEgp : 0)) * discountMultiplier);

  const transferNumber = SUPPORT_PHONE;

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setReceiptError('');
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setReceiptError('يُسمح فقط بملفات الصور (JPG, PNG, ...)');
      return;
    }
    if (file.size > MAX_RECEIPT_BYTES) {
      setReceiptError('حجم الصورة أكبر من 3 ميجابايت، يرجى ضغطها أو اختيار صورة أصغر');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setReceiptImage(reader.result as string);
      setReceiptFileName(file.name);
    };
    reader.onerror = () => setReceiptError('تعذر قراءة الصورة، حاول مرة أخرى');
    reader.readAsDataURL(file);
  };

  const removeReceipt = () => {
    setReceiptImage(null);
    setReceiptFileName('');
    setReceiptError('');
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError('');
    try {
      const res = await fetch(`/api/coupons/validate?code=${encodeURIComponent(couponCode.trim())}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setDiscountPercent(data.discountPercent);
      } else {
        setCouponError(data.error || 'كوبون غير صحيح');
        setDiscountPercent(0);
      }
    } catch (err) {
      setCouponError('حدث خطأ أثناء التحقق من الكوبون');
    }
    setIsApplyingCoupon(false);
  };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(transferNumber);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          productTitle: product.title + (includeDeployment ? ' (مع خدمة التركيب السحابي)' : ''),
          buyerName: buyerData.name,
          buyerEmail: buyerData.email,
          buyerPhone: buyerData.phone,
          senderAccount: buyerData.senderAccount,
          amountEgp: totalEgpPrice,
          receiptImage: receiptImage || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || 'حدث خطأ أثناء تسجيل الطلب، يرجى المحاولة مرة أخرى.');
        setIsSubmitting(false);
        return;
      }

      const newOrder: Order = {
        id: data.id,
        productId: data.productId,
        productTitle: data.productTitle,
        buyerName: data.buyerName,
        buyerEmail: data.buyerEmail,
        buyerPhone: data.buyerPhone,
        senderAccount: data.senderAccount,
        amountEgp: data.amountEgp,
        createdAt: new Date().toLocaleDateString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        status: data.status,
      };

      setOrderNumber(newOrder.id);
      if (onOrderCreated) {
        onOrderCreated(newOrder);
      }
      setIsSuccess(true);
    } catch (err) {
      setSubmitError('تعذر الاتصال بالخادم، يرجى التأكد من اتصالك بالإنترنت والمحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendViaWhatsApp = () => {
    const deploymentNote = includeDeployment 
      ? `\n🛠️ *تم تضمين خدمة التركيب والتشغيل السريع على السيرفر والدومين (+${deploymentFeeEgp} ج.م)*`
      : '';

    const message = `مرحباً، قمت بتحويل مبلغ ${totalEgpPrice} ج.م لشراء أداة:
*${product.title}*${deploymentNote}

📌 *بيانات الطلب:*
- رقم الطلب: ${orderNumber}
- اسم المشتري: ${buyerData.name}
- رقم المحول منه: ${buyerData.senderAccount}
- الإيميل لاستلام الكود: ${buyerData.email}
- رقم الهاتف: ${buyerData.phone}

يرجى تأكيد الاستلام وإرسال حزمة الكود المصدري (.ZIP) وترخيص الاستخدام التجاري. شكراً لك!`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/75 backdrop-blur-xs overflow-y-auto" dir="rtl">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-100 relative my-8">
        
        {/* Close button */}
        <button 
          onClick={onClose}
          aria-label="إغلاق نافذة الدفع"
          className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
        >
          <X size={20} />
        </button>

        {isSuccess ? (
          <div className="p-6 sm:p-8 text-center" dir="rtl">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 size={36} />
            </div>
            <span className="inline-block bg-emerald-50 text-emerald-700 text-xs font-black px-3.5 py-1 rounded-full border border-emerald-200 mb-2">
              رقم طلبك: {orderNumber}
            </span>
            <h3 className="text-2xl font-black text-gray-900 mb-2">تم تسجيل طلبك بنجاح!</h3>
            
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-right my-5 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <Clock size={16} className="text-amber-600" />
                <span>ميعاد التسليم: خلال 24 ساعة كحد أقصى</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                نقوم حالياً بمطابقة وتأكيد عملية التحويل لحسابنا. سيتم إرسال **رابط تحميل الكود المصدري كاملاً (.ZIP)** و **شهادة الترخيص التجاري الرسمي** إلى بريدك الإلكتروني (<strong className="font-mono text-gray-900">{buyerData.email}</strong>) ورقم واتسابك.
              </p>
            </div>

            {/* Fast WhatsApp Verification Button */}
            <div className="space-y-3">
              <button
                onClick={handleSendViaWhatsApp}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 text-sm"
              >
                <MessageCircle size={18} />
                <span>إرسال إشعار التحويل المباشر عبر واتساب لتسريع الاستلام ⚡</span>
              </button>

              <button
                onClick={onClose}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors"
              >
                العودة للمتجر
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 sm:p-8" dir="rtl">
            
            {/* Header */}
            <div className="text-center mb-6">
              <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                دفع آمن بالجنيه المصري (إنستاباي / محفظة كاش)
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 mt-2">
                إتمام طلب شراء {product.title}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                تسليم الكود المصدري كاملاً وترخيص إعادة البيع مدى الحياة خلال 24 ساعة
              </p>
            </div>

            {/* Payment Transfer Instructions Box */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-5 rounded-2xl mb-5 shadow-md relative overflow-hidden">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs text-indigo-200 font-medium">المبلغ المطلوب تحويله:</span>
                <div className="flex flex-col items-end">
                  {discountPercent > 0 && (
                    <span className="text-xs text-gray-400 line-through mb-0.5">
                      {baseEgpPrice + (includeDeployment ? deploymentFeeEgp : 0)} ج.م
                    </span>
                  )}
                  <span className="text-2xl font-black text-amber-300 font-mono">
                    {totalEgpPrice} ج.م
                  </span>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/20 mb-3">
                <div className="text-[11px] text-gray-300 mb-1">
                  حول المبلغ عبر إنستاباي أو فودافون/اتصالات كاش إلى الرقم:
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xl sm:text-2xl font-black text-white font-mono tracking-wider">
                    {transferNumber}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyNumber}
                    className="bg-amber-400 hover:bg-amber-500 text-gray-950 text-xs font-black px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all active:scale-95 shadow-sm"
                  >
                    {copiedNumber ? (
                      <>
                        <Check size={14} className="text-emerald-900" />
                        <span>تم النسخ!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>نسخ الرقم</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-indigo-200 flex items-center gap-1.5">
                <Clock size={13} className="text-amber-400 flex-shrink-0" />
                <span>يصلك الكود وترخيصك عبر الإيميل والواتساب خلال 24 ساعة من تأكيد التحويل.</span>
              </div>
            </div>

            {/* 🛠️ 1-Click Deployment & Cloud Setup Add-on */}
            <div className={`p-4 rounded-2xl border mb-5 transition-all ${
              includeDeployment 
                ? 'bg-indigo-50/90 border-indigo-300 shadow-xs' 
                : 'bg-gray-50 border-gray-200 hover:border-gray-300'
            }`}>
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeDeployment}
                  onChange={(e) => setIncludeDeployment(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 accent-indigo-600"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-gray-900 flex items-center gap-1.5">
                      <Zap size={14} className="text-amber-500 fill-amber-500" />
                      إضافة خدمة التركيب والتشغيل السحابي السريع
                    </span>
                    <span className="text-xs font-black text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-md">
                      +{deploymentFeeEgp} ج.م
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                    نقوم برفع الأداة على استضافتك (Vercel/VPS)، وربط الدومين الخاص بك، وضبط مفاتيح الـ API وشهادة SSL خلال 48 ساعة.
                  </p>
                </div>
              </label>
            </div>

            {/* 🎟️ Coupon Code */}
            <div className="mb-5 bg-white p-4 rounded-2xl border border-gray-200">
              <label className="block text-xs font-bold text-gray-700 mb-2">
                هل لديك كود خصم؟
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="أدخل كود الخصم (مثال: DISCOUNT20)"
                  className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 uppercase"
                  disabled={discountPercent > 0 || isApplyingCoupon}
                />
                {discountPercent > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setCouponCode('');
                      setDiscountPercent(0);
                    }}
                    className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors"
                  >
                    إلغاء
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={!couponCode.trim() || isApplyingCoupon}
                    className="bg-gray-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-800 disabled:opacity-50 transition-colors"
                  >
                    {isApplyingCoupon ? 'جاري التحقق...' : 'تطبيق'}
                  </button>
                )}
              </div>
              {couponError && <p className="text-[10px] text-red-500 mt-1 font-bold">{couponError}</p>}
              {discountPercent > 0 && (
                <p className="text-[10px] text-emerald-600 mt-1 font-bold">
                  تم تطبيق خصم {discountPercent}% بنجاح!
                </p>
              )}
            </div>

            {/* Form to submit buyer details */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  الاسم بالكامل (يُسجل في شهادة الترخيص التجاري) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: محمد الحسيني"
                  value={buyerData.name}
                  onChange={(e) => setBuyerData({ ...buyerData, name: e.target.value })}
                  className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    البريد الإلكتروني (لاستلام ملف الـ ZIP) *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="yourname@gmail.com"
                    value={buyerData.email}
                    onChange={(e) => setBuyerData({ ...buyerData, email: e.target.value })}
                    className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    رقم الواتساب للتواصل *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="01XXXXXXXXX"
                    value={buyerData.phone}
                    onChange={(e) => setBuyerData({ ...buyerData, phone: e.target.value })}
                    className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  الرقم أو الحساب الذي قمت بالتحويل منه (لمطابقة العملية) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: رقم محفظتك 010... أو اسم حساب إنستاباي"
                  value={buyerData.senderAccount}
                  onChange={(e) => setBuyerData({ ...buyerData, senderAccount: e.target.value })}
                  className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                />
              </div>

              {/* Receipt Attachment Upload */}
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-gray-600 font-medium">إرفاق لقطة شاشة لإيصال التحويل (اختياري، بيسرّع المطابقة)</span>
                </div>

                {receiptImage ? (
                  <div className="flex items-center justify-between gap-2 bg-white border border-gray-200 rounded-lg p-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <img src={receiptImage} alt="معاينة إيصال التحويل" className="w-10 h-10 object-cover rounded-md border border-gray-200" />
                      <span className="text-gray-700 font-bold truncate">{receiptFileName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={removeReceipt}
                      className="text-red-500 hover:text-red-700 p-1"
                      aria-label="إزالة الصورة"
                    >
                      <ImageOff size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-1.5 border border-dashed border-gray-300 rounded-lg py-2.5 cursor-pointer text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors">
                    <Paperclip size={14} />
                    <span>اختر صورة الإيصال (JPG/PNG، حتى 3 ميجابايت)</span>
                    <input type="file" accept="image/*" onChange={handleReceiptChange} className="hidden" />
                  </label>
                )}
                {receiptError && <p className="text-[10px] text-red-500 mt-1 font-bold">{receiptError}</p>}
              </div>

              {submitError && (
                <p className="text-xs text-red-600 font-bold bg-red-50 border border-red-200 rounded-xl p-3 text-center">{submitError}</p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-900 hover:bg-indigo-950 text-white font-black py-3.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 mt-4 disabled:opacity-60 disabled:active:scale-100"
              >
                <CheckCircle2 size={18} className="text-emerald-400" />
                <span>{isSubmitting ? 'جاري تسجيل الطلب...' : `تأكيد تسجيل طلب الشراء الآن (${totalEgpPrice} ج.م)`}</span>
              </button>
            </form>

            <p className="text-[11px] text-gray-400 text-center mt-3">
              🔒 معاملاتك محمية. لا توجد أي اشتراكات دورية مخفية. تسليم مؤكد وموثق خلال 24 ساعة.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
