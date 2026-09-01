import React, { useState } from 'react';
import { Product } from '../types';
import { 
  Sparkles, 
  Loader2, 
  Download, 
  Copy, 
  Check, 
  Eye, 
  FileCode2,
  Terminal,
  CheckCircle2,
  Cpu,
  Zap
} from 'lucide-react';
import { escapeJsString } from '../utils/sanitize';

interface Props {
  product: Product;
}

export function GenericToolSimulator({ product }: Props) {
  const [activeMode, setActiveMode] = useState<'app' | 'source_code'>('app');
  const [inputVal, setInputVal] = useState('');
  const [options, setOptions] = useState({
    tone: 'احترافي',
    outputFormat: 'مفصل',
    language: 'العربية',
    includeInsights: true
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [sourceCopied, setSourceCopied] = useState(false);

  // Suggested preset prompts based on product category & title
  const getSuggestedInput = () => {
    if (product.title.includes('تقرير') || product.title.includes('تحليل') || product.categoryId === 'analytics') {
      return 'المبيعات: 15,000 ريال، التكاليف: 6,200 ريال، عدد العملاء الجدد: 42، معدل التحويل: 3.4%';
    }
    if (product.title.includes('محتوى') || product.title.includes('إعلان') || product.categoryId === 'marketing') {
      return 'حملة تسويقية لمتجر عبايات فاخرة بمناسبة يوم التأسيس، نستهدف النساء في السعودية';
    }
    if (product.title.includes('عملاء') || product.title.includes('رسائل') || product.categoryId === 'customer_support') {
      return 'عميل يسأل عن موعد وصول الشحنة بعد تأخرها يومين، ونريد اعتذاراً مع كود خصم 15%';
    }
    if (product.title.includes('عقد') || product.title.includes('قانون') || product.categoryId === 'legal') {
      return 'اتفاقية تقديم خدمات برمجية وتطوير موقع إلكتروني بين مبرمج مستقل وشركة عقارية';
    }
    return `أريد تطبيق وتشغيل أداة "${product.title}" لمعالجة بيانات مشروعي والوصول لأفضل نتيجة ممكنة.`;
  };

  const handleSimulate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const promptToSend = inputVal.trim() || getSuggestedInput();
    
    setIsProcessing(true);
    setResult(null);

    try {
      const res = await fetch('/api/run-tool', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          toolTitle: product.title,
          toolDescription: `${product.description} - المميزات: ${product.features?.join(', ')} - نبرة الإخراج: ${options.tone} - التنسيق: ${options.outputFormat}`,
          inputData: promptToSend
        })
      });

      if (!res.ok) {
        throw new Error('فشلت عملية المعالجة');
      }

      const data = await res.json();
      setResult(data.result);
    } catch (error) {
      console.error(error);
      setResult('عذراً، حدث خطأ أثناء المعالجة بواسطة محرك الذكاء الاصطناعي.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyResult = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const downloadResultAsFile = () => {
    if (!result) return;
    const blob = new Blob([result], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${product.id}-output.txt`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  const safeName = product.id.replace(/[^a-zA-Z0-9]/g, '').replace(/^(\d)/, '_$1');

  // Pre-generated standalone ready-to-run source code for the buyer
  const generatedStandaloneCode = `// ============================================================================
// 📦 Product: ${escapeJsString(product.title)} (Micro SaaS)
// 📁 Category: ${product.categoryId}
// 💰 Price: $${product.price} (Lifetime Ownership - 100% Commercial Rights)
// ============================================================================

import React, { useState } from 'react';

export default function ${safeName}App() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState('');

  const executeEngine = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      // 🚀 Connect this to your own Gemini API / Backend endpoint
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tool: '${escapeJsString(product.title)}',
          payload: input 
        })
      });
      const data = await response.json();
      setOutput(data.result);
    } catch (err) {
      console.error(err);
      setOutput('Execution completed locally.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto font-sans bg-white shadow-xl rounded-2xl border" dir="rtl">
      <header className="mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900">${escapeJsString(product.title)}</h1>
        <p className="text-gray-500 mt-1">${escapeJsString(product.description)}</p>
      </header>

      <div className="space-y-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="أدخل المدخلات هنا للبدء..."
          className="w-full h-36 p-4 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
        />

        <button
          onClick={executeEngine}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition"
        >
          {loading ? 'جاري التنفيذ والمعالجة...' : 'تشغيل الأداة البرمجية'}
        </button>

        {output && (
          <div className="mt-6 p-5 bg-gray-50 rounded-xl border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-2">النتيجة:</h3>
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">{output}</div>
          </div>
        )}
      </div>
    </div>
  );
}`;

  const copySourceCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedStandaloneCode);
      setSourceCopied(true);
      setTimeout(() => setSourceCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50/50 rounded-2xl border border-gray-200 overflow-hidden" dir="rtl">
      
      {/* Top Bar / Switcher */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
            <Zap size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 text-base">{product.title}</h3>
              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 size={11} />
                أداة مبرمجة وجاهزة
              </span>
            </div>
            <p className="text-xs text-gray-500 truncate max-w-md">{product.description}</p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs font-bold">
          <button
            onClick={() => setActiveMode('app')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeMode === 'app' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Eye size={14} />
            تشغيل التطبيق الحي
          </button>
          <button
            onClick={() => setActiveMode('source_code')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeMode === 'source_code' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileCode2 size={14} />
            لمحة من الكود (مصداقية)
          </button>
        </div>
      </div>

      {activeMode === 'app' ? (
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow">
          
          {/* Controls & Inputs (Left/5 cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            
            {/* Features preview */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-xs font-bold text-gray-500 block mb-2">مميزات الأداة المبرمجة:</span>
              <div className="grid grid-cols-2 gap-2">
                {product.features?.map((feat, idx) => (
                  <div key={idx} className="text-xs text-gray-700 flex items-center gap-1.5 bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <Check size={12} className="text-emerald-600 flex-shrink-0" />
                    <span className="truncate">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Input card */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex-grow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <Terminal size={14} className="text-indigo-600" />
                    بيانات التشغيل والمدخلات:
                  </label>
                  <button
                    type="button"
                    onClick={() => setInputVal(getSuggestedInput())}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold underline"
                  >
                    تعبئة نموذج تجريبي جاهز
                  </button>
                </div>

                <textarea
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="اكتب أو الصق بياناتك هنا لتشغيل الأداة البرمجية..."
                  className="w-full h-36 p-3.5 text-xs text-gray-800 bg-gray-50/70 rounded-xl border border-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none leading-relaxed"
                />

                {/* Parameters */}
                <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-100">
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 block mb-1">نبرة المخرجات</label>
                    <select
                      value={options.tone}
                      onChange={(e) => setOptions({ ...options, tone: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-1.5 text-xs text-gray-700 outline-none"
                    >
                      <option value="احترافي ورسمي">احترافي ورسمي</option>
                      <option value="تسويقي جذاب">تسويقي جذاب</option>
                      <option value="مختصر ونقاط سريعة">مختصر ونقاط</option>
                      <option value="إبداعي وتفصيلي">إبداعي وتفصيلي</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 block mb-1">طبيعة العرض</label>
                    <select
                      value={options.outputFormat}
                      onChange={(e) => setOptions({ ...options, outputFormat: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-1.5 text-xs text-gray-700 outline-none"
                    >
                      <option value="تقرير مفصل">تقرير مفصل</option>
                      <option value="كود وبيانات منظمة">كود وبيانات</option>
                      <option value="جداول وقوائم">جداول وقوائم</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSimulate()}
                disabled={isProcessing}
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-sm text-sm disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    جاري المعالجة والتنفيذ...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    تنفيذ الأداة واستخراج النتيجة
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Output Display (Right/7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col overflow-hidden min-h-[380px]">
            <div className="bg-gray-50/80 px-5 py-3 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                <Cpu size={15} className="text-indigo-600" />
                المخرجات والنتائج البرمجية:
              </div>
              {result && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyResult}
                    className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-600 text-xs flex items-center gap-1 font-medium transition"
                  >
                    {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                    {copied ? 'تم النسخ' : 'نسخ'}
                  </button>
                  <button
                    onClick={downloadResultAsFile}
                    className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-600 text-xs flex items-center gap-1 font-medium transition"
                    title="تنزيل كملف نصي"
                  >
                    <Download size={14} />
                    تنزيل
                  </button>
                </div>
              )}
            </div>

            <div className="p-5 flex-grow flex flex-col overflow-y-auto max-h-[500px]">
              {isProcessing ? (
                <div className="my-auto flex flex-col items-center justify-center text-center p-8">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-3 animate-pulse">
                    <Loader2 size={24} className="animate-spin" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm">يقوم محرك الذكاء الاصطناعي بمعالجة البيانات</h4>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs">تتم معالجة المدخلات ومطابقتها وفق منطق أداة "{product.title}"</p>
                </div>
              ) : result ? (
                <div className="bg-gray-50/60 p-4 rounded-xl border border-gray-200/80 text-xs text-gray-800 leading-relaxed whitespace-pre-wrap font-sans">
                  {result}
                </div>
              ) : (
                <div className="my-auto flex flex-col items-center justify-center text-center p-8 text-gray-400">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 mb-3">
                    <Terminal size={22} />
                  </div>
                  <h4 className="font-bold text-gray-700 text-sm">الأداة في وضع الاستعداد</h4>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs">أدخل البيانات في النموذج واضغط على "تنفيذ الأداة" لترى النتائج الفورية.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      ) : (
        /* Source Code Viewer Mode (LOCKED) */
        <div className="p-6 flex flex-col flex-grow relative">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-xl overflow-hidden flex flex-col flex-grow text-left relative" dir="ltr">
            <div className="bg-gray-950 px-4 py-2.5 border-b border-gray-800 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
              <span className="text-xs font-mono text-gray-400 ml-2">{product.id}.tsx</span>
            </div>
            
            <pre className="p-5 text-xs font-mono text-emerald-400 overflow-hidden max-h-[400px] leading-relaxed select-none relative">
              {/* Show only top 12 lines clearly */}
              <code>{generatedStandaloneCode.split('\n').slice(0, 12).join('\n')}</code>
              
              {/* Blurred lines below */}
              <code className="blur-sm opacity-50 block mt-1 pointer-events-none">
                {generatedStandaloneCode.split('\n').slice(12, 30).join('\n')}
              </code>
              
              {/* Locked overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent flex flex-col items-center justify-end pb-16 z-10">
                <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20 text-center max-w-sm">
                  <div className="w-12 h-12 bg-indigo-500/20 text-indigo-300 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileCode2 size={24} />
                  </div>
                  <h3 className="text-white font-bold mb-2 font-sans" dir="rtl">الملف المصدري محمي بالكامل</h3>
                  <p className="text-gray-300 text-xs font-sans mb-4 leading-relaxed" dir="rtl">
                    هذه لمحة بسيطة من هيكل الكود لإثبات الجودة والمصداقية. لشراء الكود المصدري كاملاً (غير مشفر) مع حقوق الملكية، يرجى إتمام عملية الدفع.
                  </p>
                </div>
              </div>
            </pre>
          </div>
        </div>
      )}

    </div>
  );
}
