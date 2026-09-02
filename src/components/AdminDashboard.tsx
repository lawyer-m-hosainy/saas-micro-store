import React, { useState, useEffect } from 'react';
import { Product, Order } from '../types';
import { DollarSign, ShoppingBag, Plus, Search, Download, CheckCircle2, Trash2, Layers, ArrowUpRight, ShieldCheck, Zap, Clock, Mail, Phone, Award, Send } from 'lucide-react';
import { SUPPORT_PHONE, WHATSAPP_NUMBER } from '../config/constants';
import { LicenseCertificateModal } from './LicenseCertificateModal';
import { downloadProductZip } from '../utils/zipGenerator';

interface Props {
  products: Product[];
  orders: Order[];
  onAddProduct: (newProduct: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
}

export function AdminDashboard({ 
  products, 
  orders, 
  onAddProduct, 
  onDeleteProduct,
  onUpdateOrderStatus
}: Props) {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'coupons'>('orders');
  const [coupons, setCoupons] = useState<any[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  
  useEffect(() => {
    if (activeTab === 'coupons') {
      fetchCoupons();
    }
  }, [activeTab]);

  const fetchCoupons = async () => {
    try {
      const { auth } = await import('../lib/firebase');
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      const res = await fetch('/api/coupons', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setCoupons(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode || !discountPercent) return;
    try {
      const { auth } = await import('../lib/firebase');
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ code: couponCode, discountPercent })
      });
      if (res.ok) {
        setCouponCode('');
        setDiscountPercent('');
        fetchCoupons();
      }
    } catch (e) {
      console.error(e);
    }
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [certProduct, setCertProduct] = useState<Product | null>(null);
  const [certOrder, setCertOrder] = useState<Order | null>(null);
  
  // Real or simulated live sales stats
  const totalProducts = products.length;
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const completedOrdersCount = orders.filter(o => o.status === 'completed').length;
  const totalRevenueEgp = orders.reduce((sum, o) => sum + o.amountEgp, 0);

  // Add Product Form State
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('29');
  const [newCategory, setNewCategory] = useState('marketing');
  const [newDescription, setNewDescription] = useState('');
  const [newFeatures, setNewFeatures] = useState('تكامل ذكاء اصطناعي فوري, لوحة تحكم عصرية, دعم فني مجاني');

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.includes(searchTerm) || p.description.includes(searchTerm);
    const matchesCat = selectedCat === 'all' || p.categoryId === selectedCat;
    return matchesSearch && matchesCat;
  });

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.buyerPhone.includes(searchTerm) ||
    o.productTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    const product: Product = {
      id: `custom-saas-${Date.now()}`,
      title: newTitle,
      description: newDescription,
      price: parseFloat(newPrice) || 29,
      categoryId: newCategory,
      features: newFeatures.split(',').map(f => f.trim()).filter(Boolean),
      icon: 'Box',
      demoComponent: 'generic',
      rating: 5.0,
      salesCount: 0
    };

    onAddProduct(product);
    setShowAddModal(false);
    // Reset form
    setNewTitle('');
    setNewDescription('');
    setNewPrice('29');
  };

  const handleFulfillOrder = (order: Order) => {
    onUpdateOrderStatus(order.id, 'completed');
    
    // Generate WhatsApp direct delivery link
    const waText = `مرحباً ${order.buyerName}،
تم تأكيد استلام تحويلك بنجاح لشراء أداة:
*${order.productTitle}*

رقم طلبك: ${order.id}
تم تفعيل ترخيصك التجاري الرسمي مدى الحياة.
يرجى تحميل الكود المصدري وشهادة الترخيص من صفحة تتبع الطلبات أو عبر الرابط المباشر. شكراً لتعاملك معنا!`;

    window.open(`https://wa.me/2${order.buyerPhone.replace(/^0+/, '')}?text=${encodeURIComponent(waText)}`, '_blank');
  };

  return (
    <div className="py-10 bg-gray-50 min-h-[calc(100vh-64px)] animate-in fade-in duration-300" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <ShieldCheck size={14} />
                لوحة تحكم الإدارة (Admin Panel)
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900">إدارة المتجر والطلبات الواردة</h1>
            <p className="text-gray-500 text-sm mt-1">متابعة التحويلات على رقم {SUPPORT_PHONE}، وتأكيد الطلبات وإرسال التراخيص للزبائن.</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Tab Toggle */}
            <div className="bg-gray-200/80 p-1 rounded-xl flex items-center gap-1 text-xs font-bold">
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'orders'
                    ? 'bg-indigo-900 text-white shadow-sm'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                <Clock size={15} />
                <span>الطلبات الواردة ({orders.length})</span>
                {pendingOrdersCount > 0 && (
                  <span className="bg-amber-400 text-gray-950 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                    {pendingOrdersCount} جديد
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('products')}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'products'
                    ? 'bg-indigo-900 text-white shadow-sm'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                <Layers size={15} />
                <span>الكتالوج والأدوات ({products.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('coupons')}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'coupons'
                    ? 'bg-indigo-900 text-white shadow-sm'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                <DollarSign size={15} />
                <span>الكوبونات والخصومات</span>
              </button>
            </div>

            {activeTab === 'products' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm text-xs"
              >
                <Plus size={16} />
                إضافة أداة جديدة
              </button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-400 block mb-1">إجمالي المبيعات (ج.م)</span>
              <div className="text-2xl font-black text-gray-900">{totalRevenueEgp.toLocaleString()} ج.م</div>
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
                <ArrowUpRight size={13} /> تحويلات إنستاباي ومحافظ
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign size={24} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-400 block mb-1">طلبات قيد المراجعة</span>
              <div className="text-2xl font-black text-amber-600">{pendingOrdersCount}</div>
              <span className="text-xs text-amber-600 font-bold flex items-center gap-0.5 mt-1">
                <Clock size={13} /> مطلوب تأكيد وتسليم
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={24} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-400 block mb-1">طلبات مكتملة ومسلمة</span>
              <div className="text-2xl font-black text-emerald-700">{completedOrdersCount}</div>
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
                <CheckCircle2 size={13} /> تم تسليم الـ ZIP والترخيص
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShoppingBag size={24} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-400 block mb-1">البرمجيات في الكتالوج</span>
              <div className="text-2xl font-black text-gray-900">{totalProducts}</div>
              <span className="text-xs text-blue-600 font-bold flex items-center gap-0.5 mt-1">
                <Zap size={13} /> 35 قسماً تخصصياً
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers size={24} />
            </div>
          </div>

        </div>

        {/* Tab 1: Orders Management */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">سجل طلبات الشراء والتحويلات</h3>
                <p className="text-xs text-gray-400">تأكيد مطابقة الإيداع لرقم {SUPPORT_PHONE} وإرسال الكود للعميل فوراً.</p>
              </div>

              <div className="w-full sm:w-72 relative">
                <input
                  type="text"
                  placeholder="بحث برقم الطلب، الاسم، أو الهاتف..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
                <Search size={16} className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-200">
                  <tr>
                    <th className="p-4">رقم الطلب والتاريخ</th>
                    <th className="p-4">بيانات المشتري</th>
                    <th className="p-4">الأداة والمبلغ</th>
                    <th className="p-4">الحساب المحول منه</th>
                    <th className="p-4">الحالة</th>
                    <th className="p-4 text-center">الإجراء والتسليم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-gray-400 text-xs">
                        لا توجد طلبات مطابقة حالياً.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map(order => {
                      const matchedProduct = products.find(p => p.id === order.productId) || {
                        id: order.productId,
                        title: order.productTitle,
                        description: '',
                        price: order.amountUsd,
                        features: [],
                        icon: 'Sparkles',
                        categoryId: 'all'
                      };

                      return (
                        <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-indigo-950 font-mono text-sm">{order.id}</div>
                            <div className="text-[11px] text-gray-400">{order.createdAt}</div>
                          </td>
                          
                          <td className="p-4">
                            <div className="font-bold text-gray-900">{order.buyerName}</div>
                            <div className="text-[11px] text-gray-500 font-mono flex items-center gap-1">
                              <Phone size={11} /> {order.buyerPhone}
                            </div>
                            <div className="text-[11px] text-gray-400 font-mono flex items-center gap-1">
                              <Mail size={11} /> {order.buyerEmail}
                            </div>
                          </td>

                          <td className="p-4">
                            <div className="font-bold text-gray-900">{order.productTitle}</div>
                            <div className="text-emerald-700 font-black text-xs mt-0.5">
                              {order.amountEgp} ج.م <span className="text-[10px] text-gray-400">(${order.amountUsd})</span>
                            </div>
                          </td>

                          <td className="p-4">
                            <span className="bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold">
                              {order.senderAccount || 'غير محدد'}
                            </span>
                          </td>

                          <td className="p-4">
                            {order.status === 'completed' ? (
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-bold text-[11px] inline-flex items-center gap-1">
                                <CheckCircle2 size={12} />
                                تم التسليم
                              </span>
                            ) : (
                              <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full font-bold text-[11px] inline-flex items-center gap-1">
                                <Clock size={12} />
                                قيد المراجعة
                              </span>
                            )}
                          </td>

                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {order.status !== 'completed' ? (
                                <button
                                  onClick={() => handleFulfillOrder(order)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow-sm transition-all active:scale-95"
                                  title="تأكيد التحويل وإرسال الكود للعميل عبر واتساب"
                                >
                                  <Send size={12} />
                                  <span>تأكيد وتسليم (واتساب)</span>
                                </button>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => {
                                      setCertProduct(matchedProduct);
                                      setCertOrder(order);
                                    }}
                                    className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold"
                                    title="عرض شهادة الترخيص PDF"
                                  >
                                    <Award size={14} />
                                  </button>
                                  <button
                                    onClick={() => downloadProductZip(matchedProduct)}
                                    className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs"
                                    title="تنزيل حزمة ZIP"
                                  >
                                    <Download size={14} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Product Management Table Card */}
        {activeTab === 'products' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          
          {/* Controls Bar */}
          <div className="p-5 border-b border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="w-full md:w-80 relative">
              <input
                type="text"
                placeholder="البحث بالاسم أو الوصف..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-xs rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
              <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={selectedCat}
                onChange={e => setSelectedCat(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-xs rounded-xl px-3 py-2.5 text-gray-700 outline-none"
              >
                <option value="all">جميع التصنيفات</option>
                <option value="marketing">التسويق والمبيعات</option>
                <option value="productivity">الإنتاجية</option>
                <option value="analytics">البيانات والتحليل</option>
                <option value="customer_support">خدمة العملاء</option>
                <option value="legal">الشؤون القانونية والعقود</option>
                <option value="design">التصميم والإبداع</option>
              </select>

              <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">
                عرض {filteredProducts.length} من أصل {products.length}
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-200">
                <tr>
                  <th className="p-4">اسم الأداة</th>
                  <th className="p-4">التصنيف</th>
                  <th className="p-4">السعر</th>
                  <th className="p-4">التقييم</th>
                  <th className="p-4">حالة الكود</th>
                  <th className="p-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.slice(0, 50).map(product => (
                  <tr key={product.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-gray-900 text-sm mb-0.5">{product.title}</div>
                      <div className="text-gray-400 line-clamp-1 max-w-md">{product.description}</div>
                    </td>
                    <td className="p-4">
                      <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md font-medium">
                        {product.categoryId}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-gray-900 text-sm">
                      ${product.price}
                    </td>
                    <td className="p-4 text-amber-500 font-bold">
                      ★ {product.rating || '5.0'}
                    </td>
                    <td className="p-4">
                      <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold text-[11px] inline-flex items-center gap-1">
                        <CheckCircle2 size={11} />
                        جاهز ومبرمج
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => { if (window.confirm('هل أنت متأكد من حذف هذه الأداة؟')) onDeleteProduct(product.id); }}
                        className="p-1.5 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg transition-colors"
                        title="حذف المنتج"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
        )}

        {/* Tab 3: Coupons Management */}
        {activeTab === 'coupons' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 overflow-hidden">
            <h3 className="text-lg font-black text-gray-900 mb-4">إنشاء كود خصم جديد</h3>
            <form onSubmit={handleCreateCoupon} className="flex flex-col sm:flex-row gap-4 items-end mb-8">
              <div className="flex-1 w-full">
                <label className="font-bold text-gray-700 text-xs block mb-1.5">كود الخصم (مثال: EID20):</label>
                <input
                  type="text"
                  required
                  placeholder="الكود بحروف إنجليزية"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-mono text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                />
              </div>
              <div className="w-full sm:w-32">
                <label className="font-bold text-gray-700 text-xs block mb-1.5">نسبة الخصم %:</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="90"
                  placeholder="20"
                  value={discountPercent}
                  onChange={e => setDiscountPercent(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm text-sm h-[46px]"
              >
                <Plus size={16} />
                <span>إضافة</span>
              </button>
            </form>

            <h3 className="text-lg font-black text-gray-900 mb-4">الكوبونات النشطة</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-200">
                  <tr>
                    <th className="p-4">الكود</th>
                    <th className="p-4">نسبة الخصم</th>
                    <th className="p-4">مرات الاستخدام</th>
                    <th className="p-4">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {coupons.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-500">لا توجد كوبونات مضافة بعد</td>
                    </tr>
                  ) : (
                    coupons.map(coupon => (
                      <tr key={coupon.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-4 font-mono font-black text-indigo-700 text-sm">
                          {coupon.code}
                        </td>
                        <td className="p-4 font-bold text-emerald-600 text-sm">
                          {coupon.discountPercent}%
                        </td>
                        <td className="p-4 font-bold text-gray-700">
                          {coupon.usageCount}
                        </td>
                        <td className="p-4">
                          {coupon.isActive === 1 ? (
                            <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-bold text-[10px]">مفعل</span>
                          ) : (
                            <span className="bg-red-50 text-red-700 px-2.5 py-1 rounded-full font-bold text-[10px]">معطل</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in" dir="rtl">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-gray-100 relative">
            <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
              <Plus className="text-indigo-600" />
              إضافة أداة SaaS جديدة للمتجر
            </h3>
            <p className="text-xs text-gray-500 mb-6">سيتم إدراج الأداة فوراً مع كود تشغيل ذكي وربطها ببوابة الشراء.</p>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1.5">عنوان الأداة البرمجية:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: روبوت تحويل الصوت إلى نصوص بالذكاء الاصطناعي"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1.5">السعر (بالدولار):</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newPrice}
                    onChange={e => setNewPrice(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1.5">التصنيف:</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  >
                    <option value="marketing">التسويق والمبيعات</option>
                    <option value="productivity">الإنتاجية</option>
                    <option value="analytics">البيانات والتحليل</option>
                    <option value="customer_support">خدمة العملاء</option>
                    <option value="legal">الشؤون القانونية والعقود</option>
                    <option value="design">التصميم والإبداع</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1.5">الوصف التعريفي:</label>
                <textarea
                  required
                  rows={3}
                  placeholder="اكتب شرحاً لما تقوم به هذه الأداة وكيف توفر الوقت على المشتري..."
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1.5">المميزات الرئيسية (افصل بينها بفاصلة):</label>
                <input
                  type="text"
                  placeholder="ميزة 1, ميزة 2, ميزة 3"
                  value={newFeatures}
                  onChange={e => setNewFeatures(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition shadow-sm text-sm"
                >
                  إضافة الأداة الآن
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-3 border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold rounded-xl transition text-sm"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Certificate Viewer Modal in Admin */}
      {certProduct && certOrder && (
        <LicenseCertificateModal
          product={certProduct}
          buyerName={certOrder.buyerName}
          orderNumber={certOrder.id}
          onClose={() => {
            setCertProduct(null);
            setCertOrder(null);
          }}
        />
      )}

    </div>
  );
}
