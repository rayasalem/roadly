/** In-app / push notification types */
export type NotificationType =
  | 'request_accepted'
  | 'provider_on_way'
  | 'provider_arrived'
  | 'service_completed'
  | 'request_created'
  | 'general';

/**
 * Notification entity from GET /notifications.
 */
export interface Notification {
  id: string;
  type?: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  data?: Record<string, unknown>;
}
