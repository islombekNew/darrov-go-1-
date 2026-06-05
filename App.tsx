import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { useThemeStore } from './src/store';

export default function App() {
  const { T } = useThemeStore();
  return (
    <SafeAreaProvider>
      <StatusBar barStyle={T.statusBar} backgroundColor={T.bg} />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
