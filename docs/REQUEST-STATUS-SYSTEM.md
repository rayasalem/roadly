# نظام حالة الطلبات — Request Status System

## الحالات الممكنة (RequestStatus)

| الحالة       | المفتاح         | اللون (تقريبي) | الوصف |
|-------------|-----------------|----------------|-------|
| جديد        | `new`           | رمادي فاتح     | طلب حديث الإنشاء |
| قيد الانتظار | `pending`       | رمادي فاتح     | لم يرد عليه المزود |
| مقبول       | `accepted`      | أخضر           | قبل المزود الطلب |
| مرفوض       | `rejected`      | أحمر           | رفض المزود الطلب |
| جاري التنفيذ | `in_progress`   | أزرق           | المزود ينفذ الخدمة |
| في الطريق   | `on_the_way`    | أزرق           | (قديم) يعامل كـ in_progress |
| مكتمل       | `completed`     | ذهبي/برتقالي   | انتهت الخدمة |
| ملغى        | `cancelled`     | رمادي غامق     | ألغي الطلب |

---

## عرض الطلب للعميل (Customer)

- **قائمة الطلبات (RequestHistoryScreen):**
  - بطاقة لكل طلب: اسم المزود، نوع الخدمة، موقع (إحداثيات أو رابط خريطة)، وقت الطلب، **الحالة بلون مميز** (من `requestStatusTheme`).
  - فلاتر: الكل / جاري التنفيذ / مكتمل / ملغي.
  - أزرار: "تتبع على الخريطة" للطلبات الجارية، "تقييم المزود" للمكتملة.
- **تفاصيل الطلب (RequestScreen + RequestStatusCard):**
  - عرض الحالة مع أيقونة ولون، اسم المزود، ETA إن وُجد.
  - زر "إلغاء الطلب" عندما تكون الحالة `new` أو `pending`.
  - زر "تتبع" للطلبات الجارية، و"تقييم" بعد الإكمال.

---

## عرض الطلب للمزود (Provider)

- **لوحة التحكم (ProviderDashboardScreen):**
  - **طلبات جديدة:** قائمة طلبات بحالة `new` أو `pending` — اسم العميل، نوع الخدمة، موقع العميل، الوقت، أزرار **قبول / رفض**.
  - **جاري التنفيذ:** طلبات بحالة `accepted` أو `on_the_way` أو `in_progress` — رابط "عرض على الخريطة" وزر **"تم التنفيذ"** لتحويل الحالة إلى `completed`.
  - **مكتملة:** قائمة الطلبات المكتملة مع التاريخ.
- بعد القبول: تحديث الحالة إلى `accepted` (أو يمكن الانتقال مباشرة إلى `in_progress` حسب المنتج).
- بعد "تم التنفيذ": تحديث الحالة إلى `completed` وإشعار العميل لتقييم الخدمة (عبر نظام الإشعارات).

---

## التحكم وإدارة الطلبات

- **المزود:** تغيير الحالة (قبول، رفض، تم التنفيذ)، أقسام منفصلة للجديدة / الجارية / المكتملة، إشعارات فورية لطلبات جديدة (عداد في الهيدر).
- **العميل:** متابعة الحالة في الوقت شبه الحقيقي (إعادة جلب دورية)، إلغاء الطلب عندما الحالة `new` أو `pending`، تقييم بعد الإكمال.

---

## الملفات الرئيسية

| الملف | الوظيفة |
|-------|---------|
| `features/requests/domain/types.ts` | `RequestStatus` و `ServiceRequest` مع `providerName`, `customerName` |
| `features/requests/constants/requestStatusTheme.ts` | `getRequestStatusTheme(status)`، `isRequestInProgress`, `canCustomerCancel` |
| `features/requests/presentation/screens/RequestHistoryScreen.tsx` | قائمة طلبات العميل مع فلتر وألوان الحالة |
| `features/requests/presentation/components/RequestStatusCard.tsx` | بطاقة تفاصيل الطلب مع إلغاء/تتبع/تقييم (وضع عميل أو مزود) |
| `features/requests/hooks/useProviderRequests.ts` | طلبات المزود: newOrPending, inProgress, completed + updateStatus |
| `features/provider-dashboard/.../ProviderDashboardScreen.tsx` | أقسام الطلبات مع قبول/رفض/تم التنفيذ |
| `features/requests/data/requestApi.ts` | إنشاء، جلب، تحديث الحالة (مع دعم الموك) |
| `mock/mockRequests.ts` | بيانات وهمية بكل الحالات |

---

## التكامل مع الباكند

- **PATCH /requests/:id/status** — body: `{ status: RequestStatus }`. يجب أن يدعم الباكند القيم: `new`, `pending`, `accepted`, `rejected`, `in_progress`, `completed`, `cancelled` (واختياريًا `on_the_way` للتوافق مع الإصدارات القديمة).
- إشعار العميل عند تغيير الحالة (قبول، رفض، تم التنفيذ) يتم عبر نظام الإشعارات أو Push.
