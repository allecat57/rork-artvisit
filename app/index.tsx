import React, { useEffect } from "react";
import { ActivityIndicator, View, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import colors from "@/constants/colors";
import typography from "@/constants/typography";

export default function IndexScreen() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) {
      // Wait for the auth store to hydrate from AsyncStorage
      return;
    }

    // Add a small delay to prevent flash
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        // User is logged in, redirect to tabs
        router.replace("/(tabs)");
      } else {
        // User is not logged in, redirect to login
        router.replace("/login");
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, isHydrated, router]);

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