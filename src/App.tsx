import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { LandingPage } from './components/LandingPage';
import { ProductCard } from './components/ProductCard';
import { CheckoutModal } from './components/CheckoutModal';
import { CategoryFilter } from './components/CategoryFilter';

import { UserLibrary } from './components/UserLibrary';
import { LocalSellers } from './components/LocalSellers';
import { AdminDashboard } from './components/AdminDashboard';
import { OrderTracking } from './components/OrderTracking';
import { TermsAndRefundModal } from './components/TermsAndRefundModal';
import { LiveSalesNotification } from './components/LiveSalesNotification';
import { WhitelabelPreviewModal } from './components/WhitelabelPreviewModal';
import { TopRibbonAd, MidFeedAdBanner, SponsoredProductCard, AdvertiseModal } from './components/AdBanner';
import { SearchAndSortBar, SortOption } from './components/SearchAndSortBar';
import { FloatingSupportWidget } from './components/FloatingSupportWidget';
import { CurrencyProvider, useCurrency } from './context/CurrencyContext';
import { products as initialProducts, categories } from './data';
import { Product, Order } from './types';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { auth, googleProvider } from './lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ProductPage } from './pages/ProductPage';

export default function App() {
  return (
    <CurrencyProvider>
      <MainApp />
    </CurrencyProvider>
  );
}

