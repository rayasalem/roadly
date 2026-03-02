export type Locale = 'en' | 'ar';

export type StringKey =
  | 'app.name'
  | 'home.greeting'
  | 'home.subtitle'
  | 'home.servicesTitle'
  | 'home.servicesSubtitle'
  | 'home.services.mechanic.title'
  | 'home.services.mechanic.subtitle'
  | 'home.services.mechanic.meta'
  | 'home.services.tow.title'
  | 'home.services.tow.subtitle'
  | 'home.services.tow.meta'
  | 'home.services.rental.title'
  | 'home.services.rental.subtitle'
  | 'home.services.rental.meta'
  | 'home.languageToggle'
  | 'auth.login.title'
  | 'auth.login.cta'
  | 'auth.login.placeholder.email'
  | 'auth.login.placeholder.password'
  | 'common.notImplemented'
  | 'common.loading'
  | 'home.title'
  | 'home.welcome'
  | 'home.toastExample'
  | 'home.action.toast'
  | 'home.action.loader'
  | 'home.action.openMap'
  | 'common.ok'
  | 'common.cancel'
  | 'common.retry'
  | 'errors.unknown'
  | 'auth.saved.title'
  | 'auth.saved.lastLogin'
  | 'auth.saved.lastRegister'
  | 'auth.register.title'
  | 'auth.register.cta'
  | 'auth.register.placeholder.name'
  | 'auth.welcome.subtitle'
  | 'auth.login.subtitle'
  | 'auth.register.subtitle'
  | 'auth.login.forgot'
  | 'auth.noAccount'
  | 'auth.hasAccount'
  | 'auth.error.required'
  | 'auth.error.requiredAll'
  | 'auth.error.generic';

export const STRINGS: Record<Locale, Record<StringKey, string>> = {
  en: {
    'app.name': 'Roadly',
    'home.greeting': 'Welcome to Roadly',
    'home.subtitle': 'Choose a service to get started.',
    'home.servicesTitle': 'Services',
    'home.servicesSubtitle': 'On-demand help for your car.',
    'home.services.mechanic.title': 'Mechanic',
    'home.services.mechanic.subtitle': 'Nearest roadside mechanic.',
    'home.services.mechanic.meta': '24 providers nearby',
    'home.services.tow.title': 'Tow / Road assistance',
    'home.services.tow.subtitle': 'Tow truck and roadside help.',
    'home.services.tow.meta': '8 tow trucks online',
    'home.services.rental.title': 'Car rental',
    'home.services.rental.subtitle': 'Find nearby rental cars.',
    'home.services.rental.meta': '12 cars available today',
    'home.languageToggle': 'عربي',
    'auth.login.title': 'Sign in',
    'auth.login.cta': 'Continue',
    'auth.login.placeholder.email': 'email@example.com',
    'auth.login.placeholder.password': 'Password',
    'common.notImplemented': 'Not implemented yet.',
    'common.loading': 'Loading…',
    'home.title': 'Home',
    'home.welcome': 'Home',
    'home.toastExample': 'Global toast is working.',
    'home.action.toast': 'Show toast',
    'home.action.loader': 'Show loader',
    'home.action.openMap': 'Open map',
    'common.ok': 'OK',
    'common.cancel': 'Cancel',
    'common.retry': 'Retry',
    'errors.unknown': 'Something went wrong. Please try again.',
    'auth.saved.title': 'Your saved info',
    'auth.saved.lastLogin': 'Last sign-in',
    'auth.saved.lastRegister': 'Last registration',
    'auth.register.title': 'Create account',
    'auth.register.cta': 'Register',
    'auth.register.placeholder.name': 'Full name',
    'auth.welcome.subtitle': 'Find mechanics, tow trucks, and rentals near you.',
    'auth.login.subtitle': 'Use your account to continue.',
    'auth.register.subtitle': 'Create an account to get started.',
    'auth.login.forgot': 'Forgot password?',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    'auth.error.required': 'Please enter email and password.',
    'auth.error.requiredAll': 'Please fill in all fields.',
    'auth.error.generic': 'Something went wrong. Please try again.',
  },
  ar: {
    'app.name': 'Roadly',
    'home.greeting': 'أهلاً بك في Roadly',
    'home.subtitle': 'اختر الخدمة للبدء الآن.',
    'home.servicesTitle': 'الخدمات',
    'home.servicesSubtitle': 'مساعدة فورية لسيارتك.',
    'home.services.mechanic.title': 'ميكانيكي',
    'home.services.mechanic.subtitle': 'أقرب ميكانيكي على الطريق.',
    'home.services.mechanic.meta': '24 مزوداً قريباً',
    'home.services.tow.title': 'ونش / مساعدة طريق',
    'home.services.tow.subtitle': 'سيارات سحب ومساعدة على الطريق.',
    'home.services.tow.meta': '8 سيارات ونش متاحة',
    'home.services.rental.title': 'تأجير سيارات',
    'home.services.rental.subtitle': 'ابحث عن مكاتب تأجير قريبة.',
    'home.services.rental.meta': '12 سيارة متاحة اليوم',
    'home.languageToggle': 'EN',
    'auth.login.title': 'تسجيل الدخول',
    'auth.login.cta': 'متابعة',
    'auth.login.placeholder.email': 'email@example.com',
    'auth.login.placeholder.password': 'كلمة المرور',
    'common.notImplemented': 'غير متوفر حالياً.',
    'common.loading': 'جاري التحميل…',
    'home.title': 'الرئيسية',
    'home.welcome': 'الرئيسية',
    'home.toastExample': 'نظام التنبيهات يعمل.',
    'home.action.toast': 'إظهار تنبيه',
    'home.action.loader': 'إظهار تحميل',
    'home.action.openMap': 'الخريطة',
    'common.ok': 'حسناً',
    'common.cancel': 'إلغاء',
    'common.retry': 'إعادة المحاولة',
    'errors.unknown': 'حدث خطأ. جرّب مرة أخرى.',
    'auth.saved.title': 'معلوماتك المحفوظة',
    'auth.saved.lastLogin': 'آخر تسجيل دخول',
    'auth.saved.lastRegister': 'آخر تسجيل',
    'auth.register.title': 'إنشاء حساب',
    'auth.register.cta': 'تسجيل',
    'auth.register.placeholder.name': 'الاسم الكامل',
    'auth.welcome.subtitle': 'ابحث عن ميكانيكي وونش وتأجير سيارات قريب منك.',
    'auth.login.subtitle': 'استخدم حسابك للمتابعة.',
    'auth.register.subtitle': 'أنشئ حساباً للبدء.',
    'auth.login.forgot': 'نسيت كلمة المرور؟',
    'auth.noAccount': 'ليس لديك حساب؟',
    'auth.hasAccount': 'لديك حساب بالفعل؟',
    'auth.error.required': 'يرجى إدخال البريد وكلمة المرور.',
    'auth.error.requiredAll': 'يرجى تعبئة جميع الحقول.',
    'auth.error.generic': 'حدث خطأ. يرجى المحاولة مرة أخرى.',
  },
} as const;

