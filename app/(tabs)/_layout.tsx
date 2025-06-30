import { Tabs } from 'expo-router';
import { useColorScheme, Platform, StatusBar } from 'react-native';
import { Home, Search, Calendar, User, ShoppingBag, CalendarDays } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isDark, colors } = useTheme();
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: '#B0B0B0',
        tabBarStyle: {
          backgroundColor: '#013025',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0.1,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: -2 },
          shadowColor: '#000000',
          height: Platform.OS === 'ios' ? 88 : 70,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 10,
          paddingHorizontal: 20,
        },
        tabBarItemStyle: {
          paddingVertical: 5,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
        headerShown: false, // Hide individual tab headers
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Home 
              color={color} 
              size={focused ? 24 : 22} 
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size, focused }) => (
            <Search 
              color={color} 
              size={focused ? 24 : 22} 
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="reservations"
        options={{
          title: 'Reservations',
          tabBarIcon: ({ color, size, focused }) => (
            <Calendar 
              color={color} 
              size={focused ? 24 : 22} 
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          tabBarIcon: ({ color, size, focused }) => (
            <CalendarDays 
              color={color} 
              size={focused ? 24 : 22} 
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          tabBarIcon: ({ color, size, focused }) => (
            <ShoppingBag 
              color={color} 
              size={focused ? 24 : 22} 
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <User 
              color={color} 
              size={focused ? 24 : 22} 
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
    </Tabs>
  );
}