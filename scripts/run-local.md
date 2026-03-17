# تشغيل المشروع محلياً (Backend + Frontend)

## 1. تشغيل الـ Backend

افتح **طرفية (Terminal)** وانتقل لمجلد الـ Backend ثم شغّل:

```bash
cd backend
npm run dev
```

- السيرفر يعمل على: **http://localhost:8082**
- تأكد من وجود ملف `backend/.env` (تم إنشاؤه من `.env.example`)

---

## 2. تشغيل الـ Frontend

افتح **طرفية ثانية** وانتقل لمجلد المشروع ثم شغّل:

```bash
cd "C:\Intel\سطح المكتب\app\mechnow"
npm run web
```

أو من داخل مجلد المشروع مباشرة:

```bash
npm run web
```

- الواجهة تفتح في المتصفح على: **http://localhost:8081** (أو المنفذ الذي يظهر في الطرفية)
- التطبيق يتصل تلقائياً بالـ Backend على `http://localhost:8082` في وضع التطوير

---

## ملخص

| الخدمة    | الأمر           | الرابط               |
|----------|-----------------|----------------------|
| Backend  | `cd backend && npm run dev` | http://localhost:8082 |
| Frontend | `npm run web`   | http://localhost:8081 |

**ملاحظة:** شغّل الـ Backend أولاً ثم الـ Frontend.
