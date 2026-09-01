import React, { useState } from 'react';
import { PenTool, Calendar, Download, RefreshCw } from 'lucide-react';

export function NicheContentDemo() {
  const [niche, setNiche] = useState('real_estate');
  const [platform, setPlatform] = useState('instagram');
  const [isGenerating, setIsGenerating] = useState(false);
  const [contentPlan, setContentPlan] = useState<{day: string, topic: string, caption: string}[] | null>(null);

  const niches: Record<string, string> = {
    real_estate: 'عقارات',
    dentist: 'طب أسنان',
    fitness: 'صالة رياضية / فتنس',
    restaurant: 'مطاعم ومقاهي'
  };

  const platforms: Record<string, string> = {
    instagram: 'انستغرام',
    twitter: 'إكس (تويتر)',
    linkedin: 'لينكد إن'
  };

  const generatePlan = () => {
    setIsGenerating(true);
    // محاكاة استدعاء ذكاء اصطناعي (Mock AI Request)
    setTimeout(() => {
      const plans = {
        real_estate: [
          { day: 'الأحد', topic: 'جولة في عقار جديد', caption: 'اكتشف الفخامة في أحدث مشاريعنا السكنية! 🏡 تصميم عصري ومساحات واسعة تناسب عائلتك. تواصل معنا للحجز.' },
          { day: 'الثلاثاء', topic: 'نصيحة عقارية', caption: 'هل تعلم أن الاستثمار في العقارات قيد الإنشاء يوفر لك حتى 20% من قيمة العقار؟ 💡 شاركنا رأيك.' },
          { day: 'الخميس', topic: 'شهادة عميل', caption: 'سعداء بثقة عملائنا! 🙏 قصة نجاح جديدة لعائلة وجدت منزل أحلامها معنا.' }
        ],
        dentist: [
          { day: 'الأحد', topic: 'ابتسامة هوليود', caption: 'ابتسامتك هي سر جمالك! ✨ حول أسنانك مع أحدث تقنيات تبييض وتركيبات الأسنان لدينا. احجز استشارتك الآن.' },
          { day: 'الثلاثاء', topic: 'توعية صحية', caption: 'متى يجب تغيير فرشاة الأسنان؟ 🤔 ننصح بتغييرها كل 3 أشهر أو بعد التعافي من نزلات البرد.' },
          { day: 'الخميس', topic: 'قبل وبعد', caption: 'تغيير جذري وثقة جديدة! شاهد نتيجة علاج التقويم الشفاف لأحد مراجعينا.' }
        ],
        default: [
          { day: 'الأحد', topic: 'عرض منتج/خدمة', caption: `احصل على أفضل الخدمات في مجال ${niches[niche]} مع عروضنا الحصرية هذا الأسبوع!` },
          { day: 'الثلاثاء', topic: 'معلومة مفيدة', caption: 'نشارككم اليوم معلومة مهمة ستساعدكم في تحسين تجربتكم معنا. هل كنتم تعرفون هذا من قبل؟' },
          { day: 'الخميس', topic: 'تفاعل مع الجمهور', caption: 'ما هو أكثر شيء تفضلونه في خدماتنا؟ شاركونا في التعليقات! 👇' }
        ]
      };

      setContentPlan(plans[niche as keyof typeof plans] || plans.default);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
      <h3 className="text-xl font-bold mb-4 text-indigo-900">مُخطط المحتوى الذكي (يعمل بالمحاكاة)</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* الإعدادات */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 h-fit">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">مجال العمل (Niche)</label>
              <select value={niche} onChange={e => setNiche(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white">
                {Object.entries(niches).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">المنصة المستهدفة</label>
              <select value={platform} onChange={e => setPlatform(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-white">
                {Object.entries(platforms).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>

            <button 
              onClick={generatePlan} 
              disabled={isGenerating}
              className="w-full mt-4 bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700 disabled:opacity-70 font-bold flex justify-center items-center gap-2 transition-all"
            >
              {isGenerating ? <RefreshCw className="animate-spin" size={20} /> : <PenTool size={20} />}
              <span>{isGenerating ? 'جاري توليد المحتوى...' : 'توليد خطة المحتوى'}</span>
            </button>
          </div>
        </div>

        {/* النتيجة */}
        <div className="lg:col-span-2 bg-white p-5 rounded-lg shadow-sm border border-gray-100 min-h-[300px]">
          {!contentPlan ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <Calendar size={60} className="mb-4 opacity-20" />
              <p>اختر المجال واضغط على زر التوليد لإنشاء خطة أسبوعية</p>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h4 className="font-bold text-gray-800 text-lg">خطة منصة {platforms[platform]} - {niches[niche]}</h4>
                <button className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-md transition-colors" title="تحميل كملف CSV"
                  onClick={() => {
                    if (!contentPlan) return;
                    const header = 'اليوم,النوع,الموضوع,النص\n';
                    const csv = contentPlan.map((p: any) => `${p.day},${p.type || ''},${p.topic},${p.caption.replace(/,/g, '،')}`).join('\n');
                    const blob = new Blob([header + csv], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'content_plan.csv';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <Download size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                {contentPlan.map((post, index) => (
                  <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-1 rounded">{post.day}</span>
                      <span className="text-sm font-semibold text-gray-600">{post.topic}</span>
                    </div>
                    <p className="text-gray-800 text-sm mt-3 whitespace-pre-wrap bg-white p-3 rounded border border-gray-100">
                      {post.caption}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
