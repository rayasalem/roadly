import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const p = path.join(__dirname, '..', 'src', 'shared', 'i18n', 'strings.ts');
let s = fs.readFileSync(p, 'utf8');
const re =
  /export type StringKey =[\s\S]*?\| 'providerReg\.typeInsurance';\r?\n\r?\nexport const STRINGS: Record<Locale, Record<StringKey, string>>/;
if (!re.test(s)) {
  console.error('pattern not found');
  process.exit(1);
}
s = s.replace(
  re,
  "export type StringKey = string;\n\nexport const STRINGS: Record<Locale, Record<string, string>>",
);
fs.writeFileSync(p, s);
console.log('OK');
