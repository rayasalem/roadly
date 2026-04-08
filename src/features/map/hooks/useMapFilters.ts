/**
 * Map filter state (role filter for providers).
 * Logic lives in hook; UI remains pure.
 */
import { useState, useCallback } from 'react';
import type { Role } from '../../../shared/constants/roles';
import { ROLES } from '../../../shared/constants/roles';

export type MapFilterRole = Role | null;

const PROVIDER_FILTER_OPTIONS: MapFilterRole[] = [
  null, // all
  ROLES.MECHANIC,
  ROLES.MECHANIC_TOW,
  ROLES.CAR_RENTAL,
  ROLES.INSURANCE,
];

export function useMapFilters() {
  const [filterRole, setFilterRole] = useState<MapFilterRole>(null);

  const setFilter = useCallback((role: MapFilterRole) => {
    setFilterRole(role);
  }, []);

  return {
    filterRole,
    setFilter,
    filterOptions: PROVIDER_FILTER_OPTIONS,
  };
}
