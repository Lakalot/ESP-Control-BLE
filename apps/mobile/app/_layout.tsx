import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../src/store/authStore';
import { bleManagerService } from '../src/ble/BleManager';
import { useBleStore } from '../src/store/bleStore';

const Stack = createNativeStackNavigator();

export default function RootLayout() {
  const loadFromSecureStore = useAuthStore((s) => s.loadFromSecureStore);
  const setBleState = useBleStore((s) => s.setBleState);

  useEffect(() => {
    loadFromSecureStore();
    const unsubscribe = bleManagerService.onStateChange((state) => {
      setBleState(state);
    });
    return unsubscribe;
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#181825' },
          headerTintColor: '#cdd6f4',
          contentStyle: { backgroundColor: '#181825' },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'ESP32 Scanner' }} component={require('./index').default} />
        <Stack.Screen name="control" options={{ title: 'Contrôle' }} component={require('./control/[deviceId]').default} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
