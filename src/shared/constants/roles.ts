/**
 * User roles for the Roadly platform.
 * Used for role-based feature isolation and API filtering.
 */
export const ROLES = {
  USER: 'user',
  MECHANIC: 'mechanic',
  MECHANIC_TOW: 'mechanic_tow',
  CAR_RENTAL: 'car_rental',
  INSURANCE: 'insurance',
  ADMIN: 'admin',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  [ROLES.USER]: 'عميل',
  [ROLES.MECHANIC]: 'ميكانيكي',
  [ROLES.MECHANIC_TOW]: 'ونش',
  [ROLES.CAR_RENTAL]: 'تأجير سيارات',
  [ROLES.INSURANCE]: 'تأمين',
  [ROLES.ADMIN]: 'إدارة',
};

/** Provider roles (can be shown on map / in lists) */
export const PROVIDER_ROLES: Role[] = [
  ROLES.MECHANIC,
  ROLES.MECHANIC_TOW,
  ROLES.CAR_RENTAL,
  ROLES.INSURANCE,
];

export function isProviderRole(role: Role): boolean {
  return PROVIDER_ROLES.includes(role);
}

export function isAdmin(role: Role): boolean {
  return role === ROLES.ADMIN;
}

export function canRequestServices(role: Role): boolean {
  return role === ROLES.USER;
}

export function hasLiveLocationTracking(role: Role): boolean {
  return (
    [ROLES.MECHANIC, ROLES.MECHANIC_TOW, ROLES.CAR_RENTAL, ROLES.INSURANCE] as readonly Role[]
  ).includes(role);
}

export function hasTowCapability(role: Role): boolean {
  return role === ROLES.MECHANIC_TOW;
}
