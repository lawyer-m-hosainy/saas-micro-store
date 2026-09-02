import React, { useMemo, useState } from 'react';
import { Copy, MessageSquareText, Search } from 'lucide-react';

export interface Snippet {
  id: string;
  category: string;
  title: string;
  body: string;
}

/** يبحث في العنوان والمحتوى والتصنيف معًا (غير حساس لحالة الأحرف)، ويرجّع أفضل تطابق أولاً بترتيب ظهور الكلمة في العنوان */
export function searchSnippets(snippets: Snippet[], query: string): Snippet[] {
  const q = query.trim().toLowerCase();
  if (!q) return snippets;

  const matches = snippets.filter(
    (s) => s.title.toLowerCase().includes(q) || s.body.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
  );

  return matches.sort((a, b) => {
    const aInTitle = a.title.toLowerCase().includes(q) ? 0 : 1;
    const bInTitle = b.title.toLowerCase().includes(q) ? 0 : 1;
    return aInTitle - bInTitle;
  });
}

export function groupByCategory(snippets: Snippet[]): Map<string, Snippet[]> {
  const map = new Map<string, Snippet[]>();
  snippets.forEach((s) => {
    const list = map.get(s.category) || [];
    list.push(s);
    map.set(s.category, list);
  });
  return map;
}

const seedSnippets = (): Snippet[] => [
  { id: '1', category: 'ترحيب', title: 'رسالة ترحيب أولى', body: 'أهلاً بيك في خدمة عملاء متجرنا! إزاي أقدر أساعدك النهاردة؟' },
  { id: '2', category: 'شحن', title: 'تأخر الشحنة', body: 'نعتذر عن التأخير في شحنتك، تم تصعيد الأمر لشركة الشحن وهتوصلك خلال 24-48 ساعة.' },
  { id: '3', category: 'شحن', title: 'تتبع الطلب', body: 'تقدر تتابع حالة طلبك من خلال رقم التتبع اللي وصلك في رسالة التأكيد.' },
  { id: '4', category: 'استرجاع', title: 'سياسة الاسترجاع', body: 'تقدر ترجع أي منتج خلال 14 يوم من الاستلام بشرط إنه في حالته الأصلية.' },
  { id: '5', category: 'إغلاق', title: 'إغلاق المحادثة', body: 'شكراً لتواصلك معنا! لو احتجت أي حاجة تانية إحنا موجودين في أي وقت 🌟' },
];

export function CannedResponseSnippetManagerDemo() {
  const [snippets] = useState<Snippet[]>(seedSnippets());
  const [query, setQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = useMemo(() => searchSnippets(snippets, query), [snippets, query]);
  const grouped = useMemo(() => groupByCategory(filtered), [filtered]);

  const copy = async (s: Snippet) => {
    await navigator.clipboard.writeText(s.body);
    setCopiedId(s.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-2 text-indigo-900 flex items-center gap-2"><MessageSquareText size={20} /> مدير الردود السريعة (نسخة تعمل بالكامل)</h3>
      <p className="text-xs text-gray-500 mb-5">بحث لحظي حقيقي في كل الردود، ونسخ بضغطة واحدة.</p>

      <div className="relative mb-5">
        <Search size={15} className="absolute right-3 top-2.5 text-gray-400" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="دوّر في الردود..." className="w-full pr-9 pl-3 py-2.5 border rounded-lg text-sm bg-white" />
      </div>

      <div className="space-y-5">
        {Array.from(grouped.entries()).map(([category, items]) => (
          <div key={category}>
            <h4 className="text-xs font-bold text-indigo-600 mb-2 uppercase tracking-wide">{category} ({items.length})</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {items.map((s) => (
                <div key={s.id} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-gray-800">{s.title}</span>
                    <button onClick={() => copy(s)} className="text-[10px] text-indigo-600 font-bold flex items-center gap-1"><Copy size={11} /> {copiedId === s.id ? 'تم ✓' : 'نسخ'}</button>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-sm text-gray-400 text-center py-10">مفيش ردود مطابقة للبحث.</p>}
      </div>
    </div>
  );
}
