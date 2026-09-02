import React, { useMemo, useState } from 'react';
import { AlertTriangle, MessageSquareHeart, Star } from 'lucide-react';

export interface CsatRating {
  id: string;
  score: number; // 1-5
  comment?: string;
}

export interface CsatSummary {
  count: number;
  avgScore: number;
  csatPct: number; // % من الردود 4 أو 5
  detractorPct: number; // % من الردود 1 أو 2
}

/** CSAT% = نسبة الردود الإيجابية (4-5 نجوم) من إجمالي الردود — المقياس القياسي المستخدم عالمياً لقياس رضا العملاء */
export function summarizeCsat(ratings: CsatRating[]): CsatSummary {
  const count = ratings.length;
  if (count === 0) return { count: 0, avgScore: 0, csatPct: 0, detractorPct: 0 };

  const avgScore = ratings.reduce((s, r) => s + r.score, 0) / count;
  const satisfied = ratings.filter((r) => r.score >= 4).length;
  const detractors = ratings.filter((r) => r.score <= 2).length;

  return { count, avgScore, csatPct: (satisfied / count) * 100, detractorPct: (detractors / count) * 100 };
}

const seedRatings = (): CsatRating[] => [
  { id: '1', score: 5, comment: 'خدمة ممتازة وسريعة' },
  { id: '2', score: 4 },
  { id: '3', score: 2, comment: 'استغرق الرد وقت طويل' },
  { id: '4', score: 5 },
  { id: '5', score: 3 },
];

export function CsatFeedbackSurveyWidgetDemo() {
  const [ratings, setRatings] = useState<CsatRating[]>(seedRatings());
  const [myScore, setMyScore] = useState(0);
  const [myComment, setMyComment] = useState('');

  const summary = useMemo(() => summarizeCsat(ratings), [ratings]);
  const negativeComments = ratings.filter((r) => r.score <= 2 && r.comment);

  const submit = () => {
    if (myScore === 0) return;
    setRatings((prev) => [...prev, { id: Date.now().toString(), score: myScore, comment: myComment || undefined }]);
    setMyScore(0);
    setMyComment('');
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-6 text-indigo-900 flex items-center gap-2"><MessageSquareHeart size={20} /> ويدجت قياس رضا العملاء CSAT (نسخة تعمل بالكامل)</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <h4 className="font-bold text-gray-700 mb-3 text-sm">كيف كانت تجربتك معنا؟</h4>
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setMyScore(n)}>
                <Star size={32} className={n <= myScore ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
              </button>
            ))}
          </div>
          <textarea value={myComment} onChange={(e) => setMyComment(e.target.value)} placeholder="أي ملاحظات إضافية؟ (اختياري)" className="w-full px-3 py-2 border rounded-md text-sm h-16 mb-3" />
          <button onClick={submit} disabled={myScore === 0} className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 text-sm">إرسال التقييم</button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Stat label="عدد الردود" value={summary.count.toString()} />
            <Stat label="متوسط النجوم" value={`${summary.avgScore.toFixed(1)}/5`} />
            <Stat label="CSAT%" value={`${summary.csatPct.toFixed(0)}%`} tone={summary.csatPct >= 70 ? 'emerald' : 'amber'} />
          </div>

          {summary.detractorPct > 20 && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs font-bold p-3 rounded-lg">
              <AlertTriangle size={14} /> {summary.detractorPct.toFixed(0)}% من العملاء غير راضين — يستحق مراجعة عاجلة
            </div>
          )}

          <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
            <h4 className="font-bold text-gray-700 text-xs mb-2">توزيع التقييمات</h4>
            <div className="space-y-1.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratings.filter((r) => r.score === star).length;
                const pct = ratings.length ? (count / ratings.length) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="w-8 text-gray-500">{star} ⭐</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div className="bg-amber-400 h-2 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-6 text-gray-400">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {negativeComments.length > 0 && (
            <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
              <h4 className="font-bold text-red-600 text-xs mb-2">ملاحظات سلبية تحتاج متابعة</h4>
              {negativeComments.map((c) => (
                <p key={c.id} className="text-xs text-gray-600 border-r-2 border-red-300 pr-2 mb-1.5">"{c.comment}"</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'emerald' | 'amber' }) {
  const cls = tone === 'emerald' ? 'text-emerald-600' : tone === 'amber' ? 'text-amber-600' : 'text-gray-800';
  return (
    <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm text-center">
      <div className={`font-mono font-black text-lg ${cls}`}>{value}</div>
      <div className="text-[9px] text-gray-500">{label}</div>
    </div>
  );
}
