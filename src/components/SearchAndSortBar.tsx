import React from 'react';
import { Search, X, SlidersHorizontal, ArrowUpDown, Sparkles } from 'lucide-react';

export type SortOption = 'default' | 'newest' | 'oldest' | 'sales' | 'rating' | 'price_low' | 'price_high';

interface SearchAndSortBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalResults: number;
}

export function SearchAndSortBar({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  totalResults
}: SearchAndSortBarProps) {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs mb-8 flex flex-col md:flex-row items-center justify-between gap-4" dir="rtl">
      
      {/* Search Input */}
      <div className="relative w-full md:w-96 flex-1">
        <Search size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ابحث بالاسم، الكلمة المفتاحية، أو مجال العمل (مثال: سيو، عقارات، واتساب)..."
          className="w-full pr-10 pl-10 py-3 bg-gray-50 hover:bg-gray-100/80 focus:bg-white text-gray-900 placeholder-gray-400 text-xs sm:text-sm rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Sort By & Results Count */}
      <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 w-full md:w-auto text-xs">
        
        {/* Results Badge */}
        <div className="text-gray-500 font-medium">
          النتائج المعروضة: <strong className="text-indigo-600 font-bold font-mono">{totalResults}</strong> أداة
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
          <ArrowUpDown size={14} className="text-gray-500 mr-1" />
          <span className="text-gray-500 font-medium hidden sm:inline">ترتيب حسب:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="bg-transparent text-gray-800 font-bold focus:outline-none cursor-pointer pr-1 text-xs"
          >
            <option value="default">الترتيب الافتراضي</option>
            <option value="newest">الأحدث إضافة 🆕</option>
            <option value="oldest">الأقدم 🕰️</option>
            <option value="sales">الأعلى مبيعاً 🔥</option>
            <option value="rating">الأعلى تقييماً ⭐</option>
            <option value="price_low">الأقل سعراً (من الأرخص) 💵</option>
            <option value="price_high">الأعلى سعراً (الحزم الأكبر) 💎</option>
          </select>
        </div>

      </div>

    </div>
  );
}
