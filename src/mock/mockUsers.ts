/**
 * مستخدمون تجريبيون موحدون — للعميل، المزود، والأدمن.
 * نفس الـ IDs والأسماء تُستخدم في mockRequests و mockProviders ولوحة الأدمن.
 */
import type { Role } from '../shared/constants/roles';
import { ROLES } from '../shared/constants/roles';

export type MockUser = {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: Role;
  rating?: number;
};

/** عملاء (يظهرون في الطلبات ولوحة الأدمن) */
export const MOCK_CUSTOMERS: MockUser[] = [
  { id: 'user_1', name: 'أحمد محمد', phone: '0599999999', email: 'ahmed@mock.mechnow.app', role: ROLES.USER, rating: 4.5 },
  { id: 'user_2', name: 'سارة علي', phone: '0591111111', email: 'sara@mock.mechnow.app', role: ROLES.USER, rating: 4.2 },
];

/** أدمن (واحد للوحة التحكم) */
export const MOCK_ADMINS: MockUser[] = [
  { id: 'admin_1', name: 'مدير النظام', phone: '0590003000', email: 'admin@mock.mechnow.app', role: ROLES.ADMIN },
];

/** كل المستخدمين (عملاء + أدمن). المزودون من mockProviders. */
export const MOCK_USERS: MockUser[] = [...MOCK_CUSTOMERS, ...MOCK_ADMINS];

/**
 * مستخدم افتراضي لتسجيل الدخول التجريبي حسب الدور.
 * نفس الـ id المستخدم في mockProviders و mockRequests لربط الطلبات.
 */
export function getMockLoginUser(role: Role): MockUser & { email: string } {
  const base = { phone: '', email: `${role}@mock.mechnow.app` };
  switch (role) {
    case ROLES.USER:
      return { ...MOCK_CUSTOMERS[0], ...base };
    case ROLES.ADMIN:
      return { ...MOCK_ADMINS[0], ...base };
    case ROLES.MECHANIC:
      return { id: 'mechanic_1', name: 'أحمد الميكانيكي', ...base, role: ROLES.MECHANIC, rating: 4.8 };
    case ROLES.MECHANIC_TOW:
      return { id: 'tow_1', name: 'ونش النجدة', ...base, role: ROLES.MECHANIC_TOW, rating: 4.6 };
    case ROLES.CAR_RENTAL:
      return { id: 'rental_1', name: 'تأجير سيارات سيتي درايف', ...base, role: ROLES.CAR_RENTAL, rating: 4.5 };
    default:
      return { ...MOCK_CUSTOMERS[0], ...base };
  }
}
