import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../shared/theme/colors';
import { TowDashboardScreen } from '../features/tow/presentation/screens/TowDashboardScreen';
import { TowServicesScreen } from '../features/tow/presentation/screens/TowServicesScreen';
import { TowSkillsScreen } from '../features/tow/presentation/screens/TowSkillsScreen';
import { MapScreen } from '../features/map/presentation/screens/MapScreen';
import { ProfileScreen } from '../features/profile/presentation/screens/ProfileScreen';

export type TowStackParamList = {
  TowDashboard: undefined;
  TowServices: undefined;
  TowSkills: undefined;
  Map: undefined;
  Profile: undefined;
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
    <Stack.Screen name="Map" component={MapScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
  </Stack.Navigator>
);

