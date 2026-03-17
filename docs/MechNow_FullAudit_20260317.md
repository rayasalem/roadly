# MechNow – Full Functional Audit (2026‑03‑17)

**Scope:** End‑to‑end functional audit for **Customer**, **Service Provider**, and **Admin** roles across **frontend + backend** after recent fixes (chat, provider location, admin, fallbacks).  
**Goal:** Verify feature status, API connectivity, map/tracking behavior, request lifecycle, chat, ratings, notifications, UI‑only features, mock usage, and provide concrete fix recommendations.

---

## 1. High‑Level Status per Role

### 1.1 Summary Table

| Role            | Area                  | Status                           | Notes |
|-----------------|-----------------------|----------------------------------|-------|
| Customer        | Auth                  | ✅ Fully working                 | Register/login/refresh/logout connected. |
| Customer        | Requests + Tracking   | ✅ Fully working                 | Create, list, track, lifecycle OK. |
| Customer        | Map / Nearby          | ✅ Working (real data, safer fallback) | Uses DB; fallback only on network/API failure. |
| Customer        | Chat                  | ✅ Request‑based, DB‑backed      | Conversations now derived from real requests. |
| Customer        | Ratings               | ✅ Fully working                 | Rate completed requests; provider ratings endpoint in place. |
| Customer        | Notifications         | ✅ Working                       | List + mark read + register/unregister device. |
| Customer        | Payments              | ⚪ UI‑only                       | Screen exists; **no backend** yet. |
| Customer        | Favorites             | ⚪ UI‑only                       | Screen exists; **no backend** yet. |
| Customer        | Help & Support        | ⚪ UI‑only                       | Screen exists; **no backend** yet. |
| Service Provider| Auth / Availability   | ✅ Fully working                 | Role‑based navigation + availability toggle. |
| Service Provider| Map presence          | ✅ Connected (location sync)     | FE calls PATCH `/providers/me/location`. |
| Service Provider| Requests dashboard    | ✅ Fully working                 | Mechanic/Tow/Rental dashboards wired. |
| Service Provider| Chat                  | ✅ Same as customer              | Conversations/messages by `requestId`. |
| Service Provider| Navigation            | ⚪ UI‑only                       | No external maps deep link yet. |
| Service Provider| Ratings (view)        | ✅ Working                       | `/providers/me/ratings`. |
| Admin           | Dashboard overview    | ✅ Connected (new shape)         | Backend returns `chartData` + panels. |
| Admin           | Users management      | ✅ Connected to backend          | Uses `/admin/users` and `/admin/users/:id/block`. |
| Admin           | Providers management  | ✅ Connected to backend          | Uses `/admin/providers` + `/admin/providers/:id/verify`. |
| Admin           | Requests list         | ✅ Connected to backend          | Uses `/admin/requests`. |
| Admin           | Analytics             | ✅ Basic chart data              | Last 7‑day counts. |
| Admin           | Complaints            | ❌ Not implemented               | No DB model or UI yet. |

---

## 2. Customer Role – Detailed Audit

### 2.1 Auth (Register / Login / Session)

- **Status:** ✅ **Fully working**
- **Frontend:** `RegisterScreen`, `LoginScreen`, session store + token refresh.
- **Backend:** `auth.ts` with Prisma‑backed `User`, `RefreshToken`.
- **APIs:** `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me`.

**Fix suggestions:** لا يوجد حالياً؛ فقط يُنصح بإضافة rate‑limiting أوسع لو لزم وحماية إضافية ضد brute‑force حسب بيئة الإنتاج.

### 2.2 Map & Nearby Providers

- **Status:** ✅ **Working with real data + safer fallback**
- **Frontend:**
  - `MapScreen` → `useNearbyProviders` → `providersApi.fetchNearbyProviders()`.
  - تم تعديل المنطق ليكون:
    - إذا API نجح و**أعاد قائمة (حتى لو فارغة)** → تُستخدم النتيجة كما هي.
    - إذا حدث خطأ حقيقي (شبكة/500) → يستخدم `MOCK_PROVIDERS` كـ fallback.
- **Backend:**
  - `GET /providers/nearby` → `providerStore.findNearby` (Prisma + مسافة haversine).
  - يعتمد على `ProviderProfile.latitude/longitude` المحدثة من مزودي الخدمة.

