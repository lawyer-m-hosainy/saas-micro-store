import React, { useMemo, useState } from 'react';
import { Copy, FileJson2 } from 'lucide-react';

export type SchemaType = 'Product' | 'Article' | 'FAQPage' | 'LocalBusiness';

export interface ProductFields {
  name: string;
  description: string;
  priceUsd: number;
  currency: string;
  brand: string;
  ratingValue: number;
  reviewCount: number;
}

export interface ArticleFields {
  headline: string;
  authorName: string;
  datePublished: string;
  image: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface LocalBusinessFields {
  name: string;
  address: string;
  telephone: string;
  priceRange: string;
}

/** يبني كائن JSON-LD صحيح ومطابق لمواصفات Schema.org لكل نوع، بدون أي حقول وهمية أو ناقصة */
export function buildJsonLd(type: SchemaType, fields: ProductFields | ArticleFields | FaqItem[] | LocalBusinessFields): object {
  if (type === 'Product') {
    const f = fields as ProductFields;
    return {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: f.name,
      description: f.description,
      brand: { '@type': 'Brand', name: f.brand },
      offers: { '@type': 'Offer', price: f.priceUsd, priceCurrency: f.currency, availability: 'https://schema.org/InStock' },
      ...(f.reviewCount > 0
        ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: f.ratingValue, reviewCount: f.reviewCount } }
        : {}),
    };
  }

  if (type === 'Article') {
    const f = fields as ArticleFields;
    return {
      '@context': 'https://schema.org/',
      '@type': 'Article',
      headline: f.headline,
      author: { '@type': 'Person', name: f.authorName },
      datePublished: f.datePublished,
      image: f.image,
    };
  }

  if (type === 'FAQPage') {
    const items = fields as FaqItem[];
    return {
      '@context': 'https://schema.org/',
      '@type': 'FAQPage',
      mainEntity: items
        .filter((i) => i.question)
        .map((i) => ({
          '@type': 'Question',
          name: i.question,
          acceptedAnswer: { '@type': 'Answer', text: i.answer },
        })),
    };
  }

  const f = fields as LocalBusinessFields;
  return {
    '@context': 'https://schema.org/',
    '@type': 'LocalBusiness',
    name: f.name,
    address: f.address,
    telephone: f.telephone,
    priceRange: f.priceRange,
  };
}

export function toScriptTag(jsonLd: object): string {
  return `<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n</script>`;
}

