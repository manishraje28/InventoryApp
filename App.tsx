import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { InventoryProvider } from './src/context/InventoryContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <InventoryProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </InventoryProvider>
    </SafeAreaProvider>
  );
}
