import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { DemoViewer } from '../components/DemoViewer';
import { CheckoutModal } from '../components/CheckoutModal';
import { WhitelabelPreviewModal } from '../components/WhitelabelPreviewModal';

interface ProductPageProps {
  productsList: Product[];
  onOrderCreated: (order: any) => void;
}

export function ProductPage({ productsList, onOrderCreated }: ProductPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showWhitelabel, setShowWhitelabel] = useState(false);

  useEffect(() => {
    if (id) {
      const found = productsList.find(p => p.id === id);
      if (found) {
        setProduct(found);
      } else {
        navigate('/store', { replace: true });
      }
    }
  }, [id, productsList, navigate]);

  if (!product) return null;

  return (
    <div className="flex flex-col min-h-[80vh]">
      <div className="flex-grow">
        <DemoViewer 
          product={product} 
          onClose={() => navigate('/store')}
          onBuy={(p) => setShowCheckout(true)}
          onOpenWhitelabel={() => setShowWhitelabel(true)}
        />
      </div>

      {showCheckout && (
        <CheckoutModal 
          product={product} 
          onClose={() => setShowCheckout(false)} 
          onOrderCreated={(order) => {
            onOrderCreated(order);
            setShowCheckout(false);
            navigate('/tracking');
          }}
        />
      )}

      {showWhitelabel && (
        <WhitelabelPreviewModal
          product={product}
          onClose={() => setShowWhitelabel(false)}
          onOrderProduct={(p) => {
            setShowWhitelabel(false);
            setShowCheckout(true);
          }}
        />
      )}

      {/* 🛒 Related Products / Upsell Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-100 w-full">
        <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
          <span>أدوات أخرى قد تهمك</span>
          <span className="text-sm font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-lg border border-amber-200">
            أكمل باقتك
          </span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {productsList
            .filter(p => p.categoryId === product.categoryId && p.id !== product.id)
            .slice(0, 3)
            .map(related => (
              <div key={related.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl">{related.icon}</div>
                  <div className="bg-emerald-50 text-emerald-700 text-xs font-black px-2 py-1 rounded-lg">
                    ${related.price}
                  </div>
                </div>
                <h4 className="font-bold text-gray-900 mb-1">{related.title}</h4>
                <p className="text-xs text-gray-500 mb-4 line-clamp-2">{related.description}</p>
                <button
                  onClick={() => {
                    navigate(`/product/${related.id}`);
                    window.scrollTo(0, 0);
                  }}
                  className="w-full bg-gray-50 hover:bg-indigo-50 text-indigo-600 font-bold text-xs py-2 rounded-xl transition-colors border border-gray-200 hover:border-indigo-200"
                >
                  استعراض الأداة
                </button>
              </div>
            ))}
          {/* Fallback if no related products in the same category */}
          {productsList.filter(p => p.categoryId === product.categoryId && p.id !== product.id).length === 0 && 
            productsList.filter(p => p.id !== product.id).slice(0, 3).map(related => (
              <div key={related.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl">{related.icon}</div>
                  <div className="bg-emerald-50 text-emerald-700 text-xs font-black px-2 py-1 rounded-lg">
                    ${related.price}
                  </div>
                </div>
                <h4 className="font-bold text-gray-900 mb-1">{related.title}</h4>
                <p className="text-xs text-gray-500 mb-4 line-clamp-2">{related.description}</p>
                <button
                  onClick={() => {
                    navigate(`/product/${related.id}`);
                    window.scrollTo(0, 0);
                  }}
                  className="w-full bg-gray-50 hover:bg-indigo-50 text-indigo-600 font-bold text-xs py-2 rounded-xl transition-colors border border-gray-200 hover:border-indigo-200"
                >
                  استعراض الأداة
                </button>
              </div>
          ))}
        </div>
      </div>
    </div>
  );
}
