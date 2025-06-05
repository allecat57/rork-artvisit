import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useColorScheme, Platform } from 'react-native';
import { ThemeProvider } from '../context/ThemeContext';
import { StripeProvider } from '../context/StripeContext';
import { supabase } from '../config/supabase';
import { useAuthStore } from '../store/useAuthStore';
import * as Analytics from '../utils/analytics';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Log app start event to TimeFrame Analytics
    Analytics.sendToTimeFrameAnalytics('app_start', {
      timestamp: new Date().toISOString(),
      platform: Platform.OS,
      color_scheme: colorScheme
    });
    
    // Check current session (without realtime subscription)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        useAuthStore.getState().setUser(session.user);
        
        // Set user ID for analytics
        Analytics.setUserId(session.user.id);
        
        // Log auth event to TimeFrame Analytics
        Analytics.sendToTimeFrameAnalytics('auth_session_restored', {
          user_id: session.user.id
        });
      }
    });
  }, []);

  return (
    <ThemeProvider>
      <StripeProvider>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: colorScheme === 'dark' ? '#121212' : '#ffffff',
            },
            headerTintColor: colorScheme === 'dark' ? '#ffffff' : '#000000',
          }}
        />
      </StripeProvider>
    </ThemeProvider>
  );
}