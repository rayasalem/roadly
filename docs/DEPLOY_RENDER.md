# نشر الفرونتاند (Expo Web) على Render

## ⚠️ إذا ظهر خطأ "Cannot find module 'expo/AppEntry.js'"

الخدمة تستخدم أوامر افتراضية خاطئة. **يجب** ضبطها يدوياً:

1. **Dashboard → خدمتك → Settings → Build & Deploy**
2. **Build Command:** غيّره إلى  
   `npm install && npm run build`
3. **Start Command:** غيّره إلى  
   `npm start`

ثم **Manual Deploy → Deploy latest commit**. بعد البناء، `npm start` يشغّل خادم التطبيق (يخدم مجلد `dist`).

---

## الخيار 1: Static Site (مُوصى به)

1. في Render: **New → Static Site**.
2. اربط المستودع (مثلاً `rayasalem/roadmapapp`).
3. الإعدادات:
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. احفظ وانشر. لا يوجد Start Command.

---

## الخيار 2: Web Service

إذا أنشأت المشروع كـ **Web Service** (وليس Static Site):

1. **Build Command:** `npm install && npm run build`
2. **Start Command:** `npm start` (أو `node server.js`)
3. اترك **Publish Directory** فارغاً.

المشروع يبني مجلد `dist` ثم يشغّل خادم `serve` ليعرضه. Render يضبط `PORT` تلقائياً.

---

## متغيرات البيئة (اختياري)

- `EXPO_PUBLIC_PLATFORM=web` — يُضبط تلقائياً أثناء البناء إن لزم.
- `EXPO_PUBLIC_API_URL` — الافتراضي في الإنتاج: `https://roadmapapp.onrender.com` (يمكن تغييره من لوحة Render).
