import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { isValidUrl, ensureHttpsUrl } from '../utils/sanitize';

interface LinkItem {
  id: string;
  title: string;
  url: string;
}

export function LinkInBioDemo() {
  const [profileName, setProfileName] = useState('@my_brand');
  const [bio, setBio] = useState('مرحباً بك في صفحتنا الرسمية. اكتشف أحدث منتجاتنا وعروضنا.');
  const [links, setLinks] = useState<LinkItem[]>([
    { id: '1', title: 'الموقع الرسمي', url: 'https://example.com' },
    { id: '2', title: 'تواصل معنا على واتساب', url: 'https://wa.me/123456789' }
  ]);
  
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const addLink = () => {
    if (!newTitle || !newUrl) return;
    const safeUrl = ensureHttpsUrl(newUrl);
    if (!safeUrl) return;
    setLinks([...links, { id: Date.now().toString(), title: newTitle, url: safeUrl }]);
    setNewTitle('');
    setNewUrl('');
  };

  const removeLink = (id: string) => {
    setLinks(links.filter(l => l.id !== id));
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
      <h3 className="text-xl font-bold mb-4 text-indigo-900">أداة صفحة الروابط (Link in Bio) (تعمل بالكامل)</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* لوحة التحكم */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex flex-col">
          <h4 className="font-bold text-gray-700 mb-4">إعدادات الصفحة</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">اسم الحساب / العلامة التجارية</label>
              <input type="text" value={profileName} onChange={e => setProfileName(e.target.value)} className="w-full px-3 py-2 border rounded-md" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">النبذة التعريفيّة (Bio)</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} className="w-full px-3 py-2 border rounded-md h-20 resize-none"></textarea>
            </div>
            
            <div className="border-t pt-4">
              <h5 className="font-bold text-sm text-gray-700 mb-3">الروابط</h5>
              
              <div className="space-y-2 mb-4">
                {links.map(link => (
                  <div key={link.id} className="flex items-center gap-2 bg-gray-50 p-2 rounded-md border border-gray-200">
                    <div className="flex-grow overflow-hidden">
                      <p className="text-sm font-medium text-gray-800 truncate">{link.title}</p>
                      <p className="text-xs text-gray-500 truncate" dir="ltr">{link.url}</p>
                    </div>
                    <button onClick={() => removeLink(link.id)} className="text-red-400 hover:text-red-600 p-1">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col gap-2 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" placeholder="عنوان الرابط (مثال: متجرنا)" />
                <input type="url" value={newUrl} onChange={e => setNewUrl(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm text-left" placeholder="https://" dir="ltr" />
                <button onClick={addLink} disabled={!newTitle || !newUrl} className="w-full bg-indigo-600 text-white py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex justify-center items-center gap-1">
                  <Plus size={16} /> إضافة الرابط
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* المعاينة الحية */}
        <div className="bg-gray-100 p-6 rounded-lg shadow-inner flex justify-center items-center">
          
          <div className="relative w-[300px] h-[600px] bg-white rounded-[40px] shadow-xl border-[8px] border-gray-900 overflow-hidden flex flex-col">
            {/* كاميرا الهاتف (Notch) */}
            <div className="absolute top-0 inset-x-0 h-6 bg-gray-900 rounded-b-3xl w-40 mx-auto"></div>
            
            <div className="flex-grow bg-gradient-to-br from-indigo-500 to-purple-600 pt-16 px-6 pb-6 text-center overflow-y-auto scrollbar-hide">
              <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-indigo-600 shadow-lg border-4 border-white">
                {profileName.charAt(0).toUpperCase() || 'U'}
              </div>
              
              <h2 className="text-white font-bold text-xl mb-2" dir="ltr">{profileName}</h2>
              <p className="text-white/90 text-sm mb-8 leading-relaxed">{bio}</p>
              
              <div className="space-y-4">
                {links.map(link => (
                  <a 
                    key={link.id} 
                    href={link.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="block w-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm text-white py-3 px-4 rounded-xl font-medium transition-all shadow-sm"
                  >
                    {link.title}
                  </a>
                ))}
              </div>
            </div>
            
            <div className="bg-white py-3 text-center border-t border-gray-100 text-xs text-gray-400 font-medium">
              Powered by MicroSaaS
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
