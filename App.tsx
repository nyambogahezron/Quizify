import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabNavigation } from './src/components/navigation/BottomTab';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { initDatabase } from './src/lib/db';
import { useUserStore } from './src/store/userStore';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';

import QuizScreen from './src/screen/QuizScreen';
import ResultScreen from './src/screen/ResultScreen';
import ProfileScreen from './src/screen/ProfileScreen';
import SettingsScreen from './src/screen/SettingsScreen';
import LeaderboardScreen from './src/screen/LeaderboardScreen';
import CreateAccountScreen from './src/screen/CreateAccountScreen';
import WordMakerScreen from './src/screen/WordMakerGameScreen';
import BookmarksScreen from './src/screen/BookmarksScreen';
import OnboardingScreen from './src/screen/OnBoardScreen';

export type RootStackParamList = {
  MainTabs: undefined;
  Quiz: { category: string };
  Result: { score: number; totalQuestions: number; coins: number };
  Profile: undefined;
  Bookmark: undefined;
  Settings: undefined;
  Leaderboard: undefined;
  CreateAccount: undefined;
  WordGame: undefined;
  OnBoard: undefined;
};

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
  }, []);

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
          <Stack.Screen name='OnBoard' component={OnboardingScreen} />
          <Stack.Screen name='MainTabs' component={BottomTabNavigation} />
          <Stack.Screen name='Quiz' component={QuizScreen} />
          <Stack.Screen name='Result' component={ResultScreen} />
          <Stack.Screen name='Profile' component={ProfileScreen} />
          <Stack.Screen name='Bookmark' component={BookmarksScreen} />
          <Stack.Screen name='Settings' component={SettingsScreen} />
          <Stack.Screen name='Leaderboard' component={LeaderboardScreen} />
          <Stack.Screen name='CreateAccount' component={CreateAccountScreen} />
          <Stack.Screen name='WordGame' component={WordMakerScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
