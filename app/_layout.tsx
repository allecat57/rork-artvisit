import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Platform, StatusBar } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/context/ThemeContext';
import { StripeProvider } from '@/context/StripeContext';
import { trpc, trpcClient } from '@/lib/trpc';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function RootLayoutContent() {
  useEffect(() => {
    // Set status bar style
    if (Platform.OS === 'ios') {
      StatusBar.setBarStyle('light-content', true);
    } else {
      StatusBar.setBackgroundColor('#013025', true);
      StatusBar.setBarStyle('light-content', true);
    }
  }, []);

  return (
    <StripeProvider>
      <Stack
        screenOptions={{
          headerShown: true,
          gestureEnabled: true,
          animation: 'slide_from_right',
          contentStyle: {
            backgroundColor: '#013025',
          },
          headerStyle: {
            backgroundColor: '#013025',
          },
          headerTintColor: '#AC8901',
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '600',
            color: '#AC8901',
          },
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ 
            title: 'Discover Art',
            headerShown: true
          }} 
        />
        <Stack.Screen 
          name="explore" 
          options={{ 
            title: 'Explore',
            headerShown: true
          }} 
        />
        <Stack.Screen 
          name="shop" 
          options={{ 
            title: 'Shop',
            headerShown: true
          }} 
        />
        <Stack.Screen 
          name="events" 
          options={{ 
            title: 'Events',
            headerShown: true
          }} 
        />
        <Stack.Screen 
          name="reservations" 
          options={{ 
            title: 'Reservations',
            headerShown: true
          }} 
        />
        <Stack.Screen 
          name="profile" 
          options={{ 
            title: 'Profile',
            headerShown: true
          }} 
        />
        <Stack.Screen 
          name="venue/[id]" 
          options={{ 
            title: 'Venue Details',
            headerShown: true
          }} 
        />
        <Stack.Screen 
          name="login" 
          options={{ 
            title: 'Login',
            headerShown: true
          }} 
        />
        <Stack.Screen 
          name="favorites" 
          options={{ 
            title: 'Favorites',
            headerShown: true
          }} 
        />
        <Stack.Screen 
          name="visit-history" 
          options={{ 
            title: 'Visit History',
            headerShown: true
          }} 
        />
        <Stack.Screen 
          name="purchase-history" 
          options={{ 
            title: 'Purchase History',
            headerShown: true
          }} 
        />
        <Stack.Screen 
          name="category/[id]" 
          options={{ 
            title: 'Category',
            headerShown: true
          }} 
        />
        <Stack.Screen 
          name="shop/product/[id]" 
          options={{ 
            title: 'Product Details',
            headerShown: true
          }} 
        />
        <Stack.Screen 
          name="shop/cart" 
          options={{ 
            title: 'Shopping Cart',
            headerShown: true
          }} 
        />
        <Stack.Screen 
          name="event/[id]" 
          options={{ 
            title: 'Event Details',
            headerShown: true
          }} 
        />
        <Stack.Screen 
          name="gallery/[id]" 
          options={{ 
            title: 'Gallery',
            headerShown: true
          }} 
        />
        <Stack.Screen 
          name="gallery/[id]/artworks" 
          options={{ 
            title: 'Artworks',
            headerShown: true
          }} 
        />
        <Stack.Screen 
          name="gallery/[id]/artwork/[artworkId]" 
          options={{ 
            title: 'Artwork Details',
            headerShown: true
          }} 
        />
        <Stack.Screen 
          name="websocket-test" 
          options={{ 
            title: 'WebSocket Test',
            headerShown: true
          }} 
        />
        <Stack.Screen 
          name="modal" 
          options={{ 
            presentation: 'modal',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#013025',
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontSize: 18,
              fontWeight: '600',
              color: '#FFFFFF',
            },
          }} 
        />
        <Stack.Screen 
          name="example-usage" 
          options={{ 
            title: 'Example Usage',
            headerShown: true
          }} 
        />
        <Stack.Screen 
          name="+not-found" 
          options={{ 
            title: 'Not Found',
            headerShown: true
          }} 
        />
        <Stack.Screen 
          name="error-boundary" 
          options={{ 
            title: 'Error',
            headerShown: true
          }} 
        />
      </Stack>
    </StripeProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <RootLayoutContent />
        </QueryClientProvider>
      </trpc.Provider>
    </ThemeProvider>
  );
}