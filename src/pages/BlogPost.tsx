import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogPosts } from '../blogData';
import { Calendar, Clock, ChevronRight, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find(p => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50 text-center px-4" dir="rtl">
        <h2 className="text-3xl font-black text-gray-900 mb-2">المقال غير موجود</h2>
        <p className="text-gray-500 mb-6">عذراً، لم نتمكن من العثور على المقال الذي تبحث عنه.</p>
        <Link to="/blog" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
          العودة للمدونة
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-12" dir="rtl">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/blog" className="inline-flex items-center gap-1 text-gray-500 hover:text-indigo-600 font-bold text-sm mb-8 transition-colors">
          <ChevronRight size={18} /> عودة للمدونة
        </Link>

        <h1 className="text-3xl sm:text-5xl font-black text-gray-900 mb-6 leading-tight">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 font-bold mb-10 pb-10 border-b border-gray-100">
          <span className="flex items-center gap-2"><User size={16} className="text-indigo-600" /> {post.author}</span>
          <span className="flex items-center gap-2"><Calendar size={16} className="text-indigo-600" /> {post.date}</span>
          <span className="flex items-center gap-2"><Clock size={16} className="text-indigo-600" /> {post.readTime}</span>
        </div>

        <img src={post.imageUrl} alt={post.title} className="w-full h-[400px] object-cover rounded-3xl mb-12 shadow-sm" />

        <div className="prose prose-lg prose-indigo prose-headings:font-black prose-p:text-gray-600 max-w-none">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
        
        <div className="mt-16 pt-8 border-t border-gray-100 text-center">
            <h3 className="text-2xl font-black text-gray-900 mb-4">جاهز لإطلاق مشروعك؟</h3>
            <Link to="/store" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black transition-transform active:scale-95 shadow-lg shadow-indigo-200">
                تصفح الكتالوج واحصل على كود جاهز
            </Link>
        </div>
      </div>
    </div>
  );
}
