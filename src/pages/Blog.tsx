import React from 'react';
import { Link } from 'react-router-dom';
import { blogPosts } from '../blogData';
import { Calendar, Clock, ChevronLeft } from 'lucide-react';

export function Blog() {
  return (
    <div className="bg-gray-50 min-h-screen py-16" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-black text-gray-900 mb-4">مدونة سوق ساس</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            مقالات، دروس، وأدلة شاملة لمساعدتك في بناء وتطوير وتسويق مشاريع الـ Micro SaaS الخاصة بك.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map(post => (
            <Link key={post.id} to={`/blog/${post.slug}`} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col">
              <div className="h-48 overflow-hidden relative">
                <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-4 text-[11px] text-gray-500 font-bold mb-3">
                  <span className="flex items-center gap-1"><Calendar size={13} /> {post.date}</span>
                  <span className="flex items-center gap-1"><Clock size={13} /> {post.readTime}</span>
                </div>
                <h2 className="text-xl font-black text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {post.title}
                </h2>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-grow">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-sm font-bold mt-auto pt-4 border-t border-gray-100">
                  <span className="text-gray-900">{post.author}</span>
                  <span className="text-indigo-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                    اقرأ المزيد <ChevronLeft size={16} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