export function SchemaMarkupBuilderDemo() {
  const [type, setType] = useState<SchemaType>('Product');
  const [product, setProduct] = useState<ProductFields>({ name: 'قالب موقع متجر إلكتروني', description: 'قالب React جاهز لبناء متجر إلكتروني كامل', priceUsd: 49, currency: 'USD', brand: 'Micro SaaS Store', ratingValue: 4.8, reviewCount: 120 });
  const [article, setArticle] = useState<ArticleFields>({ headline: 'كيف تبدأ متجرك الإلكتروني في 2025', authorName: 'فريق المتجر', datePublished: new Date().toISOString().split('T')[0], image: 'https://example.com/cover.jpg' });
  const [faqItems, setFaqItems] = useState<FaqItem[]>([{ question: 'هل الترخيص مدى الحياة؟', answer: 'نعم، دفعة واحدة بدون اشتراك شهري.' }]);
  const [business, setBusiness] = useState<LocalBusinessFields>({ name: 'متجر ساس', address: 'القاهرة، مصر', telephone: '+201142099605', priceRange: '$$' });
  const [copied, setCopied] = useState(false);

  const jsonLd = useMemo(() => {
    if (type === 'Product') return buildJsonLd('Product', product);
    if (type === 'Article') return buildJsonLd('Article', article);
    if (type === 'FAQPage') return buildJsonLd('FAQPage', faqItems);
    return buildJsonLd('LocalBusiness', business);
  }, [type, product, article, faqItems, business]);

  const scriptTag = useMemo(() => toScriptTag(jsonLd), [jsonLd]);

  const copy = async () => {
    await navigator.clipboard.writeText(scriptTag);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-2 text-indigo-900 flex items-center gap-2"><FileJson2 size={20} /> باني أكواد السكيما JSON-LD (نسخة تعمل بالكامل)</h3>
      <p className="text-xs text-gray-500 mb-5">كود مطابق فعليًا لمواصفات Schema.org — جاهز للصق في &lt;head&gt; موقعك.</p>

      <div className="flex bg-white p-1 rounded-lg border border-gray-100 shadow-sm w-fit mb-5">
        {(['Product', 'Article', 'FAQPage', 'LocalBusiness'] as SchemaType[]).map((t) => (
          <button key={t} onClick={() => setType(t)} className={`px-3 py-1.5 text-xs font-bold rounded-md ${type === t ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}>{t}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm space-y-3">
          {type === 'Product' && (
            <>
              <Field label="اسم المنتج" value={product.name} onChange={(v) => setProduct((p) => ({ ...p, name: v }))} />
              <Field label="الوصف" value={product.description} onChange={(v) => setProduct((p) => ({ ...p, description: v }))} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="السعر" value={String(product.priceUsd)} onChange={(v) => setProduct((p) => ({ ...p, priceUsd: Number(v) || 0 }))} dir="ltr" />
                <Field label="العملة" value={product.currency} onChange={(v) => setProduct((p) => ({ ...p, currency: v }))} dir="ltr" />
              </div>
              <Field label="العلامة التجارية" value={product.brand} onChange={(v) => setProduct((p) => ({ ...p, brand: v }))} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="متوسط التقييم" value={String(product.ratingValue)} onChange={(v) => setProduct((p) => ({ ...p, ratingValue: Number(v) || 0 }))} dir="ltr" />
                <Field label="عدد التقييمات" value={String(product.reviewCount)} onChange={(v) => setProduct((p) => ({ ...p, reviewCount: Number(v) || 0 }))} dir="ltr" />
              </div>
            </>
          )}

          {type === 'Article' && (
            <>
              <Field label="العنوان" value={article.headline} onChange={(v) => setArticle((a) => ({ ...a, headline: v }))} />
              <Field label="الكاتب" value={article.authorName} onChange={(v) => setArticle((a) => ({ ...a, authorName: v }))} />
              <Field label="تاريخ النشر" value={article.datePublished} onChange={(v) => setArticle((a) => ({ ...a, datePublished: v }))} dir="ltr" />
              <Field label="رابط الصورة" value={article.image} onChange={(v) => setArticle((a) => ({ ...a, image: v }))} dir="ltr" />
            </>
          )}

          {type === 'FAQPage' && (
            <div className="space-y-3">
              {faqItems.map((item, idx) => (
                <div key={idx} className="border border-gray-100 rounded-md p-2 space-y-1.5">
                  <Field label={`سؤال ${idx + 1}`} value={item.question} onChange={(v) => setFaqItems((prev) => prev.map((it, i) => (i === idx ? { ...it, question: v } : it)))} />
                  <Field label="الإجابة" value={item.answer} onChange={(v) => setFaqItems((prev) => prev.map((it, i) => (i === idx ? { ...it, answer: v } : it)))} />
                </div>
              ))}
              <button onClick={() => setFaqItems((prev) => [...prev, { question: '', answer: '' }])} className="text-xs text-indigo-600 font-bold">+ إضافة سؤال</button>
            </div>
          )}

          {type === 'LocalBusiness' && (
            <>
              <Field label="اسم النشاط" value={business.name} onChange={(v) => setBusiness((b) => ({ ...b, name: v }))} />
              <Field label="العنوان" value={business.address} onChange={(v) => setBusiness((b) => ({ ...b, address: v }))} />
              <Field label="الهاتف" value={business.telephone} onChange={(v) => setBusiness((b) => ({ ...b, telephone: v }))} dir="ltr" />
              <Field label="نطاق السعر" value={business.priceRange} onChange={(v) => setBusiness((b) => ({ ...b, priceRange: v }))} dir="ltr" />
            </>
          )}
        </div>

        <div>
          <div className="flex justify-end mb-1">
            <button onClick={copy} className="text-xs text-indigo-600 font-bold flex items-center gap-1"><Copy size={13} /> {copied ? 'تم النسخ ✓' : 'نسخ الكود'}</button>
          </div>
          <pre dir="ltr" className="w-full h-96 p-3 font-mono text-[11px] border rounded-lg bg-gray-900 text-emerald-300 overflow-auto whitespace-pre-wrap">
            {scriptTag}
          </pre>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, dir }: { label: string; value: string; onChange: (v: string) => void; dir?: string }) {
  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" dir={dir} />
    </div>
  );
}
