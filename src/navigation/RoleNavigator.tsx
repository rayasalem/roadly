import React from 'react';
import { CustomerStack } from './CustomerStack';
import { MechanicStack } from './MechanicStack';
import { TowStack } from './TowStack';
import { RentalStack } from './RentalStack';
import { AdminStack } from './AdminStack';
import { useAuthStore } from '../store/authStore';
import type { Role } from '../shared/constants/roles';

type RoleSegment = 'customer' | 'mechanic' | 'tow' | 'rental' | 'admin';

const mapRoleToSegment = (role: Role | 'guest' | undefined): RoleSegment => {
  switch (role) {
    case 'mechanic':
      return 'mechanic';
    case 'mechanic_tow':
      return 'tow';
    case 'car_rental':
      return 'rental';
    case 'admin':
      return 'admin';
    default:
      return 'customer';
  }
};

export const RoleNavigator = () => {
  const userRole = useAuthStore((s) => s.user?.role ?? 'guest');
  const segment = mapRoleToSegment(userRole as Role | 'guest');

  if (segment === 'mechanic') return <MechanicStack />;
  if (segment === 'tow') return <TowStack />;
  if (segment === 'rental') return <RentalStack />;
  if (segment === 'admin') return <AdminStack />;

  return <CustomerStack />;
};

