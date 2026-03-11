const deviceTokens = new Map<string, string>(); // userId -> expo push token

export function registerDevice(userId: string, token: string): void {
  deviceTokens.set(userId, token);
}

export function unregisterDevice(userId: string): void {
  deviceTokens.delete(userId);
}

export function getDeviceToken(userId: string): string | undefined {
  return deviceTokens.get(userId);
}

/** In-app notification types for push and in-app list */
export type NotificationType =
  | 'request_accepted'
  | 'provider_on_way'
  | 'provider_arrived'
  | 'service_completed'
  | 'request_created'
  | 'general';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  data?: Record<string, unknown>; // e.g. requestId, providerId
  createdAt: string;
}

const notifications = new Map<string, AppNotification>();
let notifIdCounter = 1;
const nextNotifId = () => `notif_${notifIdCounter++}`;

export function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  data?: Record<string, unknown>
): AppNotification {
  const n: AppNotification = {
    id: nextNotifId(),
    userId,
    type,
    title,
    message,
    read: false,
    data,
    createdAt: new Date().toISOString(),
  };
  notifications.set(n.id, n);
  return n;
}

export function listNotifications(userId: string): AppNotification[] {
  return Array.from(notifications.values())
    .filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function markNotificationRead(id: string): AppNotification | undefined {
  const n = notifications.get(id);
  if (!n) return undefined;
  n.read = true;
  return n;
}