function MainApp() {
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation & Auth state
  const [user, setUser] = useState<User | null>(null);
  const [isAdvertiseOpen, setIsAdvertiseOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const isLoggedIn = !!user;

  // Dynamic products list (allows adding/deleting via Admin panel)
  const [productsList, setProductsList] = useState<Product[]>(() => {
    const saved = localStorage.getItem('custom_saas_products');
    if (saved) {
      try {
        const customItems = JSON.parse(saved);
        return [...customItems, ...initialProducts];
      } catch (e) {
        return initialProducts;
      }
    }
    return initialProducts;
  });

  // Orders State (Persisted in localStorage with realistic initial sample orders)
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('micro_saas_store_orders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return [
      {
        id: '#ORD-849201',
        productId: 'tax-eta-prep',
        productTitle: 'مُهيئ وفاحص فواتير ETA JSON',
        buyerName: 'م. أحمد ممدوح',
        buyerEmail: 'ahmed.mamdouh@gmail.com',
        buyerPhone: '01012345678',
        senderAccount: '01012345678 (فودافون كاش)',
        amountEgp: 1450,
        amountUsd: 29,
        createdAt: 'اليوم، 09:30 ص',
        status: 'pending'
      },
      {
        id: '#ORD-719324',
        productId: 'lead-magnet-creator',
        productTitle: 'صانع الكتب وصفحات الهبوط المغناطيسية',
        buyerName: 'طارق حسام (وكالة كريتيف)',
        buyerEmail: 'tarek@creative-agency.com',
        buyerPhone: '01298765432',
        senderAccount: 'tarek@instapay (إنستاباي)',
        amountEgp: 1450,
        amountUsd: 29,
        createdAt: 'أمس، 04:15 م',
        status: 'completed'
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('micro_saas_store_orders', JSON.stringify(orders));
    } catch (e) {}
  }, [orders]);

  const handleOrderCreated = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  // Tools/Products state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [whitelabelProduct, setWhitelabelProduct] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  // Purchased products state (from DB)
  const [purchasedIds, setPurchasedIds] = useState<string[]>([]);
  const purchasedProducts = useMemo(() => productsList.filter(p => purchasedIds.includes(p.id)), [productsList, purchasedIds]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          
          // Sync user with backend
          await fetch('/api/auth/sync', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          // Check if returning from Stripe checkout
          const params = new URLSearchParams(window.location.search);
          const sessionId = params.get('session_id');
          const productId = params.get('product_id');
          const success = params.get('success');

          if (success === 'true' && sessionId && productId) {
            const verifyRes = await fetch('/api/verify-session', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ session_id: sessionId, product_id: productId })
            });

            if (verifyRes.ok) {
              navigate('/library');
              // Clear URL params
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          }

          // Fetch user's purchases
          const res = await fetch('/api/purchases', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (res.ok) {
            const ids = await res.json();
            setPurchasedIds(ids);
          }
        } catch (error) {
          console.error("Error syncing user or fetching purchases", error);
        }
      } else {
        setPurchasedIds([]);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/store');
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleNavigate = (view: 'landing' | 'home' | 'library' | 'local-sellers' | 'admin' | 'tracking') => {
    if ((view === 'library' || view === 'local-sellers') && !isLoggedIn) {
      handleLogin();
      return;
    }
    
    switch (view) {
      case 'landing': navigate('/'); break;
      case 'home': navigate('/store'); break;
      case 'library': navigate('/library'); break;
      case 'local-sellers': navigate('/local-sellers'); break;
      case 'admin': navigate('/admin'); break;
      case 'tracking': navigate('/tracking'); break;
      default: navigate('/'); break;
    }
  };

  const currentView = location.pathname === '/' ? 'landing' :
                      location.pathname === '/store' ? 'home' :
                      location.pathname === '/library' ? 'library' :
                      location.pathname === '/local-sellers' ? 'local-sellers' :
                      location.pathname === '/admin' ? 'admin' :
                      location.pathname === '/tracking' ? 'tracking' : 'home';

  const handleAddProduct = (newProduct: Product) => {
    setProductsList(prev => {
      const updated = [newProduct, ...prev];
      const customOnes = updated.filter(p => p.id.startsWith('custom-saas-'));
      try { localStorage.setItem('custom_saas_products', JSON.stringify(customOnes)); } catch (e) {}
      return updated;
    });
    alert('تمت إضافة أداة الـ SaaS الجديدة بنجاح للمتجر!');
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الأداة من المتجر؟')) {
      setProductsList(prev => {
        const updated = prev.filter(p => p.id !== productId);
        const customOnes = updated.filter(p => p.id.startsWith('custom-saas-'));
        try { localStorage.setItem('custom_saas_products', JSON.stringify(customOnes)); } catch (e) {}
        return updated;
      });
    }
  };

  // Pagination settings & Search/Sort
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const itemsPerPage = 11; // 11 items + 1 sponsored card = 12 total items per page

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery, sortBy]);

  const filteredProducts = useMemo(() => {
    let result = [...productsList];

    // Filter by Category
    if (activeCategory !== 'all') {
      result = result.filter(product => product.categoryId === activeCategory);
    }

    // Filter by Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(product => 
        product.title.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q) ||
        product.features.some(f => f.toLowerCase().includes(q))
      );
    }

    // Sorting logic
    if (sortBy === 'sales') {
      result.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 5.0) - (a.rating || 5.0));
    } else if (sortBy === 'price_low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_high') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [activeCategory, searchQuery, sortBy, productsList]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans" dir="rtl">
      
      {/* 🚀 Top Global Sponsored Ribbon (Monetization) */}
      <TopRibbonAd onOpenAdvertise={() => setIsAdvertiseOpen(true)} />

      {/* Main Header */}
      <Header 
        currentView={currentView}
        onNavigate={handleNavigate}
        isLoggedIn={isLoggedIn}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onOpenAdvertise={() => setIsAdvertiseOpen(true)}
      />
      
      <main className="flex-grow flex flex-col">
        <Routes>
          <Route path="/" element={
              <LandingPage
                products={productsList}
                onEnterStore={() => navigate('/store')}
                onLogin={handleLogin}
                onOpenRadar={() => handleNavigate('local-sellers')}
                onBuyProduct={setSelectedProduct}
                onDemoProduct={(p) => navigate(`/product/${p.id}`)}
                onWhitelabelProduct={setWhitelabelProduct}
                onOpenAdvertise={() => setIsAdvertiseOpen(true)}
                isLoggedIn={isLoggedIn}
                userName={user?.displayName || user?.email?.split('@')[0]}
              />
          } />
          
          <Route path="/product/:id" element={
            <ProductPage 
              productsList={productsList} 
              onOrderCreated={handleOrderCreated}
            />
          } />
          
          <Route path="/store" element={
            <>
              <Hero 
                onExploreClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                onOpenRadar={() => handleNavigate('local-sellers')}
              />
              
              <section id="products" className="py-16 bg-gray-50 scroll-mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="mb-10 text-center">
                    <h2 className="text-3xl font-black text-gray-950 mb-3">
                      كتالوج أدوات المايكرو ساس 
                      <span className="text-indigo-600 text-sm mx-2 bg-indigo-50 px-3 py-1 rounded-full font-bold border border-indigo-100">
                        ({productsList.length} أداة جاهزة)
                      </span>
                    </h2>
                    <p className="text-gray-600 text-sm max-w-2xl mx-auto mb-8">
                      تصفح جميع الأدوات، جربها حياً، واحصل على الكود المصدري كاملاً فوراً بدون اشتراكات شهرية.
                    </p>
                    
                    <CategoryFilter 
                      categories={categories} 
                      activeCategoryId={activeCategory} 
                      onSelectCategory={setActiveCategory} 
                    />
                  </div>

                  {/* 🔍 Search and Sorting Bar */}
                  <SearchAndSortBar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    totalResults={filteredProducts.length}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {currentProducts.map((product, idx) => (
                      <React.Fragment key={product.id}>
                        <ProductCard 
                          product={product} 
                          onBuy={setSelectedProduct} 
                          onDemo={(p) => navigate(`/product/${p.id}`)}
                          onWhitelabel={setWhitelabelProduct}
                        />
                        {/* Place sponsored ad card seamlessly at position 3 */}
                        {idx === 2 && (
                          <SponsoredProductCard onOpenAdvertise={() => setIsAdvertiseOpen(true)} />
                        )}
                      </React.Fragment>
                    ))}
                    {currentProducts.length > 0 && currentProducts.length < 3 && (
                      <SponsoredProductCard onOpenAdvertise={() => setIsAdvertiseOpen(true)} />
                    )}
                  </div>
                  
                  {/* Mid-Feed Banner */}
                  <MidFeedAdBanner onOpenAdvertise={() => setIsAdvertiseOpen(true)} />

                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-8">
                      <button 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight size={20} />
                      </button>
                      
                      <div className="flex gap-1 overflow-x-auto max-w-[200px] sm:max-w-none scrollbar-hide px-2">
                        {Array.from({ length: totalPages }).map((_, index) => {
                          const pageNum = index + 1;
                          const isNear = Math.abs(pageNum - currentPage) <= 2;
                          const isEdge = pageNum === 1 || pageNum === totalPages;
                          
                          if (!isNear && !isEdge) {
                            if (pageNum === 2 || pageNum === totalPages - 1) {
                              return <span key={pageNum} className="px-2 text-gray-400">...</span>;
                            }
                            return null;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`w-10 h-10 rounded-xl text-sm font-bold transition-colors shrink-0 ${
                                currentPage === pageNum
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button 
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft size={20} />
                      </button>
                    </div>
                  )}
                  
                  {filteredProducts.length === 0 && (
                    <div className="text-center py-20 text-gray-500 bg-white rounded-3xl border border-gray-200">
                      <p className="text-base font-bold text-gray-800 mb-1">لم نتمكن من العثور على أداة مطابقة لبحثك</p>
                      <p className="text-xs text-gray-500">جرب كتابة كلمة أخرى أو تصفية تصنيف مختلف.</p>
                    </div>
                  )}
                </div>
              </section>
            </>
          } />
          
          <Route path="/library" element={
            <UserLibrary 
              purchasedProducts={purchasedProducts} 
              onOpenTool={(p) => navigate(`/product/${p.id}`)}
              userName={user?.displayName || user?.email?.split('@')[0] || 'عميلنا العزيز'}
            />
          } />
          
          <Route path="/local-sellers" element={<LocalSellers />} />
          
          <Route path="/tracking" element={
            <OrderTracking 
              orders={orders}
              products={productsList}
              onOpenTool={(p) => navigate(`/product/${p.id}`)}
            />
          } />
          
          <Route path="/admin" element={
            <AdminDashboard
              products={productsList}
              orders={orders}
              onAddProduct={handleAddProduct}
              onDeleteProduct={handleDeleteProduct}
              onUpdateOrderStatus={handleUpdateOrderStatus}
            />
          } />
        </Routes>
      </main>

      {/* 💬 Floating WhatsApp & Quick Support Widget */}
      <FloatingSupportWidget />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-10 mt-auto" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-500 text-xs">
          <div>
            <p className="font-bold text-gray-800">سوق ساس — منصة برمجيات المايكرو ساس والذكاء الاصطناعي</p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              شراء لمرة واحدة مدى الحياة مع الكود المصدري الكامل. التسليم خلال 24 ساعة للتحويلات على 01142099605.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsTermsOpen(true)}
              className="text-gray-600 hover:text-indigo-600 font-bold underline transition-colors"
            >
              شروط الترخيص وسياسة التسليم والاسترجاع
            </button>
            <span className="text-gray-300">|</span>
            <button 
              onClick={() => setIsAdvertiseOpen(true)}
              className="text-amber-700 hover:text-amber-800 font-bold bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200"
            >
              فرص الإعلان والرعاية
            </button>
            <p>© {new Date().getFullYear()} جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>

      {/* 💳 Checkout Modal */}
      {selectedProduct && (
        <CheckoutModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
          onOrderCreated={handleOrderCreated}
        />
      )}



      {/* 🎛️ White-Label Branding Simulator Modal */}
      {whitelabelProduct && (
        <WhitelabelPreviewModal
          product={whitelabelProduct}
          onClose={() => setWhitelabelProduct(null)}
          onOrderProduct={(p) => {
            setWhitelabelProduct(null);
            setSelectedProduct(p);
          }}
        />
      )}

      {/* 📢 Advertise Opportunities Modal */}
      <AdvertiseModal 
        isOpen={isAdvertiseOpen} 
        onClose={() => setIsAdvertiseOpen(false)} 
      />

      {/* 🛡️ Terms & Refund Policy Modal */}
      <TermsAndRefundModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />

      {/* 🔔 Live Social Proof Sales Notification */}
      <LiveSalesNotification
        products={productsList}
        onSelectProduct={(prod) => setSelectedProduct(prod)}
      />
    </div>
  );
}
