import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../shared/theme/colors';
import { MechanicDashboardScreen } from '../features/mechanic/presentation/screens/MechanicDashboardScreen';
import { MechanicServicesScreen } from '../features/mechanic/presentation/screens/MechanicServicesScreen';
import { MechanicSkillsScreen } from '../features/mechanic/presentation/screens/MechanicSkillsScreen';
import { MapScreen } from '../features/map/presentation/screens/MapScreen';
import { ProfileScreen } from '../features/profile/presentation/screens/ProfileScreen';

export type MechanicStackParamList = {
  MechanicDashboard: undefined;
  MechanicServices: undefined;
  MechanicSkills: undefined;
  Map: undefined;
  Profile: undefined;
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
    <Stack.Screen name="Map" component={MapScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
  </Stack.Navigator>
);

