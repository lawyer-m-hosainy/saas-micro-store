import React, { useState, useEffect } from 'react';
import { ShoppingCart, Zap, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import { Product } from '../types';

interface LiveSalesNotificationProps {
  products: Product[];
  onSelectProduct?: (product: Product) => void;
}

interface SaleNotificationData {
  city: string;
  customerName: string;
  timeAgo: string;
  product: Product;
}

const EGYPT_CITIES = [
  'القاهرة (المعادي)',
  'الجيزة (الدقي)',
  'الإسكندرية (سموحة)',
  'المنصورة',
  'طنطا',
  'الرياض (السعودية)',
  'دبي (الإمارات)',
  'القاهرة الجديدة (التجمع)',
  'الشيخ زايد',
  'الزقازيق',
  'أسيوط',
  'بورسعيد'
];

const BUYER_NAMES = [
  'م. طارق',
  'أحمد ح.',
  'شركة الأفق للبرمجيات',
  'م. كريم الشافعي',
  'سارة م.',
  'وكالة فيوتشر ميديا',
  'م. عمر عبد العزيز',
  'د. مصطفى الجوهري',
  'محمود ن.',
  'م. يوسف خليل'
];

const TIME_AGOS = [
  'منذ 4 دقائق',
  'منذ 9 دقائق',
  'منذ 14 دقيقة',
  'منذ 21 دقيقة',
  'منذ 35 دقيقة',
  'منذ ساعة',
  'منذ بضع دقائق'
];

export function LiveSalesNotification({ products, onSelectProduct }: LiveSalesNotificationProps) {
  const [currentNotification, setCurrentNotification] = useState<SaleNotificationData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (!products || products.length === 0 || isDismissed) return;

    // Trigger first popup after 4 seconds
    const initialTimer = setTimeout(() => {
      showRandomSale();
    }, 4000);

    // Recurring popup every 16-24 seconds
    const interval = setInterval(() => {
      showRandomSale();
    }, 18000);

    function showRandomSale() {
      if (isDismissed) return;

      const randomProduct = products[Math.floor(Math.random() * products.length)];
      const randomCity = EGYPT_CITIES[Math.floor(Math.random() * EGYPT_CITIES.length)];
      const randomBuyer = BUYER_NAMES[Math.floor(Math.random() * BUYER_NAMES.length)];
      const randomTime = TIME_AGOS[Math.floor(Math.random() * TIME_AGOS.length)];

      setCurrentNotification({
        city: randomCity,
        customerName: randomBuyer,
        timeAgo: randomTime,
        product: randomProduct
      });

      setIsVisible(true);

      // Hide after 6.5 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 6500);
    }

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [products, isDismissed]);

  if (!currentNotification || isDismissed) return null;

  return (
    <div 
      className={`fixed bottom-5 right-5 z-40 max-w-sm w-[calc(100vw-2.5rem)] sm:w-auto transition-all duration-500 transform ${
        isVisible ? 'translate-y-0 opacity-100 scale-100 pointer-events-auto' : 'translate-y-6 opacity-0 scale-95 pointer-events-none'
      }`}
      dir="rtl"
    >
      <div className="bg-white/95 backdrop-blur-md border border-gray-200/90 shadow-2xl rounded-2xl p-3.5 sm:p-4 text-right flex items-start gap-3 relative group hover:border-indigo-300 transition-colors">
        
        {/* Dismiss Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsVisible(false);
            setIsDismissed(true);
          }}
          className="absolute top-2 left-2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
          title="إخفاء الإشعارات"
        >
          <X size={13} />
        </button>

        {/* Pulse Icon Avatar */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center flex-shrink-0 shadow-md relative">
          <Zap size={20} className="fill-amber-300 text-amber-300" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-white"></span>
          </span>
        </div>

        {/* Notification Text */}
        <div className="flex-1 pr-0.5">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-0.5">
            <span className="font-bold text-gray-900">{currentNotification.customerName}</span>
            <span>من</span>
            <span className="text-indigo-600 font-semibold">{currentNotification.city}</span>
          </div>

          <div 
            onClick={() => onSelectProduct?.(currentNotification.product)}
            className="text-xs font-bold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-1 cursor-pointer"
          >
            اشترى: {currentNotification.product.title}
          </div>

          <div className="flex items-center justify-between gap-2 mt-1 text-[10px] text-gray-400 font-medium">
            <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/50 flex items-center gap-1">
              <CheckCircle2 size={10} className="text-emerald-600" />
              تم التحويل والترخيص
            </span>
            <span className="font-mono">{currentNotification.timeAgo}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
