import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeProvider } from '@/context/ThemeContext';
import { StripeProvider } from '@/context/StripeContext';
import { supabase, isSupabaseConfigured } from '@/config/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import * as Analytics from '@/utils/analytics';
import colors from '@/constants/colors';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    Analytics.logEvent('app_start', {
      timestamp: new Date().toISOString(),
    });
    
    if (isSupabaseConfigured()) {
      supabase?.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          useAuthStore.getState().setUser(session.user);
          Analytics.logEvent('auth_session_restored', {
            user_id: session.user.id
          });
        }
      });
    } else {
      console.warn("Supabase is not configured. Skipping auth session check.");
      Analytics.logEvent('auth_session_skipped', {
        reason: 'supabase_not_configured'
      });
    }
  }, []);

  return (
    <ThemeProvider>
      <StripeProvider>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: isDark ? colors.background.dark : '#FFFFFF',
            },
            headerTitleStyle: {
              fontWeight: '600',
              fontSize: 17,
              color: '#AC8901', // Pastel gold accent for headers
            },
            headerTintColor: isDark ? colors.text.dark : colors.text.light,
            contentStyle: {
              backgroundColor: isDark ? colors.background.dark : '#FFFFFF',
            },
          }}
        />
      </StripeProvider>
    </ThemeProvider>
  );
}