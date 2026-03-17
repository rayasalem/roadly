# تقرير تحليل الوظائف والـ APIs – مشروع MechNow

تم إعداد هذا التقرير بناءً على فحص كود الـ Backend والـ Frontend والربط بينهما.

---

## 1. هيكل الـ APIs في المشروع

### Backend (Express)

| المسار | الملف | الوظيفة |
|--------|--------|----------|
| `/health` | `backend/src/routes/health.ts` | Liveness / Readiness |
| `/auth` | `backend/src/routes/auth.ts` | تسجيل، دخول، تحديث توكن، خروج، المستخدم الحالي |
| `/requests` | `backend/src/routes/requests.ts` | إنشاء طلب، قوائم (عميل/مزود)، تفاصيل، تحديث حالة، تقييم |
| `/providers` | `backend/src/routes/providers.ts` | بروفايل المزود، تحديث، توفر، موقع، قريبين، تقييمات |
| `/notifications` | `backend/src/routes/notifications.ts` | قائمة، تعليم كمقروء، تسجيل/إلغاء جهاز |
| `/dashboard` | `backend/src/routes/dashboard.ts` | لوحات (mechanic, tow, rental) |
| `/admin` | `backend/src/routes/admin.ts` | إحصائيات، مستخدمين، مزودين، حظر، توثيق |
| `/chat` | `backend/src/routes/chat.ts` | محادثات ورسائل (stub – بيانات ثابتة) |

### Frontend (استدعاءات الـ API)

- **عميل HTTP:** `src/shared/services/http/api.ts` (Axios + token + refresh عند 401).
- **الثوابت:** `src/shared/constants/apiEndpoints.ts`.
- **الربط:** كل الميزات تستخدم نفس الـ `api` وتستدعي المسارات المذكورة أعلاه (ما عدا تقييمات المزود التي كانت تستدعي مساراً غير موجود، وتم تصحيحها).

---

## 2. ما يعمل بشكل صحيح

| الوظيفة | Backend | Frontend | الملاحظات |
|--------|---------|----------|-----------|
| **تسجيل المستخدم** | `POST /auth/register` | `authApi.register()` | يعمل – التحقق Joi، إنشاء مستخدم وتوكنات. |
| **تسجيل الدخول** | `POST /auth/login` | `authApi.login()` | يعمل – تحقق كلمة المرور، حظر الحساب. |
| **تحديث التوكن** | `POST /auth/refresh` | `refreshAccessToken.ts` | يعمل – يستخدم نفس `API_BASE_URL`. |
| **المستخدم الحالي** | `GET /auth/me` | عبر الـ store بعد الدخول | يعمل. |
| **تسجيل الخروج** | `POST /auth/logout` | `authApi.logout()` | يعمل. |
| **إنشاء طلب** | `POST /requests` | `requestApi.createRequest()` | يعمل – مع fallback mock عند فشل الشبكة. |
| **قائمة طلبات العميل** | `GET /requests/customer` | `requestApi.fetchCustomerRequests()` | يعمل. |
| **قائمة طلبات المزود** | `GET /requests/provider` | `requestApi.fetchProviderRequests()` | يعمل. |
| **تفاصيل طلب** | `GET /requests/:id` | `requestApi.getRequestById()` | يعمل – بعد الإصلاح يسمح للمزود بعرض الطلب المعلّق. |
| **تحديث حالة الطلب** | `PATCH /requests/:id/status` | `requestApi.updateRequestStatus()` | يعمل – بعد الإصلاح يسمح للمزود بقبول الطلب المعلّق. |
| **تقييم الطلب** | `POST /requests/:id/rate` | `requestApi.rateRequest()` | يعمل – Backend يقبل `rating` و`comment` فقط (الحقول الإضافية تُهمل). |
| **بروفايل المزود** | `GET/PATCH /providers/me` | `providerProfileApi` | يعمل. |
| **توفر المزود** | `PATCH /providers/me/availability` | نفس الملف | يعمل. |
| **مزودون قريبون** | `GET /providers/nearby` | `providersApi.fetchNearbyProviders()` | يعمل – optionalAuth. |
| **مزود بالمعرف** | `GET /providers/:id` | `providersApi.getProviderById()` | يعمل. |
| **تقييمات مزود (بالمعرف)** | `GET /providers/:id/ratings` | غير مستخدم من واجهة “تقييماتي” | يعمل. |
| **تقييمات المزود الحالي** | `GET /providers/me/ratings` **(جديد)** | `ratingsApi.fetchProviderRatings()` | تم إضافة المسار في Backend وتوجيه Frontend إليه. |
| **الإشعارات** | `GET /notifications`, `PATCH /:id/read` | `notificationsApi` | يعمل. |
| **تسجيل/إلغاء جهاز** | `POST /notifications/register`, `unregister` | من خدمات الإشعارات | يعمل. |
| **لوحات المزود** | `GET /dashboard/mechanic|tow|rental` | الـ APIs الخاصة بكل لوحة | يعمل. |
| **لوحة الأدمن** | `GET /admin/dashboard`, users, providers, block, verify | `adminDashboardApi` وغيرها | يعمل. |
| **الـ Chat** | `GET/POST /chat/...` | `chatApi` | يعمل كـ stub – نفس البيانات الثابتة. |
| **Health** | `GET /health`, `GET /health/ready` | غير مستدعى من التطبيق | يعمل. |

