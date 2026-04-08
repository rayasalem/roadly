import type { ServiceType } from '../domain/types';

export const VALID_SERVICE_TYPES: readonly ServiceType[] = [
  'mechanic',
  'tow',
  'rental',
  'insurance',
  'battery',
  'tire',
  'oil_change',
];

export function isValidServiceType(value: unknown): value is ServiceType {
  return typeof value === 'string' && (VALID_SERVICE_TYPES as readonly string[]).includes(value);
}

export function getInitialServiceType(raw: unknown): ServiceType {
  return isValidServiceType(raw) ? raw : 'mechanic';
}
