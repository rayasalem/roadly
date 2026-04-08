/**
 * One-off: extract `ar: { ... }` from strings.ts → locales/ar.json
 * Run: node scripts/extract-ar-json.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const stringsPath = path.join(root, 'src/shared/i18n/strings.ts');
const outDir = path.join(root, 'src/shared/i18n/locales');
const outPath = path.join(outDir, 'ar.json');

const text = fs.readFileSync(stringsPath, 'utf8');
const start = text.indexOf('  ar: {');
const end = text.indexOf('\n  },\n} as const', start);
if (start < 0 || end < 0) {
  console.error('Could not find ar block markers');
  process.exit(1);
}
const chunk = text.slice(start + '  ar: {'.length, end);
const obj = {};
// Lines: 'key': 'value',  (value may contain \')
const lineRe = /^\s*'((?:\\'|[^'])+)':\s*'((?:\\'|[^'])*)',?\s*$/gm;
let m;
while ((m = lineRe.exec(chunk)) !== null) {
  const k = m[1].replace(/\\'/g, "'");
  const v = m[2].replace(/\\'/g, "'").replace(/\\n/g, '\n');
  obj[k] = v;
}

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(obj, null, 2), 'utf8');
console.log('Wrote', outPath, 'keys:', Object.keys(obj).length);
