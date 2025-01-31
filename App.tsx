import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabNavigation } from '@/components/navigation/BottomTab';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { initDatabase } from '@/lib/db';
import { useUserStore } from '@/store/userStore';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { RootStackParamList } from '@/lib/types';
import SCREENS from '@/screen';

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [appIsReady, setAppIsReady] = React.useState(false);
  const { loadUser } = useUserStore();

  React.useEffect(() => {
    const init = async () => {
      await initDatabase();
      await loadUser();
    };
    init();
  }, [loadUser]);

  React.useEffect(() => {
    async function prepare() {
      try {
        await Font.loadAsync({
          'Rb-bold': require('./assets/fonts/RobotoCondensed-Bold.ttf'),
          'Rb-regular': require('./assets/fonts/RobotoCondensed-Regular.ttf'),
          'Rb-medium': require('./assets/fonts/RobotoCondensed-Medium.ttf'),
        });
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  const onLayoutRootView = React.useCallback(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <GestureHandlerRootView>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
          initialRouteName='OnBoard'
        >
          <Stack.Screen name='OnBoard' component={SCREENS.OnboardingScreen} />
          <Stack.Screen name='MainTabs' component={BottomTabNavigation} />
          <Stack.Screen name='Quiz' component={SCREENS.QuizScreen} />
          <Stack.Screen name='Result' component={SCREENS.ResultScreen} />
          <Stack.Screen name='Profile' component={SCREENS.ProfileScreen} />
          <Stack.Screen name='Bookmark' component={SCREENS.BookmarksScreen} />
          <Stack.Screen name='Settings' component={SCREENS.SettingsScreen} />
          <Stack.Screen
            name='Leaderboard'
            component={SCREENS.LeaderboardScreen}
          />
          <Stack.Screen
            name='CreateAccount'
            component={SCREENS.CreateAccountScreen}
          />
          <Stack.Screen name='WordGame' component={SCREENS.WordMakerScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
