# تشغيل الباكند

1. **من مجلد `backend`:**
   ```bash
   cd backend
   npm install
   npm run build
   npm run dev
   ```
   أو للإنتاج: `npm start`

2. **المنفذ:** التطبيق يتوقع الباكند على **8082**. تأكد أن في `.env`:
   ```
   PORT=8082
   ```

3. **إذا ظهر "Missing required env: JWT_SECRET":** انسخ `.env.example` إلى `.env` وضَع قيماً لـ `JWT_SECRET` و `JWT_REFRESH_SECRET` (كل واحد 32 حرف على الأقل).
