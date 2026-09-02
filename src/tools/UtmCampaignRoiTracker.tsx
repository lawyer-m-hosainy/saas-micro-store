import React, { useMemo, useState } from 'react';
import { Copy, Link as LinkIcon, Trash2, TrendingUp } from 'lucide-react';

export interface UtmParams {
  baseUrl: string;
  source: string;
  medium: string;
  campaign: string;
}

/** يبني رابط UTM قياسي (utm_source/medium/campaign) بترميز صحيح للقيم عبر encodeURIComponent */
export function buildUtmLink(p: UtmParams): string {
  if (!p.baseUrl) return '';
  const separator = p.baseUrl.includes('?') ? '&' : '?';
  const params = [
    p.source && `utm_source=${encodeURIComponent(p.source)}`,
    p.medium && `utm_medium=${encodeURIComponent(p.medium)}`,
    p.campaign && `utm_campaign=${encodeURIComponent(p.campaign)}`,
  ].filter(Boolean);
  return params.length ? `${p.baseUrl}${separator}${params.join('&')}` : p.baseUrl;
}

export interface CampaignStat {
  id: string;
  name: string;
  spend: number;
  clicks: number;
  conversions: number;
  revenue: number;
}

export interface CampaignResult extends CampaignStat {
  cpc: number;
  conversionRatePct: number;
  roiPct: number;
}

/** ROI% = (الإيراد - الإنفاق) / الإنفاق × 100، ومعدل التحويل = التحويلات / النقرات */
export function analyzeCampaigns(stats: CampaignStat[]): CampaignResult[] {
  return stats.map((s) => ({
    ...s,
    cpc: s.clicks > 0 ? s.spend / s.clicks : 0,
    conversionRatePct: s.clicks > 0 ? (s.conversions / s.clicks) * 100 : 0,
    roiPct: s.spend > 0 ? ((s.revenue - s.spend) / s.spend) * 100 : 0,
  }));
}

const emptyCampaign = (n: number): CampaignStat => ({ id: Date.now().toString() + n, name: `حملة ${n}`, spend: 500, clicks: 400, conversions: 20, revenue: 1200 });

export function UtmCampaignRoiTrackerDemo() {
  const [utm, setUtm] = useState<UtmParams>({ baseUrl: 'https://store.example.com/product/x', source: 'instagram', medium: 'influencer', campaign: 'ramadan2025' });
  const [copied, setCopied] = useState(false);
  const [campaigns, setCampaigns] = useState<CampaignStat[]>([
    { id: '1', name: 'مؤثر أ (Instagram)', spend: 800, clicks: 1200, conversions: 60, revenue: 2400 },
    { id: '2', name: 'إعلانات فيسبوك', spend: 1500, clicks: 3000, conversions: 90, revenue: 2700 },
  ]);

  const link = useMemo(() => buildUtmLink(utm), [utm]);
  const results = useMemo(() => analyzeCampaigns(campaigns).sort((a, b) => b.roiPct - a.roiPct), [campaigns]);

  const setUtmField = (key: keyof UtmParams) => (e: React.ChangeEvent<HTMLInputElement>) => setUtm((prev) => ({ ...prev, [key]: e.target.value }));
  const updateCampaign = (id: string, field: keyof CampaignStat, value: string) => {
    setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: field === 'name' ? value : Number(value) || 0 } : c)));
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-6 text-indigo-900 flex items-center gap-2"><TrendingUp size={20} /> متتبع عوائد حملات UTM (نسخة تعمل بالكامل)</h3>

      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm mb-5">
        <h4 className="font-bold text-gray-700 mb-3 text-sm flex items-center gap-1.5"><LinkIcon size={14} /> بناء رابط تتبع UTM</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
          <input value={utm.baseUrl} onChange={setUtmField('baseUrl')} placeholder="الرابط الأساسي" className="col-span-2 md:col-span-1 px-2 py-2 border rounded-md text-xs" dir="ltr" />
          <input value={utm.source} onChange={setUtmField('source')} placeholder="المصدر (source)" className="px-2 py-2 border rounded-md text-xs" dir="ltr" />
          <input value={utm.medium} onChange={setUtmField('medium')} placeholder="الوسيلة (medium)" className="px-2 py-2 border rounded-md text-xs" dir="ltr" />
          <input value={utm.campaign} onChange={setUtmField('campaign')} placeholder="اسم الحملة" className="px-2 py-2 border rounded-md text-xs" dir="ltr" />
        </div>
        <div className="flex items-center gap-2 bg-gray-50 border rounded-md p-2">
          <code dir="ltr" className="flex-1 text-[11px] text-indigo-700 overflow-x-auto whitespace-nowrap">{link || '—'}</code>
          <button onClick={copyLink} className="text-xs text-indigo-600 font-bold flex items-center gap-1 shrink-0"><Copy size={13} /> {copied ? 'تم ✓' : 'نسخ'}</button>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {results.map((c, idx) => (
          <div key={c.id} className={`bg-white p-4 rounded-lg border shadow-sm ${idx === 0 ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-gray-100'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <input value={c.name} onChange={(e) => updateCampaign(c.id, 'name', e.target.value)} className="font-bold text-sm text-gray-800 border-b border-transparent focus:border-indigo-300 outline-none" />
                {idx === 0 && <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">الأفضل عائداً</span>}
              </div>
              {campaigns.length > 1 && (
                <button onClick={() => setCampaigns((prev) => prev.filter((x) => x.id !== c.id))} className="text-gray-300 hover:text-red-500"><Trash2 size={14} /></button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
              <Mini label="الإنفاق" value={c.spend} onChange={(v) => updateCampaign(c.id, 'spend', v)} />
              <Mini label="النقرات" value={c.clicks} onChange={(v) => updateCampaign(c.id, 'clicks', v)} />
              <Mini label="التحويلات" value={c.conversions} onChange={(v) => updateCampaign(c.id, 'conversions', v)} />
              <Mini label="الإيرادات" value={c.revenue} onChange={(v) => updateCampaign(c.id, 'revenue', v)} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <StatMini label="تكلفة النقرة" value={`${c.cpc.toFixed(2)} ج.م`} />
              <StatMini label="معدل التحويل" value={`${c.conversionRatePct.toFixed(1)}%`} />
              <StatMini label="ROI" value={`${c.roiPct.toFixed(0)}%`} tone={c.roiPct >= 0 ? 'emerald' : 'red'} />
            </div>
          </div>
        ))}
      </div>

      <button onClick={() => setCampaigns((prev) => [...prev, emptyCampaign(prev.length + 1)])} className="text-sm text-indigo-600 font-medium hover:text-indigo-800">+ إضافة حملة أخرى</button>
    </div>
  );
}

function Mini({ label, value, onChange }: { label: string; value: number; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[10px] text-gray-500 mb-1">{label}</label>
      <input type="number" value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-2 py-1.5 border rounded-md text-xs" dir="ltr" />
    </div>
  );
}

function StatMini({ label, value, tone }: { label: string; value: string; tone?: 'emerald' | 'red' }) {
  const cls = tone === 'emerald' ? 'text-emerald-600' : tone === 'red' ? 'text-red-600' : 'text-gray-800';
  return (
    <div className="bg-gray-50 rounded-md px-2 py-1.5">
      <div className="text-[10px] text-gray-500">{label}</div>
      <div className={`font-mono font-bold text-xs ${cls}`}>{value}</div>
    </div>
  );
}
