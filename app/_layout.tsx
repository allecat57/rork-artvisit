import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from "@/context/ThemeContext";
import { StripeProvider } from "@/context/StripeContext";
import { useAuthStore } from "@/store/useAuthStore";
import { ErrorBoundary } from "./error-boundary";

function RootLayoutContent() {
  const { ensureTestUserExists } = useAuthStore();

  useEffect(() => {
    // Initialize any app-level setup here
    console.log("App initialized");
    
    try {
      // Ensure test user exists for demo purposes
      ensureTestUserExists();
    } catch (error) {
      console.warn("Error during app initialization:", error);
      // Continue loading even if initialization fails
    }
  }, [ensureTestUserExists]);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="gallery/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="gallery/[id]/artworks" options={{ title: "Artworks" }} />
      <Stack.Screen name="gallery/[id]/artwork/[artworkId]" options={{ title: "Artwork" }} />
      <Stack.Screen name="venue/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="event/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="category/[id]" options={{ title: "Category" }} />
      <Stack.Screen name="shop/product/[id]" options={{ title: "Product" }} />
      <Stack.Screen name="shop/cart" options={{ title: "Cart" }} />
      <Stack.Screen name="favorites" options={{ title: "Favorites" }} />
      <Stack.Screen name="visit-history" options={{ title: "Visit History" }} />
      <Stack.Screen name="purchase-history" options={{ title: "Purchase History" }} />
      <Stack.Screen name="reservations" options={{ title: "Reservations" }} />
      <Stack.Screen name="example-usage" options={{ title: "Example Usage" }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <StripeProvider>
            <RootLayoutContent />
            <StatusBar style="auto" />
          </StripeProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}