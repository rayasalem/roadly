/**
 * Admin: users list and service assignments (mock state, API-ready).
 * No timing/availability — only user profile and assigned service types per role.
 */
import { useState, useCallback, useMemo } from 'react';

export type AdminUserRole = 'user' | 'mechanic' | 'tow' | 'rental' | 'admin';
export type AdminUserStatus = 'active' | 'suspended' | 'pending';

export interface AdminUser {
  id: string;
  name: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  assignedServiceIds: string[];
}

export type ServiceCategory = 'mechanic' | 'tow' | 'rental';

export interface AdminService {
  id: string;
  name: string;
  category: ServiceCategory;
}

const MOCK_SERVICES: AdminService[] = [
  { id: 's-m1', name: 'Tire repair', category: 'mechanic' },
  { id: 's-m2', name: 'Engine diagnostic', category: 'mechanic' },
  { id: 's-m3', name: 'Oil change', category: 'mechanic' },
  { id: 's-m4', name: 'Battery service', category: 'mechanic' },
  { id: 's-t1', name: 'Tow to garage', category: 'tow' },
  { id: 's-t2', name: 'Roadside assistance', category: 'tow' },
  { id: 's-t3', name: 'Long-distance tow', category: 'tow' },
  { id: 's-r1', name: 'Daily rental', category: 'rental' },
  { id: 's-r2', name: 'Weekly rental', category: 'rental' },
  { id: 's-r3', name: 'Luxury vehicles', category: 'rental' },
];

const MOCK_USERS: AdminUser[] = [
  { id: 'u1', name: 'أحمد السيد', role: 'user', status: 'active', assignedServiceIds: [] },
  { id: 'u2', name: 'FastFix Garage', role: 'mechanic', status: 'active', assignedServiceIds: ['s-m1', 's-m2', 's-m3'] },
  { id: 'u3', name: 'RoadTow 24/7', role: 'tow', status: 'active', assignedServiceIds: ['s-t1', 's-t2'] },
  { id: 'u4', name: 'CityDrive Rentals', role: 'rental', status: 'active', assignedServiceIds: ['s-r1', 's-r2'] },
  { id: 'u5', name: 'سارة علي', role: 'user', status: 'active', assignedServiceIds: [] },
  { id: 'u6', name: 'AutoCare Pro', role: 'mechanic', status: 'active', assignedServiceIds: ['s-m1', 's-m4'] },
];

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>(MOCK_USERS);

  const allServices = useMemo(() => MOCK_SERVICES, []);

  const servicesByCategory = useMemo(() => {
    const by: Record<ServiceCategory, AdminService[]> = {
      mechanic: allServices.filter((s) => s.category === 'mechanic'),
      tow: allServices.filter((s) => s.category === 'tow'),
      rental: allServices.filter((s) => s.category === 'rental'),
    };
    return by;
  }, [allServices]);

  const updateUser = useCallback(
    (userId: string, payload: Partial<Pick<AdminUser, 'name' | 'role' | 'status'>>) => {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, ...payload } : u)),
      );
    },
    [],
  );

  const setUserAssignedServices = useCallback((userId: string, serviceIds: string[]) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, assignedServiceIds: serviceIds } : u)),
    );
  }, []);

  const getUserById = useCallback(
    (id: string) => users.find((u) => u.id === id) ?? null,
    [users],
  );

  return {
    users,
    allServices,
    servicesByCategory,
    updateUser,
    setUserAssignedServices,
    getUserById,
  };
}
