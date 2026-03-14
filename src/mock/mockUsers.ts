export type MockUser = {
  id: string;
  name: string;
  phone: string;
  rating: number;
  role: 'customer' | 'mechanic' | 'tow' | 'rental' | 'admin';
};

export const MOCK_USERS: MockUser[] = [
  { id: 'user_1', name: 'Test Customer', phone: '0599999999', rating: 4.5, role: 'customer' },
  { id: 'user_2', name: 'Omar Customer', phone: '0591111111', rating: 4.2, role: 'customer' },
  { id: 'mechanic_user_1', name: 'Ahmad Mechanic', phone: '0590000001', rating: 4.8, role: 'mechanic' },
  { id: 'tow_user_1', name: 'Tow Master', phone: '0590001000', rating: 4.6, role: 'tow' },
  { id: 'rental_user_1', name: 'Rental City', phone: '0590002000', rating: 4.4, role: 'rental' },
  { id: 'admin_1', name: 'Admin Panel', phone: '0590003000', rating: 5.0, role: 'admin' },
];

