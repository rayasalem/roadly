/**
 * إشعارات تجريبية موحدة — مرتبطة بـ MOCK_REQUESTS و MOCK_USERS/MOCK_PROVIDERS.
 * تظهر للعميل والمزود والأدمن بنفس الـ requestId والأسماء.
 */
import type { Notification } from '../features/notifications/domain/types';
import { MOCK_REQUESTS } from './mockRequests';

const now = new Date().toISOString();
const hourAgo = new Date(Date.now() - 3600000).toISOString();
const min15 = new Date(Date.now() - 15 * 60 * 1000).toISOString();

function notif(
  id: string,
  type: Notification['type'],
  title: string,
  message: string,
  createdAt: string,
  requestId: string,
  read = false
): Notification {
  return { id, type, title, message, createdAt, read, data: { requestId } };
}

/** إشعارات مبنية من الطلبات التجريبية — نفس الـ request_1, request_2... */
export const MOCK_NOTIFICATIONS: Notification[] = [
  notif(
    'notif_1',
    'new_request',
    'طلب جديد',
    `طلب من ${MOCK_REQUESTS[0].customerName} — ميكانيكي، قريب منك`,
    now,
    'request_1',
    false
  ),
  notif(
    'notif_2',
    'request_accepted',
    'تم قبول الطلب',
    `تم قبول طلبك من قبل ${MOCK_REQUESTS[2].providerName}.`,
    hourAgo,
    'request_3',
    true
  ),
  notif(
    'notif_3',
    'service_completed',
    'تم إتمام الخدمة',
    `قيّم تجربتك مع ${MOCK_REQUESTS[3].providerName}.`,
    hourAgo,
    'request_4',
    false
  ),
  notif(
    'notif_4',
    'request_rejected',
    'تم رفض الطلب',
    `عذراً، ${MOCK_REQUESTS[5].providerName} غير متاح حالياً.`,
    min15,
    'request_6',
    false
  ),
];
