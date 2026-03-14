import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../shared/theme/colors';
import { AdminDashboardScreen } from '../features/admin/presentation/screens/AdminDashboardScreen';
import { AdminProviderListScreen } from '../features/admin/presentation/screens/AdminProviderListScreen';
import { AdminUsersScreen } from '../features/admin/presentation/screens/AdminUsersScreen';
import { AdminReportsScreen } from '../features/admin/presentation/screens/AdminReportsScreen';
import { AdminSystemSettingsScreen } from '../features/admin/presentation/screens/AdminSystemSettingsScreen';
import { MapScreen } from '../features/map/presentation/screens/MapScreen';
import { ChatScreen } from '../features/chat/presentation/screens/ChatScreen';
import { ProfileScreen } from '../features/profile/presentation/screens/ProfileScreen';
import { SettingsScreen } from '../features/settings/presentation/screens/SettingsScreen';
import { NotificationsScreen } from '../features/notifications/presentation/screens/NotificationsScreen';

export type AdminStackParamList = {
  AdminDashboard: undefined;
  AdminProviderList: { role: 'mechanic' | 'tow' | 'rental' };
  AdminUsers: undefined;
  AdminReports: undefined;
  AdminSystemSettings: undefined;
  Map: undefined;
  Chat: undefined;
  Profile: undefined;
  Settings: undefined;
  Notifications: undefined;
};

const Stack = createNativeStackNavigator<AdminStackParamList>();

const screenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: colors.background },
  animation: 'slide_from_right' as const,
  gestureEnabled: true,
  animationDuration: 200,
};

export const AdminStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
    <Stack.Screen name="AdminProviderList" component={AdminProviderListScreen} />
    <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
    <Stack.Screen name="AdminReports" component={AdminReportsScreen} />
    <Stack.Screen name="AdminSystemSettings" component={AdminSystemSettingsScreen} />
    <Stack.Screen name="Map" component={MapScreen} />
    <Stack.Screen name="Chat" component={ChatScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
  </Stack.Navigator>
);
