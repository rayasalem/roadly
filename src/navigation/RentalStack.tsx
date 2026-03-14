import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../shared/theme/colors';
import { RentalDashboardScreen } from '../features/rental/presentation/screens/RentalDashboardScreen';
import { RentalServicesScreen } from '../features/rental/presentation/screens/RentalServicesScreen';
import { RentalSkillsScreen } from '../features/rental/presentation/screens/RentalSkillsScreen';
import { RentalCarListScreen } from '../features/rental/presentation/screens/RentalCarListScreen';
import { RentalBookingsScreen } from '../features/rental/presentation/screens/RentalBookingsScreen';
import { RentalHistoryScreen } from '../features/rental/presentation/screens/RentalHistoryScreen';
import { MapScreen } from '../features/map/presentation/screens/MapScreen';
import { ProfileScreen } from '../features/profile/presentation/screens/ProfileScreen';
import { SettingsScreen } from '../features/settings/presentation/screens/SettingsScreen';
import { NotificationsScreen } from '../features/notifications/presentation/screens/NotificationsScreen';

export type RentalStackParamList = {
  RentalDashboard: undefined;
  RentalServices: undefined;
  RentalSkills: undefined;
  RentalCarList: undefined;
  RentalBookings: undefined;
  RentalHistory: undefined;
  Map: undefined;
  Profile: undefined;
  Settings: undefined;
  Notifications: undefined;
};

const Stack = createNativeStackNavigator<RentalStackParamList>();

const screenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: colors.background },
  animation: 'slide_from_right' as const,
  gestureEnabled: true,
  animationDuration: 200,
};

export const RentalStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="RentalDashboard" component={RentalDashboardScreen} />
    <Stack.Screen name="RentalServices" component={RentalServicesScreen} />
    <Stack.Screen name="RentalSkills" component={RentalSkillsScreen} />
    <Stack.Screen name="RentalCarList" component={RentalCarListScreen} />
    <Stack.Screen name="RentalBookings" component={RentalBookingsScreen} />
    <Stack.Screen name="RentalHistory" component={RentalHistoryScreen} />
    <Stack.Screen name="Map" component={MapScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
  </Stack.Navigator>
);

