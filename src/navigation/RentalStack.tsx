import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../shared/theme/colors';
import { RentalDashboardScreen } from '../features/rental/presentation/screens/RentalDashboardScreen';
import { RentalServicesScreen } from '../features/rental/presentation/screens/RentalServicesScreen';
import { RentalSkillsScreen } from '../features/rental/presentation/screens/RentalSkillsScreen';
import { MapScreen } from '../features/map/presentation/screens/MapScreen';
import { ProfileScreen } from '../features/profile/presentation/screens/ProfileScreen';

export type RentalStackParamList = {
  RentalDashboard: undefined;
  RentalServices: undefined;
  RentalSkills: undefined;
  Map: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RentalStackParamList>();

export const RentalStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: colors.background },
    }}
  >
    <Stack.Screen name="RentalDashboard" component={RentalDashboardScreen} />
    <Stack.Screen name="RentalServices" component={RentalServicesScreen} />
    <Stack.Screen name="RentalSkills" component={RentalSkillsScreen} />
    <Stack.Screen name="Map" component={MapScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
  </Stack.Navigator>
);

