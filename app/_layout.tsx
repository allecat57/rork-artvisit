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
      StatusBar.setBackgroundColor('#013025', true);
    } else {
      StatusBar.setBackgroundColor('#013025', true);
      StatusBar.setBarStyle('light-content', true);
    }
  }, [isDark]);

  return (
    <StripeProvider>
      <Stack
        screenOptions={{
          headerShown: false, // Hide headers for tab screens
          gestureEnabled: true,
          animation: 'slide_from_right',
          contentStyle: {
            backgroundColor: '#013025',
          },
        }}
      >
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false,
            title: '' 
          }} 
        />
        <Stack.Screen 
          name="modal" 
          options={{ 
            presentation: 'modal',
            headerShown: true,
            headerStyle: {
              backgroundColor: '#013025',
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontSize: 18,
              fontWeight: '600',
              color: '#FFFFFF',
            },
          }} 
        />
      </Stack>
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