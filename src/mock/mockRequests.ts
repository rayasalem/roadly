/**
 * طلبات تجريبية موحدة — مرتبطة بنفس الـ IDs في mockUsers و mockProviders.
 * للعميل، المزود، والأدمن.
 */
import type { GeoPoint } from '../shared/types/geo';
import type { RequestStatus } from '../features/requests/domain/types';

export type { RequestStatus };

export type MockRequest = {
  id: string;
  customerId: string;
  providerId: string;
  service: 'mechanic' | 'tow' | 'rental';
  status: RequestStatus;
  customerLocation: GeoPoint;
  createdAt: string;
  customerName?: string;
  providerName?: string;
};

const baseLoc: GeoPoint = { latitude: 32.221, longitude: 35.261 };

/** أسماء العملاء من mockUsers (user_1=أحمد محمد, user_2=سارة علي) */
const CUSTOMER_NAMES: Record<string, string> = {
  user_1: 'أحمد محمد',
  user_2: 'سارة علي',
};

/** أسماء المزودين من mockProviders (نفس الـ IDs) */
const PROVIDER_NAMES: Record<string, string> = {
  mechanic_1: 'أحمد الميكانيكي',
  mechanic_2: 'ورشة السرعة القصوى',
  mechanic_3: 'خدمة الطريق السريعة',
  mechanic_4: 'ميكانيكي الحارة',
  mechanic_5: 'ورشة النخبة',
  mechanic_6: 'خدمة الطوارئ السريعة',
  tow_1: 'ونش النجدة',
  tow_2: 'ونش ٢٤/٧',
  tow_3: 'ونش الخط السريع',
  tow_4: 'ونش المدينة',
  tow_5: 'ونش الخدمة الذهبية',
  rental_1: 'تأجير سيارات سيتي درايف',
  rental_2: 'تأجير الطريق السريع',
  rental_3: 'مكتب السيارات الاقتصادية',
  rental_4: 'سيارات فخمة VIP',
  rental_5: 'تأجير المطار',
};

function req(
  id: string,
  customerId: string,
  providerId: string,
  service: 'mechanic' | 'tow' | 'rental',
  status: RequestStatus,
  latDelta: number,
  lngDelta: number,
  createdAt: string
): MockRequest {
  return {
    id,
    customerId,
    providerId,
    service,
    status,
    customerLocation: { latitude: baseLoc.latitude + latDelta, longitude: baseLoc.longitude + lngDelta },
    createdAt,
    customerName: CUSTOMER_NAMES[customerId],
    providerName: PROVIDER_NAMES[providerId],
  };
}

const now = new Date();
const min10 = new Date(now.getTime() - 10 * 60 * 1000).toISOString();
const min20 = new Date(now.getTime() - 20 * 60 * 1000).toISOString();
const hour2 = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
const hour24 = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
const hour1 = new Date(now.getTime() - 60 * 60 * 1000).toISOString();

export const MOCK_REQUESTS: MockRequest[] = [
  req('request_1', 'user_1', 'mechanic_1', 'mechanic', 'new', 0, 0, now.toISOString()),
  req('request_2', 'user_1', 'mechanic_3', 'mechanic', 'in_progress', 0.004, -0.002, min10),
  req('request_3', 'user_2', 'tow_1', 'tow', 'accepted', -0.003, 0.004, min20),
  req('request_4', 'user_1', 'tow_3', 'tow', 'completed', 0.006, 0.001, hour2),
  req('request_5', 'user_2', 'rental_1', 'rental', 'cancelled', -0.005, -0.003, hour24),
  req('request_6', 'user_1', 'mechanic_2', 'mechanic', 'rejected', 0.002, -0.001, hour1),
  req('request_7', 'user_2', 'mechanic_1', 'mechanic', 'pending', -0.002, 0.003, min10),
];
