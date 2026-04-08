import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../shared/theme/colors';
import { InsuranceDashboardScreen } from '../features/insurance/presentation/screens/InsuranceDashboardScreen';
import { InsurancePlansScreen } from '../features/insurance/presentation/screens/InsurancePlansScreen';
import { InsuranceRequestsScreen } from '../features/insurance/presentation/screens/InsuranceRequestsScreen';
import { MapScreen } from '../features/map/presentation/screens/MapScreen';
import { ProfileScreen } from '../features/profile/presentation/screens/ProfileScreen';
import { ProviderProfileScreen } from '../features/profile/presentation/screens/ProviderProfileScreen';
import { SettingsScreen } from '../features/settings/presentation/screens/SettingsScreen';
import { NotificationsScreen } from '../features/notifications/presentation/screens/NotificationsScreen';
import { ChatScreen } from '../features/chat/presentation/screens/ChatScreen';
import { ChatDetailScreen } from '../features/chat/presentation/screens/ChatDetailScreen';
import { NotFoundScreen } from '../shared/components/NotFoundScreen';

export type InsuranceStackParamList = {
  InsuranceDashboard: undefined;
  InsurancePlans: undefined;
  InsuranceRequests: undefined;
  Map: undefined;
  Profile: undefined;
  ProviderProfile: { providerId: string };
  Chat: undefined;
  ChatDetail: { conversationId: string; name: string };
  Settings: undefined;
  Notifications: undefined;
  NotFound: undefined;
};

const Stack = createNativeStackNavigator<InsuranceStackParamList>();

const screenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: colors.background },
  animation: 'slide_from_right' as const,
  gestureEnabled: true,
  animationDuration: 200,
};

export const InsuranceStack = () => (
  <Stack.Navigator screenOptions={screenOptions} initialRouteName="InsuranceDashboard">
    <Stack.Screen name="InsuranceDashboard" component={InsuranceDashboardScreen} />
    <Stack.Screen name="InsurancePlans" component={InsurancePlansScreen} />
    <Stack.Screen name="InsuranceRequests" component={InsuranceRequestsScreen} />
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
