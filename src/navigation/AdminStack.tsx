import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../shared/theme/colors';
import { AdminDashboardScreen } from '../features/admin/presentation/screens/AdminDashboardScreen';
import { AdminProviderListScreen } from '../features/admin/presentation/screens/AdminProviderListScreen';
import { AdminUsersScreen } from '../features/admin/presentation/screens/AdminUsersScreen';
import { MapScreen } from '../features/map/presentation/screens/MapScreen';
import { ProfileScreen } from '../features/profile/presentation/screens/ProfileScreen';

export type AdminStackParamList = {
  AdminDashboard: undefined;
  AdminProviderList: { role: 'mechanic' | 'tow' | 'rental' };
  AdminUsers: undefined;
  Map: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<AdminStackParamList>();

export const AdminStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: colors.background },
    }}
  >
    <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
    <Stack.Screen name="AdminProviderList" component={AdminProviderListScreen} />
    <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
    <Stack.Screen name="Map" component={MapScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
  </Stack.Navigator>
);
