import React, { useEffect, useState } from "react";
import { ActivityIndicator, View, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import colors from "@/constants/colors";
import typography from "@/constants/typography";

export default function IndexScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    console.log('IndexScreen: Component mounted');
    
    // Simple timeout to redirect to login after a short delay
    const timer = setTimeout(() => {
      console.log('IndexScreen: Redirecting to login');
      setIsLoading(false);
      router.replace("/login");
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);
  
  // Try to use auth store but don't block on it
  useEffect(() => {
    try {
      const { isAuthenticated, isHydrated } = useAuthStore.getState();
      console.log('IndexScreen: Auth state - isHydrated:', isHydrated, 'isAuthenticated:', isAuthenticated);
      
      if (isHydrated && isAuthenticated) {
        console.log('IndexScreen: User is authenticated, redirecting to tabs');
        router.replace("/(tabs)");
      }
    } catch (error) {
      console.warn('IndexScreen: Error accessing auth store:', error);
    }
  }, [router]);

  // Show loading spinner while determining auth status
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.accent} />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 16,
  },
});