/**
 * Notification types: provider (new request, accepted, rejected, completed) and customer (accepted, rejected, arrived, in progress, completed).
 */

/** Provider-facing events */
export type ProviderNotificationType =
  | 'new_request'
  | 'request_accepted'
  | 'request_rejected'
  | 'request_completed'
  | 'general';

/** Customer-facing events */
export type CustomerNotificationType =
  | 'request_accepted'
  | 'request_rejected'
  | 'provider_arrived'
  | 'in_progress'
  | 'service_completed'
  | 'general';

/** Legacy API types (kept for backward compatibility) */
export type LegacyNotificationType = 'provider_on_way' | 'request_created';

/** Union for API / list display */
export type NotificationType = ProviderNotificationType | CustomerNotificationType | LegacyNotificationType;

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
  /** requestId, providerId for navigation */
  data?: {
    requestId?: string;
    providerId?: string;
    serviceType?: string;
    [key: string]: unknown;
  };
}
