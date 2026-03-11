# نظام الخرائط MechNow (مجاني – OpenStreetMap)

## الويب (Web)
- **المصدر:** OpenStreetMap فقط عبر Leaflet (تحميل من CDN، بدون Google Maps أو مفتاح API).
- **المكونات:** `WebMapView.tsx` → `OSMMapView.tsx` – خريطة تفاعلية، طبقة OSM، markers (صورة، اسم، رقم)، popup مع زر "طلب خدمة / اتصل".
- **لا يُستخدم Google Maps على الويب.**

## Native (iOS / Android)
- **iOS:** `PROVIDER_DEFAULT` = Apple Maps (مجاني).
- **Android:** `PROVIDER_DEFAULT` (قد يتطلب إعداد مفتاح حسب البيئة).

## Hook موحد: useSortedNearbyProviders
- **الملف:** `hooks/useSortedNearbyProviders.ts`
- يجمع: موقع المستخدم (GPS) + جلب المزودين القريبين من API + ترتيب الأقرب (Haversine).
- يعيد فقط المزودين الذين سجّلوا موقعهم (lat, lng).
- عند فشل API يستخدم قائمة fallback حتى لا تتوقف الخريطة.
- الاستخدام: `useSortedNearbyProviders({ role: filterRole, enabled: true })` → `sortedProviders`, `nearest`, `userCoords`, `mapCenter`, `getDistanceKm`, `refetchProviders`, إلخ.

## تدفق البيانات
1. **موقع المستخدم:** `useUserLocation()` أو عبر `useSortedNearbyProviders`.
2. **المزودون القريبون:** `useNearbyProviders` (داخلي في الـ hook) → من API أو fallback.
3. **المسافة والترتيب:** `haversine.ts` → `haversineDistanceKm()` و `sortByNearest()` لترتيب الأقرب أولاً.
4. **العرض:** فقط المزودون الذين لديهم `location` (lat/lng) صالح يظهرون على الخريطة.

## الظهور حسب الدور
- **Backend:** `findNearby` يفلتر حسب `isAvailable` ووجود موقع صحيح و`verified`.
- **واجهة الخريطة:** كل الأدوار (Admin, User, Mechanic, Tow, Car Rental) تشاهد الخريطة؛ زر "طلب خدمة" يظهر للمستخدم (Customer) فقط.
