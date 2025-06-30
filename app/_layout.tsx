import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import colors from "@/constants/colors";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" backgroundColor={colors.primary} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: "600",
          },
          contentStyle: {
            backgroundColor: colors.primary,
          },
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ 
            title: "Home",
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="explore" 
          options={{ 
            title: "Explore",
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="gallery/[id]" 
          options={{ 
            title: "Gallery",
            presentation: "card"
          }} 
        />
        <Stack.Screen 
          name="gallery/[id]/artworks" 
          options={{ 
            title: "Artworks",
            presentation: "card"
          }} 
        />
        <Stack.Screen 
          name="gallery/[id]/artwork/[artworkId]" 
          options={{ 
            title: "Artwork",
            presentation: "card"
          }} 
        />
        <Stack.Screen 
          name="login" 
          options={{ 
            title: "Login",
            presentation: "modal"
          }} 
        />
        <Stack.Screen 
          name="profile" 
          options={{ 
            title: "Profile"
          }} 
        />
        <Stack.Screen 
          name="reservations" 
          options={{ 
            title: "Reservations"
          }} 
        />
        <Stack.Screen 
          name="favorites" 
          options={{ 
            title: "Favorites"
          }} 
        />
        <Stack.Screen 
          name="visit-history" 
          options={{ 
            title: "Visit History"
          }} 
        />
        <Stack.Screen 
          name="events" 
          options={{ 
            title: "Events"
          }} 
        />
        <Stack.Screen 
          name="event/[id]" 
          options={{ 
            title: "Event Details",
            presentation: "card"
          }} 
        />
        <Stack.Screen 
          name="shop" 
          options={{ 
            title: "Shop"
          }} 
        />
        <Stack.Screen 
          name="shop/product/[id]" 
          options={{ 
            title: "Product Details",
            presentation: "card"
          }} 
        />
        <Stack.Screen 
          name="shop/cart" 
          options={{ 
            title: "Shopping Cart",
            presentation: "card"
          }} 
        />
        <Stack.Screen 
          name="purchase-history" 
          options={{ 
            title: "Purchase History"
          }} 
        />
        <Stack.Screen 
          name="category/[id]" 
          options={{ 
            title: "Category",
            presentation: "card"
          }} 
        />
        <Stack.Screen 
          name="modal" 
          options={{ 
            presentation: "modal",
            title: "Modal"
          }} 
        />
        <Stack.Screen 
          name="example-usage" 
          options={{ 
            title: "Example Usage"
          }} 
        />
        <Stack.Screen 
          name="+not-found" 
          options={{ 
            title: "Not Found"
          }} 
        />
      </Stack>
    </>
  );
}