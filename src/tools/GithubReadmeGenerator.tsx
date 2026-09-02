import React, { useMemo, useState } from 'react';
import { Copy, Github } from 'lucide-react';

export interface ReadmeInputs {
  projectName: string;
  description: string;
  installCommand: string;
  usageExample: string;
  license: string;
  githubUser: string;
  repoName: string;
  includeBadges: boolean;
  includeContributing: boolean;
}

const BADGE_STYLE = 'for-the-badge';

/** يبني ملف README.md حقيقي كامل من مدخلات المستخدم، شارات ديناميكية من shields.io، وأقسام ثابتة الترتيب */
export function buildReadme(i: ReadmeInputs): string {
  const lines: string[] = [];

  lines.push(`# ${i.projectName || 'My Project'}`, '');

  if (i.includeBadges && i.githubUser && i.repoName) {
    lines.push(
      `![License](https://img.shields.io/github/license/${i.githubUser}/${i.repoName}?style=${BADGE_STYLE})`,
      `![Stars](https://img.shields.io/github/stars/${i.githubUser}/${i.repoName}?style=${BADGE_STYLE})`,
      `![Issues](https://img.shields.io/github/issues/${i.githubUser}/${i.repoName}?style=${BADGE_STYLE})`,
      ''
    );
  }

  if (i.description) {
    lines.push(i.description, '');
  }

  lines.push('## التثبيت', '', '```bash', i.installCommand || 'npm install', '```', '');
  lines.push('## الاستخدام', '', '```bash', i.usageExample || 'npm start', '```', '');

  if (i.includeContributing) {
    lines.push(
      '## المساهمة',
      '',
      '1. اعمل Fork للمشروع',
      '2. أنشئ فرعاً جديداً (`git checkout -b feature/amazing`)',
      '3. اعمل Commit للتعديلات (`git commit -m "إضافة ميزة رائعة"`)',
      '4. ادفع الفرع (`git push origin feature/amazing`)',
      '5. افتح Pull Request',
      ''
    );
  }

  lines.push('## الترخيص', '', `هذا المشروع مرخّص تحت رخصة ${i.license || 'MIT'}.`, '');

  return lines.join('\n');
}

const defaultInputs: ReadmeInputs = {
  projectName: 'Awesome Micro SaaS',
  description: 'أداة بسيطة وقوية تساعدك على إنجاز مهمتك بسرعة وكفاءة.',
  installCommand: 'npm install awesome-micro-saas',
  usageExample: 'npm run dev',
  license: 'MIT',
  githubUser: 'your-username',
  repoName: 'awesome-micro-saas',
  includeBadges: true,
  includeContributing: true,
};

export function GithubReadmeGeneratorDemo() {
  const [inputs, setInputs] = useState<ReadmeInputs>(defaultInputs);
  const [copied, setCopied] = useState(false);

  const markdown = useMemo(() => buildReadme(inputs), [inputs]);

  const set = <K extends keyof ReadmeInputs>(key: K) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setInputs((prev) => ({ ...prev, [key]: value as ReadmeInputs[K] }));
  };

  const copy = async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-2 text-indigo-900 flex items-center gap-2"><Github size={20} /> صانع ملفات README الاحترافية (نسخة تعمل بالكامل)</h3>
      <p className="text-xs text-gray-500 mb-5">Markdown حقيقي جاهز للنسخ مباشرة في مشروعك — يتحدث فورًا مع كل تعديل.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm space-y-3">
          <Field label="اسم المشروع" value={inputs.projectName} onChange={set('projectName')} />
          <div>
            <label className="block text-xs text-gray-600 mb-1">الوصف</label>
            <textarea value={inputs.description} onChange={set('description')} className="w-full px-3 py-2 border rounded-md text-sm h-16" />
          </div>
          <Field label="أمر التثبيت" value={inputs.installCommand} onChange={set('installCommand')} dir="ltr" />
          <Field label="أمر التشغيل" value={inputs.usageExample} onChange={set('usageExample')} dir="ltr" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="اسم المستخدم في GitHub" value={inputs.githubUser} onChange={set('githubUser')} dir="ltr" />
            <Field label="اسم المستودع" value={inputs.repoName} onChange={set('repoName')} dir="ltr" />
          </div>
          <Field label="الترخيص" value={inputs.license} onChange={set('license')} dir="ltr" />
          <div className="flex items-center gap-4 pt-1">
            <label className="flex items-center gap-1.5 text-xs text-gray-600"><input type="checkbox" checked={inputs.includeBadges} onChange={set('includeBadges')} /> إضافة شارات (Badges)</label>
            <label className="flex items-center gap-1.5 text-xs text-gray-600"><input type="checkbox" checked={inputs.includeContributing} onChange={set('includeContributing')} /> قسم المساهمة</label>
          </div>
        </div>

        <div>
          <div className="flex justify-end mb-1">
            <button onClick={copy} className="text-xs text-indigo-600 font-bold flex items-center gap-1"><Copy size={13} /> {copied ? 'تم النسخ ✓' : 'نسخ الكود'}</button>
          </div>
          <pre dir="ltr" className="w-full h-[420px] p-3 font-mono text-[11px] border rounded-lg bg-gray-900 text-emerald-300 overflow-auto whitespace-pre-wrap">
            {markdown}
          </pre>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, dir }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; dir?: string }) {
  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      <input value={value} onChange={onChange} className="w-full px-3 py-2 border rounded-md text-sm" dir={dir} />
    </div>
  );
}
