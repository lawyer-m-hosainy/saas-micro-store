import React, { useState } from 'react';
import { Download, FileText, CheckCircle2 } from 'lucide-react';
import { escapeHtml, sanitizeFilename, isValidUrl } from '../utils/sanitize';

export function PrivacyPolicyGenDemo() {
  const [companyName, setCompanyName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [email, setEmail] = useState('');
  const [generated, setGenerated] = useState(false);
  const [policyText, setPolicyText] = useState('');

  const generatePolicy = () => {
    if (!companyName || !websiteUrl || !email) return;
    
    const text = `سياسة الخصوصية لـ ${companyName}

تاريخ السريان: ${new Date().toLocaleDateString('ar-EG')}

1. جمع المعلومات
نحن في ${companyName} (المتاح عبر ${websiteUrl}) نجمع المعلومات التي تقدمها لنا طواعية عند استخدام خدماتنا.

2. استخدام المعلومات
نستخدم معلوماتك لتقديم وتحسين خدماتنا، والتواصل معك عبر البريد الإلكتروني ${email}.

3. مشاركة المعلومات
نحن لا نبيع أو نؤجر معلوماتك الشخصية لأي جهات خارجية.

4. أمان البيانات
نحن نتخذ إجراءات أمنية معقولة لحماية بياناتك، لكن تذكر أنه لا توجد وسيلة نقل عبر الإنترنت آمنة 100%.

5. اتصل بنا
إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى التواصل معنا على: ${email}
`;
    setPolicyText(text);
    setGenerated(true);
  };

  const downloadText = () => {
    const blob = new Blob([policyText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `privacy_policy_${sanitizeFilename(companyName)}.txt`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  const downloadHtml = () => {
    const safeCompanyName = escapeHtml(companyName);
    const safeWebsiteUrl = escapeHtml(websiteUrl);
    const safeEmail = escapeHtml(email);
    const hrefWebsiteUrl = isValidUrl(websiteUrl) ? escapeHtml(websiteUrl) : '#';

    const htmlContent = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>سياسة الخصوصية - ${safeCompanyName}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1, h2 { color: #333; }
    </style>
</head>
<body>
    <h1>سياسة الخصوصية لـ ${safeCompanyName}</h1>
    <p><strong>تاريخ السريان:</strong> ${new Date().toLocaleDateString('ar-EG')}</p>
    
    <h2>1. جمع المعلومات</h2>
    <p>نحن في ${safeCompanyName} (المتاح عبر <a href="${hrefWebsiteUrl}">${safeWebsiteUrl}</a>) نجمع المعلومات التي تقدمها لنا طواعية.</p>
    
    <h2>2. استخدام المعلومات</h2>
    <p>نستخدم معلوماتك لتقديم وتحسين خدماتنا، والتواصل معك عبر البريد الإلكتروني.</p>
    
    <h2>3. مشاركة المعلومات</h2>
    <p>نحن لا نبيع أو نؤجر معلوماتك الشخصية لأي جهات خارجية.</p>
    
    <h2>4. اتصل بنا</h2>
    <p>لأي استفسارات: <a href="mailto:${safeEmail}">${safeEmail}</a></p>
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `privacy_policy_${sanitizeFilename(companyName)}.html`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
      <h3 className="text-xl font-bold mb-4 text-indigo-900">مُولد سياسة الخصوصية (يعمل بالكامل)</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">اسم الشركة / التطبيق</label>
              <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="مثال: شركة التقنية" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">رابط الموقع</label>
              <input type="url" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} className="w-full px-3 py-2 border rounded-md text-left" dir="ltr" placeholder="https://example.com" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">البريد الإلكتروني للتواصل</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded-md text-left" dir="ltr" placeholder="contact@example.com" />
            </div>
            
            <button 
              onClick={generatePolicy} 
              disabled={!companyName || !websiteUrl || !email}
              className="w-full mt-4 bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700 disabled:opacity-50 font-bold"
            >
              توليد سياسة الخصوصية
            </button>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex flex-col h-full">
          {!generated ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <FileText size={48} className="mb-4 opacity-20" />
              <p>أدخل البيانات واضغط على توليد لرؤية النتيجة</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 text-green-600 font-bold mb-4">
                <CheckCircle2 size={20} />
                <span>تم إنشاء السياسة بنجاح</span>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-sm whitespace-pre-wrap flex-grow overflow-y-auto max-h-[250px] mb-4">
                {policyText}
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-auto">
                <button onClick={downloadText} className="flex justify-center items-center gap-2 bg-gray-800 text-white py-2 rounded-md hover:bg-gray-900 transition-colors">
                  <Download size={16} /> كملف نصي (TXT)
                </button>
                <button onClick={downloadHtml} className="flex justify-center items-center gap-2 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors">
                  <Download size={16} /> كملف ويب (HTML)
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
