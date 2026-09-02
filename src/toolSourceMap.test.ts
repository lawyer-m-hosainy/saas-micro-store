import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { TOOL_SOURCE_FILE } from './toolSourceMap';
import { products } from './data';

describe('TOOL_SOURCE_FILE', () => {
  it('points every entry at a real, existing file under src/tools/', () => {
    for (const [id, file] of Object.entries(TOOL_SOURCE_FILE)) {
      const filePath = path.join(__dirname, 'tools', `${file}.tsx`);
      expect(fs.existsSync(filePath), `${id} -> ${file}.tsx should exist`).toBe(true);
    }
  });

  it('only maps ids that exist in the product catalog', () => {
    const catalogIds = new Set(products.map((p) => p.id));
    for (const id of Object.keys(TOOL_SOURCE_FILE)) {
      expect(catalogIds.has(id), `${id} should exist in the catalog`).toBe(true);
    }
  });
});
