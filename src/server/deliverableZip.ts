import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { Product } from '../types';
import { TOOL_SOURCE_FILE } from '../toolSourceMap';
import { buildProjectFiles, RealToolSource } from '../shared/projectZipFiles';

function getRealToolSourceServer(productId: string): RealToolSource | null {
  const fileName = TOOL_SOURCE_FILE[productId];
  if (!fileName) return null;
  const filePath = path.join(process.cwd(), 'src', 'tools', `${fileName}.tsx`);
  if (!fs.existsSync(filePath)) return null;
  return { code: fs.readFileSync(filePath, 'utf8'), exportName: `${fileName}Demo` };
}

/** يبني نفس حزمة الـZIP اللي المشتري يقدر ينزّلها من صفحة تتبع الطلب — بس هنا كـBuffer عشان يترفق بالإيميل */
export async function buildProductZipBuffer(product: Product): Promise<Buffer> {
  const zip = new JSZip();
  const safeId = product.id.replace(/[^a-zA-Z0-9_-]/g, '_');
  const folder = zip.folder(safeId) || zip;

  const files = buildProjectFiles(product, getRealToolSourceServer(product.id));
  for (const [filePath, content] of Object.entries(files)) {
    folder.file(filePath, content);
  }

  return zip.generateAsync({ type: 'nodebuffer' }) as Promise<Buffer>;
}
