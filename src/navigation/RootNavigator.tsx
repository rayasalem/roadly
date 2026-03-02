import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../shared/theme/colors';
import { t } from '../shared/i18n/t';

export type RootStackParamList = {
  Launch: undefined;
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Map: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Launch"
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="Launch"
        options={{ headerShown: false }}
        getComponent={() => require('../features/auth/presentation/screens/LaunchScreen').LaunchScreen}
      />
      <Stack.Screen
        name="Welcome"
        options={{ headerShown: false }}
        getComponent={() => require('../features/auth/presentation/screens/WelcomeScreen').WelcomeScreen}
      />
      <Stack.Screen
        name="Login"
        options={{ title: t('auth.login.title') }}
        getComponent={() => require('../features/auth/presentation/screens/LoginScreen').LoginScreen}
      />
      <Stack.Screen
        name="Register"
        options={{ title: t('auth.register.title') }}
        getComponent={() => require('../features/auth/presentation/screens/RegisterScreen').RegisterScreen}
      />
      <Stack.Screen
        name="Home"
        options={{ title: t('home.title') }}
        getComponent={() => require('../features/home/presentation/screens/HomeScreen').HomeScreen}
      />
      <Stack.Screen
        name="Map"
        options={{ title: 'Map' }}
        getComponent={() => require('../features/map/presentation/screens/MapScreen').MapScreen}
      />
    </Stack.Navigator>
  );
}
