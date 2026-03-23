import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../shared/theme/colors';
import { t } from '../shared/i18n/t';
import { HomeScreen } from '../features/home/presentation/screens/HomeScreen';
import { MapScreen } from '../features/map/presentation/screens/MapScreen';
import { RequestScreen } from '../features/requests/presentation/screens/RequestScreen';
import { RequestHistoryScreen } from '../features/requests/presentation/screens/RequestHistoryScreen';
import { ProfileScreen } from '../features/profile/presentation/screens/ProfileScreen';
import { ProviderProfileScreen } from '../features/profile/presentation/screens/ProviderProfileScreen';
import { ChatScreen } from '../features/chat/presentation/screens/ChatScreen';
import { ChatDetailScreen } from '../features/chat/presentation/screens/ChatDetailScreen';
import { NotificationsScreen } from '../features/notifications/presentation/screens/NotificationsScreen';
import { SettingsScreen } from '../features/settings/presentation/screens/SettingsScreen';
import { LiveTrackingScreen } from '../features/requests/presentation/screens/LiveTrackingScreen';
import { RatingsScreen } from '../features/ratings/presentation/screens/RatingsScreen';
import { PaymentScreen } from '../features/payment/presentation/screens/PaymentScreen';
import { FavoritesScreen } from '../features/favorites/presentation/screens/FavoritesScreen';
import { HelpSupportScreen } from '../features/help/presentation/screens/HelpSupportScreen';
import { AllProvidersScreen } from '../features/providers/presentation/screens/AllProvidersScreen';
import { NotFoundScreen } from '../shared/components/NotFoundScreen';

export type CustomerStackParamList = {
  Home: undefined;
  Map: undefined;
  AllProviders: undefined;
  Request: { serviceType?: import('../features/requests/domain/types').ServiceType; providerId?: string | null; requestId?: string };
  RequestHistory: undefined;
  LiveTracking: { requestId?: string };
  Profile: undefined;
  ProviderProfile: { providerId: string };
  Chat: undefined;
  ChatDetail: { conversationId: string; name: string };
  Notifications: undefined;
  Settings: undefined;
  Ratings: { requestId?: string; providerName?: string };
  Payment: undefined;
  Favorites: undefined;
  HelpSupport: undefined;
  NotFound: undefined;
};

const Stack = createNativeStackNavigator<CustomerStackParamList>();

const screenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: colors.background },
  animation: 'slide_from_right' as const,
  gestureEnabled: true,
  animationDuration: 200,
};

export const CustomerStack = () => (
  <Stack.Navigator screenOptions={screenOptions} initialRouteName="Map">
    <Stack.Screen name="Map" component={MapScreen} initialParams={undefined} />
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="Request" component={RequestScreen} />
    <Stack.Screen name="RequestHistory" component={RequestHistoryScreen} />
    <Stack.Screen name="AllProviders" component={AllProvidersScreen} />
    <Stack.Screen name="LiveTracking" component={LiveTrackingScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="ProviderProfile" component={ProviderProfileScreen} />
    <Stack.Screen name="Chat" component={ChatScreen} />
    <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="Ratings" component={RatingsScreen} />
    <Stack.Screen name="Payment" component={PaymentScreen} />
    <Stack.Screen name="Favorites" component={FavoritesScreen} />
    <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
    <Stack.Screen name="NotFound" component={NotFoundScreen} />
  </Stack.Navigator>
);