---

## 3. المشاكل التي وُجدت وتم إصلاحها

### 3.1 (حرجة) مزود الخدمة لا يستطيع قبول الطلب المعلّق

- **الملف والسطر:** `backend/src/routes/requests.ts` (التحقق من الصلاحية في `PATCH /:id/status` و `GET /:id`).
- **المشكلة:** الطلب المعلّق له `providerId = null`. التحقق كان: `customerId === userId || providerId === userId`، فيحصل المزود على **403 Forbidden** عند محاولة القبول أو حتى عرض تفاصيل الطلب.
- **الإصلاح:** السماح للمستخدم بدور `mechanic` أو `mechanic_tow` أو `car_rental` بعرض وتحديث حالة الطلب عندما يكون الطلب `pending` وبدون مزود معيّن (حتى يتمكن من “قبول” الطلب ويُعيَّن كمزود).

### 3.2 API تقييمات المزود الحالي غير موجود في الـ Backend

- **الملف (Frontend):** `src/shared/constants/apiEndpoints.ts` – `ratingsProvider: '/ratings/provider'`.
- **المشكلة:** الـ Frontend يستدعي `GET /ratings/provider` ولا يوجد في الـ Backend أي مسار تحت `/ratings`. النتيجة 404، والواجهة تعتمد على mock.
- **الإصلاح:**
  - إضافة مسار في الـ Backend: **`GET /providers/me/ratings`** في `backend/src/routes/providers.ts` (قبل `GET /:id` لتفادي تفسير `me` كـ id).
  - في الـ Frontend: إضافة `providersMeRatings: '/providers/me/ratings'` واستخدامه في `src/features/ratings/data/ratingsApi.ts` بدلاً من `ratingsProvider`.

---

## 4. سيناريوهات التطبيق الأساسية – الحالة بعد الإصلاحات

| السيناريو | الحالة | ملاحظات |
|-----------|--------|----------|
| تسجيل المستخدم | يعمل | `POST /auth/register` + حفظ التوكنات. |
| تسجيل الدخول | يعمل | `POST /auth/login`، تحقق من الحظر. |
| إرسال الطلب | يعمل | `POST /requests` مع `serviceType, origin, ...`. |
| قبول الطلب من المزود | يعمل (بعد الإصلاح) | `PATCH /requests/:id/status` مع `status: 'accepted'` من مزود، والطلب `pending` وبدون مزود. |
| رفض/إلغاء الطلب | يعمل | إرسال `status: 'cancelled'` (من عميل أو مزود حسب الصلاحيات). |
| تحديث حالة الطلب | يعمل | `on_the_way`, `completed`, إلخ. مع إشعارات من الـ Backend. |
| تتبع الطلب من العميل | يعمل | `GET /requests/:id` وواجهة التتبع مع `etaMinutes`. |
| عرض تقييمات المزود (بروفايله) | يعمل (بعد الإصلاح) | `GET /providers/me/ratings` من الـ Frontend. |

---

## 5. قواعد البيانات والتخزين

- **حالياً:** لا يوجد قاعدة بيانات حقيقية. التخزين في الذاكرة عبر الـ stores في `backend/src/store/` (authStore, requestStore, providerStore, notificationStore, ratingStore, chatStore).
- **Prisma:** مذكور في `package.json` لكن لا يوجد `schema.prisma`؛ الـ health يتحقق من `DATABASE_URL` إذا وُجدت لكن لا يستخدم عميل DB.
- **النتيجة:** البيانات تُفقد عند إعادة تشغيل الـ Backend. الربط المنطقي بين Frontend ↔ Backend ↔ “قاعدة البيانات” (الـ stores) يعمل كما هو مصمم حالياً.

