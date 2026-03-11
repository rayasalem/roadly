import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../shared/theme/colors';
import { t } from '../shared/i18n/t';
import { HomeScreen } from '../features/home/presentation/screens/HomeScreen';
import { MapScreen } from '../features/map/presentation/screens/MapScreen';
import { RequestScreen } from '../features/requests/presentation/screens/RequestScreen';
import { RequestHistoryScreen } from '../features/requests/presentation/screens/RequestHistoryScreen';
import { ProfileScreen } from '../features/profile/presentation/screens/ProfileScreen';
import { ChatScreen } from '../features/chat/presentation/screens/ChatScreen';
import { ChatDetailScreen } from '../features/chat/presentation/screens/ChatDetailScreen';
import { NotificationsScreen } from '../features/notifications/presentation/screens/NotificationsScreen';
import { SettingsScreen } from '../features/settings/presentation/screens/SettingsScreen';

export type CustomerStackParamList = {
  Home: undefined;
  Map: undefined;
  Request: { serviceType?: import('../features/requests/domain/types').ServiceType; providerId?: string | null; requestId?: string };
  RequestHistory: undefined;
  Profile: undefined;
  Chat: undefined;
  ChatDetail: { conversationId: string; name: string };
  Notifications: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<CustomerStackParamList>();

export const CustomerStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: colors.background },
    }}
  >
    <Stack.Screen name="Map" component={MapScreen} initialParams={undefined} />
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="Request" component={RequestScreen} />
    <Stack.Screen name="RequestHistory" component={RequestHistoryScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="Chat" component={ChatScreen} />
    <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
  </Stack.Navigator>
);

