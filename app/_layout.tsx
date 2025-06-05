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
      StatusBar.setBarStyle('light-content', true);
    }
  }, [isDark]);

  return (
    <StripeProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#013025',
            borderBottomWidth: 0,
            elevation: 0,
            shadowOpacity: 0.05,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 1 },
            shadowColor: '#000000',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '600',
            color: '#FFFFFF',
          },
          headerBackTitleVisible: false,
          gestureEnabled: true,
          animation: 'slide_from_right',
          contentStyle: {
            backgroundColor: '#013025',
          },
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