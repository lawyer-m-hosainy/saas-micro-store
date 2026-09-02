import { describe, expect, it } from 'vitest';
import {
  ensureHttpsUrl,
  escapeHtml,
  escapeHtmlAttribute,
  escapeJsString,
  isValidUrl,
  sanitizeFilename,
} from './sanitize';

describe('escapeHtml', () => {
  it('escapes all HTML special characters', () => {
    expect(escapeHtml(`<script>alert('xss')</script>`)).toBe(
      '&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;'
    );
  });

  it('escapes double quotes and backticks', () => {
    expect(escapeHtml(`"quoted" & \`templated\``)).toBe(
      '&quot;quoted&quot; &amp; &#96;templated&#96;'
    );
  });

  it('leaves plain text untouched', () => {
    expect(escapeHtml('أداة Micro SaaS')).toBe('أداة Micro SaaS');
  });
});

describe('escapeJsString', () => {
  it('escapes characters that would break out of a JS string/template literal', () => {
    expect(escapeJsString('back\\slash \'single\' "double" `tick` ${expr}')).toBe(
      "back\\\\slash \\'single\\' \\\"double\\\" \\`tick\\` \\${expr}"
    );
  });

  it('escapes newlines and carriage returns', () => {
    expect(escapeJsString('line1\nline2\r\n')).toBe('line1\\nline2\\r\\n');
  });
});

describe('sanitizeFilename', () => {
  it('replaces filesystem-unsafe characters with underscores', () => {
    expect(sanitizeFilename('report/2024:final*.pdf')).toBe('report_2024_final_.pdf');
  });

  it('blocks path traversal sequences', () => {
    expect(sanitizeFilename('../secret.txt')).toBe('__secret.txt');
  });

  it('strips leading dots and trims length to 200 chars', () => {
    const longName = '.'.repeat(5) + 'a'.repeat(250);
    const result = sanitizeFilename(longName);
    expect(result.startsWith('.')).toBe(false);
    expect(result.length).toBeLessThanOrEqual(200);
  });
});

describe('isValidUrl', () => {
  it('accepts http and https URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('http://example.com')).toBe(true);
  });

  it('rejects dangerous protocols', () => {
    expect(isValidUrl('javascript:alert(1)')).toBe(false);
    expect(isValidUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
    expect(isValidUrl('vbscript:msgbox(1)')).toBe(false);
  });

  it('treats a protocol-less relative path as valid', () => {
    expect(isValidUrl('/some/relative/path')).toBe(true);
  });
});

describe('ensureHttpsUrl', () => {
  it('prepends https:// when no protocol is present', () => {
    expect(ensureHttpsUrl('example.com')).toBe('https://example.com');
  });

  it('keeps an existing safe protocol untouched', () => {
    expect(ensureHttpsUrl('http://example.com')).toBe('http://example.com');
  });

  it('returns null for dangerous protocols', () => {
    expect(ensureHttpsUrl('javascript:alert(1)')).toBeNull();
  });

  it('returns null for empty or whitespace-only input', () => {
    expect(ensureHttpsUrl('   ')).toBeNull();
  });
});

describe('escapeHtmlAttribute', () => {
  it('escapes HTML entities plus line breaks and tabs', () => {
    expect(escapeHtmlAttribute('line1\nline2\ttabbed\r')).toBe(
      'line1&#10;line2&#9;tabbed&#13;'
    );
  });
});
