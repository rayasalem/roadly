/**
 * Icon and color per notification type for provider and customer.
 * Provider: new_request=green, rejected=red, completed=blue.
 * Customer: accepted=green, rejected=red, arrived/in_progress=info, completed=blue.
 */
import { colors } from '../../../shared/theme/colors';
import type { NotificationType } from '../domain/types';

export type ToastType = 'success' | 'error' | 'info';

export interface NotificationTheme {
  icon: string;
  color: string;
  toastType: ToastType;
}

const PROVIDER_THEMES: Record<string, NotificationTheme> = {
  new_request: {
    icon: 'bell-ring',
    color: colors.success,
    toastType: 'success',
  },
  request_accepted: {
    icon: 'check-circle',
    color: colors.success,
    toastType: 'success',
  },
  request_rejected: {
    icon: 'close-circle',
    color: colors.error,
    toastType: 'error',
  },
  request_completed: {
    icon: 'flag-checkered',
    color: colors.info,
    toastType: 'info',
  },
  general: {
    icon: 'bell-outline',
    color: colors.textSecondary,
    toastType: 'info',
  },
};

const CUSTOMER_THEMES: Record<string, NotificationTheme> = {
  request_accepted: {
    icon: 'check-circle',
    color: colors.success,
    toastType: 'success',
  },
  request_rejected: {
    icon: 'close-circle',
    color: colors.error,
    toastType: 'error',
  },
  provider_arrived: {
    icon: 'map-marker-check',
    color: colors.success,
    toastType: 'success',
  },
  in_progress: {
    icon: 'wrench',
    color: colors.info,
    toastType: 'info',
  },
  service_completed: {
    icon: 'star-check',
    color: colors.info,
    toastType: 'info',
  },
  general: {
    icon: 'bell-outline',
    color: colors.textSecondary,
    toastType: 'info',
  },
};

const FALLBACK: NotificationTheme = {
  icon: 'bell-outline',
  color: colors.textSecondary,
  toastType: 'info',
};

/** Legacy type mapping for API backward compatibility */
const LEGACY_MAP: Record<string, string> = {
  provider_on_way: 'in_progress',
  request_created: 'new_request',
};

export function getNotificationTheme(
  type: NotificationType | undefined,
  isProvider: boolean
): NotificationTheme {
  const map = isProvider ? PROVIDER_THEMES : CUSTOMER_THEMES;
  if (!type) return FALLBACK;
  const resolved = LEGACY_MAP[type] ?? type;
  return map[resolved] ?? FALLBACK;
}
