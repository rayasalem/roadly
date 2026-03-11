# فحص المشروع – كل شيء شغال

## ما تم فحصه وإصلاحه

### الفرونتاند (Expo / React Native Web)
- **الإعداد:** `package.json`, `app.json`, `babel.config.js`, `src/shared/constants/env.ts` — سليمة.
- **التنقل:** `RootNavigator`, `RoleNavigator`, `CustomerStack` وغيرها — تعمل.
- **API:** `api.ts` يستخدم `API_BASE_URL` و`tokenStore` و`useUIStore` — المسارات والاستيرادات صحيحة.
- **المتاجر:** `authStore`, `uiStore`, `localeStore`, `themeStore` — موجودة ومستخدمة بشكل صحيح.
- **البناء:** `npm run build` يصدّر التطبيق الكامل إلى `dist`. استخدم `npm run serve` أو `node server.js` لتشغيل الإنتاج.

### الباكند (Node / Express)
- **الإعداد:** `backend/package.json` — أمر البناء أصبح `tsc` فقط (بدون Prisma إن لم يكن موجوداً).
- **التحقق من الأنواع:**
  - إضافة `backend/src/types/sanitize-html.d.ts` لـ `sanitize-html`.
  - إصلاح `validateRequest.ts`: استخدام `...(details !== undefined ? { errors: details } : {})` لتجنب خطأ الـ spread.
  - إصلاح `providerStore.ts`: استخدام نوع `ProviderWithDistance` وسلسلة عمليات واضحة بدل الـ type assertion في منتصف الـ chain.
- **التشغيل:** `npm run build` ثم `npm run start` (من مجلد `backend`) أو `npm run dev` مع tsx.

### النشر
- **Vercel (فرونتاند):** Build: `npm run build` أو حسب `vercel.json`, Output: `dist`. اختياري: `EXPO_PUBLIC_API_URL`.
- **Render (فرونتاند كـ Web Service):** Build: `npm install && npm run build`, Start: `node server.js`.
- **Render (باكند):** Build: `npm install && npm run build`, Start: `npm run start` (من مجلد backend). تعيين `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL`.

## أوامر سريعة

| الهدف              | الأمر (من جذر المشروع)        |
|--------------------|--------------------------------|
| تشغيل الفرونتاند   | `npm start` أو `npm run web`   |
| بناء الفرونتاند    | `npm run build`                |
| تشغيل مخرجات البناء | `npm run serve` أو `node server.js` |
| بناء الباكند       | `npm run build --prefix backend` |
| تشغيل الباكند (dev) | `npm run dev --prefix backend` |

## ملاحظات
- الباكند يعتمد على مخازن في الذاكرة (auth, providers, requests، إلخ). لإضافة قاعدة بيانات لاحقاً يمكن استخدام Prisma مع وجود `schema.prisma`.
- الـ API الافتراضي في الإنتاج: `https://roadmapapp.onrender.com` (يمكن تغييره عبر `EXPO_PUBLIC_API_URL`).
