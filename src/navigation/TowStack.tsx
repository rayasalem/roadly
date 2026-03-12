import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../shared/theme/colors';
import { TowDashboardScreen } from '../features/tow/presentation/screens/TowDashboardScreen';
import { TowServicesScreen } from '../features/tow/presentation/screens/TowServicesScreen';
import { TowSkillsScreen } from '../features/tow/presentation/screens/TowSkillsScreen';
import { TowJobHistoryScreen } from '../features/tow/presentation/screens/TowJobHistoryScreen';
import { MapScreen } from '../features/map/presentation/screens/MapScreen';
import { ProfileScreen } from '../features/profile/presentation/screens/ProfileScreen';
import { SettingsScreen } from '../features/settings/presentation/screens/SettingsScreen';
import { NotificationsScreen } from '../features/notifications/presentation/screens/NotificationsScreen';

export type TowStackParamList = {
  TowDashboard: undefined;
  TowServices: undefined;
  TowSkills: undefined;
  TowJobHistory: undefined;
  Map: undefined;
  Profile: undefined;
  Settings: undefined;
  Notifications: undefined;
};

const Stack = createNativeStackNavigator<TowStackParamList>();

export const TowStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: colors.background },
    }}
  >
    <Stack.Screen name="TowDashboard" component={TowDashboardScreen} />
    <Stack.Screen name="TowServices" component={TowServicesScreen} />
    <Stack.Screen name="TowSkills" component={TowSkillsScreen} />
    <Stack.Screen name="TowJobHistory" component={TowJobHistoryScreen} />
    <Stack.Screen name="Map" component={MapScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
  </Stack.Navigator>
);

