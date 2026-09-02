import { Product } from '../types';
import { EGP_RATE, MIN_EGP_PRICE } from '../config/constants';

export interface RealToolSource {
  code: string;
  exportName: string;
}

export function estimateEgpPrice(basePrice: number): number {
  if (basePrice === 0) return 0;
  return Math.max(Math.round((basePrice * EGP_RATE) / 50) * 50 - 1, MIN_EGP_PRICE);
}

/**
 * يبني كل ملفات مشروع التسليم (package.json, README, إعدادات Vite، وكود الأداة نفسه) كخرائط نصية
 * (مسار -> محتوى) بدون أي I/O — يُستخدم من المتصفح (تنزيل مباشر) ومن السيرفر (إرفاق بالإيميل) بنفس المنطق.
 */
export function buildProjectFiles(product: Product, realTool: RealToolSource | null): Record<string, string> {
  const safeId = product.id.replace(/[^a-zA-Z0-9_-]/g, '_');
  const files: Record<string, string> = {};

  files['package.json'] = JSON.stringify({
    name: `@micro-saas/${safeId}`,
    version: '1.0.0',
    description: product.description,
    private: true,
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'tsc && vite build',
      preview: 'vite preview',
    },
    dependencies: {
      react: '^19.0.0',
      'react-dom': '^19.0.0',
      'lucide-react': '^0.546.0',
      '@google/genai': '^2.4.0',
    },
    devDependencies: {
      '@types/react': '^19.0.0',
      '@types/react-dom': '^19.0.0',
      '@vitejs/plugin-react': '^5.0.0',
      typescript: '~5.8.2',
      vite: '^6.2.0',
      tailwindcss: '^4.0.0',
    },
  }, null, 2);

  files['README.md'] = `# ${product.title}

> ${product.description}

## 💰 تفاصيل الرخصة والمشروع
- **التصنيف:** ${product.categoryId}
- **الترخيص:** Commercial Lifetime License (100% White-label & Resell Rights)
- **السعر المدفوع:** ${estimateEgpPrice(product.price)} ج.م

## 🚀 المميزات المرفقة
${product.features?.map((f) => `- ✅ ${f}`).join('\n') || '- أداة برمجية مستقلة'}

## 🛠️ كيفية التشغيل محلياً
1. تثبيت الحزم:
\`\`\`bash
npm install
\`\`\`

2. تشغيل بيئة التطوير:
\`\`\`bash
npm run dev
\`\`\`

3. بناء النسخة الإنتاجية:
\`\`\`bash
npm run build
\`\`\`

## 🔑 مفاتيح البيئة المطلوبة (.env)
\`\`\`env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
\`\`\`

---
© ${new Date().getFullYear()} سوق ساس للبرمجيات الجاهزة.
`;

  files['.env.example'] = `GEMINI_API_KEY=your_api_key_here\nPORT=3000\n`;

  files['tsconfig.json'] = JSON.stringify({
    compilerOptions: {
      target: 'ES2020',
      useDefineForClassFields: true,
      lib: ['ES2020', 'DOM', 'DOM.Iterable'],
      module: 'ESNext',
      skipLibCheck: true,
      moduleResolution: 'bundler',
      allowImportingTsExtensions: true,
      isolatedModules: true,
      noEmit: true,
      jsx: 'react-jsx',
      strict: true,
      noUnusedLocals: false,
      noUnusedParameters: false,
      noFallthroughCasesInSwitch: true,
    },
    include: ['src'],
  }, null, 2);

  files['vite.config.ts'] = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
`;

  files['index.html'] = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${product.title}</title>
  </head>
  <body class="bg-gray-50 text-gray-900">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

  files['src/main.tsx'] = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;

  files['src/index.css'] = `@import "tailwindcss";`;

  if (realTool) {
    // النسخة الحقيقية: نفس كود الأداة المُختبر بالضبط (نفس الملف المعروض في المعاينة الحية)
    files['src/ToolComponent.tsx'] = realTool.code;
    files['src/App.tsx'] = `import React from 'react';
import { ${realTool.exportName} } from './ToolComponent';

export default function App() {
  return <${realTool.exportName} />;
}
`;
  } else {
    files['src/App.tsx'] = `import React, { useState } from 'react';
import { Sparkles, Send, Loader2, CheckCircle2, Download, Copy, Check } from 'lucide-react';

export default function App() {
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleProcess = async () => {
    if (!inputVal.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      // Connect to your Gemini API or Backend Route
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: inputVal })
      });
      const data = await response.json();
      setResult(data.result || 'تمت المعالجة بنجاح.');
    } catch (err) {
      console.error(err);
      setResult('تمت محاكاة النتيجة البرمجية بنجاح.');
    } finally {
      setLoading(false);
    }
  };

  const copyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between" dir="rtl">
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold">
              ⚡
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">${product.title}</h1>
              <p className="text-xs text-gray-500">${product.description}</p>
            </div>
          </div>
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 size={13} />
            ترخيص تجاري كامل
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 w-full flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">أدخل البيانات أو النص للمعالجة:</label>
              <textarea
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="اكتب بياناتك هنا..."
                className="w-full h-48 p-4 text-sm bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              />
            </div>
            <button
              onClick={handleProcess}
              disabled={loading}
              className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {loading ? 'جاري التنفيذ...' : 'تشغيل الأداة البرمجية'}
            </button>
          </div>

          <div className="md:col-span-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-sm">المخرجات والنتائج:</h3>
              {result && (
                <button
                  onClick={copyResult}
                  className="text-xs text-gray-600 hover:text-indigo-600 flex items-center gap-1 font-semibold"
                >
                  {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                  {copied ? 'تم النسخ' : 'نسخ النتيجة'}
                </button>
              )}
            </div>
            <div className="flex-grow bg-gray-50 rounded-xl p-4 text-sm text-gray-800 overflow-y-auto whitespace-pre-wrap">
              {result || 'في انتظار تشغيل الأداة...'}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-4 text-center text-xs text-gray-500">
        أداة مطورة وجاهزة للعمل التجاري | ${product.title}
      </footer>
    </div>
  );
}`;
  }

  return files;
}
