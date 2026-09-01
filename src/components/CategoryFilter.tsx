import React, { useRef } from 'react';
import { Category } from '../types';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface CategoryFilterProps {
  categories: Category[];
  activeCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
}

/**
 * فريق التطوير: 
 * تم تحديث هذا المكون ليدعم التمرير الأفقي (Horizontal Scroll) 
 * لأن عدد التصنيفات أصبح كبيراً (25 تصنيف).
 */
export function CategoryFilter({ categories, activeCategoryId, onSelectCategory }: CategoryFilterProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      // بما أن الموقع باللغة العربية (RTL)، الاتجاهات تكون معكوسة برمجياً في الـ scroll
      const scrollAmount = direction === 'right' ? -300 : 300;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative mb-10 w-full max-w-5xl mx-auto flex items-center group">
      
      {/* زر التمرير يمين */}
      <button 
        onClick={() => scroll('right')}
        className="absolute right-0 z-10 bg-white/90 shadow-md p-2 rounded-full border border-gray-100 text-gray-600 hover:text-indigo-600 md:hidden group-hover:flex translate-x-3 backdrop-blur-sm"
      >
        <ChevronRight size={20} />
      </button>

      {/* الحاوية القابلة للتمرير */}
      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto gap-2 py-2 px-4 scrollbar-hide scroll-smooth w-full"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // لإخفاء شريط التمرير في المتصفحات
      >
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium transition-all shrink-0 ${
              activeCategoryId === category.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* زر التمرير يسار */}
      <button 
        onClick={() => scroll('left')}
        className="absolute left-0 z-10 bg-white/90 shadow-md p-2 rounded-full border border-gray-100 text-gray-600 hover:text-indigo-600 md:hidden group-hover:flex -translate-x-3 backdrop-blur-sm"
      >
        <ChevronLeft size={20} />
      </button>
    </div>
  );
}
