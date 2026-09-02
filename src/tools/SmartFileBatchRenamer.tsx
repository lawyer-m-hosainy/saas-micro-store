import React, { useMemo, useState } from 'react';
import { FolderCog, Upload } from 'lucide-react';

export interface RenameRules {
  removeSpecialChars: boolean;
  findText: string;
  replaceText: string;
  addSequence: boolean;
  sequenceStart: number;
  prefix: string;
  lowercaseExtension: boolean;
}

function splitExt(filename: string): { base: string; ext: string } {
  const idx = filename.lastIndexOf('.');
  if (idx <= 0) return { base: filename, ext: '' };
  return { base: filename.slice(0, idx), ext: filename.slice(idx) };
}

/** يطبق قواعد إعادة تسمية حتمية بترتيب ثابت: البحث/الاستبدال، إزالة الرموز، إضافة بادئة، ترقيم تسلسلي، وحالة أحرف الامتداد */
export function renameFiles(filenames: string[], rules: RenameRules): string[] {
  return filenames.map((original, idx) => {
    let { base, ext } = splitExt(original);

    if (rules.findText) {
      base = base.split(rules.findText).join(rules.replaceText);
    }

    if (rules.removeSpecialChars) {
      base = base.replace(/[^a-zA-Z0-9أ-ي\s-]/g, '').replace(/\s+/g, '-');
    }

    if (rules.prefix) {
      base = `${rules.prefix}${base}`;
    }

    if (rules.addSequence) {
      const num = rules.sequenceStart + idx;
      base = `${base}-${String(num).padStart(3, '0')}`;
    }

    if (rules.lowercaseExtension) {
      ext = ext.toLowerCase();
    }

    return `${base}${ext}`;
  });
}

/** يتحقق من عدم وجود اسمين متطابقين بعد إعادة التسمية لتفادي الكتابة فوق ملفات */
export function findCollisions(renamed: string[]): string[] {
  const seen = new Map<string, number>();
  renamed.forEach((n) => seen.set(n, (seen.get(n) || 0) + 1));
  return [...seen.entries()].filter(([, count]) => count > 1).map(([name]) => name);
}

const sampleFiles = [
  'IMG_2049 (نسخة!!).JPG',
  'Product Photo #2.jpeg',
  'photo@final_v2.PNG',
  'واتساب صورة 2024-05-10.jpg',
];

export function SmartFileBatchRenamerDemo() {
  const [files, setFiles] = useState<string[]>(sampleFiles);
  const [rules, setRules] = useState<RenameRules>({
    removeSpecialChars: true,
    findText: '',
    replaceText: '',
    addSequence: true,
    sequenceStart: 1,
    prefix: 'product-',
    lowercaseExtension: true,
  });

  const renamed = useMemo(() => renameFiles(files, rules), [files, rules]);
  const collisions = useMemo(() => findCollisions(renamed), [renamed]);

  const set = <K extends keyof RenameRules>(key: K) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.type === 'number' ? Number(e.target.value) || 0 : e.target.value;
    setRules((prev) => ({ ...prev, [key]: value as RenameRules[K] }));
  };

  const onFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (list && list.length > 0) setFiles(Array.from(list).map((f) => f.name));
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-6 text-indigo-900 flex items-center gap-2"><FolderCog size={20} /> منظم الملفات الذكي بالدفعات (نسخة تعمل بالكامل)</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm space-y-3">
          <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-4 text-xs text-gray-500 cursor-pointer hover:border-indigo-300">
            <Upload size={16} /> ارفع ملفاتك الحقيقية (أو جرّب على العينة الحالية)
            <input type="file" multiple className="hidden" onChange={onFilesSelected} />
          </label>

          <Field label="بادئة تُضاف لكل اسم" value={rules.prefix} onChange={set('prefix')} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="نص للبحث عنه" value={rules.findText} onChange={set('findText')} dir="ltr" />
            <Field label="استبداله بـ" value={rules.replaceText} onChange={set('replaceText')} dir="ltr" />
          </div>
          <label className="flex items-center gap-2 text-xs text-gray-600"><input type="checkbox" checked={rules.removeSpecialChars} onChange={set('removeSpecialChars')} /> إزالة الرموز والفواصل المزعجة</label>
          <label className="flex items-center gap-2 text-xs text-gray-600"><input type="checkbox" checked={rules.addSequence} onChange={set('addSequence')} /> ترقيم تسلسلي</label>
          {rules.addSequence && <Field label="يبدأ الترقيم من" value={String(rules.sequenceStart)} onChange={set('sequenceStart')} dir="ltr" type="number" />}
          <label className="flex items-center gap-2 text-xs text-gray-600"><input type="checkbox" checked={rules.lowercaseExtension} onChange={set('lowercaseExtension')} /> امتداد الملف بحروف صغيرة (.jpg بدل .JPG)</label>
        </div>

        <div>
          <h4 className="font-bold text-gray-700 text-sm mb-2">المعاينة ({files.length} ملف)</h4>
          <div className="space-y-1.5">
            {files.map((original, idx) => (
              <div key={idx} className="bg-white p-2.5 rounded-md border border-gray-100 text-xs flex items-center justify-between gap-2" dir="ltr">
                <span className="text-gray-400 truncate flex-1 line-through">{original}</span>
                <span className="text-gray-300">→</span>
                <span className={`font-mono font-bold truncate flex-1 text-left ${collisions.includes(renamed[idx]) ? 'text-red-600' : 'text-emerald-700'}`}>{renamed[idx]}</span>
              </div>
            ))}
          </div>
          {collisions.length > 0 && (
            <p className="text-xs text-red-600 font-bold mt-2">⚠ تعارض في الأسماء: {collisions.join(', ')} — عدّل القواعد لتفادي الكتابة فوق الملفات.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, dir, type }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; dir?: string; type?: string }) {
  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      <input type={type || 'text'} value={value} onChange={onChange} className="w-full px-3 py-2 border rounded-md text-sm" dir={dir} />
    </div>
  );
}
