declare module 'sanitize-html' {
  interface Options {
    allowedTags?: string[];
    allowedAttributes?: Record<string, string[]>;
    [key: string]: unknown;
  }
  function sanitizeHtml(dirty: string, options?: Options): string;
  export default sanitizeHtml;
}
