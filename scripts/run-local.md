# تشغيل المشروع محلياً (Run Locally)

## المتطلبات
- Node.js (مثلاً 18 أو 20)
- npm

## الطريقة الأسرع (من مستكشف الملفات)

1. **افتح مجلد المشروع** `mechnow` في مستكشف الملفات.
2. **شغّل الخادم أولاً:** انقر نقراً مزدوجاً على **`Start-Backend.bat`**
   - ستفتح نافذة وتثبت الحزم ثم تبدأ الخادم على المنفذ 4000.
   - اترك النافذة مفتوحة.
3. **شغّل الواجهة:** انقر نقراً مزدوجاً على **`Start-Frontend.bat`**
   - ستفتح نافذة ثانية وتثبت الحزم ثم تبدأ Expo.
   - في النافذة اضغط **w** لفتح النسخة الويب في المتصفح، أو امسح QR Code من تطبيق Expo Go.

## أو من الطرفية (Command Prompt أو PowerShell)

### 1. تشغيل الـ Backend (الخادم)

افتح **طرفية أولى** وانتقل لمجلد المشروع ثم مجلد الـ backend:

```bash
cd backend
npm install
npm run dev
```

يجب أن يعمل الخادم على: **http://localhost:4000**

- للتأكد: افتح المتصفح على http://localhost:4000/health يجب أن ترى `{"status":"ok",...}`

### 2. تشغيل الواجهة (Expo / Frontend)

افتح **طرفية ثانية** من مجلد المشروع (الجذر):

```bash
npm install
npx expo start
```

ثم اختر:
- **w** لفتح نسخة الويب في المتصفح
- أو امسح QR Code من تطبيق Expo Go على جوالك

## إذا ظهرت رسالة "خطأ في الشبكة" أو "Network error"

1. **تأكد أن الخادم (Backend) يعمل على المنفذ 4000**
   - في طرفية: `cd backend` ثم `npm run dev`
   - يجب أن ترى شيئاً مثل: `Server listening on port 4000`
2. **تحقق من الرابط**: افتح في المتصفح: http://localhost:4000/health  
   - إذا فتحت التطبيق من **127.0.0.1** (مثلاً http://127.0.0.1:8081)، ضع في **.env** في جذر المشروع:
   - `EXPO_PUBLIC_API_URL=http://127.0.0.1:4000`
   - ثم أعد تشغيل الواجهة (`npx expo start`).
3. **انسخ .env إن لم يكن موجوداً**: من الجذر `copy .env.example .env` (أو `cp .env.example .env`) وتأكد أن السطر:
   - `EXPO_PUBLIC_API_URL=http://localhost:4000` موجود.

## أخطاء Console في المتصفح (Web)

إذا ظهرت في أدوات المطوّر (F12) أخطاء مثل:
- **`AppEntry.bundle` — ERR_CONNECTION_REFUSED**: خادم Expo غير مشغّل أو الصفحة فُتحت قبل الجاهزية. شغّل `npx expo start` ثم اضغط **w** وافتح الرابط المعروض (مثلاً **http://localhost:8081**).
- **`:8081/favicon.ico` — ERR_CONNECTION_REFUSED**: افتح التطبيق بالعنوان الكامل **http://localhost:8081** (وليس فقط `:8081`). للتفاصيل انظر `docs/TROUBLESHOOTING_WEB.md`.

## ملاحظات
- ملف **.env** في الجذر يحدد `EXPO_PUBLIC_API_URL=http://localhost:4000` للواجهة.
- ملف **backend/.env** يحدد المنفذ والـ JWT secrets للخادم.
- إذا استخدمت جهازاً حقيقياً (جوال) على نفس الشبكة، غيّر في .env إلى IP جهازك، مثلاً:  
  `EXPO_PUBLIC_API_URL=http://192.168.1.100:4000`
