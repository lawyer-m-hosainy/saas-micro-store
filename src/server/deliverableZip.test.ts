import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';
import { buildProductZipBuffer } from './deliverableZip';
import { TOOL_SOURCE_FILE } from '../toolSourceMap';
import { products } from '../data';

describe('buildProductZipBuffer', () => {
  it('packages the real, tested tool source for a product that has one', async () => {
    const [productId, fileName] = Object.entries(TOOL_SOURCE_FILE)[0];
    const product = products.find((p) => p.id === productId)!;
    expect(product).toBeTruthy();

    const buffer = await buildProductZipBuffer(product);
    const zip = await JSZip.loadAsync(buffer);

    const safeId = product.id.replace(/[^a-zA-Z0-9_-]/g, '_');
    const toolComponent = await zip.file(`${safeId}/src/ToolComponent.tsx`)?.async('string');
    expect(toolComponent).toContain(`${fileName}Demo`);

    const appTsx = await zip.file(`${safeId}/src/App.tsx`)?.async('string');
    expect(appTsx).toContain(`${fileName}Demo`);
  });

  it('falls back to the generic simulator scaffold for a product with no mapped real source', async () => {
    const product = products.find((p) => !TOOL_SOURCE_FILE[p.id])!;
    expect(product).toBeTruthy();

    const buffer = await buildProductZipBuffer(product);
    const zip = await JSZip.loadAsync(buffer);
    const safeId = product.id.replace(/[^a-zA-Z0-9_-]/g, '_');

    expect(zip.file(`${safeId}/src/ToolComponent.tsx`)).toBeNull();
    const appTsx = await zip.file(`${safeId}/src/App.tsx`)?.async('string');
    expect(appTsx).toContain('تشغيل الأداة البرمجية');
  });
});
