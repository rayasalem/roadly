import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../shared/theme/colors';
import { ProviderDashboardScreen } from '../features/provider-dashboard/presentation/screens/ProviderDashboardScreen';
import { MechanicDashboardScreen } from '../features/mechanic/presentation/screens/MechanicDashboardScreen';
import { MechanicServicesScreen } from '../features/mechanic/presentation/screens/MechanicServicesScreen';
import { MechanicSkillsScreen } from '../features/mechanic/presentation/screens/MechanicSkillsScreen';
import { MechanicJobHistoryScreen } from '../features/mechanic/presentation/screens/MechanicJobHistoryScreen';
import { MapScreen } from '../features/map/presentation/screens/MapScreen';
import { ProfileScreen } from '../features/profile/presentation/screens/ProfileScreen';
import { ProviderProfileScreen } from '../features/profile/presentation/screens/ProviderProfileScreen';
import { SettingsScreen } from '../features/settings/presentation/screens/SettingsScreen';
import { NotificationsScreen } from '../features/notifications/presentation/screens/NotificationsScreen';
import { ChatScreen } from '../features/chat/presentation/screens/ChatScreen';
import { ChatDetailScreen } from '../features/chat/presentation/screens/ChatDetailScreen';
import { NotFoundScreen } from '../shared/components/NotFoundScreen';

export type MechanicStackParamList = {
  ProviderDashboard: undefined;
  MechanicDashboard: undefined;
  MechanicServices: undefined;
  MechanicSkills: undefined;
  MechanicJobHistory: undefined;
  Map: undefined;
  Profile: undefined;
  ProviderProfile: { providerId: string };
  Chat: undefined;
  ChatDetail: { conversationId: string; name: string };
  Settings: undefined;
  Notifications: undefined;
  NotFound: undefined;
};

const Stack = createNativeStackNavigator<MechanicStackParamList>();

const screenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: colors.background },
  animation: 'slide_from_right' as const,
  gestureEnabled: true,
  animationDuration: 200,
};

export const MechanicStack = () => (
  <Stack.Navigator screenOptions={screenOptions} initialRouteName="MechanicDashboard">
    <Stack.Screen name="ProviderDashboard" component={ProviderDashboardScreen} />
    <Stack.Screen name="MechanicDashboard" component={MechanicDashboardScreen} />
    <Stack.Screen name="MechanicServices" component={MechanicServicesScreen} />
    <Stack.Screen name="MechanicSkills" component={MechanicSkillsScreen} />
    <Stack.Screen name="MechanicJobHistory" component={MechanicJobHistoryScreen} />
    <Stack.Screen name="Map" component={MapScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="ProviderProfile" component={ProviderProfileScreen} />
    <Stack.Screen name="Chat" component={ChatScreen} />
    <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
    <Stack.Screen name="NotFound" component={NotFoundScreen} />
  </Stack.Navigator>
);

