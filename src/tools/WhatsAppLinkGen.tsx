import React, { useState, useRef } from 'react';
import { Copy, CheckCircle2, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

/**
 * فريق التطوير:
 * تم تحسين أداة مُولد روابط الواتساب.
 * الآن تقوم بتوليد كود QR حقيقي وقابل للتحميل ليستخدمه العميل في مطبوعاته.
 */
export function WhatsAppLinkGenDemo() {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  // توليد الرابط
  const generatedLink = `https://wa.me/${phone.replace(/[^0-9]/g, '')}${
    message ? `?text=${encodeURIComponent(message)}` : ''
  }`;

  const handleCopy = async () => {
    if (!phone) return;
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const downloadQR = () => {
    if (!qrRef.current || !phone) return;
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
        downloadLink.download = `whatsapp-qr-${phone}.png`;
        downloadLink.href = `${pngFile}`;
        downloadLink.click();
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
      <h3 className="text-xl font-bold mb-4 text-indigo-900">أداة مُولد روابط الواتساب (نسخة تعمل بالكامل)</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* لوحة إدخال البيانات */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex flex-col h-full">
          <div className="space-y-4 flex-grow">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رقم الواتساب (مع رمز الدولة)</label>
              <input 
                type="text" 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none text-left" 
                placeholder="مثال: 966500000000" 
                dir="ltr"
              />
              <p className="text-xs text-gray-500 mt-1">بدون أصفار أو علامة + في البداية.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الرسالة التلقائية (اختياري)</label>
              <textarea 
                value={message} 
                onChange={e => setMessage(e.target.value)} 
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]" 
                placeholder="مثال: مرحباً، أريد الاستفسار عن خدمة..." 
              />
            </div>
          </div>
        </div>

        {/* نتيجة الرابط و QR */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center text-center">
          
          <div 
            ref={qrRef} 
            className={`p-4 bg-white border-2 border-gray-100 rounded-2xl mb-4 transition-opacity ${phone ? 'opacity-100' : 'opacity-20'}`}
          >
            <QRCodeSVG 
              value={phone ? generatedLink : 'https://wa.me/'} 
              size={150}
              level="H"
              includeMargin={true}
            />
          </div>
          
          <button 
            onClick={downloadQR}
            disabled={!phone}
            className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mb-6 disabled:opacity-50"
          >
            <Download size={16} /> تحميل كود QR كصورة
          </button>

          <div className="w-full bg-gray-100 p-3 rounded-lg break-all text-sm text-gray-800 text-left mb-4 flex items-center justify-center border border-gray-200" dir="ltr">
            {phone ? generatedLink : <span className="text-gray-400">الرابط سيظهر هنا...</span>}
          </div>

          <button 
            onClick={handleCopy}
            disabled={!phone}
            className={`w-full py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
              !phone 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : copied 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            {copied ? (
              <>
                <CheckCircle2 size={18} />
                <span>تم النسخ بنجاح!</span>
              </>
            ) : (
              <>
                <Copy size={18} />
                <span>نسخ الرابط</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
