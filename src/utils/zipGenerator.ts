import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Product } from '../types';
import { TOOL_SOURCE_FILE } from '../toolSourceMap';
import { buildProjectFiles, estimateEgpPrice, RealToolSource } from '../shared/projectZipFiles';

export { estimateEgpPrice };

// كل ملفات كود الأدوات الحقيقية، محمّلة كنص خام وقت البناء — نفس الكود المُختبر المعروض في المعاينة الحية
const rawToolSources = import.meta.glob('../tools/*.tsx', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

export function getRealToolSource(productId: string): (RealToolSource & { fileName: string }) | null {
  const fileName = TOOL_SOURCE_FILE[productId];
  if (!fileName) return null;
  const code = rawToolSources[`../tools/${fileName}.tsx`];
  if (!code) return null;
  return { code, exportName: `${fileName}Demo`, fileName };
}

export async function downloadProductZip(product: Product) {
  const zip = new JSZip();
  const safeId = product.id.replace(/[^a-zA-Z0-9_-]/g, '_');
  const folder = zip.folder(safeId) || zip;

  const files = buildProjectFiles(product, getRealToolSource(product.id));
  for (const [path, content] of Object.entries(files)) {
    folder.file(path, content);
  }

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `${safeId}-full-package.zip`);
}
