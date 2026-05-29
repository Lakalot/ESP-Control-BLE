import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useAuthStore } from '../src/store/authStore';
import { useBleStore } from '../src/store/bleStore';
import { bleManagerService } from '../src/transport/BleManager';
import { selectInitialTransport } from '../src/transport/selectTransport';
import { setTransport } from '../src/settings/manifestRuntimeFlag';
import { palette } from '../src/ui/theme/ui';

const Stack = createNativeStackNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: palette.bg,
    card: palette.panel,
    border: palette.border,
    text: palette.text,
    primary: palette.accent,
  },
};

export default function RootLayout() {
  const loadFromSecureStore = useAuthStore((state) => state.loadFromSecureStore);
  const setBleState = useBleStore((state) => state.setBleState);

  useEffect(() => {
    loadFromSecureStore();
    const unsubscribe = bleManagerService.onStateChange((state) => {
      setBleState(state);
    });
    return unsubscribe;
  }, [loadFromSecureStore, setBleState]);

  // Auto-detect the transport once at startup: read the current BLE state and
  // fall back to SPP when BLE is unsupported (hardware can't do BLE). By the
  // time the user reaches the scan screen, getTransport() reflects ble vs spp.
  useEffect(() => {
    let cancelled = false;
    bleManagerService
      .getBleState()
      .then((state) => selectInitialTransport(state))
      .then((transport) => {
        if (!cancelled) setTransport(transport);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <StatusBar barStyle="light-content" backgroundColor={palette.bg} />
          <NavigationContainer theme={navTheme}>
            <Stack.Navigator
              screenOptions={{
                headerStyle: { backgroundColor: palette.panel },
                headerShadowVisible: false,
                headerTintColor: palette.text,
                headerTitleStyle: {
                  color: palette.text,
                  fontWeight: '700',
                  fontSize: 18,
                },
                contentStyle: { backgroundColor: palette.bg },
                animation: 'slide_from_right',
              }}
            >
              <Stack.Screen
                name="index"
                options={{ title: 'ESP Control BLE' }}
                component={require('./index').default}
              />
              <Stack.Screen
                name="control"
                options={{ title: 'Controle', headerBackTitle: 'Retour' }}
                component={require('./control/[deviceId]').default}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
