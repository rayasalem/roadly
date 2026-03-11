/**
 * Sanitization helpers for safe output and user input (XSS prevention).
 * Use for any user-generated data before storage or when embedding in HTML.
 */
import sanitizeHtml from 'sanitize-html';

const ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Escape HTML entities to prevent XSS when embedding in HTML. */
export function escapeHtml(str: string): string {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"']/g, (c) => ENTITIES[c] ?? c);
}

/** Truncate string to max length (for logging or display limits). */
export function truncate(str: string, maxLen: number): string {
  if (typeof str !== 'string') return '';
  return str.length <= maxLen ? str : str.slice(0, maxLen) + '…';
}

/** Options for sanitize-html: strip all tags, keep plain text only. */
const STRIP_ALL_OPTIONS = {
  allowedTags: [] as string[],
  allowedAttributes: {} as Record<string, string[]>,
};

/**
 * Sanitize user input (names, comments, chat text) – strip HTML/scripts to prevent XSS.
 * Use before storing in DB or sending in responses.
 */
export function sanitizeUserInput(str: string, maxLength = 2000): string {
  if (typeof str !== 'string') return '';
  const stripped = sanitizeHtml(str, STRIP_ALL_OPTIONS);
  return stripped.length > maxLength ? stripped.slice(0, maxLength) : stripped;
}
