import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.backgroundLight },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="splash" options={{ animation: 'fade' }} />
        <Stack.Screen name="login" />
        <Stack.Screen name="calendar" />
        <Stack.Screen name="experimenta" />
        <Stack.Screen name="account" />
        <Stack.Screen name="add-person" />
        <Stack.Screen name="presenteados" />
        <Stack.Screen name="subscription" options={{ presentation: 'modal' }} />
        <Stack.Screen name="achievements" />
        <Stack.Screen name="personal-data" />
        <Stack.Screen name="special-people" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="privacy" />
        <Stack.Screen name="gift-suggestion" />
        <Stack.Screen name="checkout" />
        <Stack.Screen name="order-confirmation" />
        <Stack.Screen name="orders" />
        <Stack.Screen name="product-details" />
        <Stack.Screen name="track-order" />
        <Stack.Screen name="gift-display" />
        <Stack.Screen name="add-event" />
        <Stack.Screen name="gift-history" />
        <Stack.Screen name="shared-profile" />
      </Stack>
    </SafeAreaProvider>
  );
}

