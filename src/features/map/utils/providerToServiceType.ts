/**
 * Maps provider role to Request screen serviceType param.
 * Used when navigating from map "Request Service" to Request flow.
 */
import type { Role } from '../../../shared/constants/roles';
import { ROLES } from '../../../shared/constants/roles';

export type RequestServiceType = 'mechanic' | 'tow' | 'rental' | 'battery' | 'tire' | 'oil_change';

export function providerRoleToServiceType(role: Role): RequestServiceType {
  if (role === ROLES.MECHANIC_TOW) return 'tow';
  if (role === ROLES.CAR_RENTAL) return 'rental';
  return 'mechanic';
}

export const ALL_SERVICE_TYPES: RequestServiceType[] = ['mechanic', 'tow', 'rental', 'battery', 'tire', 'oil_change'];
