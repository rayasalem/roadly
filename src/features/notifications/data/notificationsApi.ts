/**
 * Notifications API. Backend: GET /notifications, PATCH /notifications/:id/read.
 */
import { api } from '../../../shared/services/http/api';
import { ENDPOINTS } from '../../../shared/constants/apiEndpoints';
import { getErrorMessage } from '../../../shared/services/http/errorMessage';
import type { Notification } from '../domain/types';

export type { Notification };

export async function fetchNotifications(): Promise<Notification[]> {
  try {
    const res = await api.get<{ items: Notification[]; total?: number; page?: number; limit?: number } | Notification[]>(ENDPOINTS.notifications);
    if (!res || typeof res !== 'object') return [];
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && Array.isArray((data as { items?: Notification[] }).items)) return (data as { items: Notification[] }).items;
    return [];
  } catch (error) {
    const msg = getErrorMessage(error);
    if (__DEV__) console.warn('[notificationsApi] fetchNotifications failed:', msg);
    throw new Error(msg);
  }
}

export async function markNotificationRead(id: string): Promise<Notification> {
  try {
    const res = await api.patch<Notification>(ENDPOINTS.notificationMarkRead(id), { read: true });
    if (!res || typeof res !== 'object' || res.data == null) throw new Error('Invalid API response');
    return res.data;
  } catch (error) {
    const msg = getErrorMessage(error);
    if (__DEV__) console.warn('[notificationsApi] markNotificationRead failed:', msg);
    throw new Error(msg);
  }
}
