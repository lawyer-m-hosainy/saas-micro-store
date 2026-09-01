import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Link as LinkIcon } from 'lucide-react';

/**
 * فريق التطوير:
 * أداة صانع منيو الـ QR. تم برمجتها لتعمل بشكل حقيقي بالكامل.
 * تتيح إدخال رابط المنيو، تغيير الألوان، وتحميل الباركود للطباعة.
 */
export function QrMenuMakerDemo() {
  const [restaurantName, setRestaurantName] = useState('');
  const [menuUrl, setMenuUrl] = useState('');
  const [qrColor, setQrColor] = useState('#000000');
  const qrRef = useRef<HTMLDivElement>(null);

  const downloadQR = () => {
    if (!qrRef.current || !menuUrl) return;
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `${restaurantName || 'Menu'}_QR.png`;
        downloadLink.href = `${pngFile}`;
        downloadLink.click();
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
      <h3 className="text-xl font-bold mb-4 text-indigo-900">أداة صانع منيو الباركود (نسخة تعمل بالكامل)</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* لوحة التحكم */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex flex-col h-full">
          <div className="space-y-4 flex-grow">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اسم المطعم / المقهى</label>
              <input 
                type="text" 
                value={restaurantName} 
                onChange={e => setRestaurantName(e.target.value)} 
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none" 
                placeholder="مثال: مطعم السعادة" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رابط قائمة الطعام (المنيو) الإلكتروني *</label>
              <div className="relative">
                <input 
                  type="url" 
                  value={menuUrl} 
                  onChange={e => setMenuUrl(e.target.value)} 
                  className="w-full px-3 py-2 pl-10 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none text-left" 
                  placeholder="https://example.com/menu.pdf" 
                  dir="ltr"
                />
                <LinkIcon className="absolute left-3 top-2.5 text-gray-400" size={18} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">لون الباركود</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={qrColor} 
                  onChange={e => setQrColor(e.target.value)} 
                  className="w-12 h-10 border-0 rounded cursor-pointer p-0" 
                />
                <span className="text-sm text-gray-500" dir="ltr">{qrColor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* النتيجة و المعاينة */}
        <div className="bg-gray-100 p-6 rounded-lg shadow-inner flex flex-col items-center justify-center">
          
          <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-[280px] text-center" ref={qrRef}>
            <h4 className="font-bold text-gray-800 text-lg mb-4 truncate">
              {restaurantName || 'امسح الكود لرؤية المنيو'}
            </h4>
            
            <div className={`mx-auto w-fit transition-opacity ${menuUrl ? 'opacity-100' : 'opacity-20'}`}>
              <QRCodeSVG 
                value={menuUrl || 'https://example.com'} 
                size={200}
                level="H"
                fgColor={qrColor}
                includeMargin={false}
              />
            </div>
            
            <p className="text-xs text-gray-500 mt-4 uppercase tracking-widest font-semibold">
              Scan For Menu
            </p>
          </div>
          
          <button 
            onClick={downloadQR}
            disabled={!menuUrl}
            className="w-full max-w-[280px] mt-6 bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 flex justify-center items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={20} />
            <span>تحميل للطباعة (PNG)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