**Remaining risk:** إذا كانت قاعدة البيانات فارغة فلن تظهر مزودين (سلوك صحيح في الإنتاج). يمكن تفعيل mock في وضع التطوير فقط إن لزم.

**Fix suggestions:**
- إبقاء fallback للمحلي/التجريبي فقط (ربطه بـ `__DEV__` أو متغير بيئة).

### 2.3 Create & Track Requests

- **Status:** ✅ **End‑to‑end working**
- **Frontend:** `RequestScreen`, `RequestHistoryScreen`, `LiveTrackingScreen`, `useRequest`.
- **Backend:** `requestStore` (Prisma) + `requests.ts` routes، مع الحالات:
  - `pending` → `accepted` → `on_the_way` → `completed` أو `cancelled`.
- **Lifecycle:** إنشـاء، قبول، إلغاء، تتبع، إكمال، تقييم كلها متصلة.

**Fix suggestions:** متابعة التناسق على مستوى التسمية:
- في جميع الواجهات استخدم **`cancelled`** بدلاً من `rejected` (تم تصحيحه في المواضع الأساسية بالفعل).

### 2.4 Chat System (Customer Side)

- **Status قبل الإصلاح:** قائمة المحادثات كانت **stub** بثلاث محادثات ثابتة، ولا تستند إلى الطلبات.
- **الحالة الآن: ✅ متكاملة مع الطلبات**
- **Backend:**
  - `requestStore.listRequestsForChat(userId)`:
    - يجلب كل الـ Requests التي يكون فيها المستخدم Customer أو Provider.
  - `chatStore.getLastMessagesByRequestIds(requestIds)`:
    - يعيد آخر رسالة لكل طلب.
  - `GET /chat/conversations`:
    - يبني قائمة محادثات حيث:
      - `id` = **`requestId`**.
      - `name` = اسم الطرف الآخر (العميل أو المزود) من DB.
      - `lastMessage`, `lastAt` من `chatStore`.
    - في حالة فشل DB يعيد قائمة فارغة بدل stub.
  - `GET /chat/conversations/:id/messages`:
    - يتحقق أن المستخدم مشارك في الطلب (customer/provi­der)، ثم يعيد الرسائل من DB فقط.
    - لا توجد بيانات ثابتة الآن؛ كل شيء من DB.
- **Frontend:**
  - كان بالفعل يتعامل مع `conversationId` على أنه `requestId` للرسائل والإرسال؛ بعد التعديل أصبحت القائمة متوافقة مع هذا العقد.

**Result:**  
قائمة المحادثات الآن مبنية على الطلبات الفعلية لكل مستخدم، وكل `conversationId` يطابق `requestId`، والرسائل مخزنة/مسترجعة من قاعدة البيانات.

**Fix suggestions:** في المستقبل يمكن إضافة:
- مؤشر unread per conversation.
- ترقيم/صفحات في `GET /chat/conversations/:id/messages`.

### 2.5 Ratings, Notifications, Other Features

- **Ratings:** ✅
  - `POST /requests/:id/rate` + `GET /providers/me/ratings` متصلين.
- **Notifications:** ✅
  - `GET /notifications`, `PATCH /notifications/:id/read`, `POST /notifications/register|unregister`.
- **Payment (UI‑only):** ⚪
  - `PaymentScreen` تعرض واجهة بدون أي استدعاءات API.
- **Favorites (UI‑only):** ⚪
  - `FavoritesScreen` تعرض قائمة فارغة؛ لا يوجد model أو API.
- **Help & Support (UI‑only):** ⚪
  - `HelpSupportScreen` تعرض نموذج أو روابط بدون تخزين في DB.

**Fix plan for missing customer features:**

| Feature     | Backend additions                                                                 | Frontend wiring                                                                 |
|------------|------------------------------------------------------------------------------------|---------------------------------------------------------------------------------|
| Payments   | Table `PaymentMethod` + `PaymentIntent`, routes تحت `/payments` أو `/billing`.    | `PaymentScreen` → `paymentsApi` (add card, list methods, start/confirm payment). |
| Favorites  | Table `FavoriteProvider(userId, providerId)`.                                     | `FavoritesScreen` يستخدم `GET/POST/DELETE /favorites`.                         |
| Help/Support | Table `SupportTicket`/`Complaint` مع حالة وأولوية.                             | `HelpSupportScreen` يرسل `POST /support/tickets` ويعرض `GET /support/tickets`. |

---

## 3. Service Provider Role – Detailed Audit

