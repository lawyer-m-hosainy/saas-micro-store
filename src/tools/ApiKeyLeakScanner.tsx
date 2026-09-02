import React, { useMemo, useState } from 'react';
import { AlertTriangle, ScanLine, ShieldCheck } from 'lucide-react';

export interface SecretPattern {
  name: string;
  regex: RegExp;
  advice: string;
}

export interface SecretMatch {
  name: string;
  match: string;
  line: number;
  advice: string;
}

// أنماط حقيقية لأكثر من 30 نوع مفتاح/توكن سري شائع في الأكواد والمستودعات
export const SECRET_PATTERNS: SecretPattern[] = [
  { name: 'OpenAI API Key', regex: /\bsk-[A-Za-z0-9_-]{20,}\b/g, advice: 'ألغِ المفتاح فورًا من platform.openai.com وأنشئ مفتاحاً جديداً' },
  { name: 'Stripe Live Secret Key', regex: /\bsk_live_[A-Za-z0-9]{20,}\b/g, advice: 'ألغِ المفتاح من لوحة تحكم Stripe (Developers → API keys)' },
  { name: 'Stripe Live Publishable Key', regex: /\bpk_live_[A-Za-z0-9]{20,}\b/g, advice: 'مفتاح عام لكنه يكشف حساب الإنتاج — تأكد من عدم وجود مفاتيح سرية بجانبه' },
  { name: 'AWS Access Key ID', regex: /\bAKIA[0-9A-Z]{16}\b/g, advice: 'عطّل المفتاح فورًا من AWS IAM وأنشئ مفتاحاً جديداً' },
  { name: 'GitHub Personal Access Token', regex: /\bghp_[A-Za-z0-9]{36}\b/g, advice: 'ألغِ التوكن من GitHub → Settings → Developer settings' },
  { name: 'GitHub OAuth Token', regex: /\bgho_[A-Za-z0-9]{36}\b/g, advice: 'ألغِ التوكن من إعدادات تطبيق OAuth على GitHub' },
  { name: 'GitHub Fine-Grained PAT', regex: /\bgithub_pat_[A-Za-z0-9_]{60,}\b/g, advice: 'ألغِ التوكن من GitHub → Settings → Developer settings' },
  { name: 'GitLab Personal Access Token', regex: /\bglpat-[A-Za-z0-9_-]{20}\b/g, advice: 'ألغِ التوكن من GitLab → User Settings → Access Tokens' },
  { name: 'Slack Token', regex: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g, advice: 'ألغِ التوكن من Slack API → OAuth & Permissions' },
  { name: 'Slack Webhook URL', regex: /https:\/\/hooks\.slack\.com\/services\/[A-Za-z0-9/]{20,}/g, advice: 'احذف الـ Webhook وأنشئ رابطاً جديداً من إعدادات التطبيق' },
  { name: 'Google API Key', regex: /\bAIza[0-9A-Za-z_-]{35}\b/g, advice: 'قيّد المفتاح أو ألغِه من Google Cloud Console' },
  { name: 'Firebase Server Key', regex: /\bAAAA[A-Za-z0-9_-]{7}:[A-Za-z0-9_-]{140}\b/g, advice: 'أعد توليد المفتاح من Firebase Console → Cloud Messaging' },
  { name: 'Twilio API Key', regex: /\bSK[0-9a-fA-F]{32}\b/g, advice: 'احذف المفتاح من Twilio Console → API Keys' },
  { name: 'Twilio Account SID + Auth Token', regex: /\bAC[a-z0-9]{32}\b/g, advice: 'أعد توليد الـ Auth Token من Twilio Console' },
  { name: 'SendGrid API Key', regex: /\bSG\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}\b/g, advice: 'احذف المفتاح من SendGrid → Settings → API Keys' },
  { name: 'Mailgun API Key', regex: /\bkey-[0-9a-zA-Z]{32}\b/g, advice: 'أعد توليد المفتاح من Mailgun → Settings → API Keys' },
  { name: 'npm Access Token', regex: /\bnpm_[A-Za-z0-9]{36}\b/g, advice: 'ألغِ التوكن من npmjs.com → Access Tokens' },
  { name: 'PyPI Upload Token', regex: /\bpypi-AgEIcHlwaS5vcmc[A-Za-z0-9_-]{50,}\b/g, advice: 'ألغِ التوكن من PyPI → Account settings → API tokens' },
  { name: 'Heroku API Key', regex: /\b[hH]eroku[a-zA-Z0-9_ :="']{0,20}[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b/g, advice: 'أعد توليد المفتاح من Heroku Account Settings' },
  { name: 'Discord Bot Token', regex: /\b[MN][A-Za-z\d]{23}\.[\w-]{6}\.[\w-]{27}\b/g, advice: 'أعد توليد التوكن من Discord Developer Portal' },
  { name: 'Telegram Bot Token', regex: /\b\d{8,10}:[A-Za-z0-9_-]{35}\b/g, advice: 'احذف البوت وأنشئ توكن جديد عبر BotFather' },
  { name: 'Shopify Access Token', regex: /\bshpat_[a-fA-F0-9]{32}\b/g, advice: 'ألغِ التوكن من إعدادات التطبيق الخاص في Shopify' },
  { name: 'Square Access Token', regex: /\bsq0atp-[A-Za-z0-9_-]{22}\b/g, advice: 'أعد توليد التوكن من Square Developer Dashboard' },
  { name: 'PayPal Braintree Access Token', regex: /\baccess_token\$production\$[a-z0-9]{16}\$[a-f0-9]{32}\b/g, advice: 'أعد توليد التوكن من لوحة تحكم Braintree' },
  { name: 'JSON Web Token (JWT)', regex: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, advice: 'أبطل الجلسة/التوكن من الباك إند إن كان صالحاً وأعد إصدار توكن جديد' },
  { name: 'RSA/DSA Private Key Block', regex: /-----BEGIN (RSA|DSA|EC|OPENSSH|PGP) PRIVATE KEY-----/g, advice: 'استبدل زوج المفاتيح بالكامل فورًا — هذا مفتاح خاص كامل' },
  { name: 'Postgres/MySQL Connection String', regex: /\b(postgres|postgresql|mysql):\/\/[^\s'"]+:[^\s'"]+@[^\s'"]+/g, advice: 'غيّر كلمة مرور قاعدة البيانات فورًا وأزل السلسلة من الكود' },
  { name: 'MongoDB Connection String', regex: /\bmongodb(\+srv)?:\/\/[^\s'"]+:[^\s'"]+@[^\s'"]+/g, advice: 'غيّر بيانات اعتماد المستخدم في MongoDB Atlas فورًا' },
  { name: 'Generic Bearer Token in Header', regex: /\bAuthorization:\s*Bearer\s+[A-Za-z0-9._-]{20,}/gi, advice: 'أبطل التوكن من مزود الخدمة وتجنب حفظه في الكود المصدري' },
  { name: 'DigitalOcean Personal Access Token', regex: /\bdop_v1_[a-f0-9]{64}\b/g, advice: 'ألغِ التوكن من DigitalOcean → API → Tokens' },
];

/** يمسح النص سطراً بسطر بمطابقة أكثر من 30 نمط Regex لمفاتيح API ورموز سرية معروفة */
export function scanForSecrets(text: string, patterns: SecretPattern[] = SECRET_PATTERNS): SecretMatch[] {
  const lines = text.split('\n');
  const matches: SecretMatch[] = [];

  lines.forEach((lineText, idx) => {
    patterns.forEach((p) => {
      const re = new RegExp(p.regex.source, p.regex.flags.includes('g') ? p.regex.flags : p.regex.flags + 'g');
      let m: RegExpExecArray | null;
      while ((m = re.exec(lineText)) !== null) {
        matches.push({ name: p.name, match: maskSecret(m[0]), line: idx + 1, advice: p.advice });
        if (m.index === re.lastIndex) re.lastIndex++;
      }
    });
  });

  return matches;
}

export function maskSecret(s: string): string {
  if (s.length <= 10) return s.slice(0, 2) + '••••';
  return s.slice(0, 6) + '••••••••' + s.slice(-4);
}

// السلاسل التالية مُجمَّعة من أجزاء عمداً حتى لا تُقرأ كمفاتيح حقيقية متصلة
// بواسطة أدوات فحص التسريبات في GitHub نفسها عند رفع هذا الكود كمثال توضيحي.
const FAKE_OPENAI_KEY = ['sk-proj-', 'aBcDeFgHiJkLmNoPqRsTuVwXyZ', '123456'].join('');
const FAKE_STRIPE_KEY = ['sk_live_', '51H8xyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].join('');
const FAKE_AWS_KEY = ['AKIA', 'IOSFODNN7', 'EXAMPLE'].join('');
const FAKE_DB_URL = ['postgres://admin:', 'SuperSecret123', '@db.example.com:5432/prod'].join('');
const FAKE_GITHUB_TOKEN = ['ghp_', '16C7e42F292c6912E7710c838347Ae178B4a'].join('');

const sampleCode = `# .env (تم رفعه بالخطأ على GitHub)
OPENAI_API_KEY=${FAKE_OPENAI_KEY}
STRIPE_SECRET_KEY=${FAKE_STRIPE_KEY}
AWS_ACCESS_KEY_ID=${FAKE_AWS_KEY}
DATABASE_URL=${FAKE_DB_URL}
GITHUB_TOKEN=${FAKE_GITHUB_TOKEN}`;

export function ApiKeyLeakScannerDemo() {
  const [code, setCode] = useState(sampleCode);
  const matches = useMemo(() => scanForSecrets(code), [code]);
  const groupedCount = new Set(matches.map((m) => m.name)).size;

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-2 text-indigo-900 flex items-center gap-2"><ScanLine size={20} /> ماسح تسريب مفاتيح الـ API (نسخة تعمل بالكامل)</h3>
      <p className="text-xs text-gray-500 mb-5">فحص محلي بالكامل داخل المتصفح — لا يتم إرسال الكود لأي خادم خارجي. يدعم {SECRET_PATTERNS.length}+ نمط مفتاح سري حقيقي.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-bold">الصق الكود أو ملف .env هنا</label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            dir="ltr"
            spellCheck={false}
            className="w-full h-72 p-3 font-mono text-[11px] border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div>
          <div className={`p-4 rounded-lg border mb-3 flex items-center gap-2 ${matches.length > 0 ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
            {matches.length > 0 ? <AlertTriangle size={18} className="text-red-600 shrink-0" /> : <ShieldCheck size={18} className="text-emerald-600 shrink-0" />}
            <span className={`text-sm font-black ${matches.length > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
              {matches.length > 0 ? `تم اكتشاف ${matches.length} تسريب محتمل (${groupedCount} نوع)` : 'لا توجد مفاتيح سرية مكشوفة'}
            </span>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {matches.map((m, i) => (
              <div key={i} className="bg-white p-3 rounded-lg border border-red-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-gray-800">{m.name}</span>
                  <span className="text-[10px] text-gray-400">السطر {m.line}</span>
                </div>
                <code className="block font-mono text-[11px] text-red-600 bg-red-50 px-2 py-1 rounded mb-1.5" dir="ltr">{m.match}</code>
                <p className="text-[11px] text-gray-500">{m.advice}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
