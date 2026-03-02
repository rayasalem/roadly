import type { Role } from '../constants/roles';
import type { GeoPoint } from './geo';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  /** Set for provider roles when they are online */
  location?: GeoPoint | null;
  /** Only for mechanic_tow */
  hasTowCapability?: boolean;
  /** Provider availability (mechanic, tow, car_rental) */
  isAvailable?: boolean;
}

export interface SessionUser extends User {
  /** Prefer storing only token; user can be re-fetched */
  accessToken?: string;
}
