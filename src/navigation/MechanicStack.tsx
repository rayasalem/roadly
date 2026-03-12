import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../shared/theme/colors';
import { MechanicDashboardScreen } from '../features/mechanic/presentation/screens/MechanicDashboardScreen';
import { MechanicServicesScreen } from '../features/mechanic/presentation/screens/MechanicServicesScreen';
import { MechanicSkillsScreen } from '../features/mechanic/presentation/screens/MechanicSkillsScreen';
import { MechanicJobHistoryScreen } from '../features/mechanic/presentation/screens/MechanicJobHistoryScreen';
import { MapScreen } from '../features/map/presentation/screens/MapScreen';
import { ProfileScreen } from '../features/profile/presentation/screens/ProfileScreen';
import { SettingsScreen } from '../features/settings/presentation/screens/SettingsScreen';
import { NotificationsScreen } from '../features/notifications/presentation/screens/NotificationsScreen';

export type MechanicStackParamList = {
  MechanicDashboard: undefined;
  MechanicServices: undefined;
  MechanicSkills: undefined;
  MechanicJobHistory: undefined;
  Map: undefined;
  Profile: undefined;
  Settings: undefined;
  Notifications: undefined;
};

const Stack = createNativeStackNavigator<MechanicStackParamList>();

export const MechanicStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: colors.background },
    }}
  >
    <Stack.Screen name="MechanicDashboard" component={MechanicDashboardScreen} />
    <Stack.Screen name="MechanicServices" component={MechanicServicesScreen} />
    <Stack.Screen name="MechanicSkills" component={MechanicSkillsScreen} />
    <Stack.Screen name="MechanicJobHistory" component={MechanicJobHistoryScreen} />
    <Stack.Screen name="Map" component={MapScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
  </Stack.Navigator>
);

