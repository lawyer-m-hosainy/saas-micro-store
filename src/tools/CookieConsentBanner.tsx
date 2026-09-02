import React, { useMemo, useState } from 'react';
import { Copy, Cookie } from 'lucide-react';

export interface BannerConfig {
  message: string;
  acceptLabel: string;
  rejectLabel: string;
  accentColor: string;
  position: 'bottom' | 'top';
  language: 'ar' | 'en';
}

/** يولّد HTML/CSS/JS خفيف الوزن (بدون أي مكتبة) لبانر موافقة كوكيز حقيقي يعمل بمجرد لصقه — يخزن القرار في localStorage ويمنع إعادة الظهور */
export function generateBannerSnippet(cfg: BannerConfig): string {
  const posCss = cfg.position === 'bottom' ? 'bottom:0' : 'top:0';
  return `<!-- Cookie Consent Banner — الصق هذا الكود قبل </body> -->
<div id="cookie-consent-banner" style="position:fixed;${posCss};inset-inline:0;z-index:9999;display:none;background:#111827;color:#fff;padding:16px 20px;font-family:sans-serif;font-size:14px;box-shadow:0 -2px 12px rgba(0,0,0,.15)">
  <div style="max-width:960px;margin:0 auto;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px">
    <span>${cfg.message}</span>
    <div style="display:flex;gap:8px;flex-shrink:0">
      <button id="cookie-consent-reject" style="background:transparent;border:1px solid #6b7280;color:#fff;padding:8px 16px;border-radius:8px;cursor:pointer">${cfg.rejectLabel}</button>
      <button id="cookie-consent-accept" style="background:${cfg.accentColor};border:0;color:#fff;padding:8px 16px;border-radius:8px;cursor:pointer;font-weight:bold">${cfg.acceptLabel}</button>
    </div>
  </div>
</div>
<script>
(function () {
  var STORAGE_KEY = 'cookie_consent_v1';
  var banner = document.getElementById('cookie-consent-banner');
  var saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}

  if (!saved) {
    banner.style.display = 'block';
  } else {
    window.dispatchEvent(new CustomEvent('cookieConsentChange', { detail: { consent: saved } }));
  }

  function setConsent(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) {}
    banner.style.display = 'none';
    window.dispatchEvent(new CustomEvent('cookieConsentChange', { detail: { consent: value } }));
  }

  document.getElementById('cookie-consent-accept').addEventListener('click', function () { setConsent('accepted'); });
  document.getElementById('cookie-consent-reject').addEventListener('click', function () { setConsent('rejected'); });
})();
</script>`;
}

export function estimateSnippetSizeKb(cfg: BannerConfig): number {
  return Math.round((generateBannerSnippet(cfg).length / 1024) * 100) / 100;
}

const defaultConfig: BannerConfig = {
  message: 'نستخدم ملفات تعريف الارتباط لتحسين تجربتك. بالمتابعة أنت توافق على سياسة الخصوصية.',
  acceptLabel: 'موافق',
  rejectLabel: 'رفض',
  accentColor: '#4f46e5',
  position: 'bottom',
  language: 'ar',
};

export function CookieConsentBannerDemo() {
  const [cfg, setCfg] = useState<BannerConfig>(defaultConfig);
  const [copied, setCopied] = useState(false);

  const snippet = useMemo(() => generateBannerSnippet(cfg), [cfg]);
  const sizeKb = useMemo(() => estimateSnippetSizeKb(cfg), [cfg]);

  const set = <K extends keyof BannerConfig>(key: K) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setCfg((prev) => ({ ...prev, [key]: e.target.value as BannerConfig[K] }));
  };

  const copy = async () => {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-2 text-indigo-900 flex items-center gap-2"><Cookie size={20} /> صانع لافتات موافقة الكوكيز (نسخة تعمل بالكامل)</h3>
      <p className="text-xs text-gray-500 mb-5">كود حقيقي بدون أي مكتبة خارجية — حجم الكود الحالي: <b className="text-gray-800">{sizeKb} كيلوبايت</b></p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">نص الرسالة</label>
            <textarea value={cfg.message} onChange={set('message')} className="w-full px-3 py-2 border rounded-md text-sm h-20" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="زر الموافقة" value={cfg.acceptLabel} onChange={set('acceptLabel')} />
            <Field label="زر الرفض" value={cfg.rejectLabel} onChange={set('rejectLabel')} />
          </div>
          <div className="grid grid-cols-2 gap-3 items-end">
            <div>
              <label className="block text-xs text-gray-600 mb-1">اللون الأساسي</label>
              <input type="color" value={cfg.accentColor} onChange={set('accentColor')} className="w-full h-9 border rounded-md p-0.5" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">موضع اللافتة</label>
              <select value={cfg.position} onChange={set('position')} className="w-full px-2 py-2 border rounded-md text-sm">
                <option value="bottom">أسفل الصفحة</option>
                <option value="top">أعلى الصفحة</option>
              </select>
            </div>
          </div>

          <div className={`mt-3 rounded-lg overflow-hidden border ${cfg.position === 'bottom' ? 'flex flex-col-reverse' : 'flex flex-col'} h-28 bg-gray-100`}>
            <div className="text-white text-xs p-3 flex items-center justify-between gap-2" style={{ background: '#111827' }}>
              <span className="line-clamp-2">{cfg.message}</span>
              <div className="flex gap-1.5 shrink-0">
                <span className="border border-gray-400 px-2 py-1 rounded">{cfg.rejectLabel}</span>
                <span className="px-2 py-1 rounded font-bold" style={{ background: cfg.accentColor }}>{cfg.acceptLabel}</span>
              </div>
            </div>
            <div className="flex-1" />
          </div>
        </div>

        <div>
          <div className="flex justify-end mb-1">
            <button onClick={copy} className="text-xs text-indigo-600 font-bold flex items-center gap-1"><Copy size={13} /> {copied ? 'تم النسخ ✓' : 'نسخ الكود الكامل'}</button>
          </div>
          <pre dir="ltr" className="w-full h-[380px] p-3 font-mono text-[10.5px] border rounded-lg bg-gray-900 text-emerald-300 overflow-auto whitespace-pre-wrap">
            {snippet}
          </pre>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      <input value={value} onChange={onChange} className="w-full px-3 py-2 border rounded-md text-sm" />
    </div>
  );
}
