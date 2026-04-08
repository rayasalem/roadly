import { useEffect, useRef } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../shared/theme/colors';
import { RoleNavigator } from './RoleNavigator';
import { LaunchScreen } from '../features/auth/presentation/screens/LaunchScreen';
import { OnboardingScreen } from '../features/auth/presentation/screens/OnboardingScreen';
import { WelcomeScreen } from '../features/auth/presentation/screens/WelcomeScreen';
import { LoginScreen } from '../features/auth/presentation/screens/LoginScreen';
import { RegisterScreen } from '../features/auth/presentation/screens/RegisterScreen';
import { ProviderRegistrationScreen } from '../features/auth/presentation/screens/ProviderRegistrationScreen';
import { useAuthStore } from '../store/authStore';
import { navigationRef } from './navigationRef';

export type RootStackParamList = {
  Launch: undefined;
  Onboarding: undefined;
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ProviderRegister: undefined;
  App: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * When hydration finishes and the user is authenticated, redirect to App once.
 * Launch stays the initial route for first load and unauthenticated users only.
 */
export function RootNavigator() {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasRedirectedToApp = useRef(false);

  useEffect(() => {
    if (!hasHydrated || !isAuthenticated || hasRedirectedToApp.current) return;
    if (!navigationRef.isReady()) return;
    hasRedirectedToApp.current = true;
    navigationRef.reset({
      index: 0,
      routes: [{ name: 'App' }],
    });
  }, [hasHydrated, isAuthenticated]);

  return (
    <Stack.Navigator
      initialRouteName="Launch"
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600' },
        animation: 'slide_from_right',
        gestureEnabled: true,
        animationDuration: 200,
      }}
    >
      <Stack.Screen
        name="Launch"
        options={{ headerShown: false }}
        component={LaunchScreen}
      />
      <Stack.Screen
        name="Onboarding"
        options={{ headerShown: false }}
        component={OnboardingScreen}
      />
      <Stack.Screen
        name="Welcome"
        options={{ headerShown: false }}
        component={WelcomeScreen}
      />
      <Stack.Screen
        name="Login"
        options={{ headerShown: false }}
        component={LoginScreen}
      />
      <Stack.Screen
        name="Register"
        options={{ headerShown: false }}
        component={RegisterScreen}
      />
      <Stack.Screen
        name="ProviderRegister"
        options={{ headerShown: false }}
        component={ProviderRegistrationScreen}
      />
      <Stack.Screen
        name="App"
        options={{ headerShown: false }}
        component={RoleNavigator}
      />
    </Stack.Navigator>
  );
}