---

## 6. APIs غير مستخدمة أو جزئية

| API | الحالة |
|-----|--------|
| `GET /ratings/provider` | كان مستدعى من الواجهة فقط؛ لا يوجد في الـ Backend. تم استبداله بـ `GET /providers/me/ratings`. |
| Chat | مستخدم من الواجهة لكن الـ Backend يعيد بيانات ثابتة (stub). لا تخزين حقيقي في chatStore. |

---

## 7. أخطاء محتملة في الكونسول / اللوجز

- **عند فشل الشبكة أو الـ API:** عدة دوال في الـ Frontend (مثل `requestApi`, `ratingsApi`) تستخدم **mock fallback** وتطبع في `__DEV__` تحذيرات مثل:  
  `[requestApi] fetchCustomerRequests failed, using mock.`  
  هذا متعمّد لتجنب كسر الواجهة، لكنه يخفي فشل الـ API الحقيقي. يُفضّل في الإنتاج عدم الاعتماد على mock أو تقليله وربط أخطاء الشبكة بنظام مراقبة.
- **Refresh token:** عند فشل `POST /auth/refresh` يتم إطلاق حدث `unauthorized` وتنظيف الجلسة؛ لا يوجد سجل خطأ تفصيلي في الكود الحالي.

---

## 8. قائمة المشاكل حسب الأولوية (بعد الإصلاحات)

1. **تم حلها – كانت حرجة:** منع المزود من قبول الطلب المعلّق (403) → تم تعديل منطق الصلاحيات في `requests.ts`.
2. **تم حلها:** عدم وجود endpoint لتقييمات المزود الحالي → تم إضافة `GET /providers/me/ratings` وتحديث الـ Frontend.
3. **متوسطة:** تخزين البيانات في الذاكرة فقط → فقدان البيانات عند إعادة التشغيل. الحل: إدخال قاعدة بيانات (مثلاً Prisma + PostgreSQL) وربط الـ stores بها.
4. **منخفضة:** Chat يعمل كـ stub → ربطه بـ chatStore أو قاعدة بيانات عند الحاجة لمحادثات حقيقية.
5. **منخفضة:** الـ Backend يقبل في التقييم `rating` و`comment` فقط؛ الحقول الإضافية (مثل ratingSpeed, ratingQuality) تُهمل. يمكن توسيع المخطط والـ store لاحقاً إذا لزم.

---

## 9. اقتراحات لتحسين الاستقرار والأداء

1. **قاعدة بيانات:** إضافة Prisma schema وربط المستخدمين، الطلبات، المزودين، التقييمات، والإشعارات بقاعدة بيانات حقيقية مع migrations.
2. **مراقبة الأخطاء:** تسجيل أخطاء الـ API (4xx/5xx) وربطها بنظام مراقبة (مثل Sentry) بدلاً من الاعتماد فقط على تحذيرات الكونسول في وضع التطوير.
3. **تقليل الاعتماد على الـ mock في الإنتاج:** جعل fallback إلى mock مشروطاً بـ `__DEV__` فقط، أو إزالته في الإنتاج، حتى لا يبدو التطبيق وكأنه يعمل رغم فشل الـ API.
4. **اختبارات تكامل إضافية:** تغطية سيناريوهات: تسجيل → دخول → إنشاء طلب → قبول من مزود → تحديث حالة → تقييم، للتأكد من عدم كسر التدفق عند أي تعديل.
5. **Rate limiting:** موجود بالفعل (auth, admin, location). مراجعة الحدود حسب الحمل الفعلي.
6. **Health في العميل:** استدعاء `GET /health/ready` عند بدء التطبيق أو قبل عمليات حرجة لمعرفة إذا كان الـ Backend متاحاً.

---

## 10. ملخص الملفات المعدّلة في هذا التحليل

| الملف | التعديل |
|-------|---------|
| `backend/src/routes/requests.ts` | السماح للمزود بعرض وقبول الطلبات المعلّقة (GET و PATCH). |
| `backend/src/routes/providers.ts` | إضافة `GET /providers/me/ratings` وتحديده قبل `GET /:id`. |
| `src/shared/constants/apiEndpoints.ts` | إضافة `providersMeRatings` والإبقاء على `ratingsProvider` كـ deprecated. |
| `src/features/ratings/data/ratingsApi.ts` | استخدام `ENDPOINTS.providersMeRatings` بدلاً من `ratingsProvider`. |

---

*تاريخ التقرير: بناءً على تحليل الكود الحالي.*
