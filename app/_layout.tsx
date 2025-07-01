import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Platform, StatusBar } from 'react-native';
import { ThemeProvider } from '@/context/ThemeContext';
import { StripeProvider } from '@/context/StripeContext';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter, useSegments } from 'expo-router';
import colors from '@/constants/colors';

function RootLayoutContent() {
  const { isAuthenticated, isHydrated, ensureTestUserExists } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Set status bar style
    if (Platform.OS === 'ios') {
      StatusBar.setBarStyle('light-content', true);
      StatusBar.setBackgroundColor(colors.background, true);
    } else {
      StatusBar.setBackgroundColor(colors.background, true);
      StatusBar.setBarStyle('light-content', true);
    }
  }, []);

  useEffect(() => {
    // Ensure test user exists on app startup
    ensureTestUserExists();
  }, [ensureTestUserExists]);

  useEffect(() => {
    if (!isHydrated) return; // Wait for auth state to be loaded from storage

    const inAuthGroup = segments[0] === 'login';
    const inTabsGroup = segments[0] === '(tabs)';

    if (!isAuthenticated && !inAuthGroup) {
      // User is not authenticated and not in auth group, redirect to login
      router.replace('/login');
    } else if (isAuthenticated && inAuthGroup) {
      // User is authenticated but in auth group, redirect to tabs
      router.replace('/(tabs)');
    } else if (isAuthenticated && segments.length === 0) {
      // User is authenticated and at root, redirect to tabs
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isHydrated, segments, router]);

  return (
    <StripeProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          animation: 'slide_from_right',
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="gallery/[id]" 
          options={{ 
            headerShown: true,
            title: 'Gallery Details',
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.accent,
            headerTitleStyle: {
              fontSize: 18,
              fontWeight: '600',
              color: colors.accent,
            },
          }} 
        />
        <Stack.Screen 
          name="venue/[id]" 
          options={{ 
            headerShown: true,
            title: 'Venue Details',
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.accent,
            headerTitleStyle: {
              fontSize: 18,
              fontWeight: '600',
              color: colors.accent,
            },
          }} 
        />
        <Stack.Screen 
          name="event/[id]" 
          options={{ 
            headerShown: true,
            title: 'Event Details',
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.accent,
            headerTitleStyle: {
              fontSize: 18,
              fontWeight: '600',
              color: colors.accent,
            },
          }} 
        />
        <Stack.Screen 
          name="shop/product/[id]" 
          options={{ 
            headerShown: true,
            title: 'Product Details',
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.accent,
            headerTitleStyle: {
              fontSize: 18,
              fontWeight: '600',
              color: colors.accent,
            },
          }} 
        />
        <Stack.Screen 
          name="shop/cart" 
          options={{ 
            headerShown: true,
            title: 'Shopping Cart',
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.accent,
            headerTitleStyle: {
              fontSize: 18,
              fontWeight: '600',
              color: colors.accent,
            },
          }} 
        />
        <Stack.Screen 
          name="favorites" 
          options={{ 
            headerShown: true,
            title: 'Favorites',
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.accent,
            headerTitleStyle: {
              fontSize: 18,
              fontWeight: '600',
              color: colors.accent,
            },
          }} 
        />
        <Stack.Screen 
          name="visit-history" 
          options={{ 
            headerShown: true,
            title: 'Visit History',
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.accent,
            headerTitleStyle: {
              fontSize: 18,
              fontWeight: '600',
              color: colors.accent,
            },
          }} 
        />
        <Stack.Screen 
          name="purchase-history" 
          options={{ 
            headerShown: true,
            title: 'Purchase History',
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.accent,
            headerTitleStyle: {
              fontSize: 18,
              fontWeight: '600',
              color: colors.accent,
            },
          }} 
        />
        <Stack.Screen 
          name="reservations" 
          options={{ 
            headerShown: true,
            title: 'Reservations',
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.accent,
            headerTitleStyle: {
              fontSize: 18,
              fontWeight: '600',
              color: colors.accent,
            },
          }} 
        />
        <Stack.Screen 
          name="modal" 
          options={{ 
            presentation: 'modal',
            headerShown: true,
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.text,
            headerTitleStyle: {
              fontSize: 18,
              fontWeight: '600',
              color: colors.text,
            },
          }} 
        />
      </Stack>
    </StripeProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutContent />
    </ThemeProvider>
  );
}