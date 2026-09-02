import React, { useMemo, useRef, useState } from 'react';
import { Crop, Download, Upload } from 'lucide-react';

export interface SizePreset {
  id: string;
  label: string;
  width: number;
  height: number;
}

export const SOCIAL_PRESETS: SizePreset[] = [
  { id: 'ig-post', label: 'إنستجرام - منشور مربع', width: 1080, height: 1080 },
  { id: 'ig-story', label: 'إنستجرام - ستوري', width: 1080, height: 1920 },
  { id: 'fb-cover', label: 'فيسبوك - غلاف الصفحة', width: 820, height: 312 },
  { id: 'fb-post', label: 'فيسبوك - منشور', width: 1200, height: 630 },
  { id: 'x-post', label: 'إكس (تويتر) - منشور', width: 1200, height: 675 },
  { id: 'tiktok', label: 'تيك توك - فيديو/صورة', width: 1080, height: 1920 },
  { id: 'linkedin-post', label: 'لينكدإن - منشور', width: 1200, height: 627 },
  { id: 'youtube-thumb', label: 'يوتيوب - صورة مصغرة', width: 1280, height: 720 },
];

/** يحسب أبعاد القص (Cover Fit) للحفاظ على تناسق العناصر بدون تمدد أو تشويه الصورة عند تغيير المقاس */
export function computeCoverCrop(sourceW: number, sourceH: number, targetW: number, targetH: number) {
  const sourceRatio = sourceW / sourceH;
  const targetRatio = targetW / targetH;

  let cropW = sourceW;
  let cropH = sourceH;

  if (sourceRatio > targetRatio) {
    cropW = sourceH * targetRatio;
  } else {
    cropH = sourceW / targetRatio;
  }

  const cropX = (sourceW - cropW) / 2;
  const cropY = (sourceH - cropH) / 2;

  return { cropX, cropY, cropW, cropH };
}

export function SocialBannerAutoResizerDemo() {
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  const [selectedPresets, setSelectedPresets] = useState<Set<string>>(new Set(['ig-post', 'fb-cover', 'x-post']));
  const canvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({});

  const activePresets = useMemo(() => SOCIAL_PRESETS.filter((p) => selectedPresets.has(p.id)), [selectedPresets]);

  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => setImageEl(img);
    img.src = URL.createObjectURL(file);
  };

  const drawPreset = (preset: SizePreset, canvas: HTMLCanvasElement | null) => {
    if (!canvas || !imageEl) return;
    canvas.width = preset.width;
    canvas.height = preset.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { cropX, cropY, cropW, cropH } = computeCoverCrop(imageEl.naturalWidth, imageEl.naturalHeight, preset.width, preset.height);
    ctx.drawImage(imageEl, cropX, cropY, cropW, cropH, 0, 0, preset.width, preset.height);
  };

  const togglePreset = (id: string) => {
    setSelectedPresets((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const downloadPreset = (preset: SizePreset) => {
    const canvas = canvasRefs.current[preset.id];
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${preset.id}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-2 text-indigo-900 flex items-center gap-2"><Crop size={20} /> مكيف مقاسات التصاميم التلقائي (نسخة تعمل بالكامل)</h3>
      <p className="text-xs text-gray-500 mb-5">قص وتحجيم حقيقي عبر Canvas — يحافظ على تناسق عناصر الصورة بدون تشويه.</p>

      <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-sm text-gray-500 cursor-pointer hover:border-indigo-300 bg-white mb-5">
        <Upload size={18} /> {imageEl ? 'استبدل الصورة' : 'ارفع صورة تصميمك'}
        <input type="file" accept="image/*" className="hidden" onChange={onFileSelected} />
      </label>

      <div className="flex flex-wrap gap-2 mb-5">
        {SOCIAL_PRESETS.map((p) => (
          <button key={p.id} onClick={() => togglePreset(p.id)} className={`text-xs font-bold px-3 py-1.5 rounded-full border ${selectedPresets.has(p.id) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-500 border-gray-200'}`}>
            {p.label} ({p.width}×{p.height})
          </button>
        ))}
      </div>

      {!imageEl && <p className="text-sm text-gray-400 text-center py-8">ارفع صورة عشان تشوف كل المقاسات بتتولد فورًا.</p>}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {imageEl && activePresets.map((p) => (
          <div key={p.id} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
            <p className="text-[11px] font-bold text-gray-700 mb-2">{p.label}</p>
            <div className="bg-gray-100 rounded-md overflow-hidden mb-2" style={{ aspectRatio: `${p.width}/${p.height}` }}>
              <canvas
                ref={(el) => {
                  canvasRefs.current[p.id] = el;
                  drawPreset(p, el);
                }}
                className="w-full h-full object-contain"
              />
            </div>
            <button onClick={() => downloadPreset(p)} className="w-full flex items-center justify-center gap-1.5 bg-indigo-50 text-indigo-700 py-1.5 rounded-md text-xs font-bold hover:bg-indigo-100">
              <Download size={12} /> تحميل PNG
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
