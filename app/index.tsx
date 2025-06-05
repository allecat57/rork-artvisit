import { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet, Text, Platform } from "react-native";
import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import * as Analytics from "@/utils/analytics";

export default function IndexPage() {
  const { isAuthenticated, isHydrated } = useAuthStore();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [loadingTime, setLoadingTime] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  // Log app start event
  useEffect(() => {
    // Log with our custom analytics
    Analytics.logEvent("app_start", {
      timestamp: new Date().toISOString()
    });
  }, []);

  // Set up a timer to track loading time and force redirect after timeout
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingTime(prev => {
        const newTime = prev + 1;
        
        // Update loading message based on time
        if (newTime > 8) {
          setLoadingMessage("Still loading... This is taking longer than expected");
        } else if (newTime > 5) {
          setLoadingMessage("Still loading... Please wait");
        }
        
        // Force redirect after 5 seconds regardless of hydration state
        if (newTime >= 5 && !shouldRedirect) {
          console.log("Forcing navigation due to timeout");
          setShouldRedirect(true);
          setRedirectPath(isAuthenticated ? "/(tabs)" : "/login");
          
          // Log timeout event
          Analytics.logEvent("app_load_timeout", {
            loading_time: newTime,
            is_authenticated: isAuthenticated
          });
        }
        
        return newTime;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [shouldRedirect, isAuthenticated]);

  // Handle navigation based on auth state
  useEffect(() => {
    // Only set redirect flag after the auth store has been hydrated from storage
    if (isHydrated) {
      console.log("Auth store hydrated, redirecting to appropriate screen. isAuthenticated:", isAuthenticated);
      // Add a small delay to ensure navigation happens after layout is fully mounted
      const timer = setTimeout(() => {
        setShouldRedirect(true);
        setRedirectPath(isAuthenticated ? "/(tabs)" : "/login");
        
        // Log navigation event
        Analytics.logEvent("initial_navigation", {
          destination: isAuthenticated ? "tabs" : "login",
          loading_time: loadingTime
        });
      }, 100);
      
      return () => clearTimeout(timer);
    }
    
    // If we've been loading for more than 3 seconds and still not hydrated,
    // force navigation to login screen
    if (loadingTime > 3 && !isHydrated) {
      console.log("Forcing navigation due to hydration timeout");
      setShouldRedirect(true);
      setRedirectPath("/login");
      
      // Log hydration timeout event
      Analytics.logEvent("hydration_timeout", {
        loading_time: loadingTime
      });
    }
  }, [isHydrated, loadingTime, isAuthenticated]);

  // Use Redirect component for navigation
  if (shouldRedirect && redirectPath) {
    console.log("Redirecting to:", redirectPath);
    return <Redirect href={redirectPath} />;
  }

  // Show a loading indicator while we determine where to navigate
  return (
    <View style={styles.container}>
      <Text style={[typography.heading1, styles.loadingText]}>TIMEFRAME</Text>
      <ActivityIndicator size="large" color={colors.primary.accent} />
      <Text style={styles.loadingMessage}>
        {loadingMessage}
      </Text>
      
      {loadingTime > 5 && (
        <Text style={styles.troubleshootingText}>
          If this persists, try restarting the app or clearing app data.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primary.background,
    padding: 20,
  },
  loadingText: {
    marginBottom: 20,
    color: colors.primary.accent,
    fontFamily: Platform.select({
      ios: "Georgia",
      android: "serif",
      default: "Georgia, serif"
    }),
  },
  loadingMessage: {
    ...typography.body,
    color: colors.primary.muted,
    marginTop: 16,
    textAlign: "center",
  },
  troubleshootingText: {
    ...typography.bodySmall,
    color: colors.status.warning,
    marginTop: 24,
    textAlign: "center",
    maxWidth: "80%",
  }
});