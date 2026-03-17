import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../shared/theme/colors';
import { ProviderDashboardScreen } from '../features/provider-dashboard/presentation/screens/ProviderDashboardScreen';
import { TowDashboardScreen } from '../features/tow/presentation/screens/TowDashboardScreen';
import { TowServicesScreen } from '../features/tow/presentation/screens/TowServicesScreen';
import { TowSkillsScreen } from '../features/tow/presentation/screens/TowSkillsScreen';
import { TowJobHistoryScreen } from '../features/tow/presentation/screens/TowJobHistoryScreen';
import { MapScreen } from '../features/map/presentation/screens/MapScreen';
import { ProfileScreen } from '../features/profile/presentation/screens/ProfileScreen';
import { ProviderProfileScreen } from '../features/profile/presentation/screens/ProviderProfileScreen';
import { SettingsScreen } from '../features/settings/presentation/screens/SettingsScreen';
import { NotificationsScreen } from '../features/notifications/presentation/screens/NotificationsScreen';
import { ChatScreen } from '../features/chat/presentation/screens/ChatScreen';
import { ChatDetailScreen } from '../features/chat/presentation/screens/ChatDetailScreen';

export type TowStackParamList = {
  ProviderDashboard: undefined;
  TowDashboard: undefined;
  TowServices: undefined;
  TowSkills: undefined;
  TowJobHistory: undefined;
  Map: undefined;
  Profile: undefined;
  ProviderProfile: { providerId: string };
  Chat: undefined;
  ChatDetail: { conversationId: string; name: string };
  Settings: undefined;
  Notifications: undefined;
};

const Stack = createNativeStackNavigator<TowStackParamList>();

const screenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: colors.background },
  animation: 'slide_from_right' as const,
  gestureEnabled: true,
  animationDuration: 200,
};

export const TowStack = () => (
  <Stack.Navigator screenOptions={screenOptions} initialRouteName="TowDashboard">
    <Stack.Screen name="ProviderDashboard" component={ProviderDashboardScreen} />
    <Stack.Screen name="TowDashboard" component={TowDashboardScreen} />
    <Stack.Screen name="TowServices" component={TowServicesScreen} />
    <Stack.Screen name="TowSkills" component={TowSkillsScreen} />
    <Stack.Screen name="TowJobHistory" component={TowJobHistoryScreen} />
    <Stack.Screen name="Map" component={MapScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="ProviderProfile" component={ProviderProfileScreen} />
    <Stack.Screen name="Chat" component={ChatScreen} />
    <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
  </Stack.Navigator>
);

