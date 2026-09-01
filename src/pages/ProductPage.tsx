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
    </div>
  );
}
