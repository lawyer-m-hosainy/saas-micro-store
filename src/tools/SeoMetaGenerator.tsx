import React, { useState } from 'react';
import { Copy, CheckCircle2, Globe, Twitter, Facebook, Code } from 'lucide-react';
import { escapeHtmlAttribute } from '../utils/sanitize';

export function SeoMetaGeneratorDemo() {
  const [title, setTitle] = useState('موقع متجري - أفضل العروض والخصومات');
  const [description, setDescription] = useState('اكتشف أحدث المنتجات بأفضل الأسعار. شحن مجاني ودفع عند الاستلام. تسوق الآن واستمتع بتجربة فريدة.');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80');
  const [domain, setDomain] = useState('mystore.com');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'google' | 'twitter' | 'facebook'>('google');

  const safeTitle = escapeHtmlAttribute(title);
  const safeDescription = escapeHtmlAttribute(description);
  const safeImageUrl = escapeHtmlAttribute(imageUrl);
  const url = domain.startsWith('http://') || domain.startsWith('https://') ? domain : `https://${domain}`;
  const safeUrl = escapeHtmlAttribute(url);

  const generatedCode = `<!-- Primary Meta Tags -->
<title>${safeTitle}</title>
<meta name="title" content="${safeTitle}">
<meta name="description" content="${safeDescription}">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="${safeUrl}/">
<meta property="og:title" content="${safeTitle}">
<meta property="og:description" content="${safeDescription}">
<meta property="og:image" content="${safeImageUrl}">

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="${safeUrl}/">
<meta property="twitter:title" content="${safeTitle}">
<meta property="twitter:description" content="${safeDescription}">
<meta property="twitter:image" content="${safeImageUrl}">`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
      <h3 className="text-xl font-bold mb-4 text-indigo-900 flex items-center gap-2">
        <Globe size={24} />
        مُولد وسوم SEO ومعاينة السوشيال ميديا
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* لوحة الإدخال */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex flex-col h-full">
          <h4 className="font-bold text-gray-700 mb-4 border-b pb-2">بيانات الموقع</h4>
          <div className="space-y-4 flex-grow">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-gray-700">عنوان الصفحة (Title)</label>
                <span className={`text-xs ${title.length > 60 ? 'text-red-500' : 'text-green-500'}`}>{title.length}/60</span>
              </div>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-gray-700">الوصف (Description)</label>
                <span className={`text-xs ${description.length > 160 ? 'text-red-500' : 'text-green-500'}`}>{description.length}/160</span>
              </div>
              <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 border rounded-md h-24 resize-none"></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الدومين (Domain)</label>
              <input type="text" value={domain} onChange={e => setDomain(e.target.value)} className="w-full px-3 py-2 border rounded-md text-left" dir="ltr" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رابط صورة العرض (Image URL)</label>
              <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full px-3 py-2 border rounded-md text-left text-sm" dir="ltr" />
            </div>
          </div>
        </div>

        {/* لوحة المعاينة والكود */}
        <div className="flex flex-col gap-6">
          
          {/* قسم المعاينة الحية */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
            <div className="flex gap-2 mb-4 border-b pb-2">
              <button onClick={() => setActiveTab('google')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors ${activeTab === 'google' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}>
                <Globe size={16} /> Google
              </button>
              <button onClick={() => setActiveTab('twitter')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors ${activeTab === 'twitter' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                <Twitter size={16} /> Twitter
              </button>
              <button onClick={() => setActiveTab('facebook')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors ${activeTab === 'facebook' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}>
                <Facebook size={16} /> Facebook
              </button>
            </div>

            <div className="min-h-[150px]">
              {/* Google Preview */}
              {activeTab === 'google' && (
                <div className="max-w-[600px]" dir="rtl">
                  <div className="text-sm text-gray-800 flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
                      <Globe size={14} className="text-gray-500" />
                    </div>
                    <div>
                      <span className="block text-xs">{domain}</span>
                      <span className="block text-[10px] text-gray-500" dir="ltr">https://{domain}</span>
                    </div>
                  </div>
                  <h3 className="text-xl text-[#1a0dab] hover:underline cursor-pointer mb-1 line-clamp-1">{title}</h3>
                  <p className="text-sm text-[#4d5156] line-clamp-2">{description}</p>
                </div>
              )}

              {/* Twitter Preview */}
              {activeTab === 'twitter' && (
                <div className="max-w-[450px] border border-gray-200 rounded-2xl overflow-hidden cursor-pointer hover:bg-gray-50 transition-colors" dir="ltr">
                  <div className="h-[235px] w-full bg-gray-200 border-b border-gray-200 overflow-hidden relative">
                    <img src={imageUrl || 'https://via.placeholder.com/1000x500'} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3">
                    <p className="text-[13px] text-gray-500 mb-0.5">{domain}</p>
                    <p className="text-[15px] font-bold text-gray-900 line-clamp-1">{title}</p>
                    <p className="text-[15px] text-gray-500 line-clamp-2 mt-0.5">{description}</p>
                  </div>
                </div>
              )}

              {/* Facebook Preview */}
              {activeTab === 'facebook' && (
                <div className="max-w-[500px] border border-gray-200 rounded-sm overflow-hidden cursor-pointer" dir="ltr">
                  <div className="h-[261px] w-full bg-gray-200 border-b border-gray-200 overflow-hidden">
                    <img src={imageUrl || 'https://via.placeholder.com/1000x500'} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3 bg-gray-100/50">
                    <p className="text-[12px] text-gray-500 uppercase font-semibold mb-1">{domain}</p>
                    <p className="text-[16px] font-bold text-gray-900 leading-tight mb-1 line-clamp-1">{title}</p>
                    <p className="text-[14px] text-gray-500 line-clamp-1">{description}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* قسم الكود */}
          <div className="bg-gray-900 p-5 rounded-lg shadow-sm border border-gray-800 relative group flex-grow flex flex-col">
            <h4 className="font-bold text-gray-300 mb-3 flex items-center gap-2 text-sm">
              <Code size={16} />
              الكود الجاهز (HTML)
            </h4>
            <div className="relative flex-grow">
              <pre className="text-gray-300 text-xs font-mono overflow-auto p-3 bg-black/30 rounded-md h-[180px] w-full text-left" dir="ltr">
                {generatedCode}
              </pre>
              <button 
                onClick={copyToClipboard}
                className="absolute top-2 right-2 bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-md transition-colors"
                title="نسخ الكود"
              >
                {copied ? <CheckCircle2 size={16} className="text-green-400" /> : <Copy size={16} />}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
