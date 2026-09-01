import React from 'react';
import { Product } from '../types';
import * as Icons from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

interface ProductCardProps {
  product: Product;
  onBuy: (product: Product) => void;
  onDemo: (product: Product) => void;
  onWhitelabel?: (product: Product) => void;
}

export function ProductCard({ product, onBuy, onDemo, onWhitelabel }: ProductCardProps) {
  const { formatPrice, currency } = useCurrency();
  // Dynamically get the icon component from lucide-react
  const IconComponent = (Icons as any)[product.icon] || Icons.Box;

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6 sm:p-8 flex flex-col h-full hover:shadow-md transition-all hover:border-indigo-100 relative group overflow-hidden" dir="rtl">
      
      {/* 📱 Mobile-First Quick Buy & Whitelabel Floating Chips */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
        {onWhitelabel && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onWhitelabel(product);
            }}
            className="bg-gray-100 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 p-1.5 rounded-full border border-gray-200 shadow-xs transition-all active:scale-95"
            title="تخصيص الهوية التجارية والشعار (White-Label)"
          >
            <Icons.Palette size={13} />
          </button>
        )}

        <div className="sm:hidden">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBuy(product);
            }}
            className="bg-amber-400 hover:bg-amber-500 text-gray-950 text-[11px] font-black px-2.5 py-1.5 rounded-full shadow-md flex items-center gap-1 active:scale-95 transition-all animate-pulse"
            title="شراء سريع فوري"
          >
            <Icons.Zap size={13} className="fill-gray-950 text-gray-950" />
            <span>شراء</span>
          </button>
        </div>
      </div>

      {/* Header & Icon */}
      <div className="flex items-start justify-between gap-3 mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-50 p-2.5 sm:p-3 rounded-xl text-indigo-600 group-hover:scale-105 transition-transform flex-shrink-0">
            <IconComponent size={26} strokeWidth={1.5} />
          </div>
          <div className="pr-1">
            <h3 className="text-lg sm:text-xl font-black text-gray-900 leading-tight">{product.title}</h3>
            <span className="text-[10px] sm:text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1 border border-emerald-200/60">
              ترخيص تجاري مدى الحياة
            </span>
          </div>
        </div>
      </div>
      
      <p className="text-gray-600 mb-5 flex-grow text-xs sm:text-sm leading-relaxed">{product.description}</p>
      
      <ul className="space-y-2 mb-6">
        {product.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <Icons.CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span className="text-xs sm:text-sm text-gray-700 font-medium">{feature}</span>
          </li>
        ))}
      </ul>
      
      <div className="mt-auto pt-4 sm:pt-6 border-t border-gray-100">
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <div className="text-xl sm:text-2xl font-black text-gray-950 font-mono">
              {formatPrice(product.price)}
            </div>
            <span className="text-[10px] sm:text-[11px] text-gray-500 font-medium">
              دفع لمرة واحدة للأبد (شراء الكود كاملاً)
            </span>
          </div>

          {currency === 'EGP' && (
            <span className="text-[10px] sm:text-[11px] text-indigo-700 font-black bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
              وفر 90%
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* زر الشراء المباشر */}
          <button
            onClick={() => onBuy(product)}
            className="bg-indigo-950 hover:bg-indigo-900 text-white px-3 py-2.5 rounded-xl font-black transition-all flex items-center justify-center gap-1.5 text-xs sm:text-sm shadow-md active:scale-95"
          >
            <Icons.Zap size={15} className="text-amber-400 fill-amber-400" />
            <span>شراء سريع</span>
          </button>
          
          {/* زر الاستعراض التجريبي (Demo) */}
          <button
            onClick={() => onDemo(product)}
            className="bg-indigo-50 text-indigo-800 border border-indigo-200/80 px-3 py-2.5 rounded-xl font-bold hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1.5 text-xs sm:text-sm active:scale-95"
          >
            <Icons.Eye size={15} />
            <span>تجربة حية</span>
          </button>
        </div>
      </div>
    </div>
  );
}
