import React, { useState } from 'react';
import { Search, Clock, CheckCircle2, AlertCircle, Package, Download, MessageCircle, Sparkles, Award } from 'lucide-react';
import { Order, Product } from '../types';
import { SUPPORT_PHONE } from '../config/constants';
import { LicenseCertificateModal } from './LicenseCertificateModal';
import { downloadProductZip } from '../utils/zipGenerator';

interface OrderTrackingProps {
  products: Product[];
  onOpenTool?: (product: Product) => void;
}

export function OrderTracking({ products, onOpenTool }: OrderTrackingProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showCertProduct, setShowCertProduct] = useState<Product | null>(null);
  const [downloading, setDownloading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      setSelectedOrder(null);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/orders/track?q=${encodeURIComponent(query)}`);
      setSelectedOrder(res.ok ? await res.json() : null);
    } catch (err) {
      setSelectedOrder(null);
    } finally {
      setIsSearching(false);
      setHasSearched(true);
    }
  };

  const currentMatchedProduct = selectedOrder 
    ? products.find(p => p.id === selectedOrder.productId) || {
        id: selectedOrder.productId,
        title: selectedOrder.productTitle,
        description: 'أداة برمجية مرخصة',
        price: selectedOrder.amountEgp,
        features: ['الكود المصدري كاملاً', 'ترخيص تجاري مدى الحياة'],
        icon: 'Sparkles',
        categoryId: 'all'
      }
    : null;

  const handleDownloadZip = async () => {
    if (!currentMatchedProduct) return;
    setDownloading(true);
    try {
      await downloadProductZip(currentMatchedProduct);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12" dir="rtl">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-black px-4 py-1.5 rounded-full mb-3 border border-indigo-100">
          <Clock size={14} className="text-indigo-600" />
          <span>متابعة حالة التفعيل والتسليم (خلال 24 ساعة)</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-950 mb-3">
          تتبع حالة طلبك والكود المصدري
        </h1>
        <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
          أدخل رقم طلبك (مثل <span className="font-mono font-bold text-gray-800">#ORD-XXXXXX</span>) أو رقم هاتفك أو بريدك الإلكتروني لمعرفة موقف المراجعة والتسليم فوراً.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 shadow-xl mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              required
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="اكتب رقم الطلب (#ORD-...) أو رقم هاتفك / إيميلك..."
              className="w-full pr-11 pl-4 py-3.5 bg-gray-50 hover:bg-gray-100/80 focus:bg-white text-gray-900 text-xs sm:text-sm rounded-2xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all font-medium"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="bg-indigo-900 hover:bg-indigo-950 text-white font-black px-8 py-3.5 rounded-2xl text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 flex-shrink-0 disabled:opacity-60"
          >
            <Search size={16} />
            <span>{isSearching ? 'جاري البحث...' : 'بحث عن الطلب'}</span>
          </button>
        </div>
      </form>

      {/* Result Display */}
      {selectedOrder ? (
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Order Status Badge & ID */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-gray-100 mb-6">
            <div>
              <div className="text-xs text-gray-400 mb-1">رقم الطلب الرسمي:</div>
              <div className="text-xl sm:text-2xl font-black font-mono text-indigo-950">
                {selectedOrder.id}
              </div>
            </div>

            <div>
              {selectedOrder.status === 'completed' && (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-4 py-2 rounded-full border border-emerald-200 flex items-center gap-1.5 shadow-xs">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  تم الاعتماد والتسليم بنجاح 🚀
                </span>
              )}
              {selectedOrder.status === 'processing' && (
                <span className="bg-amber-100 text-amber-900 text-xs font-black px-4 py-2 rounded-full border border-amber-200 flex items-center gap-1.5 shadow-xs">
                  <Clock size={16} className="text-amber-600 animate-spin" />
                  تم تأكيد الدفع وجاري إعداد حزمة الكود
                </span>
              )}
              {selectedOrder.status === 'pending' && (
                <span className="bg-blue-50 text-blue-800 text-xs font-black px-4 py-2 rounded-full border border-blue-200 flex items-center gap-1.5 shadow-xs">
                  <Clock size={16} className="text-blue-600" />
                  قيد مراجعة التحويل (خلال 24 ساعة)
                </span>
              )}
            </div>
          </div>

          {/* Progress Steps Indicator */}
          <div className="my-8">
            <div className="grid grid-cols-3 gap-2 relative">
              
              {/* Step 1 */}
              <div className="text-center relative">
                <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center font-black text-xs mb-2 transition-all ${
                  'bg-emerald-600 text-white shadow-md'
                }`}>
                  ✓
                </div>
                <div className="text-xs font-bold text-gray-900">1. تسجيل الطلب</div>
                <div className="text-[10px] text-gray-400 mt-0.5">تم استلام البيانات</div>
              </div>

              {/* Step 2 */}
              <div className="text-center relative">
                <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center font-black text-xs mb-2 transition-all ${
                  selectedOrder.status === 'completed' || selectedOrder.status === 'processing'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-amber-500 text-white animate-pulse'
                }`}>
                  {selectedOrder.status === 'completed' || selectedOrder.status === 'processing' ? '✓' : '2'}
                </div>
                <div className="text-xs font-bold text-gray-900">2. مطابقة التحويل</div>
                <div className="text-[10px] text-gray-400 mt-0.5">فحص الإيداع لرقم {SUPPORT_PHONE}</div>
              </div>

              {/* Step 3 */}
              <div className="text-center relative">
                <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center font-black text-xs mb-2 transition-all ${
                  selectedOrder.status === 'completed'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {selectedOrder.status === 'completed' ? '✓' : '3'}
                </div>
                <div className="text-xs font-bold text-gray-900">3. التسليم والترخيص</div>
                <div className="text-[10px] text-gray-400 mt-0.5">إرسال الكود والـ ZIP</div>
              </div>

            </div>
          </div>

          {/* Order Details Table */}
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 mb-6 space-y-3 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
              <span className="text-gray-500">الأداة المطلوبة:</span>
              <strong className="text-gray-900 font-bold text-sm text-indigo-900">{selectedOrder.productTitle}</strong>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
              <span className="text-gray-500">اسم المشتري:</span>
              <strong className="text-gray-900">{selectedOrder.buyerName}</strong>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
              <span className="text-gray-500">البريد الإلكتروني المسجل:</span>
              <strong className="text-gray-900 font-mono">{selectedOrder.buyerEmail}</strong>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
              <span className="text-gray-500">رقم الهاتف / الواتساب:</span>
              <strong className="text-gray-900 font-mono">{selectedOrder.buyerPhone}</strong>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-gray-200/60">
              <span className="text-gray-500">الحساب المحول منه:</span>
              <strong className="text-gray-900">{selectedOrder.senderAccount}</strong>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-500">المبلغ المدفوع:</span>
              <strong className="text-emerald-700 font-black text-sm">{selectedOrder.amountEgp} ج.م</strong>
            </div>
          </div>

          {/* Actions & Deliverables if Completed */}
          {selectedOrder.status === 'completed' ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-right space-y-4">
              <div className="flex items-center gap-2 text-emerald-900 font-black text-sm">
                <Sparkles size={18} className="text-emerald-600" />
                <span>حزمة الكود والترخيص متاحة للتنزيل الفوري الآن:</span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleDownloadZip}
                  disabled={downloading}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-black py-3 px-5 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  <Download size={16} />
                  <span>{downloading ? 'جاري تجهيز الـ ZIP...' : 'تنزيل حزمة الكود المصدري (.ZIP)'}</span>
                </button>

                <button
                  onClick={() => setShowCertProduct(currentMatchedProduct)}
                  className="bg-indigo-900 hover:bg-indigo-950 text-white font-black py-3 px-5 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <Award size={16} className="text-amber-400" />
                  <span>عرض وطباعة شهادة الترخيص التجاري PDF</span>
                </button>

                {onOpenTool && currentMatchedProduct && (
                  <button
                    onClick={() => onOpenTool(currentMatchedProduct)}
                    className="bg-white hover:bg-gray-100 text-gray-900 border border-gray-300 font-bold py-3 px-4 rounded-xl text-xs flex items-center gap-1.5 transition-all"
                  >
                    <span>فتح وتشغيل الأداة مباشرة</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 text-xs text-amber-900">
                <Clock size={18} className="text-amber-600 flex-shrink-0" />
                <span>طلبك قيد التأكيد وسيكون متاحاً للتنزيل والتشغيل خلال 24 ساعة كحد أقصى.</span>
              </div>
              <a
                href={`https://wa.me/2${SUPPORT_PHONE}?text=${encodeURIComponent(`مرحباً، أستفسر عن حالة طلبي رقم ${selectedOrder.id} لشراء ${selectedOrder.productTitle}`)}`}
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-sm transition-all active:scale-95 flex-shrink-0"
              >
                <MessageCircle size={14} />
                <span>استعجال التفعيل بالواتساب</span>
              </a>
            </div>
          )}

        </div>
      ) : hasSearched ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-10 text-center shadow-md">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">لم نتمكن من العثور على طلب بهذه البيانات</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mb-5 leading-relaxed">
            يرجى التأكد من كتابة رقم الطلب بصيغة صحيحة (مثال: #ORD-123456) أو استخدام نفس رقم الهاتف أو الإيميل المسجل أثناء الدفع.
          </p>
          <a
            href="https://wa.me/2${SUPPORT_PHONE}?text=مرحباً، لم أتمكن من العثور على طلبي في صفحة التتبع، يرجى المساعدة."
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-5 rounded-xl shadow-sm transition-all"
          >
            <MessageCircle size={15} />
            <span>تواصل مع الدعم للمساعدة الفورية عبر واتساب</span>
          </a>
        </div>
      ) : (
        <div className="bg-gray-50/70 border border-dashed border-gray-300 rounded-3xl p-8 text-center text-gray-500 text-xs">
          <Package size={32} className="mx-auto text-gray-400 mb-2" />
          <p className="font-bold text-gray-700 mb-1">اكتب رقم طلبك في الخانة أعلاه لعرض موقفه</p>
          <p className="text-gray-400">يتم تحديث حالات الطلبات لحظة بلحظة بعد تأكيد التحويل المالي.</p>
        </div>
      )}

      {/* License Certificate Modal */}
      {showCertProduct && (
        <LicenseCertificateModal
          product={showCertProduct}
          buyerName={selectedOrder?.buyerName || 'العميل الموقر'}
          orderNumber={selectedOrder?.id}
          onClose={() => setShowCertProduct(null)}
        />
      )}

    </div>
  );
}
