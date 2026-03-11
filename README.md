# Roadly — MVP

تطبيق بسيط لإيجاد أقرب الميكانيكيين. Expo + TypeScript + Zustand + React Query + Axios.

---

## الخطوة 1: تثبيت الحزم

```bash
cd roadly
npm install
```

---

## الخطوة 2: هيكل المشروع (Feature-based)

```
roadly/
├── App.tsx                 # نقطة الدخول: QueryClient + Navigation
├── src/
│   ├── shared/             # مشترك بين الميزات
│   │   ├── constants/env.ts        # API_BASE_URL, APP_ENV
│   │   ├── services/http/         # api, httpClient, errorMessage (i18n)
│   │   ├── theme/colors.ts
│   │   ├── types/common.ts
│   │   └── components/     # LoadingSpinner, ErrorView, Button
│   ├── features/
│   │   ├── auth/           # المصادقة
│   │   │   ├── store/authStore.ts   # Zustand: user, token, login, logout
│   │   │   ├── types.ts
│   │   │   └── screens/LoginScreen.tsx
│   │   ├── mechanics/      # الميكانيكيون
│   │   │   ├── api.ts      # fetchNearbyMechanics (Axios)
│   │   │   ├── hooks/useNearbyMechanics.ts  # React Query
│   │   │   ├── types.ts
│   │   │   └── screens/MechanicsListScreen, MechanicDetailScreen
│   │   ├── location/       # الموقع
│   │   │   └── useLocation.ts  # expo-location
│   │   └── map/
│   │       └── MapScreen.tsx   # react-native-maps
│   └── navigation/
│       └── RootNavigator.tsx   # Login أو Main (قائمة + خريطة + تفاصيل)
```

- **لا Redux**: الحالة في Zustand (auth) و React Query (قوائم).
- **لا تعقيد**: كل feature فيه store أو api + hooks فقط.

---

## الخطوة 3: تدفق البيانات

1. **تسجيل الدخول**: المستخدم يدخل إيميل وكلمة مرور → `authStore.login()` تستدعي `POST /auth/login` → نحفظ `token` و `user` ونضيف التوكن لـ Axios عبر `setAuthToken`.
2. **أقرب الميكانيكيين**: `useLocation()` يعطي الإحداثيات → `useNearbyMechanics({ lat, lng })` يرسل طلب لـ `GET /mechanics/near` ويُدار من React Query (loading, error, refetch).
3. **الخريطة**: نفس الـ hook للميكانيكيين + عرض Markers وموقع المستخدم.

---

## الخطوة 4: Error handling و Loading

- **getErrorMessage(error)** في `shared/services/http/errorMessage.ts`: تحويل أي خطأ (Axios / HttpError) إلى رسالة مستخدم مع دعم i18n.
- **Loading**: شاشات تستخدم `LoadingSpinner` عند `isLoading` أو `locLoading`.
- **Error**: شاشات تعرض `ErrorView` مع رسالة وزر "إعادة المحاولة" يستدعي `refetch` أو `refetchLoc`.

---

## الخطوة 5: تشغيل الـ Backend

التطبيق يتوقع API على `http://localhost:4000/api` (أو `EXPO_PUBLIC_API_URL`).

- تشغيل الـ Backend من مشروع mechanic-finder: `cd backend && npm run dev`
- أو استخدم عنوان جهازك في الشبكة بدل localhost عند التشغيل على جهاز حقيقي (مثلاً `EXPO_PUBLIC_API_URL=http://192.168.1.x:4000/api`).

---

## الخطوة 6: تشغيل التطبيق

```bash
npx expo start
```

ثم اختر iOS أو Android. تأكد أن الموقع مسموح وأن الـ API يعمل.

---

## ملخص التقنيات

| التقنية | الاستخدام |
|---------|-----------|
| **Zustand** | auth: user, token, login, logout |
| **React Query** | جلب أقرب الميكانيكيين مع cache و loading و error |
| **Axios** | عميل HTTP واحد + إرفاق التوكن + getErrorMessage |
| **React Navigation** | Stack: Login → Main (قائمة) ↔ Map ↔ MechanicDetail |
| **expo-location** | useLocation للحصول على إحداثيات المستخدم |
| **react-native-maps** | MapScreen: موقع المستخدم + markers للميكانيكيين |

كود بسيط، بدون Redux، بدون Clean Architecture معقد، وجاهز للتوسع لاحقاً.
