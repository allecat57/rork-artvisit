import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeProvider } from '@/context/ThemeContext';
import { StripeProvider } from '@/context/StripeContext';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import * as Analytics from '@/utils/analytics';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useAuthStore();

  useEffect(() => {
    Analytics.logEvent('app_start', {
      timestamp: new Date().toISOString(),
    });
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        useAuthStore.getState().setUser(session.user);
        Analytics.logEvent('auth_session_restored', {
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
              backgroundColor: isDark ? colors.background.dark : colors.background.light,
              borderBottomWidth: 0.5,
              borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              shadowColor: 'transparent',
            },
            headerTitleStyle: {
              fontWeight: '600',
              fontSize: 17,
            },
            headerTintColor: isDark ? colors.text.dark : colors.text.light,
            headerBackTitleVisible: false,
            headerShadowVisible: false,
            contentStyle: {
              backgroundColor: isDark ? colors.background.dark : colors.background.light,
            },
          }}
        />
      </StripeProvider>
    </ThemeProvider>
  );
}