### 3.1 Availability & Map Presence

- **Status:** ✅ **Fully working (backend + frontend)**
- **Backend:** `ProviderProfile` مع `latitude`, `longitude`, `locationUpdatedAt`, `isAvailable`, `verified`.
- **Frontend:**
  - **مزامنة الموقع الآني:**
    - `useProviderLocationSync` (hook جديد) يقرأ موقع الجهاز من `useUserLocation` ويستدعي:
      - `PATCH /providers/me/location` عبر `providerProfileApi.updateProviderLocation(latitude, longitude)`.
    - مفعّل في شاشات: Dashboards للمكانيك/السحب/التأجير.
  - **تحديث عند قبول/بدء التنفيذ:**
    - عند `accept` أو `start` في داساتبورد المزود يتم استدعاء `locationService.getCurrentPosition()` ثم إرسال إحداثيات حديثة إلى الـ backend.
- **نتيجة:**  
مزود الخدمة يظهر الآن على الخريطة بموقعه الحقيقي (من الجهاز) وليس فقط بيانات seed أو fallback.

### 3.2 Requests Dashboard, Lifecycle, Chat

- **Status:** ✅
- **Dashboards:** `dashboard/mechanic`, `dashboard/tow`, `dashboard/rental` تعمل كما في التقرير السابق.
- **Lifecycle:** نفس تدفق العميل ولكن من منظور المزود؛ جميع الحالات متصلة بـ `PATCH /requests/:id/status`.
- **Chat:** مزود يرى نفس المحادثات المبنية على الطلبات (`requestId`).

### 3.3 Navigation (Optional)

- **Status:** ⚪ **UI‑only**
- يوجد أزرار “Navigate” لبعض الشاشات، لكنها لا تفتح تطبيق خرائط خارجي حالياً.

**Fix suggestions (Navigation):**
- في React Native أضف util مثل:
  - `Linking.openURL('https://www.google.com/maps/dir/?api=1&destination=lat,lng')`.
- استخدمه في:
  - شاشة تفاصيل الطلب للمزود.
  - شاشة التتبع الحي (للعميل والمزود).

---

## 4. Admin Role – Detailed Audit

### 4.1 Admin Dashboard (`GET /admin/dashboard`)

- **Status قبل التعديل:** mismatch بين ما يُرجع الـ backend وما تتوقعه الواجهة (`mechanics`, `tow`, `rental` فقط بدون panels/`chartData`/providers map).
- **الحالة الآن: ✅ متوافقة مع الواجهة**
- **Backend (admin.ts):**
  - يستخدم:
    - `getAllUsers()`, `getAllProviders()`.
    - `countRequestsByStatus()` → active/completed/pending.
    - `getRequestCountsByDay(7)` → `chartData` (آخر 7 أيام).
    - `listRecentRequestsWithNames(serviceType, limit)` لكل من mechanic/tow/rental.
  - يعيد JSON بالهيكل الذي تتوقعه `useAdminDashboard`:
    - `stats` مع:
      - `users`, `providers`, `requests`, `revenue` (string),  
        `mechanicsCount`, `towCount`, `rentalCount`,  
        `activeProviders`, `activeRequests`, `completedServices`, `pendingRequests`.
    - `chartData`: `number[]` (7 عناصر).
    - `mechanicPanel`:
      - `stats`: `{ jobsToday, activeRequests, avgRating }`.
      - `requests`: قائمة مبنية من طلبات serviceType = mechanic، مع حقول:
        - `id`, `title`, `customerName`, `distance`, `eta`, `status ('new'|'on_the_way'|'in_garage')`, `mechanicName`.
    - `towPanel`: مماثلة لكن مع `active/queued` و `vehicle`.
    - `rentalPanel`: حالياً stats صفرية و`vehicles: []` (قابلة للتوسعة لاحقاً).
    - `providers`: كائن يحتوي:
      - `mechanic[]`, `tow[]`, `rental[]` بعناصر:
        - `id`, `name`, `role`, `status ('verified'|'pending')`, `requestsCount` (حالياً 0).
- **Frontend:** `useAdminDashboard` تعمل الآن بدون تعديل إضافي، وتستطيع:
  - استخدام `stats`, `chartData`, panels, و`getProvidersByRole(role)` من `data.providers`.

### 4.2 Admin Users (`GET /admin/users`, `PATCH /admin/users/:id/block`)

