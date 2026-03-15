/**
 * Visual theme per request status: color and icon for badges, cards, map.
 * جديد → رمادي فاتح، مقبول → أخضر، مرفوض → أحمر، جاري التنفيذ → أزرق، مكتمل → ذهبي/برتقالي، ملغى → رمادي غامق.
 */
import { colors } from '../../../shared/theme/colors';
import type { RequestStatus } from '../domain/types';

export interface RequestStatusTheme {
  color: string;
  icon: string;
  labelKey: string;
}

const STATUS_THEMES: Record<string, RequestStatusTheme> = {
  new: {
    color: '#9CA3AF',
    icon: 'bell-outline',
    labelKey: 'request.status.new',
  },
  pending: {
    color: '#9CA3AF',
    icon: 'clock-outline',
    labelKey: 'request.status.pending',
  },
  accepted: {
    color: colors.success,
    icon: 'check-circle',
    labelKey: 'request.status.accepted',
  },
  rejected: {
    color: colors.error,
    icon: 'close-circle',
    labelKey: 'request.status.rejected',
  },
  in_progress: {
    color: colors.info,
    icon: 'wrench',
    labelKey: 'request.status.inProgress',
  },
  on_the_way: {
    color: colors.info,
    icon: 'map-marker-path',
    labelKey: 'request.status.on_the_way',
  },
  completed: {
    color: '#F59E0B',
    icon: 'flag-checkered',
    labelKey: 'request.status.completed',
  },
  cancelled: {
    color: '#374151',
    icon: 'cancel',
    labelKey: 'request.status.cancelled',
  },
};

const FALLBACK: RequestStatusTheme = {
  color: colors.textMuted,
  icon: 'help-circle-outline',
  labelKey: 'request.status.pending',
};

export function getRequestStatusTheme(status: RequestStatus | string | undefined): RequestStatusTheme {
  if (!status) return FALLBACK;
  return STATUS_THEMES[status] ?? FALLBACK;
}

/** Statuses that count as "in progress" for filters and actions (track on map, in-progress tab). Excludes new/pending. */
export const IN_PROGRESS_STATUSES: RequestStatus[] = ['accepted', 'on_the_way', 'in_progress'];

export function isRequestInProgress(status: RequestStatus | string): boolean {
  return IN_PROGRESS_STATUSES.includes(status as RequestStatus);
}

/** Customer can cancel only when status is new or pending. */
export function canCustomerCancel(status: RequestStatus | string): boolean {
  return status === 'new' || status === 'pending';
}
