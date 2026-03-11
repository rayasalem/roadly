# نشر MechNow (Frontend) على Vercel

**حالة المشروع:** المشروع مُعدّ للرفع على Vercel. إذا نجح البناء محلياً (`npm run build`) فالإعدادات صحيحة؛ إن فشل البناء على Vercel فقط، استخدم قسم "إذا فشل البناء" أدناه.

## المتطلبات

- مشروع Expo (React Native Web) مع سكربت `build` في `package.json`
- حساب على [Vercel](https://vercel.com)

## خطوات النشر

1. **ربط المستودع**
   - ادخل [vercel.com](https://vercel.com) → Add New → Project
   - اختر Git repository للمشروع

2. **إعداد البناء (Build)**
   - **Framework Preset:** Other
   - **Build Command:** `npm run build` (أو اتركه فارغاً؛ `vercel.json` يحدده)
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

3. **متغيرات البيئة (مهم)**
   - Settings → Environment Variables أضف:
   - `EXPO_PUBLIC_API_URL` = عنوان الـ API للباكند (مثال: `https://api.mechnow.example.com`) **بدون** `/` في النهاية
   - اختياري: `EXPO_PUBLIC_ENVIRONMENT` = `production`

4. **النشر**
   - Deploy. أول بناء قد يستغرق عدة دقائق.

## ملفات تم إعدادها

| الملف | الغرض |
|--------|--------|
| `vercel.json` | أمر البناء، مجلد المخرجات، هيدرز أمان |
| `.env.production.example` | مثال لمتغيرات الإنتاج |
| `package.json` | سكربتات `build` و `vercel-build` |
| `.vercelignore` | استبعاد مجلد الباكند والاختبارات من الرفع |

## إذا فشل البناء على Vercel

إذا ظهر خطأ مثل `Error: Command "npx expo export -p web" exited with 1` أو أخطاء في `babel-preset-expo` / Metro:

1. **تأكد من إعدادات Vercel:**
   - في المشروع: Settings → General → Node.js Version = **20.x**
   - في Settings → Environment Variables أضف (للـ Build):
     - `CI` = `1`
     - `NODE_OPTIONS` = `--max-old-space-size=4096`
     - `EXPO_PUBLIC_PLATFORM` = `web`
     - `EXPO_PUBLIC_API_URL` = عنوان الباكند (مطلوب للإنتاج)

2. **جرّب البناء محلياً بنفس البيئة:**
   ```bash
   set CI=1
   set NODE_OPTIONS=--max-old-space-size=4096
   set EXPO_PUBLIC_PLATFORM=web
   npm run build
   ```
   إذا نجح، ستجد المخرجات في مجلد `dist`. يمكنك رفع `dist` يدوياً أو عبر Vercel CLI بعد البناء المحلي.

3. **بديل: نشر المخرجات فقط**
   - نفّذ `npm run build` على جهازك.
   - استخدم "Import" في Vercel واختر مجلد المخرجات، أو استخدم [Vercel CLI](https://vercel.com/docs/cli) مع مجلد يحتوي على `dist` جاهز.

4. **بديل: EAS Build (Expo Application Services)**
   - استخدم [EAS Build للويب](https://docs.expo.dev/build-reference/web-builds/) لبناء الويب في السحابة ثم انشر المخرجات حيث تريد.

## ملاحظات

- الباكند (Node/Express) لا يُنشر من هذا المشروع؛ شغّله على خدمة منفصلة (Railway, Render, VPS) وضَع عنوانه في `EXPO_PUBLIC_API_URL`.
- إذا لم تُضف `EXPO_PUBLIC_API_URL` على Vercel، التطبيق سيعمل لكن طلبات الـ API ستفشل حتى تضيف الرابط.
- الملفات `.nvmrc` و `engines` في `package.json` تحدد Node 20 لتحسين توافق البناء.
