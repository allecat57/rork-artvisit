import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useColorScheme, Platform, StatusBar } from 'react-native';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { StripeProvider } from '@/context/StripeContext';

function RootLayoutContent() {
  const { isDark, colors } = useTheme();

  useEffect(() => {
    // Set status bar style based on theme
    if (Platform.OS === 'ios') {
      StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content', true);
    }
  }, [isDark]);

  return (
    <StripeProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: isDark ? colors.background.dark : colors.background.light,
            borderBottomWidth: 0,
            elevation: 0,
            shadowOpacity: 0.05,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 1 },
            shadowColor: '#000000',
          },
          headerTintColor: isDark ? colors.text.dark : colors.text.light,
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '600',
          },
          headerBackTitleVisible: false,
          gestureEnabled: true,
          animation: 'slide_from_right',
        }}
      />
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