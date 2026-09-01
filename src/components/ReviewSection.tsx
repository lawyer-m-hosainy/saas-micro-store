import React, { useState, useEffect } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  userName: string | null;
}

interface ReviewSectionProps {
  productId: string;
}

export function ReviewSection({ productId }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews/${productId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      let currentUser = auth.currentUser;
      
      if (!currentUser) {
        const result = await signInWithPopup(auth, googleProvider);
        currentUser = result.user;
      }

      const token = await currentUser.getIdToken();
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          rating,
          comment
        })
      });

      if (res.ok) {
        setComment('');
        setRating(5);
        fetchReviews(); // Refresh the list
      } else {
        alert('حدث خطأ أثناء إضافة التقييم');
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="mt-8 border-t border-gray-100 pt-8" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare size={20} className="text-indigo-600" />
          آراء العملاء
        </h3>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">{averageRating}</span>
            <div className="flex text-yellow-400">
              <Star size={18} fill="currentColor" />
            </div>
            <span className="text-sm text-gray-500">({reviews.length} تقييم)</span>
          </div>
        )}
      </div>

      <div className="bg-gray-50 rounded-xl p-5 mb-8 border border-gray-100">
        <h4 className="font-semibold mb-3 text-sm text-gray-700">أضف تقييمك للأداة</h4>
        <form onSubmit={handleSubmit}>
          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`${star <= rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors focus:outline-none`}
              >
                <Star size={24} fill={star <= rating ? "currentColor" : "none"} />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            placeholder="شاركنا رأيك في هذه الأداة..."
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[100px] mb-3 resize-none text-sm"
          />
          <button
            type="submit"
            disabled={isSubmitting || !comment.trim()}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isSubmitting ? 'جاري الإرسال...' : 'إرسال التقييم'}
          </button>
        </form>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-400">جاري تحميل التقييمات...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-white border border-gray-100 rounded-xl">
          لا توجد تقييمات حتى الآن. كن أول من يشارك رأيه!
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div className="font-semibold text-gray-900">{review.userName || 'مستخدم'}</div>
                <div className="flex text-yellow-400 gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-gray-300"} />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
              <div className="mt-3 text-xs text-gray-400">
                {new Date(review.createdAt).toLocaleDateString('ar-EG')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
