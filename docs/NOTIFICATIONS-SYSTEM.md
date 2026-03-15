# نظام الإشعارات — Notifications System

## نظرة عامة
نظام إشعارات واضح وفوري ومفصل لكل من **العميل (Customer)** و**المزود (Provider)**، مع مربعات منبثقة (Toast)، أيقونات وألوان حسب نوع الحدث، وقسم إشعارات في لوحة التحكم.

---

## 1. إشعارات المزود (Provider)

| الحدث | النوع (type) | اللون | الأيقونة | مثال رسالة |
|--------|--------------|-------|----------|-------------|
| طلب جديد | `new_request` | أخضر | bell-ring | اسم العميل، نوع الخدمة، موقع الطلب، وقت الطلب |
| تم قبول الطلب | `request_accepted` | أخضر | check-circle | تحديث الحالة |
| تم رفض الطلب | `request_rejected` | أحمر | close-circle | تحديث الحالة |
| الطلب مكتمل | `request_completed` | أزرق | flag-checkered | "الطلب مكتمل" |

---

## 2. إشعارات العميل (Customer)

| الحدث | النوع (type) | اللون | الأيقونة | مثال رسالة |
|--------|--------------|-------|----------|-------------|
| تم قبول طلبك | `request_accepted` | أخضر | check-circle | "تم قبول طلبك" |
| تم رفض طلبك | `request_rejected` | أحمر | close-circle | "تم رفض طلبك" |
| المزود وصل | `provider_arrived` | أخضر | map-marker-check | "المزود وصل" |
| قيد التنفيذ | `in_progress` | أزرق (info) | wrench | "طلبك قيد التنفيذ" |
| تم إتمام الخدمة | `service_completed` | أزرق | star-check | "تم إتمام الخدمة" + خيار التقييم |

---

## 3. عرض الإشعارات

- **مربعات منبثقة (Toast):** عند حدث فوري (طلب جديد، قبول، رفض، إلخ) يُستدعى `showNotificationToast(type, message, { durationMs, triggerHaptic })` من `features/notifications/services/notificationToast.ts`. الـ Toast يستخدم ألوان success (أخضر) / error (أحمر) / info (أزرق).
- **قسم الإشعارات (NotificationsScreen):** يعرض كل الأحداث السابقة مع التاريخ والوقت. كل بطاقة تعرض أيقونة ولون حسب `type`، والضغط يفتح تفاصيل الطلب (مثلاً RequestHistory).
- **الصوت/الاهتزاز:** عند طلب جديد يمكن تفعيل اهتزاز عبر `expo-haptics` إذا كان مثبتاً (الاستدعاء داخل `showNotificationToast` مع `triggerHaptic`).

---

## 4. إدارة أنواع الإشعارات (الإعدادات)

في **Settings** يوجد:
- مفتاح رئيسي: تشغيل/إيقاف كل الإشعارات.
- عند التشغيل تظهر ثلاثة خيارات:
  - **طلبات جديدة وتحديثات** (`newRequests`)
  - **تحديثات الحالة** (قبول، رفض، في الطريق) (`statusUpdates`)
  - **إتمام الخدمة والتقييم** (`completionAndRating`)

الحالة محفوظة في `notificationPreferencesStore`. يمكن ربطها لاحقاً بالباكند أو بـ Push بحيث لا يُرسل إشعار من نوع معين إذا كان المستخدم عطّلَه.

---

## 5. الملفات الرئيسية

| الملف | الوظيفة |
|-------|---------|
| `features/notifications/domain/types.ts` | أنواع الإشعارات (Provider/Customer) وواجهة `Notification` مع `data.requestId`, `data.providerId` |
| `features/notifications/constants/notificationTheme.ts` | `getNotificationTheme(type, isProvider)` → icon, color, toastType |
| `features/notifications/presentation/screens/NotificationsScreen.tsx` | قائمة الإشعارات مع أيقونة/لون حسب النوع والتنقل إلى الطلب أو لوحة التحكم |
| `features/notifications/services/notificationToast.ts` | `showNotificationToast(type, message, options)` للعرض الفوري والاهتزاز الاختياري |
| `store/notificationPreferencesStore.ts` | تفضيلات تشغيل/إيقاف حسب النوع |
| `features/settings/.../SettingsScreen.tsx` | قسم الإشعارات + التبديلات الثلاثة |

---

## 6. التكامل مع الباكند

- **GET /notifications:** يُفترض أن يرجع عناصر فيها `type`, `title`, `message`, `createdAt`, `read`, `data: { requestId?, providerId? }`.
- **PATCH /notifications/:id/read:** لتحديد الإشعار كمقروء.
- عند استقبال حدث فوري (WebSocket أو بعد استدعاء API): استدعاء `showNotificationToast` وإعادة جلب القائمة (مثلاً `queryClient.invalidateQueries(['notifications'])`) لتحديث لوحة التحكم فوراً.

---

## 7. الترجمة (i18n)

المفاتيح المضافة في `strings.ts`:
- `notifications.prefs.title`, `newRequests`, `statusUpdates`, `completionAndRating`
- `notification.toast.requestAccepted`, `requestRejected`, `providerArrived`, `inProgress`, `serviceCompleted`, `newRequest`, `requestCompleted`, `requestRejectedProvider`

يمكن استخدامها عند عرض Toast أو نصوص ثابتة في الواجهة.
