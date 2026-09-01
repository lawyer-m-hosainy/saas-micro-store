import React from 'react';
import { 
  ShoppingBag, 
  User, 
  LogOut, 
  LayoutDashboard, 
  MapPin, 
  ShieldCheck, 
  Megaphone,
  Globe2,
  Sparkles,
  Layers
} from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

interface HeaderProps {
  currentView?: 'landing' | 'home' | 'library' | 'local-sellers' | 'admin' | 'tracking' | 'blog';
  onNavigate?: (view: 'landing' | 'home' | 'library' | 'local-sellers' | 'admin' | 'tracking' | 'blog') => void;
  isLoggedIn?: boolean;
  onLogin?: () => void;
  onLogout?: () => void;
  onOpenAdvertise?: () => void;
}

export function Header({ 
  currentView = 'landing', 
  onNavigate, 
  isLoggedIn = false, 
  onLogin, 
  onLogout,
  onOpenAdvertise
}: HeaderProps) {
  const { currency, setCurrency } = useCurrency();

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-xs" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-2">
          
          {/* Logo & Brand */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer" 
            onClick={() => onNavigate?.('landing')}
          >
            <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-xs">
              <ShoppingBag size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-black text-gray-950 leading-none">سوق ساس</span>
              <span className="text-[10px] text-gray-400 font-medium mt-0.5">Micro SaaS Hub</span>
            </div>
          </div>
          
          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex space-x-6 space-x-reverse items-center">
            
            <button 
              onClick={() => onNavigate?.('landing')} 
              className={`font-bold transition-colors text-xs sm:text-sm ${
                currentView === 'landing' ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              صفحة الهبوط
            </button>

            <button 
              onClick={() => onNavigate?.('blog')} 
              className={`font-bold transition-colors text-xs sm:text-sm flex items-center gap-1 ${
                currentView === 'blog' ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              المدونة
            </button>

            <button 
              onClick={() => onNavigate?.('home')} 
              className={`font-bold transition-colors text-xs sm:text-sm flex items-center gap-1 ${
                currentView === 'home' ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              <Layers size={15} />
              المتجر الكامل
            </button>

            <button 
              onClick={() => onNavigate?.('tracking')}
              className={`flex items-center gap-1 font-bold transition-colors text-xs sm:text-sm ${
                currentView === 'tracking' ? 'text-indigo-600 font-black' : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              <span>تتبع طلبي والكود</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                24 ساعة
              </span>
            </button>

            <button 
              onClick={() => onNavigate?.('local-sellers')}
              className={`flex items-center gap-1 font-bold transition-colors text-xs sm:text-sm ${
                currentView === 'local-sellers' ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              <MapPin size={15} />
              رادار المحلات (5 كم)
            </button>

            <button 
              onClick={() => onNavigate?.('admin')}
              className={`flex items-center gap-1 font-bold transition-colors text-xs sm:text-sm ${
                currentView === 'admin' ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'
              }`}
            >
              <ShieldCheck size={15} />
              لوحة الإدارة
            </button>

            {/* Advertise Button */}
            <button 
              onClick={onOpenAdvertise}
              className="flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100/70 hover:bg-amber-200/80 px-2.5 py-1.5 rounded-xl transition-colors border border-amber-200"
            >
              <Megaphone size={13} />
              أعلن معنا
            </button>
            
            <div className="border-r border-gray-200 h-5 mx-1"></div>

            {/* Currency Switcher */}
            <div className="flex items-center bg-gray-100 p-0.5 rounded-xl border border-gray-200 text-xs font-bold">
              <button
                onClick={() => setCurrency('EGP')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  currency === 'EGP' 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="التحويل للجنيه المصري"
              >
                ج.م
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  currency === 'USD' 
                    ? 'bg-indigo-600 text-white shadow-xs' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="التحويل للدولار الأمريكي"
              >
                $
              </button>
            </div>
            
            {/* Auth Buttons */}
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onNavigate?.('library')}
                  className={`flex items-center gap-1.5 font-bold text-xs sm:text-sm px-3 py-1.5 rounded-xl transition-all ${
                    currentView === 'library' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <LayoutDashboard size={15} />
                  مكتبتي
                </button>
                <button 
                  onClick={onLogout}
                  className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-bold bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl transition-colors"
                >
                  <LogOut size={14} />
                  خروج
                </button>
              </div>
            ) : (
              <button 
                onClick={onLogin}
                className="flex items-center gap-1.5 bg-gray-950 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-gray-800 transition-colors shadow-xs"
              >
                <User size={15} />
                تسجيل الدخول
              </button>
            )}
          </nav>

          {/* Mobile Navigation controls */}
          <div className="flex md:hidden items-center gap-1.5">
            
            {/* Quick Currency Toggle for Mobile */}
            <button
              onClick={() => setCurrency(currency === 'EGP' ? 'USD' : 'EGP')}
              className="text-[11px] font-bold bg-gray-100 border border-gray-200 px-2 py-1 rounded-lg"
            >
              {currency === 'EGP' ? '🇪🇬 ج.م' : '💵 $'}
            </button>

            <button 
              onClick={onOpenAdvertise}
              className="p-1.5 rounded-lg text-amber-700 bg-amber-50"
              title="أعلن معنا"
            >
              <Megaphone size={16} />
            </button>

            <button 
              onClick={() => onNavigate?.(currentView === 'landing' ? 'home' : 'landing')}
              className="p-1.5 rounded-lg text-gray-700 bg-gray-100 text-xs font-bold"
            >
              {currentView === 'landing' ? 'المتجر' : 'الهبوط'}
            </button>

            {isLoggedIn ? (
              <>
                <button 
                  onClick={() => onNavigate?.('library')}
                  className={`p-1.5 rounded-lg ${currentView === 'library' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600'}`}
                  title="مكتبتي"
                >
                  <LayoutDashboard size={17} />
                </button>
                <button onClick={onLogout} className="p-1.5 text-red-500 rounded-lg" title="تسجيل خروج">
                  <LogOut size={17} />
                </button>
              </>
            ) : (
              <button 
                onClick={onLogin}
                className="text-xs bg-gray-950 text-white px-3 py-1.5 rounded-lg font-bold"
              >
                دخول
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