- **Status قبل التعديل:** `useAdminUsers` كان مبني على mock (`MOCK_CUSTOMERS`, `MOCK_PROVIDERS_ALL`, `MOCK_ADMINS`)، ولا يستخدم الـ backend.
- **الحالة الآن: ✅ متصل بالكامل**
- **Frontend:**
  - `adminUsersApi.ts`:
    - `fetchAdminUsers({ page, limit })` → `GET /admin/users`.
    - `blockUser(userId, blocked)` → `PATCH /admin/users/:id/block`.
  - `useAdminUsers`:
    - يستخدم `useQuery` على `['admin','users']` لاستدعاء `fetchAdminUsers`.
    - يحوّل `AdminUserApiItem` من الـ backend إلى `AdminUser` مع:
      - `role` مصلّح (`user|mechanic|tow|rental|admin`).
      - `status` مبني من `blocked` (`suspended` أو `active`).
    - `setUserBlocked(user, blocked)` يستدعي `blockUserApi` ويعيد تحميل القائمة.
  - `AdminUsersScreen`:
    - زر Block/Unblock يستدعي الآن `setUserBlocked` بدلاً من تعديل state محلي فقط.

### 4.3 Admin Providers (`GET /admin/providers`, `PATCH /admin/providers/:id/verify`)

- **Status قبل التعديل:** 
  - قائمة المزودين اعتمدت على `data.providers` من `/admin/dashboard` لكنها كانت فارغة بسبب mismatch.
  - زر Verify فقط يعرض toast.
- **الحالة الآن: ✅**
- **Frontend:**
  - `adminProvidersApi.ts`:
    - `fetchAdminProviders`, `verifyProvider`.
  - `AdminProviderListScreen`:
    - يجلب المزودين من `useAdminDashboard().getProvidersByRole(role)` (المتصلة الآن بالـ backend بعد تعديل response shape).
    - يستخدم `useMutation` مع `verifyProvider(id, true)` عند الضغط على زر Verify.
    - عند النجاح يلغي استعلام `['dashboard','admin']` لإعادة تحميل البيانات، ويعرض toast نجاح.

### 4.4 Admin Requests (`GET /admin/requests`)

- **Status قبل التعديل:** `AdminRequestsScreen` اعتمد على `MOCK_REQUESTS` فقط.
- **الحالة الآن: ✅**
- **Backend:**
  - مسار جديد `GET /admin/requests` في `admin.ts`:
    - يقبل `page`, `limit`, `status`, `serviceType`.
    - يستخدم `listAllRequestsForAdmin` ليعيد:
      - `items`: مع `customerName`, `providerName`, `serviceType`, `status`, `createdAt`, إلخ.
      - `total`, `page`, `limit`.
- **Frontend:**
  - `adminRequestsApi.ts`:
    - `fetchAdminRequests({ page, limit, status, serviceType })`.
  - `AdminRequestsScreen`:
    - يستخدم `useQuery` بـ key: `['admin','requests',statusFilter,serviceFilter]`.
    - يعرض النتائج الحقيقية (بدلاً من mock).
    - فلاتر الحالة (`pending`, `accepted`, `on_the_way`, `completed`, `cancelled`) متوافقة مع `RequestStatus` في الـ backend.

### 4.5 Admin Analytics & Complaints

- **Analytics:** ✅ أساسي
  - `chartData` هو مصفوفة أعداد الطلبات المنشأة لكل يوم لآخر 7 أيام.
  - يمكن توسيعها لاحقاً لتشمل إيرادات، مزودين جدد، إلخ.
- **Complaints:** ❌ غير موجودة
  - لا يوجد model أو مسارات خاصة بالشكاوى حتى الآن.

**Fix suggestions (Complaints module):**

| Layer    | Suggested addition                                                                          |
|----------|----------------------------------------------------------------------------------------------|
| DB       | جدول `Complaint` مع الحقول: `id, userId, requestId?, type, message, status, createdAt`.     |
| Backend  | `POST /support/complaints`, `GET /support/complaints (admin only)`, `PATCH /support/complaints/:id`. |
| Frontend | شاشة في تبويب الأدمن لعرض الشكاوى وتغيير الحالة؛ وربط `Help & Support` لإنشاء complaint.   |

---

## 5. API Connectivity Snapshot

### 5.1 Admin & Chat – Key Endpoints

