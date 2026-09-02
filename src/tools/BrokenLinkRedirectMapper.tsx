import React, { useMemo, useState } from 'react';
import { Copy, Link2Off } from 'lucide-react';

/** مسافة Levenshtein القياسية بين نصين (أقل عدد من التعديلات لتحويل نص لآخر) */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

/** درجة تشابه من 0 إلى 1 (1 = تطابق تام) مبنية على مسافة Levenshtein نسبةً لأطول نص */
export function similarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshteinDistance(a, b) / maxLen;
}

export interface RedirectMapping {
  brokenUrl: string;
  bestMatch: string | null;
  confidence: number;
}

/** لكل رابط معطل، يجد أقرب صفحة حية بمقارنة مسار الرابط (path) بخوارزمية التشابه النصي */
export function mapRedirects(brokenUrls: string[], liveUrls: string[]): RedirectMapping[] {
  const paths = (url: string) => {
    try {
      return new URL(url, 'https://placeholder.local').pathname;
    } catch {
      return url;
    }
  };

  return brokenUrls.map((broken) => {
    if (liveUrls.length === 0) return { brokenUrl: broken, bestMatch: null, confidence: 0 };
    const brokenPath = paths(broken);
    let best = liveUrls[0];
    let bestScore = similarity(brokenPath, paths(liveUrls[0]));
    for (const live of liveUrls.slice(1)) {
      const score = similarity(brokenPath, paths(live));
      if (score > bestScore) {
        bestScore = score;
        best = live;
      }
    }
    return { brokenUrl: broken, bestMatch: best, confidence: bestScore };
  });
}

export function buildApacheRules(mappings: RedirectMapping[]): string {
  return mappings
    .filter((m) => m.bestMatch)
    .map((m) => `Redirect 301 ${new URL(m.brokenUrl, 'https://placeholder.local').pathname} ${m.bestMatch}`)
    .join('\n');
}

export function buildNginxRules(mappings: RedirectMapping[]): string {
  return mappings
    .filter((m) => m.bestMatch)
    .map((m) => `rewrite ^${new URL(m.brokenUrl, 'https://placeholder.local').pathname}$ ${m.bestMatch} permanent;`)
    .join('\n');
}

const sampleBroken = `https://store.com/prodcut/red-shoes
https://store.com/blog/how-to-choos-size
https://store.com/catgory/electronics`;

const sampleLive = `https://store.com/product/red-shoes
https://store.com/blog/how-to-choose-size
https://store.com/category/electronics
https://store.com/about-us`;

export function BrokenLinkRedirectMapperDemo() {
  const [brokenRaw, setBrokenRaw] = useState(sampleBroken);
  const [liveRaw, setLiveRaw] = useState(sampleLive);
  const [format, setFormat] = useState<'apache' | 'nginx'>('apache');
  const [copied, setCopied] = useState(false);

  const mappings = useMemo(() => {
    const broken = brokenRaw.split('\n').map((s) => s.trim()).filter(Boolean);
    const live = liveRaw.split('\n').map((s) => s.trim()).filter(Boolean);
    return mapRedirects(broken, live);
  }, [brokenRaw, liveRaw]);

  const rules = useMemo(() => (format === 'apache' ? buildApacheRules(mappings) : buildNginxRules(mappings)), [mappings, format]);

  const copy = async () => {
    await navigator.clipboard.writeText(rules);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-2 text-indigo-900 flex items-center gap-2"><Link2Off size={20} /> خريطة تحويل الروابط المعطلة (نسخة تعمل بالكامل)</h3>
      <p className="text-xs text-gray-500 mb-5">مطابقة حقيقية بخوارزمية Levenshtein — كل سطر رابط واحد.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">روابط 404 المعطلة</label>
          <textarea value={brokenRaw} onChange={(e) => setBrokenRaw(e.target.value)} dir="ltr" spellCheck={false} className="w-full h-28 p-3 font-mono text-[11px] border rounded-lg bg-white" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">الروابط الحية الحالية</label>
          <textarea value={liveRaw} onChange={(e) => setLiveRaw(e.target.value)} dir="ltr" spellCheck={false} className="w-full h-28 p-3 font-mono text-[11px] border rounded-lg bg-white" />
        </div>
      </div>

      <div className="space-y-2 mb-5">
        {mappings.map((m, i) => (
          <div key={i} className="bg-white p-3 rounded-lg border border-gray-100 flex items-center justify-between gap-2 text-xs" dir="ltr">
            <span className="text-red-600 font-mono truncate flex-1">{m.brokenUrl}</span>
            <span className="text-gray-400">→</span>
            <span className="text-emerald-700 font-mono truncate flex-1">{m.bestMatch || '—'}</span>
            <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${m.confidence > 0.6 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{Math.round(m.confidence * 100)}%</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-1">
        <div className="flex bg-white p-1 rounded-lg border border-gray-100">
          <button onClick={() => setFormat('apache')} className={`px-3 py-1 text-xs font-bold rounded-md ${format === 'apache' ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}>Apache (.htaccess)</button>
          <button onClick={() => setFormat('nginx')} className={`px-3 py-1 text-xs font-bold rounded-md ${format === 'nginx' ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}>Nginx</button>
        </div>
        <button onClick={copy} className="text-xs text-indigo-600 font-bold flex items-center gap-1"><Copy size={13} /> {copied ? 'تم ✓' : 'نسخ'}</button>
      </div>
      <pre dir="ltr" className="w-full p-3 font-mono text-[11px] border rounded-lg bg-gray-900 text-emerald-300 overflow-auto whitespace-pre-wrap min-h-[80px]">
        {rules || '—'}
      </pre>
    </div>
  );
}
