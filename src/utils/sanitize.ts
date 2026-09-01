// ============================================
// Security Sanitization Utilities
// Prevent XSS, injection, and path traversal
// ============================================

/**
 * Escape HTML special characters to prevent XSS injection.
 * Use when inserting user input into HTML templates.
 */
export function escapeHtml(str: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '`': '&#96;',
  };
  return str.replace(/[&<>"'`]/g, (char) => map[char] || char);
}

/**
 * Escape special characters for safe insertion into JavaScript string literals.
 * Handles backticks, template literals, quotes, and backslashes.
 */
export function escapeJsString(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
}

/**
 * Sanitize a filename by removing path traversal characters and
 * replacing unsafe characters with underscores.
 */
export function sanitizeFilename(name: string): string {
  return name
    .replace(/[\/\\?%*:|"<>]/g, '_')  // Remove filesystem-unsafe chars
    .replace(/\.{2,}/g, '_')           // Prevent path traversal
    .replace(/^\.+/, '')               // Remove leading dots
    .trim()
    .slice(0, 200);                    // Limit length
}

/**
 * Validate that a URL uses a safe protocol (http or https only).
 * Blocks javascript:, data:, vbscript:, and other dangerous protocols.
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    // If URL constructor fails, check if it looks like a relative path
    // (no protocol specified)
    return !url.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:/);
  }
}

/**
 * Ensure a URL has a protocol. Prepends https:// if missing.
 * Returns null if the URL uses an unsafe protocol.
 */
export function ensureHttpsUrl(url: string): string | null {
  if (!url.trim()) return null;
  
  // If it already has a protocol, validate it
  if (url.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:/)) {
    return isValidUrl(url) ? url : null;
  }
  
  // No protocol — prepend https://
  return `https://${url}`;
}

/**
 * Escape a string for safe insertion into an HTML attribute value.
 * More aggressive than escapeHtml — also handles line breaks and tabs.
 */
export function escapeHtmlAttribute(str: string): string {
  return escapeHtml(str)
    .replace(/\n/g, '&#10;')
    .replace(/\r/g, '&#13;')
    .replace(/\t/g, '&#9;');
}