| Endpoint                               | Status            | Frontend usage                              |
|----------------------------------------|-------------------|---------------------------------------------|
| `GET /chat/conversations`             | ✅ Live, DB‑backed| `fetchConversations`                        |
| `GET /chat/conversations/:id/messages`| ✅                | `fetchMessages(conversationId=requestId)`   |
| `POST /chat/conversations/:id/messages`| ✅               | `sendMessage`                               |
| `GET /admin/dashboard`                | ✅                | `useAdminDashboard`                         |
| `GET /admin/users`                    | ✅                | `useAdminUsers` → `fetchAdminUsers`         |
| `PATCH /admin/users/:id/block`        | ✅                | `useAdminUsers.setUserBlocked`              |
| `GET /admin/providers`                | ✅                | underlying data for providers list          |
| `PATCH /admin/providers/:id/verify`   | ✅                | `AdminProviderListScreen` → `verifyProvider`|
| `GET /admin/requests`                 | ✅                | `AdminRequestsScreen` → `fetchAdminRequests`|

---

## 6. Mock Data & Fallbacks – Current Usage

| Area             | Type         | When used now                                          | Risk / Recommendation                      |
|------------------|-------------|--------------------------------------------------------|--------------------------------------------|
| Nearby providers | Fallback    | فقط عند فشل API/network (ليس عند قائمة فارغة)        | مقبول؛ يفضل قصره على بيئات التطوير.      |
| Admin requests   | Mock         | **أزيل** – تم استبدال `MOCK_REQUESTS` ببيانات حقيقية | —                                          |
| Admin users      | Mock         | **أزيل** – لم يعد يستخدم INITIAL_USERS              | —                                          |
| Chat             | Stub         | **أزيل** – القائمة قائمة على DB الآن                 | —                                          |

---

## 7. Optional Items – Navigation & Performance

### 7.1 External Navigation

- **Current:** أزرار/أيقونات بدون ربط فعلي بالخرائط.
- **Recommendation (minimal):**
  - Utility:
    - `openExternalMap(lat, lng)` باستخدام `Linking.openURL` بصيغة Google/Apple Maps.
  - استخدامه في:
    - `LiveTrackingScreen` (للعميل).
    - شاشات مزود الخدمة التي تعرض إحداثيات الطلب.

### 7.2 Performance & Memory

- **Backend:**
  - يعتمد على Prisma + PostgreSQL؛ لا يوجد تخزين in‑memory كبير باستثناء عمليات الـ query المؤقتة.
  - يفضل مراقبة:
    - كثرة استعلامات `findMany` بدون pagination حقيقي في لوحات الأدمن عند تضخم البيانات.
- **Frontend:**
  - استخدام `react-query` مع `staleTime` مناسب، ما يساعد في تقليل الاستدعاءات.
  - يفضَّل:
    - التأكد من إلغاء الاشتراكات/listeners عند unmount (خاصة hooks الموقع).
    - مراقبة شاشات الخرائط/التتبع في أجهزة قديمة للتأكد من عدم وجود memory leaks في `useUserLocation`.

---

## 8. Final Recommendations Before Web/Mobile Release

1. **إغلاق الميزات الناقصة للعميل:**
   - تنفيذ وحدات **Payments**, **Favorites**, **Help & Support** أو إخفاء هذه الشاشات مؤقتاً في الإنتاج إذا لم تُجهَّز.
2. **إضافة Complaints للأدمن (اختياري قوي):**
   - على الأقل نموذج بسيط يربط Help & Support بجدول في DB يعرضه الأدمن.
3. **التنقل الخارجي (Navigation):**
   - تنفيذ `openExternalMap` وربطه بالأزرار الموجودة للعميل والمزود.
4. **تأكيد سياسة fallback:**
   - حصر استخدام البيانات الوهمية في بيئات التطوير فقط، أو تمييزها بوضوح في الـ UI إذا استُخدمت.
5. **اختبارات كاملة للأدوار الثلاثة:**
   - Flows أساسيـة لكل من Customer / Provider / Admin، خاصة مع التغييرات الأخيرة في الـ admin و chat.

هذا التدقيق يعكس حالة المشروع بعد الدمج الأخير للتغييرات (chat request‑based، مزامنة موقع المزود، ربط لوحات الأدمن بالـ APIs، وتصحيح fallbacks). يمكن استخدامه كمرجع جاهز لتجهيز نسخة الإنتاج للويب والموبايل.

