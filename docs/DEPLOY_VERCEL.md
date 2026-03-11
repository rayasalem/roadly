# نشر MechNow (Frontend) على Vercel

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

## ملاحظات

- الباكند (Node/Express) لا يُنشر من هذا المشروع؛ شغّله على خدمة منفصلة (Railway, Render, VPS) وضَع عنوانه في `EXPO_PUBLIC_API_URL`.
- إذا لم تُضف `EXPO_PUBLIC_API_URL` على Vercel، التطبيق سيعمل لكن طلبات الـ API ستفشل حتى تضيف الرابط.
