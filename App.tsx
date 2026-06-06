import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { StatusBar, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { useThemeStore, useAuthStore } from './src/store';
import { C } from './src/theme';

export default function App() {
  const { T } = useThemeStore();
  const { hydrated } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Zustand persist rehydrates from AsyncStorage — wait for it
    const timer = setTimeout(() => setReady(true), 300);
    return () => clearTimeout(timer);
  }, []);

  if (!ready || !hydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: C.p, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#fff" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={T.statusBar} backgroundColor={T.bg} />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
