import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import QuizScreen from './src/screen/QuizScreen';
import ResultScreen from './src/screen/ResultScreen';
import { BottomTabNavigation } from './src/components/navigation/BottomTab';

export type RootStackParamList = {
  MainTabs: undefined;
  Quiz: { category: string };
  Result: { score: number; totalQuestions: number; coins: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name='MainTabs' component={BottomTabNavigation} />
        <Stack.Screen name='Quiz' component={QuizScreen} />
        <Stack.Screen name='Result' component={ResultScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
