import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { DashboardScreen } from '../screens/DashboardScreen';
import { AddItemScreen } from '../screens/AddItemScreen';
import { ItemDetailScreen } from '../screens/ItemDetailScreen';
import { CsvPreviewScreen } from '../screens/CsvPreviewScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Dashboard"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen 
          name="AddItem" 
          component={AddItemScreen} 
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
          <Stack.Screen name="CsvPreview" component={CsvPreviewScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
