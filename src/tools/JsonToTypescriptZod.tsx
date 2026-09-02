import React, { useMemo, useState } from 'react';
import { Copy, FileCode2 } from 'lucide-react';

export interface GeneratedTypes {
  typescript: string;
  zod: string;
}

function toPascalCase(key: string): string {
  const cleaned = key.replace(/[^a-zA-Z0-9]/g, ' ').trim();
  const parts = cleaned.length ? cleaned.split(/\s+/) : ['Value'];
  return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join('') || 'Value';
}

interface BuildContext {
  tsBlocks: string[];
  zodBlocks: string[];
  usedNames: Set<string>;
}

function uniqueName(ctx: BuildContext, base: string): string {
  let name = base;
  let n = 2;
  while (ctx.usedNames.has(name)) {
    name = `${base}${n}`;
    n++;
  }
  ctx.usedNames.add(name);
  return name;
}

function primitiveZod(t: 'string' | 'number' | 'boolean'): string {
  return `z.${t}()`;
}

function inferNode(value: unknown, keyName: string, ctx: BuildContext): { tsType: string; zodExpr: string } {
  if (value === null) return { tsType: 'null', zodExpr: 'z.null()' };

  if (Array.isArray(value)) {
    if (value.length === 0) return { tsType: 'unknown[]', zodExpr: 'z.array(z.unknown())' };

    const allObjects = value.every((v) => v !== null && typeof v === 'object' && !Array.isArray(v));
    if (allObjects) {
      const { tsType, zodExpr } = inferNode(value[0], keyName, ctx);
      return { tsType: `${tsType}[]`, zodExpr: `z.array(${zodExpr})` };
    }

    const inferred = value.map((v) => inferNode(v, keyName, ctx));
    const tsSet = Array.from(new Set(inferred.map((i) => i.tsType)));
    const zodSet = Array.from(new Set(inferred.map((i) => i.zodExpr)));

    if (tsSet.length === 1) return { tsType: `${tsSet[0]}[]`, zodExpr: `z.array(${zodSet[0]})` };
    return { tsType: `(${tsSet.join(' | ')})[]`, zodExpr: `z.array(z.union([${zodSet.join(', ')}]))` };
  }

  if (typeof value === 'object') {
    const name = uniqueName(ctx, toPascalCase(keyName));
    const fieldLines: string[] = [];
    const zodFieldLines: string[] = [];

    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const field = inferNode(v, k, ctx);
      fieldLines.push(`  ${k}: ${field.tsType};`);
      zodFieldLines.push(`  ${k}: ${field.zodExpr},`);
    }

    ctx.tsBlocks.push(`export interface ${name} {\n${fieldLines.join('\n')}\n}`);
    ctx.zodBlocks.push(`export const ${name}Schema = z.object({\n${zodFieldLines.join('\n')}\n});`);

    return { tsType: name, zodExpr: `${name}Schema` };
  }

  if (typeof value === 'string') return { tsType: 'string', zodExpr: primitiveZod('string') };
  if (typeof value === 'number') return { tsType: 'number', zodExpr: primitiveZod('number') };
  if (typeof value === 'boolean') return { tsType: 'boolean', zodExpr: primitiveZod('boolean') };

  return { tsType: 'unknown', zodExpr: 'z.unknown()' };
}

/** يستنتج بنية أي JSON بشكل تكراري ويولّد TypeScript interfaces حقيقية + مخططات Zod مطابقة لها بنفس الترتيب */
export function jsonToTypes(json: unknown, rootName = 'Root'): GeneratedTypes {
  const ctx: BuildContext = { tsBlocks: [], zodBlocks: [], usedNames: new Set() };

  if (json !== null && typeof json === 'object' && !Array.isArray(json)) {
    inferNode(json, rootName, ctx);
  } else {
    const { tsType, zodExpr } = inferNode(json, rootName, ctx);
    ctx.tsBlocks.push(`export type ${rootName} = ${tsType};`);
    ctx.zodBlocks.push(`export const ${rootName}Schema = ${zodExpr};`);
  }

  return {
    typescript: ctx.tsBlocks.join('\n\n'),
    zod: `import { z } from 'zod';\n\n${ctx.zodBlocks.join('\n\n')}`,
  };
}

const sampleJson = `{
  "id": "ord_9182",
  "customerName": "منى عبد الله",
  "total": 349.5,
  "isPaid": true,
  "items": [
    { "sku": "SKU-001", "qty": 2, "price": 99.75 },
    { "sku": "SKU-002", "qty": 1, "price": 150 }
  ],
  "shippingAddress": {
    "city": "القاهرة",
    "street": "شارع التحرير",
    "zip": "11511"
  },
  "tags": ["vip", "repeat-customer"]
}`;

export function JsonToTypescriptZodDemo() {
  const [raw, setRaw] = useState(sampleJson);
  const [rootName, setRootName] = useState('Order');
  const [tab, setTab] = useState<'ts' | 'zod'>('ts');
  const [copied, setCopied] = useState(false);

  const { result, error } = useMemo(() => {
    try {
      return { result: jsonToTypes(JSON.parse(raw), rootName || 'Root'), error: null as string | null };
    } catch (e) {
      return { result: null, error: e instanceof Error ? e.message : 'JSON غير صالح' };
    }
  }, [raw, rootName]);

  const currentCode = result ? (tab === 'ts' ? result.typescript : result.zod) : '';

  const copy = async () => {
    if (!currentCode) return;
    await navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200" dir="rtl">
      <h3 className="text-xl font-bold mb-2 text-indigo-900 flex items-center gap-2"><FileCode2 size={20} /> محول JSON إلى TypeScript & Zod (نسخة تعمل بالكامل)</h3>
      <p className="text-xs text-gray-500 mb-5">استنتاج تكراري حقيقي لبنية الـJSON — واجهات متداخلة ومصفوفات ومخططات Zod متطابقة تمامًا.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <label className="text-xs text-gray-600 font-bold">اسم النوع الجذري</label>
            <input value={rootName} onChange={(e) => setRootName(e.target.value)} className="text-xs border rounded-md px-2 py-1 w-32" dir="ltr" />
          </div>
          <textarea value={raw} onChange={(e) => setRaw(e.target.value)} dir="ltr" spellCheck={false} className="w-full h-80 p-3 font-mono text-[11px] border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none" />
          {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
              <button onClick={() => setTab('ts')} className={`px-3 py-1 text-xs font-bold rounded-md ${tab === 'ts' ? 'bg-white shadow text-indigo-700' : 'text-gray-500'}`}>TypeScript</button>
              <button onClick={() => setTab('zod')} className={`px-3 py-1 text-xs font-bold rounded-md ${tab === 'zod' ? 'bg-white shadow text-indigo-700' : 'text-gray-500'}`}>Zod</button>
            </div>
            <button onClick={copy} className="text-xs text-indigo-600 font-bold flex items-center gap-1"><Copy size={13} /> {copied ? 'تم ✓' : 'نسخ'}</button>
          </div>
          <pre dir="ltr" className="w-full h-80 p-3 font-mono text-[11px] border rounded-lg bg-gray-900 text-emerald-300 overflow-auto whitespace-pre-wrap">
            {currentCode || '—'}
          </pre>
        </div>
      </div>
    </div>
  );
}
