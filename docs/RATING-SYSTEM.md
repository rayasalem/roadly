# نظام التقييم بعد إتمام الطلب — Rating System

## متى يظهر التقييم
- بعد تغيير حالة الطلب إلى **مكتمل**.
- العميل يتلقى إشعاراً (عبر نظام الإشعارات): **"قيم طلبك الآن"** (`rating.rateNowNotification`).
- في **لوحة الطلبات** (Request History) كل طلب مكتمل يعرض زر **"تقييم المزود"** للانتقال إلى صفحة التقييم مع `requestId` و`providerName`.

---

## عناصر التقييم
| العنصر | المفتاح | النوع |
|--------|---------|--------|
| التقييم العام | `rating.overall` | نجوم 1–5 (إلزامي) |
| سرعة الاستجابة/الخدمة | `rating.speed` | نجوم 1–5 |
| جودة الخدمة | `rating.quality` | نجوم 1–5 |
| سلوك المزود والاحترافية | `rating.professionalism` | نجوم 1–5 |
| ملاحظة / تعليق | `rating.commentOptional` | نص اختياري |

---

## عرض التقييم

### للعميل (Customer)
- **صفحة التقييم (RatingsScreen):** عند فتحها مع `requestId` تظهر النموذج (4 صفوف نجوم + حقل تعليق). بعد الإرسال تظهر رسالة **"شكراً لتقييمك"** مع زر "العودة لطلباتي".
- **سجل الطلبات:** الطلبات المكتملة تعرض زر "تقييم المزود" ينتقل إلى صفحة التقييم مع نفس الطلب.
- مراجعة التقييمات السابقة: من الطلبات المكتملة يمكن فتح تفاصيل الطلب؛ التقييم المُرسَل يظهر من الباكند عند دعمه.

### للمزود (Provider)
- **لوحة التحكم:** قسم **"التقييمات الواردة"** يعرض آخر التقييمات (عميل، نجوم عامة، سرعة/جودة/احترافية، تعليق، تاريخ).
- **الإحصائيات:** **متوسط التقييم** (Average rating) يظهر في قسم الإحصائيات مع نجوم ومتوسط رقمي.
- إشعار عند وصول تقييم جديد: عبر نظام الإشعارات (نوع مناسب من الباكند أو إشعار محلي).

---

## التصميم البصري
- نجوم: لون أصفر/ذهبي (`#F59E0B`) للنجوم النشطة، رمادي للغير محددة.
- ترتيب عمودي واضح، نصوص مقروءة، أيقونات مناسبة لكل بند.
- بطاقة التأكيد بعد الإرسال: أيقونة صح بلون أخضر + عنوان "شكراً لتقييمك".

---

## الملفات الرئيسية
| الملف | الوظيفة |
|-------|---------|
| `features/ratings/domain/types.ts` | `RequestRating`, `RatingDimensions` |
| `features/ratings/data/ratingsApi.ts` | `fetchProviderRatings` (قائمة تقييمات المزود) |
| `features/ratings/presentation/components/StarRatingRow.tsx` | صف تقييم: عنوان + 1–5 نجوم |
| `features/ratings/presentation/screens/RatingsScreen.tsx` | نموذج التقييم، إرسال، وشاشة "شكراً لتقييمك" |
| `features/ratings/hooks/useProviderRatings.ts` | جلب تقييمات المزود ومتوسط التقييم |
| `features/requests/data/requestApi.ts` | `rateRequest` مع `rating`, `ratingSpeed`, `ratingQuality`, `ratingProfessionalism`, `comment` |
| `features/provider-dashboard/.../ProviderDashboardScreen.tsx` | قسم التقييمات الواردة + متوسط التقييم في الإحصائيات |
| `features/requests/presentation/screens/RequestHistoryScreen.tsx` | زر التقييم ينتقل إلى Ratings مع `requestId` و`providerName` |

---

## واجهة الـ API
- **POST /requests/:requestId/rate**  
  Body: `rating` (1–5، إلزامي)، `ratingSpeed?`, `ratingQuality?`, `ratingProfessionalism?`, `comment?`.
- **GET /ratings/provider**  
  يرجع قائمة تقييمات المزود الحالي واختياريًا `averageRating`.

---

## خريطة البحث والعملاء
- متوسط تقييم المزود يظهر في بطاقة/نافذة المزود على الخريطة (من `provider.rating` أو من الإحصائيات).
- فلترة المزودين حسب تقييم عالي (مثلاً 4+ نجوم) يمكن إضافتها لاحقاً عبر معامل استعلام مثل `minRating` في واجهة المزودين القريبين.
