import React, { useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Copy, FileJson, XCircle } from 'lucide-react';

export interface InvoiceLine {
  description: string;
  itemCode: string; // كود GS1/EGS (GTIN)
  quantity: number;
  unitPrice: number;
}

export interface InvoiceDocument {
  documentUuid: string;
  documentHash: string;
  totalAmount: number;
  lines: InvoiceLine[];
}

export interface CheckResult {
  key: string;
  label: string;
  pass: boolean;
  detail: string;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const HEX64_RE = /^[0-9a-f]{64}$/i;

/** خوارزمية GS1 القياسية لحساب رقم التحقق (Check Digit) لأي GTIN بغض النظر عن الطول */
export function computeGtinCheckDigit(dataDigits: string): number {
  const reversed = dataDigits.split('').reverse();
  const sum = reversed.reduce((acc, ch, idx) => acc + Number(ch) * (idx % 2 === 0 ? 3 : 1), 0);
  return (10 - (sum % 10)) % 10;
}

/** يتحقق من أن آخر رقم في الكود يطابق رقم التحقق المحسوب فعلياً وفق معيار GS1 */
export function validateGtin(code: string): boolean {
  if (!/^\d{8,14}$/.test(code)) return false;
  const dataDigits = code.slice(0, -1);
  const checkDigit = Number(code.slice(-1));
  return computeGtinCheckDigit(dataDigits) === checkDigit;
}

/** فحص بنيوي (Structural) لصيغة UUID، وصيغة الـ Hash (64 خانة hex كما في SHA-256) — وليس إعادة حساب هاش ETA الرسمي الكامل */
export function validateEInvoice(doc: InvoiceDocument, vatRatePct = 14): CheckResult[] {
  const checks: CheckResult[] = [];

  checks.push({
    key: 'uuid',
    label: 'صحة بنية الـ UUID',
    pass: UUID_RE.test(doc.documentUuid || ''),
    detail: UUID_RE.test(doc.documentUuid || '') ? 'الصيغة مطابقة لمعيار UUID (8-4-4-4-12)' : 'الصيغة غير صحيحة — يجب أن تكون 36 محرف بصيغة UUID',
  });

  checks.push({
    key: 'hash',
    label: 'صيغة الـ Document Hash',
    pass: HEX64_RE.test(doc.documentHash || ''),
    detail: HEX64_RE.test(doc.documentHash || '') ? 'الطول والصيغة مطابقان لـ SHA-256 (64 محرف hex)' : 'يجب أن يكون 64 محرف hexadecimal (SHA-256)',
  });

  doc.lines.forEach((line, idx) => {
    const ok = validateGtin(line.itemCode || '');
    checks.push({
      key: `gtin-${idx}`,
      label: `كود السلعة GS1/EGS — السطر ${idx + 1}`,
      pass: ok,
      detail: ok ? `رقم التحقق صحيح (${line.itemCode})` : `رقم التحقق غير مطابق لخوارزمية GS1 (${line.itemCode || 'فارغ'})`,
    });
  });

  const lineTotal = doc.lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
  const vatAmount = lineTotal * (vatRatePct / 100);
  const expectedTotal = Math.round((lineTotal + vatAmount) * 100) / 100;
  const stated = Math.round(doc.totalAmount * 100) / 100;
  const totalOk = Math.abs(expectedTotal - stated) < 0.01;

  checks.push({
    key: 'vat',
    label: `حساب ضريبة القيمة المضافة (${vatRatePct}%)`,
    pass: totalOk,
    detail: totalOk
      ? `الإجمالي المذكور (${stated}) يطابق: صافي ${lineTotal.toFixed(2)} + ضريبة ${vatAmount.toFixed(2)}`
      : `الإجمالي المذكور (${stated}) لا يطابق المحسوب (${expectedTotal}) — فرق ${(stated - expectedTotal).toFixed(2)}`,
  });

  return checks;
}

const sampleInvoice: InvoiceDocument = {
  documentUuid: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  documentHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  totalAmount: 570,
  lines: [
    { description: 'لابتوب Dell Inspiron', itemCode: '6224000000004', quantity: 1, unitPrice: 500 },
  ],
};

export function EtaEInvoiceValidatorDemo() {
  const [raw, setRaw] = useState(JSON.stringify(sampleInvoice, null, 2));
  const [copied, setCopied] = useState(false);

  const { doc, parseError } = useMemo(() => {
    try {
      const parsed = JSON.parse(raw);
      return { doc: parsed as InvoiceDocument, parseError: null as string | null };
    } catch (e) {
      return { doc: null, parseError: e instanceof Error ? e.message : 'JSON غير صالح' };
    }
  }, [raw]);

  const checks = useMemo(() => (doc ? validateEInvoice(doc) : []), [doc]);
  const allPass = checks.length > 0 && checks.every((c) => c.pass);

  const copyExport = async () => {
    if (!doc) return;
    await navigator.clipboard.writeText(JSON.stringify({ ...doc, validated: allPass, validatedAt: new Date().toISOString() }, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-2 text-indigo-900 flex items-center gap-2"><FileJson size={20} /> فاحص الفواتير الإلكترونية ETA (نسخة تعمل بالكامل)</h3>
      <p className="text-xs text-gray-500 mb-5">فحص حقيقي لبنية UUID وصيغة الـ Hash، رقم تحقق GS1/GTIN لكل سطر، وتطابق حساب ضريبة القيمة المضافة 14%.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs text-gray-600 mb-1 font-bold">ملف JSON للفاتورة</label>
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            dir="ltr"
            className="w-full h-80 p-3 font-mono text-[11px] border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
            spellCheck={false}
          />
          {parseError && (
            <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1"><AlertCircle size={13} /> {parseError}</p>
          )}
        </div>

        <div>
          <div className={`p-4 rounded-lg border mb-3 ${allPass ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
            <span className={`text-sm font-black ${allPass ? 'text-emerald-700' : 'text-amber-700'}`}>
              {checks.length === 0 ? 'أدخل فاتورة صالحة للفحص' : allPass ? '✓ جاهزة للرفع لمنظومة الفاتورة الإلكترونية' : '✗ توجد مشاكل تمنع الرفع'}
            </span>
          </div>

          <div className="space-y-2">
            {checks.map((c) => (
              <div key={c.key} className={`flex items-start gap-2 p-3 rounded-lg border text-xs ${c.pass ? 'bg-white border-gray-100' : 'bg-red-50 border-red-200'}`}>
                {c.pass ? <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" /> : <XCircle size={15} className="text-red-500 shrink-0 mt-0.5" />}
                <div>
                  <div className="font-bold text-gray-800">{c.label}</div>
                  <div className="text-gray-500 mt-0.5" dir="ltr" style={{ direction: 'rtl' }}>{c.detail}</div>
                </div>
              </div>
            ))}
          </div>

          {doc && (
            <button onClick={copyExport} className="w-full mt-3 bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 flex items-center justify-center gap-2 text-sm">
              <Copy size={16} /> {copied ? 'تم النسخ ✓' : 'نسخ JSON جاهز للإرسال'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
