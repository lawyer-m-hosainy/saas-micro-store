import React, { useMemo, useState } from 'react';
import { Copy, Palette } from 'lucide-react';

const HEX_COLOR_RE = /#[0-9a-fA-F]{3,8}\b/g;

/** يزيل عناصر <script> ومعالجات الأحداث (onClick, onLoad...) قبل عرض الـSVG في المعاينة الحية، لمنع تنفيذ أي كود مدمج */
export function sanitizeSvgForPreview(svg: string): string {
  return svg
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+\s*=\s*(["']).*?\1/gi, '')
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, '');
}

/** يستخرج كل قيم الألوان hex الفريدة الموجودة داخل fill/stroke بأي عنصر SVG */
export function extractColors(svg: string): string[] {
  const matches = svg.match(HEX_COLOR_RE) || [];
  return Array.from(new Set(matches.map((c) => c.toLowerCase())));
}

/** يستبدل كل تكرار للون قديم بلون جديد داخل كود الـSVG (غير حساس لحالة الأحرف) */
export function recolorSvg(svg: string, colorMap: Record<string, string>): string {
  let result = svg;
  for (const [oldColor, newColor] of Object.entries(colorMap)) {
    if (!newColor) continue;
    const re = new RegExp(oldColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    result = result.replace(re, newColor);
  }
  return result;
}

const sampleSvg = `<svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <circle cx="24" cy="24" r="20" fill="#4F46E5"/>
  <path d="M16 24l6 6 12-12" stroke="#FFFFFF" stroke-width="3" fill="none"/>
  <rect x="4" y="38" width="40" height="4" rx="2" fill="#1E1B4B"/>
</svg>`;

export function VectorIconPaletteRecolorDemo() {
  const [svg, setSvg] = useState(sampleSvg);
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  const colors = useMemo(() => extractColors(svg), [svg]);
  const recolored = useMemo(() => recolorSvg(svg, overrides), [svg, overrides]);

  const setColor = (oldColor: string, newColor: string) => setOverrides((prev) => ({ ...prev, [oldColor]: newColor }));

  const copy = async () => {
    await navigator.clipboard.writeText(recolored);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-2 text-indigo-900 flex items-center gap-2"><Palette size={20} /> مُغير ألوان أيقونات SVG (نسخة تعمل بالكامل)</h3>
      <p className="text-xs text-gray-500 mb-5">استخراج واستبدال حقيقي لكل قيم الألوان داخل كود SVG — معاينة حية فورية.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <label className="block text-xs text-gray-600 mb-1 font-bold">كود SVG</label>
          <textarea value={svg} onChange={(e) => setSvg(e.target.value)} dir="ltr" spellCheck={false} className="w-full h-56 p-3 font-mono text-[11px] border rounded-lg bg-white" />

          {colors.length > 0 && (
            <div className="mt-3 bg-white p-3 rounded-lg border border-gray-100 space-y-2">
              <p className="text-xs font-bold text-gray-600">الألوان المكتشفة ({colors.length})</p>
              {colors.map((c) => (
                <div key={c} className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded border border-gray-200" style={{ background: c }} />
                  <span className="font-mono text-xs text-gray-500 w-20">{c}</span>
                  <span className="text-gray-300">→</span>
                  <input type="color" value={overrides[c] || c} onChange={(e) => setColor(c, e.target.value)} className="w-9 h-7 border rounded p-0.5" />
                  <span className="font-mono text-xs text-indigo-600">{overrides[c] || 'بدون تغيير'}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm flex flex-col items-center">
          <p className="text-xs font-bold text-gray-600 mb-3">معاينة حية</p>
          <div className="w-32 h-32 flex items-center justify-center bg-gray-50 rounded-lg" dangerouslySetInnerHTML={{ __html: sanitizeSvgForPreview(recolored) }} />
          <button onClick={copy} className="mt-4 w-full flex items-center justify-center gap-1.5 bg-indigo-600 text-white py-2 rounded-md text-xs font-bold hover:bg-indigo-700">
            <Copy size={13} /> {copied ? 'تم النسخ ✓' : 'نسخ كود SVG الجديد'}
          </button>
        </div>
      </div>
    </div>
  );
}
