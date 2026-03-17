/**
 * Admin: قائمة المستخدمين من API (GET /admin/users) مع Block (PATCH /admin/users/:id/block).
 */
import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MOCK_SERVICES as MOCK_SERVICES_RAW } from '../../../mock/mockServices';
import { fetchAdminUsers, blockUser as blockUserApi, type AdminUserApiItem } from '../data/adminUsersApi';

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

const allServicesList: AdminService[] = MOCK_SERVICES_RAW.map((s) => ({
  id: s.id,
  name: s.nameEn,
  category: s.category,
}));

function apiRoleToAdmin(r: string): AdminUserRole {
  if (r === 'mechanic') return 'mechanic';
  if (r === 'mechanic_tow') return 'tow';
  if (r === 'car_rental') return 'rental';
  if (r === 'admin') return 'admin';
  return 'user';
}

function apiItemToAdminUser(item: AdminUserApiItem): AdminUser {
  return {
    id: item.id,
    name: item.name,
    role: apiRoleToAdmin(item.role),
    status: item.blocked ? 'suspended' : 'active',
    assignedServiceIds: [],
  };
}

const ADMIN_USERS_QUERY_KEY = ['admin', 'users'] as const;

export function useAdminUsers() {
  const queryClient = useQueryClient();
  const [localOverrides, setLocalOverrides] = useState<Record<string, Partial<AdminUser>>>({});

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ADMIN_USERS_QUERY_KEY,
    queryFn: () => fetchAdminUsers({ page: 1, limit: 500 }),
    staleTime: 60 * 1000,
  });

  const blockMutation = useMutation({
    mutationFn: ({ userId, blocked }: { userId: string; blocked: boolean }) => blockUserApi(userId, blocked),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
    },
  });

  const users: AdminUser[] = useMemo(() => {
    const list = (data?.items ?? []).map(apiItemToAdminUser);
    if (Object.keys(localOverrides).length === 0) return list;
    return list.map((u) => (localOverrides[u.id] ? { ...u, ...localOverrides[u.id] } : u));
  }, [data?.items, localOverrides]);

  const allServices = useMemo(() => allServicesList, []);

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
      setLocalOverrides((prev) => ({ ...prev, [userId]: { ...prev[userId], ...payload } }));
    },
    [],
  );

  const setUserAssignedServices = useCallback((userId: string, serviceIds: string[]) => {
    setLocalOverrides((prev) => ({ ...prev, [userId]: { ...prev[userId], assignedServiceIds: serviceIds } }));
  }, []);

  const getUserById = useCallback(
    (id: string) => users.find((u) => u.id === id) ?? null,
    [users],
  );

  const setUserBlocked = useCallback(
    (user: AdminUser, blocked: boolean) => {
      blockMutation.mutate({ userId: user.id, blocked });
    },
    [blockMutation],
  );

  return {
    users,
    allServices,
    servicesByCategory,
    updateUser,
    setUserAssignedServices,
    getUserById,
    setUserBlocked,
    blockMutation,
    isLoading,
    isError,
    error,
    refetch,
  };
}
